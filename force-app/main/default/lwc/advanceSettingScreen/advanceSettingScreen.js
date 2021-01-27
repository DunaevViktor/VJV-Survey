import { LightningElement, track, api } from "lwc";
import { label } from "./labels.js";
import { columns, columnsMember, isReceiverExist } from "./advanceSettingScreenHelper.js";
import { FlowNavigationBackEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getGroups from "@salesforce/apex/GroupController.getGroups";
import getSurveys from "@salesforce/apex/SurveyController.getAllSurveys";
import getCampaigns from "@salesforce/apex/CampaignController.getCampaigns";
import searchMembers from "@salesforce/apex/searchHelper.searchMembers";

export default class AdvanceSettingScreen extends LightningElement {

    SINGLE_RECORD_VARIANT = "Record";
    GROUP_VARIANT = "User Group";
    CAMPAIGN_VARIAN = "Campaign"

    label = label;
    columns = columns;
    columnsMember = columnsMember;

    @track isConnectToSurvey;
    @track hasReceivers;
    @track __survey = {};
    @track receivers = [];
    @track displayedSurveys = [];
    @track displayedGroups = [];
    @track isHasSurveys = false;
    @track isHasGroups = false;
    @track getGroupError = false;
    @track getSurveyError = false;

    @track displayedCampaigns = [];
    @track getCampaignsError = false;
    @track isHasCampaigns = false;

    @track hasMembers = false;
    @track searchError = false;

    groupId = "";
    surveyId = "";
    campaignId = "";

    queryTerm = "";
    memberList = [];
    handleKeyUp(evt) {
        const isEnterKey = evt.keyCode === 13;
        if (isEnterKey) {
            this.queryTerm = evt.target.value;
            if (this.queryTerm && this.queryTerm.trim().length > 1) {
                this.searchError = false;
                searchMembers({ searchTerm: this.queryTerm })
                    .then((result) => {
                        this.memberList = [];
                        result.forEach(memberListByType => {
                            let recordType = "";
                            if(memberListByType.length > 0){
                                let uniquePrefix = memberListByType[0].Id.substr(0,3);
                                switch (uniquePrefix){
                                    case '005' :
                                        recordType = 'User';
                                        break;
                                    case '00Q' :
                                        recordType = 'Lead';
                                        break;
                                    default: recordType = 'Contact';
                                }
                            }
                            memberListByType.forEach(member => {
                                let copyMember = {...member};
                                copyMember.Type = recordType;
                                this.memberList.push(copyMember);
                            });
                        });
                        this.setIsHasMembers();
                    })
                    .catch(() => {
                        this.searchError = true;
                    });
            }
        }
    }

    setIsHasMembers() {
        this.hasMembers = this.memberList && this.memberList.length > 0;
    }

    get survey() {
        return this.__survey;
    }

    get surveys() {
        return this.displayedSurveys;
    }

    get surveyReceivers() {
        return this.receivers;
    }

    get groups() {
        return this.displayedGroups;
    }

    get campaigns() {
        return this.displayedCampaigns;
    }

    get groupOptions() {
        return this.displayedGroups.map((group) => {
            return { label: group.Name, value: group.Id };
        });
    }

    get surveyOptions() {
        return this.displayedSurveys.map((survey) => {
            return { label: survey.Name, value: survey.Id };
        });
    }

    get campaignOptions() {
        return this.displayedCampaigns.map((campaign) => {
            return { label: campaign.Name, value: campaign.Id };
        });
    }

    @api set survey(value) {
        this.__survey = JSON.parse(JSON.stringify(value));
        if (this.__survey.Related_To__c === undefined) {
            this.isConnectToSurvey = false;
        } else {
            this.isConnectToSurvey = true;
            this.surveyId = this.__survey.Related_To__c;
        }
    }

    @api set surveys(value) {
        this.displayedSurveys = JSON.parse(JSON.stringify(value));
    }

    @api set surveyReceivers(value) {
        this.receivers = JSON.parse(JSON.stringify(value));
    }

    @api set groups(value) {
        this.displayedGroups = JSON.parse(JSON.stringify(value));
    }

    @api set campaigns(value) {
        this.displayedCampaigns = JSON.parse(JSON.stringify(value));
    }

    connectedCallback() {
        this.initSurveys();
        this.initGroups();
        this.initCampaigns();
        this.setIsHasReseivers();
        this.setIsHasMembers();

        this.isHasSurveys = this.displayedSurveys.length > 0;
        this.isHasGroups = this.displayedGroups > 0;
        this.isHasCampaigns = this.displayedCampaigns > 0;
    }

    initSurveys() {
        if (this.displayedSurveys.length === 0) {
            getSurveys()
                .then((result) => {
                    this.displayedSurveys = result.length > 0 ? result : [];
                    this.isHasSurveys = this.displayedSurveys.length > 0;
                })
                .catch(() => {
                    this.getSurveyError = true;
                });
        }
    }

    initGroups() {
        if (this.displayedGroups.length === 0) {
            getGroups()
                .then((result) => {
                    this.displayedGroups = result.length > 0 ? result : [];
                    this.isHasGroups = this.displayedGroups.length > 0;
                })
                .catch(() => {
                    this.getGroupError = true;
                });
        }
    }

    initCampaigns() {
        if (this.displayedCampaigns.length === 0) {
            getCampaigns()
                .then((result) => {
                    this.displayedCampaigns = result.length > 0 ? result : [];
                    this.isHasCampaigns = this.displayedCampaigns.length > 0;
                })
                .catch(() => {
                    this.getCampaignsError = true;
                });
        }
    }

    setIsHasReseivers() {
        this.hasReceivers = this.receivers && this.receivers.length > 0;
    }

    //delete in table ER
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === "delete") {
            this.deleteRow(row);
        }

        if (actionName === "add"){
            this.handleAddRecordReceiver(row);
        }
    }

    deleteRow(row) {
        const { Value__c } = row;
        this.receivers = this.receivers.filter((receiver) => {
            return receiver.Value__c !== Value__c;
        });

        this.setIsHasReseivers();
    }

    //change group and add group ER
    handleGroupChange(event) {
        this.groupId = event.detail.value;
    }

    handleAddGroupReceiver() {
        const combobox = this.template.querySelector(".group-combobox");

        if (!this.isGroupValid(combobox)) {
            return;
        }

        const receiver = {};
        receiver.Type__c = this.GROUP_VARIANT;
        receiver.Value__c = this.displayedGroups.find((group) => {
            return this.groupId === group.Id;
        }).Name;

        this.receivers = [...this.receivers, receiver];

        this.callReportValidity(combobox, "");
        this.setIsHasReseivers();
    }

    isGroupValid(combobox) {
        if (this.groupId.localeCompare("") === 0) {
            this.callReportValidity(combobox, label.error_choose_some_group);
            return false;
        }

        const value = this.displayedGroups.find((group) => {
            return this.groupId === group.Id;
        }).Name;

        if (isReceiverExist(this.receivers, value)) {
            this.callReportValidity(combobox, label.error_already_added_this_group);
            return false;
        }

        return true;
    }

    //methods for all validations
    callReportValidity(input, message) {
        input.setCustomValidity(message);
        input.reportValidity();
    }

    //record logic 
    handleAddRecordReceiver(row){
        const { Id } = row;
        
        if (!this.isRecordValid(Id)) {
            return;
        }

        const receiver = {};
        receiver.Type__c = this.SINGLE_RECORD_VARIANT;
        receiver.Value__c = Id;

        this.receivers = [...this.receivers, receiver];
        this.setIsHasReseivers();
    }

    isRecordValid(Id){
        const value = Id;

        if (isReceiverExist(this.receivers, value)) {
            this.showToast();
            return false;
        }

        return true;
    }

    showToast() {
        const event = new ShowToastEvent({
            title: 'Error',
            message: 'Duplicate record!',
            variant: 'error'
        });
        this.dispatchEvent(event);
    }

    //campaign logic
    handleCampaignChange(event) {
        this.campaignId = event.detail.value;
    }

    handleAddCampaignReceiver() {
        const combobox = this.template.querySelector(".campaign-combobox");

        if (!this.isCampaignValid(combobox)) {
            return;
        }

        const receiver = {};
        receiver.Type__c = this.CAMPAIGN_VARIAN;
        receiver.Value__c = this.displayedCampaigns.find((campaign) => {
            return this.campaignId === campaign.Id;
        }).Name;

        this.receivers = [...this.receivers, receiver];

        this.callReportValidity(combobox, "");
        this.setIsHasReseivers();
    }

    isCampaignValid(combobox) {
        if (this.campaignId.localeCompare("") === 0) {
            this.callReportValidity(combobox, "Empty choose.");
            return false;
        }

        const value = this.displayedCampaigns.find((campaign) => {
            return this.campaignId === campaign.Id;
        }).Name;

        if (isReceiverExist(this.receivers, value)) {
            this.callReportValidity(combobox, "This campaign uze est.");
            return false;
        }

        return true;
    }

    //standard survey
    handleIsStandardSurveyChange(event) {
        this.__survey.IsStandard__c = event.target.checked;
    }

    //connect to survey
    handleSurveyChange(event) {
        this.__survey.Related_To__c = event.detail.value;
        this.surveyId = event.detail.value;
    }

    handleConnectToAnotherSurveyChange(event) {
        this.isConnectToSurvey = event.target.checked;
        if (!this.isConnectToSurvey) {
            this.surveyId = "";
            this.__survey.Related_To__c = undefined;
        }
    }

    //pagination
    clickPreviousButton() {
        const backNavigationEvent = new FlowNavigationBackEvent();
        this.dispatchEvent(backNavigationEvent);
    }

    clickNextButton() {
        const nextNavigationEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextNavigationEvent);
    }
}
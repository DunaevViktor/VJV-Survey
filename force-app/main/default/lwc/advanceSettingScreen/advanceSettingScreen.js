import { LightningElement, track, api } from "lwc";
import { label } from "./labels.js";
import { columns, columnsMember, isReceiverExist, deleteReceiver, createDisplayedMap, getObjectName } from "./advanceSettingScreenHelper.js";
import { FlowNavigationBackEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getGroups from "@salesforce/apex/GroupController.getGroups";
import getSurveys from "@salesforce/apex/SurveyController.getAllSurveys";
import getCampaigns from "@salesforce/apex/CampaignController.getCampaigns";
import searchMembers from "@salesforce/apex/searchHelper.searchMembers";

export default class AdvanceSettingScreen extends LightningElement {

    SINGLE_RECORD_VARIANT = "Record";
    GROUP_VARIANT = "User Group";
    CAMPAIGN_VARIAN = "Campaign";
    RECORD_TYPE_CONTACT = "Contact";
    RECORD_TYPE_USER = "User";
    RECORD_TYPE_LEAD = "Lead";

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
    @track copyReceivers = [];

    groupId = "";
    surveyId = "";
    campaignId = "";
    queryTerm = "";
    memberList = [];

    get survey() {
        return this.__survey;
    }

    get surveys() {
        return this.displayedSurveys;
    }

    get surveyReceivers() {
        return this.receivers;
    }

    get copySurveyReceivers() {
        return this.copyReceivers;
    }

    get groups() {
        return this.displayedGroups;
    }

    get campaigns() {
        return this.displayedCampaigns;
    }

    get groupOptions() {
        return createDisplayedMap(this.displayedGroups);
    }

    get surveyOptions() {
        return createDisplayedMap(this.displayedSurveys);
    }

    get campaignOptions() {
        return createDisplayedMap(this.displayedCampaigns);
    }

    @api set survey(value) {
        this.__survey = JSON.parse(JSON.stringify(value));
        this.isConnectToSurvey = this.__survey.Related_To__c !== undefined;
        if(this.isConnectToSurvey) this.surveyId = this.__survey.Related_To__c;
    }

    @api set surveys(value) {
        this.displayedSurveys = JSON.parse(JSON.stringify(value));
    }

    @api set surveyReceivers(value) {
        this.receivers = JSON.parse(JSON.stringify(value));
    }
    
    @api set copySurveyReceivers(value) {
        this.copyReceivers = JSON.parse(JSON.stringify(value));
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
        this.isHasGroups = this.displayedGroups.length > 0;
        this.isHasCampaigns = this.displayedCampaigns.length > 0;
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

    handleKeyUp(evt) {
        const isEnterKey = evt.keyCode === 13;
        if (!isEnterKey) { return; }
        this.queryTerm = evt.target.value;
        if (!(this.queryTerm && this.queryTerm.trim().length > 1)) { return; }
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
                                recordType = this.RECORD_TYPE_USER;
                                break;
                            case '00Q' :
                                recordType = this.RECORD_TYPE_LEAD;
                                break;
                            default: recordType = this.RECORD_TYPE_CONTACT;
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

    setIsHasMembers() {
        this.hasMembers = this.memberList && this.memberList.length > 0;
    }

    setIsHasReseivers() {
        this.hasReceivers = this.receivers && this.receivers.length > 0;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName){
            case 'delete' :
                this.deleteRow(row);
                break;
            default: this.handleAddRecordReceiver(row);
        }
    }

    deleteRow(row) {
        const { Value__c } = row;

        this.copyReceivers = deleteReceiver(this.copyReceivers, Value__c);
        this.receivers = deleteReceiver(this.receivers, Value__c);

        this.setIsHasReseivers();
    }

    createCopyReceiver(receiver, nameValue){
        let copyReceiver = {...receiver};
        copyReceiver.Name = nameValue;
        this.copyReceivers = [...this.copyReceivers, copyReceiver];
    }

    callReportValidity(input, message) {
        input.setCustomValidity(message);
        input.reportValidity();
    }

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
        receiver.Value__c = getObjectName(this.displayedGroups, this.groupId);

        this.createCopyReceiver(receiver, receiver.Value__c);
        this.receivers = [...this.receivers, receiver];

        this.callReportValidity(combobox, "");
        this.setIsHasReseivers();
    }

    isGroupValid(combobox) {
        if (this.groupId.localeCompare("") === 0) {
            this.callReportValidity(combobox, label.error_choose_some_group);
            return false;
        }

        const value = getObjectName(this.displayedGroups, this.groupId);

        if (isReceiverExist(this.receivers, value)) {
            this.callReportValidity(combobox, label.error_already_added_this_group);
            return false;
        }

        return true;
    }

    handleAddRecordReceiver(row){
        const { Id, Name } = row;
        
        if (!this.isRecordValid(Id)) {
            return;
        }

        const receiver = {};
        receiver.Type__c = this.SINGLE_RECORD_VARIANT;
        receiver.Value__c = Id;

        this.createCopyReceiver(receiver, Name);
        this.receivers = [...this.receivers, receiver];

        this.setIsHasReseivers();
    }

    isRecordValid(value){
        if (isReceiverExist(this.receivers, value)) {
            this.showToast();
            return false;
        }
        return true;
    }

    showToast() {
        const event = new ShowToastEvent({
            title: label.error,
            message: label.duplicate_record,
            variant: 'error'
        });
        this.dispatchEvent(event);
    }

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
        receiver.Value__c = getObjectName(this.displayedCampaigns, this.campaignId);

        this.createCopyReceiver(receiver, receiver.Value__c);
        this.receivers = [...this.receivers, receiver];

        this.callReportValidity(combobox, "");
        this.setIsHasReseivers();
    }

    isCampaignValid(combobox) {
        if (this.campaignId.localeCompare("") === 0) {
            this.callReportValidity(combobox, label.error_choose_some_campaign);
            return false;
        }

        const value = getObjectName(this.displayedCampaigns, this.campaignId);

        if (isReceiverExist(this.receivers, value)) {
            this.callReportValidity(combobox, label.error_already_added_campaign);
            return false;
        }

        return true;
    }

    handleIsStandardSurveyChange(event) {
        this.__survey.IsStandard__c = event.target.checked;
    }

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

    clickPreviousButton() {
        const backNavigationEvent = new FlowNavigationBackEvent();
        this.dispatchEvent(backNavigationEvent);
    }

    clickNextButton() {
        const nextNavigationEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextNavigationEvent);
    }
}
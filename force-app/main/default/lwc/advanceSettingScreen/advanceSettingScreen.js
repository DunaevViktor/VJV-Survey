import { LightningElement, track, api, wire } from "lwc";
import { label } from "./labels.js";
import { columns, columnsMember, getResultTableStyle, getReceiversTableStyle, isReceiverExist, deleteReceiver, createDisplayedMap,
        createSurveyDisplayedMap, getObjectName, callReportValidity, createMemberList } from "./advanceSettingScreenHelper.js";
import { FlowNavigationBackEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getGroups from "@salesforce/apex/GroupController.getGroups";
import getSurveys from "@salesforce/apex/SurveyController.getAllSurveys";
import getCampaigns from "@salesforce/apex/CampaignController.getCampaigns";
import searchMembers from "@salesforce/apex/SearchHelper.searchMembers";
import getPageQuestionAmount from "@salesforce/apex/SurveySettingController.getPageQuestionAmount";
import { surveyFields, receiverFields } from "c/fieldService";

export default class AdvanceSettingScreen extends LightningElement {

    MULTIPLIER = 1;
    SINGLE_RECORD_VARIANT = "Record";
    GROUP_VARIANT = "User Group";
    CAMPAIGN_VARIAN = "Campaign";

    label = label;
    columns = columns;
    columnsMember = columnsMember;

    @wire(getPageQuestionAmount) amountItems;

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

    @track memberPage;
    @track isNeedPagination = false;
    @track currentPage = 0;

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
        return createSurveyDisplayedMap(this.displayedSurveys);
    }

    get campaignOptions() {
        return createDisplayedMap(this.displayedCampaigns);
    }

    @api set survey(value) {
        this.__survey = JSON.parse(JSON.stringify(value));
        this.isConnectToSurvey = this.__survey[surveyFields.RELATED] !== undefined;
        if(this.isConnectToSurvey) this.surveyId = this.__survey[surveyFields.RELATED] ;
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

    renderedCallback() {
        if(this.template.querySelector('.resultTable')) {
            this.template.querySelector('.resultTable').appendChild(getResultTableStyle());
        }

        if(this.template.querySelector('.emailTable')) {
            this.template.querySelector('.emailTable').appendChild(getReceiversTableStyle());
        }
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

    get isStandardSurvey() {
        return this.__survey[surveyFields.STANDARD];
    }

    get receiversKeyField() {
        return receiverFields.VALUE;
    }

    handleKeyUp(evt) {
        const isEnterKey = evt.keyCode === 13;
        if (!isEnterKey) { return; }
        this.queryTerm = evt.target.value;
        if (!(this.queryTerm && this.queryTerm.trim().length > 1)) { return; }
        this.searchError = false;
        searchMembers({ searchTerm: this.queryTerm })
            .then((result) => {
                this.memberList = createMemberList(result);
                this.currentPage = 0;
                this.resolveMembersPage();
                this.setIsHasMembers();
            })
            .catch(() => {
                this.searchError = true;
            });
    }

    resolveMembersPage() {
      this.isNeedPagination = this.memberList.length > (this.amountItems.data * this.MULTIPLIER);
      if(this.isNeedPagination) {
        this.memberPage = this.memberList.slice(
          this.currentPage *  (this.amountItems.data * this.MULTIPLIER), 
          (this.currentPage + 1 )*  (this.amountItems.data * this.MULTIPLIER)
        );
      } else {
        this.memberPage = [...this.memberList];
      }
    }

    get isPreviousDisabled() {
      return this.currentPage === 0;
    }
    
    get isNextDisabled() {
      return this.currentPage >= Math.floor(this.memberList.length /  (this.amountItems.data * this.MULTIPLIER));
    }

    clickPreviousTableButton() {
      if(this.currentPage === 0) return;
    
      this.currentPage--;
      this.resolveMembersPage();
    }
    
    clickNextTableButton() {
      if(this.currentPage >= Math.floor(this.memberList.length /  (this.amountItems.data * this.MULTIPLIER))) return;
    
      this.currentPage++;
      this.resolveMembersPage();
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
        const value = row[receiverFields.VALUE];
        this.copyReceivers = deleteReceiver(this.copyReceivers, value);
        this.receivers = deleteReceiver(this.receivers, value);
        this.setIsHasReseivers();
    }

    createCopyReceiver(receiver, nameValue){
        let copyReceiver = {...receiver};
        copyReceiver.Name = nameValue;
        this.copyReceivers = [...this.copyReceivers, copyReceiver];
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
        receiver[receiverFields.TYPE] = this.GROUP_VARIANT;
        receiver[receiverFields.VALUE] = this.groupId;

        let groupName = getObjectName(this.displayedGroups, this.groupId);
        this.createCopyReceiver(receiver, groupName);
        this.receivers = [...this.receivers, receiver];

        callReportValidity(combobox, "");
        this.setIsHasReseivers();
    }

    isGroupValid(combobox) {
        if (this.groupId.localeCompare("") === 0) {
            callReportValidity(combobox, label.error_choose_some_group);
            return false;
        }

        if (isReceiverExist(this.receivers, this.groupId)) {
            callReportValidity(combobox, label.error_already_added_this_group);
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
        receiver[receiverFields.TYPE] = this.SINGLE_RECORD_VARIANT;
        receiver[receiverFields.VALUE] = Id;

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
        receiver[receiverFields.TYPE] = this.CAMPAIGN_VARIAN;
        receiver[receiverFields.VALUE] = this.campaignId;

        let campaignName = getObjectName(this.displayedCampaigns, this.campaignId);
        this.createCopyReceiver(receiver, campaignName);
        this.receivers = [...this.receivers, receiver];

        callReportValidity(combobox, "");
        this.setIsHasReseivers();
    }

    isCampaignValid(combobox) {
        if (this.campaignId.localeCompare("") === 0) {
            callReportValidity(combobox, label.error_choose_some_campaign);
            return false;
        }

        if (isReceiverExist(this.receivers, this.campaignId)) {
            callReportValidity(combobox, label.error_already_added_campaign);
            return false;
        }
        return true;
    }

    handleIsStandardSurveyChange(event) {
        this.__survey[surveyFields.STANDARD] = event.target.checked;
    }

    handleSurveyChange(event) {
        this.__survey[surveyFields.RELATED] = event.detail.value;
        this.surveyId = event.detail.value;
    }

    handleConnectToAnotherSurveyChange(event) {
        this.isConnectToSurvey = event.target.checked;
        if (!this.isConnectToSurvey) {
            this.surveyId = "";
            this.__survey[surveyFields.RELATED] = undefined;
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
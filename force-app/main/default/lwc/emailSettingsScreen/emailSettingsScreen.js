import { LightningElement, track, api, wire } from "lwc";
import { NavigationMixin } from 'lightning/navigation';
import { navigationType } from './constants.js';
import { label } from "./labels.js";
import { columns, columnsMember, getResultTableStyle, getReceiversTableStyle, isReceiverExist, deleteReceiver, createDisplayedMap,
        getObjectName, callReportValidity, createMemberList, isUser } from "./emailSettingsScreenHelper.js";
import { FlowNavigationBackEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getGroups from "@salesforce/apex/GroupController.getGroups";
import getCampaigns from "@salesforce/apex/CampaignController.getCampaigns";
import searchMembers from "@salesforce/apex/SearchHelper.searchMembers";
import getPageQuestionAmount from "@salesforce/apex/SurveySettingController.getPageQuestionAmount";
import getCommunityUrl from "@salesforce/apex/CommunityController.getCommunityUrl";
import getCommunityName from "@salesforce/apex/SurveySettingController.getCommunityName";
import updateFullSurveyUrl from "@salesforce/apex/SaverController.updateFullSurveyUrl";
import { receiverFields, surveyObject } from "c/fieldService";

export default class EmailSettingsScreen extends NavigationMixin(LightningElement) {

    ONE = 1;
    EMPTY_STRING = '';
    EMPTY_ARRAY = [];
    ENTER_KEYCODE = 13;
    MULTIPLIER = 2;
    DELETE_ROW_ACTION = 'delete';
    ERROR_VARIANT = 'error';

    SINGLE_RECORD_VARIANT = "Record";
    GROUP_VARIANT = "User Group";
    CAMPAIGN_VARIAN = "Campaign";

    label = label;
    columns = columns;
    columnsMember = columnsMember;

    @wire(getPageQuestionAmount) amountItems;

    @track hasReceivers;
    @track receivers = [];
    @track displayedGroups = [];
    @track isHasGroups = false;
    @track getGroupError = false;
    @track getSurveyError = false;
    @track displayedCampaigns = [];
    @track getCampaignsError = false;
    @track isHasCampaigns = false;
    @track hasMembers = false;
    @track searchError = false;
    @track isFirstRun = false;

    @track memberPage;
    @track isNeedPagination = false;
    @track currentPage = 0;

    groupId = this.EMPTY_STRING;
    campaignId = this.EMPTY_STRING;
    queryTerm = this.EMPTY_STRING;
    memberList = [];

    communityUrl;
    surveyUrl;

    ANSWER_PAGE_API_NAME = 'Survey_Answer_Form';
    SURVEY_URL_PARAMETER_NAME = 'c__surveyId';

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
        return createDisplayedMap(this.displayedGroups);
    }

    get campaignOptions() {
        return createDisplayedMap(this.displayedCampaigns);
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
        this.initGroups();
        this.initCampaigns();
        this.setIsHasReseivers();
        this.setIsHasMembers();
        this.setSurveyUrl();
        this.setCommunityUrl();

        this.isFirstRun = true;
        this.isHasGroups = !!this.displayedGroups.length;
        this.isHasCampaigns = !!this.displayedCampaigns.length;
    }

    renderedCallback() {
        if(this.template.querySelector('.resultTable')) {
            this.template.querySelector('.resultTable').appendChild(getResultTableStyle());
        }

        if(this.template.querySelector('.emailTable')) {
            this.template.querySelector('.emailTable').appendChild(getReceiversTableStyle());
        }
    }

    initGroups() {
        if (!this.displayedGroups.length) {
            getGroups()
                .then((result) => {
                    this.displayedGroups = result.length ? result : [];
                    this.isHasGroups = !!this.displayedGroups.length;
                })
                .catch(() => {
                    this.getGroupError = true;
                });
        }
    }

    initCampaigns() {
        if (!this.displayedCampaigns.length) {
            getCampaigns()
                .then((result) => {
                    this.displayedCampaigns = result.length ? result : [];
                    this.isHasCampaigns = !!this.displayedCampaigns.length;
                })
                .catch(() => {
                    this.getCampaignsError = true;
                });
        }
    }

    get receiversKeyField() {
        return receiverFields.VALUE;
    }

    handleKeyUp(evt) {
        this.isFirstRun = false;
        const isEnterKey = evt.keyCode === this.ENTER_KEYCODE;
        if (!isEnterKey) { return; }
        this.queryTerm = evt.target.value;
        if (!(this.queryTerm && this.queryTerm.trim().length > this.ONE)) { return; }
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
            (this.currentPage + this.ONE )*  (this.amountItems.data * this.MULTIPLIER)
            );
        } else {
            this.memberPage = [...this.memberList];
        }
    }

    get isPreviousDisabled() {
        return !!this.currentPage;
    }
    
    get isNextDisabled() {
        return this.currentPage >= Math.floor(this.memberList.length /  (this.amountItems.data * this.MULTIPLIER));
    }

    clickPreviousTableButton() {
        if(!this.currentPage) return;
        
        this.currentPage--;
        this.resolveMembersPage();
    }
    
    clickNextTableButton() {
        if(this.currentPage >= Math.floor(this.memberList.length /  (this.amountItems.data * this.MULTIPLIER))) return;
        
        this.currentPage++;
        this.resolveMembersPage();
    }

    setIsHasMembers() {
        this.hasMembers = this.memberList && this.memberList.length;
    }

    setIsHasReseivers() {
        this.hasReceivers = this.receivers && this.receivers.length;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName){
            case this.DELETE_ROW_ACTION:
                this.deleteRow(row);
                break;
            default: this.handleAddRecordReceiver(row);
        }
    }

    deleteRow(row) {
        const value = row[receiverFields.VALUE];
        this.receivers = deleteReceiver(this.receivers, value);
        this.setIsHasReseivers();
    }

    handleGroupChange(event) {
        this.groupId = event.detail.value;
    }

    handleAddGroupReceiver() {
        const combobox = this.template.querySelector(".group-combobox");

        if (!this.isGroupValid(combobox)) {
            return;
        }

        let groupName = getObjectName(this.displayedGroups, this.groupId);
        const receiver = {};
        receiver[receiverFields.TYPE] = this.GROUP_VARIANT;
        receiver[receiverFields.VALUE] = this.groupId;
        receiver[receiverFields.URL] = this.surveyUrl;

        this.createCopyReceiver(receiver, groupName);
        receiver.DisplayedName = groupName;
        
        this.receivers = [...this.receivers, receiver];

        callReportValidity(combobox, this.EMPTY_STRING);
        this.setIsHasReseivers();
    }

    isGroupValid(combobox) {
        if (!this.groupId.localeCompare(this.EMPTY_STRING)) {
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
        receiver[receiverFields.URL] = isUser(Id) ? this.surveyUrl : this.communityUrl;
        receiver.DisplayedName = Name;

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
            variant: this.ERROR_VARIANT
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

        let campaignName = getObjectName(this.displayedCampaigns, this.campaignId);
        const receiver = {};
        receiver[receiverFields.TYPE] = this.CAMPAIGN_VARIAN;
        receiver[receiverFields.VALUE] = this.campaignId;
        receiver[receiverFields.URL] = this.communityUrl;

        this.createCopyReceiver(receiver, campaignName);
        receiver.DisplayedName = campaignName;
        
        this.receivers = [...this.receivers, receiver];

        callReportValidity(combobox, this.EMPTY_STRING);
        this.setIsHasReseivers();
    }

    isCampaignValid(combobox) {
        if (!this.campaignId.localeCompare(this.EMPTY_STRING)) {
            callReportValidity(combobox, label.error_choose_some_campaign);
            return false;
        }

        if (isReceiverExist(this.receivers, this.campaignId)) {
            callReportValidity(combobox, label.error_already_added_campaign);
            return false;
        }
        return true;
    }

    clickPreviousButton() {
        const backNavigationEvent = new FlowNavigationBackEvent();
        this.dispatchEvent(backNavigationEvent);
    }

    clickNextButton() {
        const nextNavigationEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextNavigationEvent);
    }

    setSurveyUrl(){
      if(surveyObject.split("__S").length > 1){
        this.ANSWER_PAGE_API_NAME = surveyObject.split("__S")[0] + '__' +  this.ANSWER_PAGE_API_NAME;
        this.SURVEY_URL_PARAMETER_NAME = this.SURVEY_URL_PARAMETER_NAME.replace('c', surveyObject.split("__S")[0]);
      }
      this[NavigationMixin.GenerateUrl]({
          type: navigationType,
          attributes: {
              apiName: this.ANSWER_PAGE_API_NAME
          }
      })
        .then((url) => {
          return updateFullSurveyUrl({surveyUrl : url});
        })
        .then((url) => {
          this.surveyUrl = url;
        })
        .catch((error) => {
          console.log(error);
        });
    }
  
    setCommunityUrl(){
      getCommunityName()
        .then((data) => {
          if (data) {
            return getCommunityUrl({communityName: data})
          }
        })
        .then((url) => {
          if (url) {
            this.communityUrl = `${url}/s/`;
          }
        })
        .catch((error) => {
            console.log(error);
        });
      
    }
}
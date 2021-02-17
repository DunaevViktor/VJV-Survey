import { label } from "./labels.js";
import { receiverFields } from "c/fieldService";

const TYPE_TEXT = "text";
const FIELD_NAME = "Name";
const FIELD_DISPLAYED_NAME = "DisplayedName";
const FIELD_STANDARD_TYPE = "Type";
const RECORD_TYPE_CONTACT = "Contact";
const RECORD_TYPE_USER = "User";
const RECORD_TYPE_LEAD = "Lead";

const BUTTON_WIDTH = 100;
const ZERO = 0;
const EMPTY_STRING = '';
const PREFIX_LENGTH = 3;
const USER_PREFIX = '005';
const LEAD_PREFIX = '00Q';

const DELETE_ROW_ACTION = 'delete';
const ADD_ROW_ACTION = 'add';

const columns = [
    { label: label.type, fieldName: receiverFields.TYPE, type: TYPE_TEXT },
    { label: label.Name, fieldName: FIELD_DISPLAYED_NAME, type: TYPE_TEXT },
    {
        type: "button",
        initialWidth: BUTTON_WIDTH,
        typeAttributes: {
            label: label.delete_button,
            name: DELETE_ROW_ACTION
        }
    }
];

const columnsMember = [
    { label: label.type, fieldName: FIELD_STANDARD_TYPE, type: TYPE_TEXT },
    { label: label.Name, fieldName: FIELD_NAME, type: TYPE_TEXT },
    {
        type: "button",
        initialWidth: BUTTON_WIDTH,
        typeAttributes: {
            label: label.add,
            name: ADD_ROW_ACTION
        }
    }
];

const getResultTableStyle = () => {
    const resultStyle = document.createElement('style');
    resultStyle.innerText = '.resultTable .slds-th__action{background-color: #b9b4ff; color: white;} ' + 
    '.slds-table_header-fixed_container {overflow: hidden} ' + 
    '.resultTable .slds-has-focus .slds-th__action, .resultTable .slds-th__action:hover {background-color: #9090ff !important;}';
    return resultStyle;
}

const getReceiversTableStyle = () => {
    const receiversStyle = document.createElement('style');
    receiversStyle.innerText = '.emailTable .slds-th__action{background-color:#409fff; color: white;} ' + 
    '.slds-table_header-fixed_container {overflow: hidden} ' + 
    '.emailTable .slds-has-focus .slds-th__action, .emailTable .slds-th__action:hover {background-color: #0082de !important;}';
    return receiversStyle;
}

const isReceiverExist = (receivers, value) => {
    return receivers.find((receiver) => {
        return receiver[receiverFields.VALUE].localeCompare(value) === ZERO
    });
};

const deleteReceiver = (receiverList, filterValue) => {
    return receiverList.filter((receiver) => {
        return receiver[receiverFields.VALUE] !== filterValue;
    });
}

const createDisplayedMap = (objectList) => {
    return objectList.map((element) => {
        return { label: element.Name, value: element.Id };
    });
}

const getObjectName = (objectList, objectId) => {
    return objectList.find((element) => {
        return objectId === element.Id;
    }).Name;
}

const callReportValidity = (input, message) => {
    input.setCustomValidity(message);
    input.reportValidity();
}

const createMemberList = (result) => {
    let memberList = [];
    result.forEach(memberListByType => {
        let recordType = EMPTY_STRING;
        if(memberListByType.length > ZERO){
            let uniquePrefix = memberListByType[ZERO].Id.substr(ZERO, PREFIX_LENGTH);
            switch (uniquePrefix){
                case USER_PREFIX :
                    recordType = RECORD_TYPE_USER;
                    break;
                case LEAD_PREFIX :
                    recordType = RECORD_TYPE_LEAD;
                    break;
                default: recordType = RECORD_TYPE_CONTACT;
            }
        }
        memberListByType.forEach(member => {
            let copyMember = {...member};
            copyMember.Type = recordType;
            memberList.push(copyMember);
        });
    });
    return memberList;
}

export {
    columns,
    columnsMember,
    getResultTableStyle,
    getReceiversTableStyle,
    isReceiverExist,
    deleteReceiver,
    createDisplayedMap,
    getObjectName,
    callReportValidity,
    createMemberList
};
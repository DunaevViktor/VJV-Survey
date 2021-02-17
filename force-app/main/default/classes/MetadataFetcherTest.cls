@isTest
public with sharing class MetadataFetcherTest {
    
    private static final String TRIGGER_RULE_OBJECT_API_NAME = 'Trigger_Rule__c';
    private static final String OBJECT_API_NAME_FIELD = 'Object_Api_Name__c';
    private static final String CASE_OBJECT_API_NAME  = 'Case';
    private static final String CONTACT_OBJECT_API_NAME  = 'Contact';
    private static final String NON_EXISTENT_FIELD = 'Test__c';
    private static final String NAME_FIELD = 'Name';
    private static final Integer MIN_TRIGGER_RULE_STANDARD_OBJECTS_COUNT = 3;
    private static final Integer MIN_CONTACT_OBJECT_FIELDS_COUNT = 29;
    
    private static final String INVALID_OBJECT_API_NAMES_AMOUNT = 'Actual length of object api names is less than expected.';
    private static final String INVALID_OBJECT_FIELD_AMOUNT = 'Actual amount of object fields is less than expected.';
    private static final String INVALID_OBJECT_FIELD_DESCRIPTION_RESULT = 'Invalid object field description result.';
    private static final String INVALID_PICKLIST_OPTIONS_AMOUNT = 'Invalid picklist options amount.';
    
    
    @isTest
    static void testPositiveGetPicklistValues() {
        Map<String, String> result = MetadataFetcher.getPicklistValues(TRIGGER_RULE_OBJECT_API_NAME, OBJECT_API_NAME_FIELD);
        System.assert(result.size() >= MIN_TRIGGER_RULE_STANDARD_OBJECTS_COUNT, INVALID_OBJECT_API_NAMES_AMOUNT);
    }
    
    @isTest
    static void testNegativeGetPicklistValues() {
        Map<String, String> result = MetadataFetcher.getPicklistValues(CASE_OBJECT_API_NAME, NON_EXISTENT_FIELD);
        System.assertEquals(0, result.size(), INVALID_PICKLIST_OPTIONS_AMOUNT);
    }
    
    @isTest
    static void testFirstGetObjectFieldsDescriptionList() {
        List<FieldDescriptionWrapper> result = MetadataFetcher.getObjectFieldsDescriptionList(CONTACT_OBJECT_API_NAME);
        System.assertNotEquals(null, result, INVALID_OBJECT_FIELD_DESCRIPTION_RESULT);
        for(FieldDescriptionWrapper fieldDescription: result) {
            System.assertNotEquals(null, fieldDescription.value, INVALID_OBJECT_FIELD_DESCRIPTION_RESULT);
            System.assertNotEquals(null, fieldDescription.label, INVALID_OBJECT_FIELD_DESCRIPTION_RESULT);
            System.assertNotEquals(null, fieldDescription.datatype, INVALID_OBJECT_FIELD_DESCRIPTION_RESULT);
            if(fieldDescription.datatype == MetadataFetcher.REFERENCE_DATATYPE) {
                System.assertNotEquals(0, fieldDescription.referencedObjects.size(), INVALID_OBJECT_FIELD_DESCRIPTION_RESULT);
            }
        }
        System.assert(result.size() >= MIN_CONTACT_OBJECT_FIELDS_COUNT, INVALID_OBJECT_FIELD_AMOUNT);
    }
}
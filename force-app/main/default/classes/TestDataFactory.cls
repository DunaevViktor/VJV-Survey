@isTest
public class TestDataFactory {
    
    static final List<String> NUMBER_DATE_OPERATORS = new List<String>{'IS NULL', 'EQUALS', 'NOT EQUALS', 'LESS THAN', 'GREATER THAN'};
    static final List<String> OTHER_FIELD_OPERATORS = new List<String>{'IS NULL', 'EQUALS', 'NOT EQUALS', 'CONTAINS', 'NOT CONTAINS'};
            
    public static void createTriggerRules(Id surveyId){
        Survey__c testSurvey = new Survey__c(Name = 'Test Survey');
        insert testSurvey;
                
        Map<String, List<String>> fieldTypeOperators = new Map<String, List<String>>();
                
        fieldTypeOperators.put('DATE', NUMBER_DATE_OPERATORS);
        fieldTypeOperators.put('DATETIME', NUMBER_DATE_OPERATORS);
        fieldTypeOperators.put('DOUBLE', NUMBER_DATE_OPERATORS);
        fieldTypeOperators.put('TEXT', OTHER_FIELD_OPERATORS);
                
        List<Trigger_Rule__c> triggerRules = new List<Trigger_Rule__c>();
                
        for(String fieldType: fieldTypeOperators.keySet()){
            for(String operator: fieldTypeOperators.get(fieldType)){
                Trigger_Rule__c triggerRule;
                switch on fieldType{
                    when 'DATE'{
                        triggerRule = new Trigger_Rule__c(Field_Name__c = 'Birthdate',
                                                                  Operator__c = operator,
                                                                  Field_Value__c = '4/28/2020',
                                                                  Object_Api_Name__c = 'Contact',
                                                                  Survey__c = testSurvey.Id);
                    }
                    when 'DATETIME'{
                        triggerRule = new Trigger_Rule__c(Field_Name__c = 'EmailBouncedDate', 
                                                                  Operator__c = operator,
                                                                  Field_Value__c = '10/14/2019, 11:46 AM', 
                                                                  Object_Api_Name__c = 'Contact', 
                                                                  Survey__c = testSurvey.Id);
                    }
                    when 'DOUBLE'{
                        triggerRule = new Trigger_Rule__c(Field_Name__c = 'MailingLatitude',
                                                                  Operator__c = operator,
                                                                  Field_Value__c = '12345', 
                                                                  Object_Api_Name__c = 'Contact', 
                                                                  Survey__c = testSurvey.Id);
                    }
                    when else{
                        triggerRule = new Trigger_Rule__c(Field_Name__c = 'SuppliedEmail', 
                                                                  Operator__c = operator,
                                                                  Field_Value__c = 'Test Email', 
                                                                  Object_Api_Name__c = 'Case', 
                                                                  Survey__c = testSurvey.Id);
                    }
                }
                triggerRules.add(triggerRule);
            }
        }
                
        insert triggerRules;
    }
    
    public static Id createSurvey(){
        Survey__c testSurvey = new Survey__c(Name = 'Test Survey');
        insert testSurvey;
        return testSurvey.Id;
    }
    
    public static void createEmailReceivers(Id surveyId){
        List<Email_Receiver__c> emailReceivers = new List<Email_Receiver__c>();
        for(Integer i=0; i<5; i++){
            Email_Receiver__c emailReceiver = new Email_Receiver__c(Survey__c = surveyId, Type__c='Email',
                                                                    Value__c='mail' + i);
            emailReceivers.add(emailReceiver);
        }
        
        insert emailReceivers;
    }
    
    public static void createContacts(){
        List<Contact> contactList = new List<Contact>();
        
        Date testBirthdate = Date.parse('4/28/2021'); 
        Datetime testEmailBouncedDate = Datetime.parse('10/14/2018, 11:46 AM');
        
        for(Integer i=0; i<5; i++){
            Contact testContact = new Contact(LastName = 'Test Name',
                                              Birthdate = testBirthdate,
                                              EmailBouncedDate = testEmailBouncedDate,
                                              MailingLongitude = 15,
                                              MailingLatitude = 15);
            contactList.add(testContact);
        }
        
        insert contactList;
    }
    
    public static void createCases(){
        List<Case> caseList = new List<Case>();
        
        for(Integer i=0; i<5; i++){
            Case testCase = new Case(SuppliedEmail = 'Email' + i + '@vjv.com');
            caseList.add(testCase);
        }
        
        insert caseList;
    }
    
    public static void createLeads(){
        List<Lead> leadList = new List<Lead>();
        
        for(Integer i=0; i<5; i++){
            Lead testLead = new Lead(LastName = 'Test Name', Industry='Apparel', Company = 'VJV');
            leadList.add(testLead);
        }
        
        insert leadList;
    }
}
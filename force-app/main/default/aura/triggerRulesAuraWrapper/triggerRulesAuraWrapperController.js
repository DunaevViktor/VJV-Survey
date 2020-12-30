({
  setTriggerRules: function (cmp, event, helper) {
    try {
      let newrules = event.getParam("triggerRules");
      console.log("Param rules");
      console.log(newrules);
      let numbers = [];
      let objToInsert = {};
      objToInsert.Object_Api_Name__c = "Lead";
      objToInsert.Field_Name__c = "Company";
      objToInsert.Field_Value__c = "X";
      numbers.push(objToInsert);
      console.log("Numbers");
      console.log(numbers);

      cmp.set("v.triggerRules", numbers);
    } catch (error) {
      console.log(error);
    }
  }
});

({
  setTriggerRules: function (cmp, event, helper) {
    let triggerRules = event.getParam("triggerRules");
    console.log("Param rules");
    console.log(triggerRules);

    cmp.set("v.triggerRules", triggerRules);

    var navigate = cmp.get("v.navigateFlow");
    navigate("NEXT");
  }
});

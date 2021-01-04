({
  setTriggerRules: function (cmp, event, helper) {
    const triggerRules = event.getParam("triggerRules");
    cmp.set("v.triggerRules", triggerRules);
    const navigate = cmp.get("v.navigateFlow");
    navigate("NEXT");
  }
});

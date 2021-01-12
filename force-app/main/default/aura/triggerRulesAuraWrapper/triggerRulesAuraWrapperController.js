({
  navigateNext: function (cmp, event) {
    cmp.set("v.triggerRules", event.getParam("triggerRules"));
    const navigate = cmp.get("v.navigateFlow");
    navigate("NEXT");
  },
  navigatePrev: function (cmp, event) {
    cmp.set("v.triggerRules", event.getParam("triggerRules"));
    const navigate = cmp.get("v.navigateFlow");
    navigate("BACK");
  }
});

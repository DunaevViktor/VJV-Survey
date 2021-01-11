({
  changeSurveyData: function (component, event) {
    component.set("v.survey", event.getParam("survey"));
  },

  onPrevious: function (cmp) {
    const navigate = cmp.get("v.navigateFlow");
    navigate("BACK");
  },

  onNext: function (cmp) {
    const navigate = cmp.get("v.navigateFlow");
    navigate("NEXT");
  }
});

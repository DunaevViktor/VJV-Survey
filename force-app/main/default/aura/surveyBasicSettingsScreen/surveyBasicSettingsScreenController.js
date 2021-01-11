({
  changeSurveyData: function (component, event) {
    component.set("v.survey", event.getParam("survey"));
  },

  onNext: function (cmp) {
    const navigate = cmp.get("v.navigateFlow");
    navigate("NEXT");
  }
});

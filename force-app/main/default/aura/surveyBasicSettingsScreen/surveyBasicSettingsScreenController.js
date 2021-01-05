({
  changeSurveyName: function (component, event) {
    component.set("v.surveyName", event.getParam("name"));
  },

  changeSurveyLogo: function (component, event) {
    component.set("v.surveyLogo", event.getParam("logoUrl"));
  },

  changeSurveyColor: function (component, event) {
    component.set("v.surveyColor", event.getParam("color"));
  }
});

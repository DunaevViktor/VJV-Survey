({
  changeSurveyName: function (component, event) {
    component.set("v.surveyName", event.getParam("name"));
  },

  changeSurveyLogo: function (component, event) {
    component.set("v.surveyLogo", event.getParam("logoData"));
  },

  changeSurveyColor: function (component, event) {
    component.set("v.surveyColor", event.getParam("color"));
  }
});

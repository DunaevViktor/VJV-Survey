({
  changeQuestions: function (cmp, event) {
    cmp.set("v.questions", event.getParam("questions"));
  },

  changeTemplates: function (cmp, event) {
    cmp.set("v.templates", event.getParam("templates"));
  },

  changeTemplateQuestions: function (cmp, event) {
    cmp.set("v.templateQuestions", event.getParam("templateQuestions"));
  },

  changeStandardQuestions: function (cmp, event) {
    cmp.set("v.standardQuestions", event.getParam("standardQuestions"));
  },

  onPrevious: function (cmp) {
    cmp.set("v.validations", []);
    const navigate = cmp.get("v.navigateFlow");
    navigate("BACK");
  },

  onNext: function (cmp) {
    const navigate = cmp.get("v.navigateFlow");
    navigate("NEXT");
  }
});
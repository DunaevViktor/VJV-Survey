({
  changeValidations: function (cmp, event) {
    cmp.set("v.validations", event.getParam("validations"));
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

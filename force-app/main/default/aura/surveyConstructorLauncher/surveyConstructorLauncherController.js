({
	launchFlow : function(component, event, helper) {
		let flow = component.find("surveyFlow");
        flow.startFlow("Survey_Flow");
	},
})
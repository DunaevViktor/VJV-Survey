({
    launchFlow : function(component) {
        component.set("v.showLaunch", true);
        var flow = component.find("surveyFlow");
        
        flow.startFlow("Survey_Flow");
    },
    
    handleStatusChange : function(component, event) {
        if(event.getParam("status") === "FINISHED") {
            component.set("v.showLaunch", false); 
        }
    },
})
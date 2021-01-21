({
    launchFlow : function(component) {
        component.set("v.showFlow", true);
        component.set("v.showLaunch", false);
        var flow = component.find("surveyFlow");
        
        flow.startFlow("Survey_Flow");
    },
    
    handleStatusChange : function(component, event) {
        if(event.getParam("status") === "FINISHED") {
            component.set("v.showFlow", false); 
            component.set("v.showLaunch", true);
        }
    },
})
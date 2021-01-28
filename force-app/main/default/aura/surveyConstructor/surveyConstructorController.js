({
    doInit : function(component) {
        var flow = component.find("surveyFlow");
        
        flow.startFlow("Survey_Flow");
    },
    
    handleStatusChange : function(component, event) {
        if(event.getParam("status") === "FINISHED") {           
            component.find("overlayLibFlow").notifyClose();
        }
        const outputVariables = event.getParam("outputVariables");
        for(let i = 0; i < outputVariables.length; i++) {
            let outputVar = outputVariables[i];
            if(outputVar.name === "CurrentScreenHeader") {
              component.set("v.headerText", outputVar.value);
              break;
            }
        }
    },
    
    closeModal: function(component) {
        component.find("overlayLibFlow").notifyClose();
    },
    
})
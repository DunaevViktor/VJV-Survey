({
    doInit : function(component) {
        var flow = component.find("surveyFlow");
        
        flow.startFlow("Survey_Flow");
    },
    
    handleStatusChange : function(component, event) {
        if(event.getParam("status") === "FINISHED") {           
            component.find("overlayLibFlow").notifyClose();
        }
    },
    
    closeModal: function(component) {
        component.find("overlayLibFlow").notifyClose();
    },
    
})
({
    launchFlow : function(component) {
        var modalBody;
        $A.createComponent(
            "c:surveyConstructor",
            {},
            function (content, status) {
                if (status === "SUCCESS") {
                    modalBody = content;
                    component.find("overlayLibButton").showCustomModal({
                        body: modalBody,
                        showCloseButton: true
                    });
                }
            }
        );
    },
    
})
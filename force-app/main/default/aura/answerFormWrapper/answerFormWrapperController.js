({
    handleCloseTab : function(component) {
        var workspaceAPI = component.find("workspace");

        workspaceAPI.getFocusedTabInfo().then(function(response) {
            var focusedTabId = response.tabId;

            workspaceAPI.closeTab({tabId: focusedTabId});
        });
    }
})
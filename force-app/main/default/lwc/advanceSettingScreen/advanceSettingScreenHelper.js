const columns = [
    { label: label.type, fieldName: "Type__c", type: "text" },
    { label: label.group_name_or_email, fieldName: "Value__c", type: "text" },
    {
      type: "button",
      initialWidth: 100,
      typeAttributes: {
        label: label.delete_button,
        name: "delete"
      }
    }
  ];

  export { columns }
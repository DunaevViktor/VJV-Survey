const transformDisplayesTypes = (templates) => {
  return templates.map((template) => {
    return {
      label: template.Name,
      value: template.Id
    };
  });
}

export {
  transformDisplayesTypes
}
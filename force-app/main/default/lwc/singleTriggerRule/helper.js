const createPicklistOption = (label, value, datatype) => {
  let objectForPicklist = {
    label: label,
    value: value,
    datatype: datatype
  };

  return objectForPicklist;
};

export { createPicklistOption };

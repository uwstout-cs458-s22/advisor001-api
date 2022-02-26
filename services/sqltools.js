function whereParams(values) {
  if (values && Object.keys(values).length > 0) {
    const text =
      'WHERE ' +
      Object.keys(values)
        .map((col, index) => `"${col}"=$${index + 1}`)
        .join(' AND ');
    return { text: text, params: Object.values(values) };
  }
  return { text: '', params: [] };
}

function insertValues(values) {
  if (values && Object.keys(values).length > 0) {
    const columns = Object.keys(values)
      .map((col) => `"${col}"`)
      .join(',');
    const parmList = Object.keys(values)
      .map((_, index) => `$${index + 1}`)
      .join(',');
    const params = Object.values(values);
    return {
      text: `(${columns}) VALUES (${parmList})`,
      params: params,
    };
  }
  return { text: '', params: [] };
}

function updateValues(whereValues, setValues) {
  if (setValues && whereValues) {
    const setValuesLength = Object.keys(setValues).length;
    const whereValuesLength = Object.keys(whereValues).length;

    if (setValuesLength > 0 && whereValuesLength > 0) {
      const whereText = whereParams(whereValues).text;
      const setText = Object.keys(setValues)
        .map((col, index) => `"${col}"=$${index + whereValuesLength + 1}`)
        .join(', ');
      const text = `SET ${setText} ${whereText}`;
      const params = Object.values(whereValues).concat(Object.values(setValues));
      return {
        text: text,
        params: params,
      };
    }
  }

  return { text: '', params: [] };
}

module.exports = {
  whereParams: whereParams,
  insertValues: insertValues,
  updateValues: updateValues,
};

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

function specificWhereParams(tableMap) {
  /*
  table1: {
    key1: value1,
    key2: value2,
  },
  table2: {
    key1: value1,
    key2, value2,
  }, ...
  */
  if (tableMap && Object.keys(tableMap).length > 0) {
    const keys = [];
    const values = [];

    Object.keys(tableMap).forEach((tableName) =>
      Object.keys(tableMap[tableName]).forEach((keyName) => {
        // keys and values
        keys.push(`"${tableName}"."${keyName}"`);
        values.push(tableMap[tableName][keyName]);
      })
    );
    // now generate text (no quotes)
    const text = 'WHERE ' + keys.map((col, index) => `${col}=$${index + 1}`).join(' AND ');
    return { text: text, params: values };
  }
  return { text: '', params: [] };
}

// returns 'key1, key2, key3'
function columnList(values) {
  return Object.keys(values)
    .map((col) => `"${col}"`)
    .join(',');
}

// returns '$1, $2, $3'
function paramList(values) {
  return Object.keys(values)
    .map((_, index) => `$${index + 1}`)
    .join(',');
}

// returns 'key1=$1, key2=$2, key3=$3'
function setList(values, offset = 1) {
  return Object.keys(values)
    .map((col, index) => `"${col}"=$${index + offset}`)
    .join(', ');
}

function insertValues(values) {
  if (values && Object.keys(values).length > 0) {
    return {
      text: `(${columnList(values)}) VALUES (${paramList(values)})`,
      params: Object.values(values),
    };
  }
  return { text: '', params: [] };
}

function insertOrUpdate(whereValues, setValues) {
  if (setValues && whereValues && Object.keys(whereValues).length > 0) {
    // 1. combined list
    const combined = Object.assign({}, whereValues, setValues);
    const insertText = `(${columnList(combined)}) VALUES (${paramList(combined)})`;
    // 2. conflict?
    const uniqueKeys = columnList(whereValues);
    const setText = setList(combined);
    const conflictText = `ON CONFLICT (${uniqueKeys}) DO UPDATE SET ${setText}`;
    // 3. final text
    return {
      text: `${insertText} ${conflictText}`,
      params: Object.values(combined),
    };
  }
  return { text: '', params: [] };
}

function updateValues(whereValues, setValues) {
  if (setValues && whereValues) {
    const setValuesLength = Object.keys(setValues).length;
    const whereValuesLength = Object.keys(whereValues).length;

    if (setValuesLength > 0 && whereValuesLength > 0) {
      // set and where text
      const setText = setList(setValues, whereValuesLength + 1);
      const whereText = whereParams(whereValues).text;
      // build string
      const text = `SET ${setText} ${whereText}`;
      // param list
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
  whereParams,
  insertValues,
  updateValues,
  insertOrUpdate,
  specificWhereParams,
};

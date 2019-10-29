const fs = require('fs');
const path = require('path');
const resourceFieldProvider = require('./resourceFieldProvider');

function getResourceFileNameById(dir, id, overwrite, mask) {
  let files = fs.readdirSync(dir) || [];

  // Make sure the array only contains files
  files = files.filter(fileName => fs.statSync(path.join(dir, fileName)).isFile());
  if (!files || files.length === 0) {
    return null;
  }

  let dashboardFile = null;
  files.every(fileName => {
    const filePath = path.join(dir, fileName);
    if (isValidFile(filePath)) {
      let dashboardId = undefined;
      if (overwrite === true) {
        dashboardId = path.parse(fileName).name;
        if (dashboardId.endsWith('.private')) {
          dashboardId = path.parse(dashboardId).name;
        }
      } else {
        const fileContents = getFileContents(filePath, mask);
        dashboardId = resourceFieldProvider.getField('id', fileContents);
      }
      if (dashboardId && dashboardId === id) {
        dashboardFile = fileName;
        return false;
      }
    }
    return true;
  });

  return dashboardFile;
}

function isValidFile(filePath) {
  const stats = fs.statSync(filePath);
  return stats.isFile() && (filePath.endsWith('.js') || filePath.endsWith('.ts'));
}

function extractExpression(contents, expression, shouldReplace, mask) {
  let findExpression = expression.exec(contents);
  if (!findExpression || findExpression.length === 0) {
    return null;
  }

  if (shouldReplace) {
    return contents.replace(findExpression[0], findExpression[0].replace(findExpression[1], mask));
  }

  return findExpression[0];
}

function extractUnmaskExpression(contents, expression, shouldGetValue) {
  let findExpression = expression.exec(contents);
  if (!findExpression || findExpression.length === 0 || (shouldGetValue && findExpression.length <= 1)) {
    return null;
  }

  return shouldGetValue ? findExpression[1] : findExpression[0];
}

function extractValueFromJSONString(contents, mask, start, end) {

  if (!mask) { return contents; }

  // search for property name
  start = start || 0;
  end  = end || contents.length;
  let propertyName = mask.substr(0, mask.indexOf('|') >= 0 ? mask.indexOf('|') : mask.length); 
  let objectIndex = contents.indexOf(propertyName, start);
  if (objectIndex < 0 || objectIndex > end) { return null; }

  // find first ':'
  let objectStartInedx = objectIndex + propertyName.length;

  // Checking case of "property-name"
  if (objectIndex > 0 && contents.length > objectStartInedx &&
      contents[objectIndex - 1] === '"' && contents[objectStartInedx] === '"') { objectStartInedx++; }

  while (contents.length > objectStartInedx && /\s|:/.test(contents[objectStartInedx])) { objectStartInedx++; }

  // find first '{'
  while (contents.length > objectStartInedx && /\s/.test(contents[objectStartInedx])) { objectStartInedx++; }

  // Check that the start of the object is a '{' character
  if (contents.length <= objectStartInedx) { return null; }

  let findStart = '{';
  let findEnd = '}';
  let findType = '{';
  switch (contents[objectStartInedx]) {
    case '{':
      findStart = '{';
      findEnd = '}';
      findType = 'brackets';
      break;
    case '[':
      findStart = '[';
      findEnd = ']';
      findType = 'brackets';
      break;
    case '"':
      findStart = '"';
      findEnd = '"';
      findType = 'string';
      break;
  }

  // count '{' + '}' until I get to 0
  let objectEndIndex = objectStartInedx;
  if (findType === 'brackets') {
    let brackets = 1;
    let toggleString = false;
    let toggleStringA = false;
    let toggleStringB = false;
    while (brackets > 0 && contents.length > objectEndIndex) {
      switch (contents[++objectEndIndex]) {
        case findStart:
          if (!toggleString) { brackets++; }
          break;
        case findEnd:
        if (!toggleString) { brackets--; }
          break;
        case '"':
          if (!toggleStringB) { 
            toggleStringA = !toggleStringA; 
            toggleString = toggleStringA || toggleStringB;
          }
          break;
        case '\'':
          if (!toggleStringA) { 
            toggleStringB = !toggleStringB; 
            toggleString = toggleStringA || toggleStringB;
          }
          break;
      }
    }
  } else {
    while (contents.length > objectEndIndex && 
          (contents[++objectEndIndex] !== '"' || contents[objectEndIndex] === '\\'));
  }

  // Check that the end of the object is a '}' character
  if (contents.length <= objectEndIndex || contents[objectEndIndex] !== findEnd) { return null; }
  
  objectStartInedx++;
  if (mask.indexOf('|') >= 0) {
    return extractValueFromJSONString(contents, mask.substr(mask.indexOf('|') + 1), objectStartInedx, objectEndIndex);
  }

  // take string part and return it
  return {
    value: contents.substring(objectStartInedx, objectEndIndex),
    start: objectStartInedx,
    end: objectEndIndex
  };
}

function maskString(contents, unmask, maskRequirements, keyName) {


  let maskedContent = contents;
  resourceFieldProvider.MASKING_REQUIREMENTS.forEach(masker => {
    
    let valueData = extractValueFromJSONString(maskedContent, masker);
    if (!valueData) { return; }
    
    let maskString = resourceFieldProvider.MASK_STRING;
    if (unmask) {

      // The user updated the value, no need to unmask
      if (valueData.value !== resourceFieldProvider.MASK_STRING) { return; }

      let unmaskValueData = extractValueFromJSONString(unmask, masker);
      if (!unmaskValueData) { return; }
      maskString = unmaskValueData.value;
    }

    // Replace old value with masked value
    maskedContent = maskedContent.substr(0, valueData.start) + maskString + maskedContent.substr(valueData.end);
  });

  return maskedContent;
}

function maskFileContent(contents) {
  return maskString(contents);
}

function unmaskFileContent(contents, filePath) {
  let unmaskContent = getFileContents(filePath, false);
  let unmaskedContents = maskString(contents, unmaskContent);
  return unmaskedContents ? unmaskedContents : contents;
}

function getFileContents(filePath, mask) {
  let contents = fs.readFileSync(filePath, 'utf8');

  // mask connection
  if (mask !== false) {
    let tryMask = maskFileContent(contents);
    if (tryMask) {
      contents = tryMask;
    }
  }

  return filePath.endsWith(".ts")
    ? "return " + contents.slice(contents.indexOf("/*return*/ {") + 10)
    : contents;
}

module.exports = {
  getResourceFileNameById,
  isValidFile,
  getFileContents,
  unmaskFileContent
}
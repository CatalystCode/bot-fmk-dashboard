/**
 * Use this method to rewire a module to render children other than 
 * it's native components. (For shalow testing)
 * 
 * @link http://stackoverflow.com/questions/32057745/using-scryrenderedcomponentswithtype-or-findrenderedcomponentwithtype
 * 
 * @param rewiredModule - The React module to rewire
 * @param varValues - The new component to use
 */
function rewireModule (rewiredModule, varValues) {
  let rewiredReverts = [];

  beforeEach(() => {
    let key, value, revert;
    for (key in varValues) {
      if (varValues.hasOwnProperty(key)) {
        value = varValues[key];
        revert = rewiredModule.__set__(key, value);
        rewiredReverts.push(revert);
      }
    }
  });

  afterEach(() => {
    rewiredReverts.forEach(revert => revert());
  });

  return rewiredModule;
}

export { rewireModule };
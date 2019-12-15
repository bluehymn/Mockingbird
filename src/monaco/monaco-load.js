(function() {
  const path = require('path');
  const amdLoader = require('./assets/monaco/vs/loader.js');
  window.amdRequire = amdLoader.require;
  const amdDefine = amdLoader.require.define;
  function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');
    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
      pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
  }
  amdRequire.config({
    baseUrl: uriFromPath(
      path.join(__dirname, './assets/monaco')
    )
  });
  self.module = undefined;
})();
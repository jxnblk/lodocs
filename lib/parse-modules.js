
var fs = require('fs');
var path = require('path');

var read = require('./read');
var md = require('./md');


module.exports = function(modules) {

  var obj = {};

  var self = this;

  function getModule(name) {

    var modulePath = path.join(self.root, './node_modules/' + name);

    if (!fs.existsSync(modulePath)) return false;
    var module = require(modulePath + '/package.json');
    var markdown = read(modulePath + '/README.md');
    module.content = md(markdown);

    return module;

  };

  modules.forEach(function(name) {
    obj[name] = getModule(name);
  });

  return obj;

};

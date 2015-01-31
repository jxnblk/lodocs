
var fs = require('fs');

var read = require('./read');
var md = require('./md');

function getModule(name) {
  if (!fs.existsSync('./node_modules/' + name)) return false;
  var module = require(name + '/package.json');
  var markdown = read('./node_modules/' + name + '/README.md');
  module.content = md(markdown);
  return module;
};

module.exports = function(modules) {
  var obj = {};
  modules.forEach(function(name) {
    obj[name] = getModule(name);
  });
  return obj;
};

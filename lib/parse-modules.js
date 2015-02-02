
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

var read = require('./read');
var md = require('./md');
var titleCase = require('./humanize-name');

module.exports = function(modules) {

  var obj = {};

  var self = this;

  function parseReadme(html) {
    var obj = {};
    var $ = cheerio.load(html);
    obj.heading = $('h1').first().remove();
    obj.description = $('p').first().remove();
    obj.body = $.html();
    return obj;
  };

  function getModule(name) {

    var modulePath = path.join(self.root, './node_modules/' + name);

    if (!fs.existsSync(modulePath)) return false;
    var module = require(modulePath + '/package.json');
    var markdown = read(modulePath + '/README.md');
    var html = md(markdown);
    module.readme = parseReadme(html);
    module.content = module.readme.body;
    module.title = titleCase(module.name);
    module.npmLink = '//npmjs.com/package/' + module.name;

    return module;

  };

  modules.forEach(function(name) {
    obj[name] = getModule(name);
  });

  return obj;

};

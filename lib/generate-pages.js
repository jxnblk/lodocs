
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var fm = require('front-matter');

var md = require('./md');
var read = require('./read');

module.exports = function() {

  var self = this;

  function generatePages(routes) {

    // use _.forIn
    var keys = Object.keys(routes);

    keys.forEach(function(key) {

      var route = routes[key];
      var dest = self.dest + route.path;
      var content = read(path.join(self.source + route.path, './index.html'));
      var pageData = self;

      // Check for markdown file
      if (!content) {
        console.log('checking for markdown');
        var src  = read(path.join(self.source + route.path, './index.md'));
        var matter = fm(src);
        _.assign(pageData, matter.attributes);
        content = md(matter.body);
      }

      // Check for parsed module
      if (typeof modules !== 'undefined' && !content) {
        var module = modules[source] || false;
        if (module) {
          content = modules[source].content;
          pageData.page = module;
        }
      }

      // Check for node module
      var source = route.source || key;
      if (!content && fs.existsSync('./node_modules/' + source)) {
        pageData.page = require(source + '/package.json');
        var markdown = read('./node_modules/' + source + '/README.md');
        content = md(markdown);
      }

      if (!content) {
        console.error('No content found for ' + route.title);
        route.disabled = true;
      } else {
        pageData.page = pageData.page || {};
        pageData.page.title = route.title;
        pageData.content = _.template(content)(pageData);
        var template = _.template(self.layout);
        var html = template(pageData);
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest);
        }
        fs.writeFileSync(path.join(dest, './index.html'), html);
      }

      // Reset layout
      self.layout = self.defaultLayout;

      // Check for subroutes
      var subroutes = route.routes || false;
      if (subroutes) {
        generatePages(subroutes);
      }

    });

  };

  generatePages(this.routes);

};


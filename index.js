
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var fm = require('front-matter');

var read = require('./lib/read');
var extend = require('./lib/extend');
var md = require('./lib/md');
var helpers = require('./lib/helpers');
var include = require('./lib/include');

module.exports = function(data) {

  var self = this;

  this.data = function() {
    return self;
  };

  if (!data.source) {
    console.error('No source provided');
  }
  if (!data.dest) {
    console.error('No destination provided');
  }

  _.forIn(data, function(val, key) {
    this[key] = val;
  });


  this.defaultLayout = read(path.join(this.source, this.layout)) || read(path.join(__dirname, './layouts/default.html'));

  this.layout = this.defaultLayout;

  this.helpers = this.helpers || {};

  _.forIn(helpers, function(val, key) {
    this[key] = val;
  });

  _.forIn(this.helpers, function(val, key) {
    this[key] = val;
  });

  // Partials
  this.partials = this.partials || {};
  this.include = include;

  // Extend layouts
  this.extend = extend;

  this.title = this.title || _.capitalize(this.name.replace(/\-/g, ' '));

  this.routes = this.routes || {};


  // Private functions
 
  function capitalize(string) {
    return _.capitalize(string.replace(/\-/g, ' '));
  };

  function formatRoutes(routes, root) {
    var root = root || '';
    var keys = Object.keys(routes);
    keys.forEach(function(key) {
      var route = routes[key];
      if (route.path) {
        route.path = root + route.path;
      } else {
        route.path = root + '/' + key;
      }
      var source = route.source || key;
      if (source) {
        if (fs.existsSync('./node_modules' + source)) {
          var pkg = require(source + '/package.json');
          route.source = pkg.name;
          route.title = route.title || capitalize(pkg.name);
        }
      }
      // Set title if manually set in routes object
      route.title = route.title || capitalize(key);
      if (route.routes) {
        formatRoutes(route.routes, root + route.path);
      }
    });
  };

  function getModule(name) {
    if (!fs.existsSync('./node_modules/' + name)) return false;
    var module = require(name + '/package.json');
    var markdown = read('./node_modules/' + name + '/README.md');
    module.content = md(markdown);
    return module;
  };

  function parseModules(modules) {
    var obj = {};
    modules.forEach(function(name) {
      obj[name] = getModule(name);
    });
    return obj;
  };

  function generatePages(routes) {

    //var root = root || '';
    var keys = Object.keys(routes);

    keys.forEach(function(key) {
      var route = routes[key];
      var dest = this.dest + route.path;
      var content = read(path.join(self.source + route.path, './index.html'));
      //var pageData = _.cloneDeep(data);
      var pageData = self.data();
      // Check for markdown file
      if (!content) {
        console.log('checking for markdown');
        var src  = read(path.join(self.source + route.path, './index.md'));
        var matter = fm(src);
        _.assign(pageData, matter.attributes);
        content = md(matter.body);
      }
      var source = route.source || key;
      // Check for parsed module
      if (typeof modules !== 'undefined' && !content) {
        var module = modules[source] || false;
        if (module) {
          content = modules[source].content;
          pageData.page = module;
        }
      }
      // Check for node module
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
        //console.log('pageData', pageData);
        pageData.content = _.template(content)(pageData);
        //console.log('content', pageData.content);
        var template = _.template(self.layout);
        var html = template(pageData);
        if (!fs.existsSync(dest)) {
          console.log(dest);
          fs.mkdirSync(dest);
        }
        console.log('write file', path.join(dest, './index.html'));
        fs.writeFileSync(path.join(dest, './index.html'), html);
      }
      // Reset layout
      self.layout = self.defaultLayout;
      var subroutes = route.routes || false;
      if (subroutes) {
        generatePages(subroutes);
      }
    });

  };


  // Format and render
  formatRoutes(this.routes);
  if (this.modules) {
    this.modules = parseModules(this.modules);
  }
  generatePages(this.routes);


};


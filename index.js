
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var fm = require('front-matter');

var read = require('./lib/read');
var extend = require('./lib/extend');
var md = require('./lib/md');
var helpers = require('./lib/helpers');

module.exports = function(data) {

  var self = this;
  if (!data.source) {
    console.error('No source provided');
  }
  if (!data.dest) {
    console.error('No destination provided');
  }

  this.source = data.source;
  this.dest = data.dest;


  this.defaultLayout = read(path.join(this.source, data.layout)) || read(path.join(__dirname, './layouts/default.html'));

  this.layout = this.defaultLayout;

  data.helpers = data.helpers || {};

  _.forIn(helpers, function(val, key) {
    data[key] = val;
  });

  _.forIn(data.helpers, function(val, key) {
    data[key] = val;
  });

  // Partials
  data.partials = data.partials || {};

  this.include = function(id, locals) {
    var d = _.cloneDeep(data);
    _.assign(d, locals);
    if (data.partials[id]) {
      return _.template(data.partials[id])(d);
    } else {
      return false;
    }
  };

  this.extend = extend;

  //this.extend = function(filename) {
  //  filename = path.join(self.source, filename);
  //  if (fs.existsSync(filename)) {
  //    console.log('Extend layout ' + filename);
  //    self.layout = read(filename);
  //  } else {
  //    console.error('Layout ' + filename + ' not found');
  //    return false;
  //  }
  //};

  data.title = data.title || _.capitalize(data.name.replace(/\-/g, ' '));

  data.routes = data.routes || {};

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

  formatRoutes(data.routes);

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

  if (data.modules) {
    data.modules = parseModules(data.modules);
  }

  function generatePages(routes) {

    //var root = root || '';
    var keys = Object.keys(routes);

    keys.forEach(function(key) {
      var route = routes[key];
      var dest = data.dest + route.path;
      var content = read(path.join(self.source + route.path, './index.html'));
      var pageData = _.cloneDeep(data);
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
        pageData.content = _.template(content)(pageData);
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


  generatePages(data.routes);

};


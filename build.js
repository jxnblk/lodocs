
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var fm = require('front-matter');
var md = require('./lib/md');

module.exports = function(data, options) {

  var self = this;
  var options = options || {};

  options.source = options.source || './views';
  options.dest = options.dest || '.';

  function read(filename) {
    if (fs.existsSync(filename)) {
      return fs.readFileSync(filename, 'utf8');
    } else {
      return false;
    }
  };

  this.layout = read(data.layout) || read(path.join(__dirname, './layouts/default.html'));

  data.helpers = data.helpers || {};

  this.include = function(id, locals) {
    var d = _.cloneDeep(data);
    _.assign(d, locals);
    if (data.helpers[id]) {
      return _.template(data.helpers[id])(d);
    } else {
      return false;
    }
  };

  this.exists = function(n) {
    if (typeof n !== 'undefined') {
      return true;
    } else {
      return false;
    }
  };

  data.helpers.json = function(obj) {
    return JSON.stringify(obj, null, '  ');
  };

  data.title = data.title || _.capitalize(data.name.replace(/\-/g, ' '));

  data.extend = function(filename) {
    if (fs.existsSync(filename)) {
      console.log('Extend layout ' + filename);
      self.layout = read(filename);
    } else {
      console.error('Layout ' + filename + ' not found');
      return false;
    }
  };

  // Markdown helper
  data.helpers.md = function(filename) {
    var src = read(filename);
    var html = md(src);
    return html;
  };

  data.routes = data.routes || {};

  function capitalize(string) {
    return _.capitalize(string.replace(/\-/g, ' '));
  };

  function formatRoutes(routes, root) {
    var root = root || '';
    var keys = Object.keys(routes);
    keys.forEach(function(key) {
      var route = routes[key];
      route.path = route.path || '/' + key;
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
        formatRoutes(route.routes, route.path);
      }
    });
  };

  formatRoutes(data.routes);


  function generatePages(routes, root) {

    var root = root || '';
    var keys = Object.keys(routes);

    keys.forEach(function(key) {
      var route = routes[key];
      var dest = options.dest + root + route.path;
      var content = read(path.join(options.source + root + route.path, './index.html'));
      var pageData = _.cloneDeep(data);

      // Check for markdown file
      if (!content) {
        console.log('checking for markdown');
        var src  = read(path.join(options.source + root + route.path, './index.md'));
        var matter = fm(src);
        _.assign(pageData, matter.attributes);
        content = md(matter.body);
      }

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
        console.log('write file', path.join(dest, './index.html'));
        fs.writeFileSync(path.join(dest, './index.html'), html);
      }

      var subroutes = route.routes || false;
      if (subroutes) {
        generatePages(subroutes, route.path);
      }

    });
  };


  generatePages(data.routes);

};


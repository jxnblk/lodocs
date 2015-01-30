
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

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

  this.layout = read(data.layout) || read('./layouts/base.html');

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

  data.title = data.title || _.capitalize(data.name.replace(/\-/g, ' '));

  data.extend = function(filename) {
    if (fs.existsSync(filename)) {
      console.log('extend layout', filename);
      self.layout = read(filename);
    } else {
      console.error(filename + ' not found');
      return false;
    }
  };

  data.md = function(filename) {
    if (fs.existsSync(filename)) {
    }
  };

  data.routes = data.routes || {};

  function generatePages(routes) {

    var keys = Object.keys(routes);
    keys.forEach(function(key) {
      var route = routes[key];
      var dest = options.dest + route.path;
      var content = read(path.join(options.source + route.path, './index.html'));
      if (!content) {
        console.log('no content', route.title);
        return false;
      }
      if (route.source) {
        console.log('has source', route.title);
      }
      data.page = data.page || {};
      data.page.title = route.title;
      data.content = _.template(content)(data);
      var template = _.template(self.layout);
      var html = template(data);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }
      fs.writeFileSync(path.join(dest, './index.html'), html);

      var subroutes = route.routes || false;
      if (subroutes) {
        generatePages(subroutes);
      }

    });
  };


  generatePages(data.routes);

};


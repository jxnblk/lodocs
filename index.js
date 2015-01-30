
var _ = require('lodash');
var fs = require('fs');

module.exports = function(content, data, options) {

  var self = this,
      options = options || {},
      template,
      html;

  function read(filename) {
    if (fs.existsSync(filename)) {
      return fs.readFileSync(filename, 'utf8');
    } else {
      return false;
    }
  };

  this.layout = read(data.layout) || read('./layouts/base.html');

  //this.helpers = {};

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

  this.__ = this.include;
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


  data.content = _.template(content)(data);

  template = _.template(this.layout);

  html = template(data);

  return html;

};


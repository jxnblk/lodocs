
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var read = require('./lib/read');
var extend = require('./lib/extend');
var md = require('./lib/md');
var helpers = require('./lib/helpers');
var include = require('./lib/include');
var generatePages = require('./lib/generate-pages');
var formatRoutes = require('./lib/format-routes');
var parseModules = require('./lib/parse-modules');
var humanizeName = require('./lib/humanize-name');


module.exports = function(data) {

  var self = this;

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

  this.partials = this.partials || {};
  this.include = include;
  this.extend = extend;
  this.title = this.title || humanizeName(this.name);
  this.routes = this.routes || {};

  // Format and render
  formatRoutes(this.routes);
  if (this.modules) {
    this.modules = parseModules(this.modules);
  }
  generatePages(this.routes);


};


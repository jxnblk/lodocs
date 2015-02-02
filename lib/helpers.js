// Default helpers

var _ = require('lodash');
var md = require('./md');
var humanizeName = require('./humanize-name');

module.exports = {
  json: function(obj) {
    var o = _.clone(obj);
    return JSON.stringify(o, null, '  ');
  },
  markdown: function(string) {
    return md(string);
  },
  capitalize: function(string) {
    if (!string) return false;
    return humanizeName(string);
  }
};

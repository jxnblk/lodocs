// Default helpers

var _ = require('lodash');
var md = require('./md');

module.exports = {
  json: function(obj) {
    var o = _.clone(obj);
    return JSON.stringify(o, null, '  ');
  },
  markdown: function(string) {
    return md(string);
  },
};

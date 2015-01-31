// Default helpers
var md = require('./md');

module.exports = {
  json: function(obj) {
    return JSON.stringify(obj, null, '  ');
  },
  markdown: function(string) {
    return md(string);
  },
};


var _ = require('lodash');

module.exports = function(string) {
  return _.capitalize(string.replace(/\-/g, ' '));
};


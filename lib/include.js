
var _ = require('lodash');

module.exports = function(id, locals) {
  var d = _.cloneDeep(this);
  _.assign(d, locals);
  if (this.partials[id]) {
    return _.template(this.partials[id])(d);
  } else {
    return false;
  }
};

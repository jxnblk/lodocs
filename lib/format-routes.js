
var fs = require('fs');

var humanizeName = require('./humanize-name');

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
        route.title = route.title || humanizeName(pkg.name);
      }
    }
    // Set title if manually set in routes object
    route.title = route.title || humanizeName(key);
    if (route.routes) {
      formatRoutes(route.routes, route.path);
    }
  });
};

module.exports = formatRoutes;


// Extend layouts

var fs = require('fs');

module.exports = function(filename) {
  if (fs.existsSync(filename)) {
    console.log('Extend layout ' + filename);
    this.layout = read(filename);
  } else {
    console.error('Layout ' + filename + ' not found');
    return false;
  }
};

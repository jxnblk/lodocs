
var marked = require('marked');
var markedExample = require('marked-example');

var renderer = new marked.Renderer();
var options = {};

renderer.code = markedExample({
  classes: {
    container: 'mb2 bg-darken-1 rounded',
    rendered: 'p2',
    code: 'm0 p2 bg-darken-1 rounded-bottom'
  }
});

options.renderer = renderer;

module.exports = function(md) {

  return marked(md, options);

};

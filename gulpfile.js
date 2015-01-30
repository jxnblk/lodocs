
var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var through = require('through2');
var marked = require('marked');
var markedExample = require('marked-example');

var filelodocs = require('./file-centric.js');

var fm = require('front-matter');
var rename = require('gulp-rename');
var webserver = require('gulp-webserver');

var data = require('./package.json');
data.routes = require('./routes.json');

data.stylesheet = 'http://d2v52k3cl9vedd.cloudfront.net/blk/0.0.14/blk.min.css';

// Default layout
//data.layout = fs.readFileSync('./layouts/base.html', 'utf8');

// Extend layouts
//data.extend = function(filename) {
//  console.log('extend layout', filename);
//  this.layout = fs.readFileSync(filename, 'utf8');
//};

//data.title = _.capitalize(data.name.replace(/\-/g, ' '));


data.partials = {};
data.partials.footer = fs.readFileSync('./partials/footer.html', 'utf8');
data.partials.nav = fs.readFileSync('./partials/nav.html', 'utf8');

// Needs data obj passed in
//data.partials.sidebar = _.template(fs.readFileSync('./partials/sidebar.html', 'utf8'));

data.helpers = {};
data.helpers.sidebar = fs.readFileSync('./partials/sidebar.html', 'utf8');
data.helpers.footer = fs.readFileSync('./partials/footer.html', 'utf8');
data.helpers.nav = fs.readFileSync('./partials/nav.html', 'utf8');


// File centric compilation
gulp.task('compile', function() {

  // Compile lodash templates
  var tpl = function(options) {
    var options = options || {};
    return through.obj(function(file, encoding, callback) {
      var contents = file.contents.toString();
      console.log('layout', data.layout);
      var html = filelodocs(contents, data);
      file.contents = new Buffer(html);
      this.push(file);
      callback();
    });
  };

  var md = function(options) {
    var renderer = new marked.Renderer();
    var markedOptions = {};
    renderer.code = markedExample({
      classes: {
        container: 'mb2 bg-darken-1 rounded',
        rendered: 'p2',
        code: 'm0 p2 bg-darken-1 rounded-bottom'
      }
    });
    markedOptions.renderer = renderer;
    return through.obj(function(file, encoding, callback) {
      var contents = file.contents.toString();
      var matter = fm(contents);
      data.layout = matter.layout || null;
      var html = marked(matter.body, markedOptions);
      var rendered = _.template(html)(data);
      console.log(rendered);
      file.contents = new Buffer(rendered);
      this.push(file);
      callback();
    });
  };

  gulp.src('./views/**/*.html')
    .pipe(tpl())
    .pipe(gulp.dest('./'));

  gulp.src('./views/**/*.md')
    .pipe(md())
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest('./test'))
    .pipe(tpl())
    .pipe(gulp.dest('./'));
});

// Route based compilation
gulp.task('build', function() {
  var build = require('./build');
  build(data);
});

gulp.task('serve', function() {
  gulp.src('./').pipe(webserver({}));
});

gulp.task('default', ['build', 'serve'], function() {
  gulp.watch(
    ['./views/**/*', './layouts/**/*', './partials/**/*'],
    ['build']
  );
});

//gulp.task('clean', function() {
//});


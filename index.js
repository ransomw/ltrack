var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');
var watchify = require('watchify');
var browserify = require('browserify');
var less = require('less');
var Handlebars = require('handlebars');

// dest paths
var PATH_CLIENT_STATIC_DIR = path.join(
  'public');
var PATH_CLIENT_BUNDLE = path.join(
  PATH_CLIENT_STATIC_DIR, 'bundle.js');
var PATH_GEN_STYLES = path.join(
  PATH_CLIENT_STATIC_DIR, 'css');
var PATH_PAGE_HTML = path.join(
  PATH_CLIENT_STATIC_DIR, 'index.html');
// src paths
var PATH_CLIENT_MAIN = path.join(
  'app', 'main.js');
var PATH_SRC_STYLES = path.join(
  'styles');
var PATH_PAGE_TEMPLATE = path.join(
  'index.hbs');

/* bfy: browserify() instance */
var make_write_bundle = function (bfy, path_bundle) {
  return function () {
    var stream_bundle = bfy.bundle();
    stream_bundle.pipe(fs.createWriteStream(path_bundle));
    return new Promise(function (resolve, reject) {
      stream_bundle.on('end', function () {
        resolve();
      });
    });
  };
};

// yea, streams would be better... idk if less and handlebars support?
var read_file = function (file_path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(file_path, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

var write_file = function (file_path, file_str) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(file_path, file_str, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

var build_style = function(filename) {
  var path_src = path.join(PATH_SRC_STYLES, filename);
  var path_dest = path.join(
    PATH_GEN_STYLES,
    path.basename(filename, '.less')) + '.css';
  return read_file(path_src)
    .then(function (less_input) {
    return less.render(less_input);
  }).then(function (less_output) {
    return write_file(path_dest, less_output.css);
  });
};

var build_styles_once = function () {
  return Promise.resolve().then(function () {
    return new Promise(function (resolve, reject) {
      fs.readdir(PATH_SRC_STYLES, function(err, files) {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }).then(function (files) {
    return Promise.all(files.map(build_style));
  });
};

var build_html_once = function () {
  return read_file(PATH_PAGE_TEMPLATE)
    .then(function (template_str) {
      var template = Handlebars.compile(template_str);
      var html_str = template({});
      return write_file(PATH_PAGE_HTML, html_str);
    });
};

// some duplication/fragility here,
// as watch_path occurs in build_X_once functions
var make_build_fn = function(build_once_fn, watch_path) {
  /* cts (boolean): build continuously */
  return function (cts) {
    return build_once_fn().then(function (res) {
      if (cts) {
        fs.watch(watch_path, function () {
          build_once_fn();
        });
      }
      return res;
    });
  };
};


var build_styles = make_build_fn(build_styles_once, PATH_SRC_STYLES);
var build_html = make_build_fn(build_html_once, PATH_PAGE_TEMPLATE);

var build_client_js = function (cts) {
  var bfy = browserify({
    entries: [PATH_CLIENT_MAIN],
    cache: {},
    packageCache: {},
    debug: true, // source maps
    plugin: cts ? [watchify] : []
  });
  var write_bundle = make_write_bundle(bfy, PATH_CLIENT_BUNDLE);
  if (cts) {
    bfy.on('update', write_bundle);
  }
  return write_bundle();
};

/* cts (boolean): build continuously */
module.exports.build_client = function (cts) {
  return Promise.all([
    build_html(cts),
    build_styles(cts),
    build_client_js(cts)
  ]);
};

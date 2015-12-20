var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');
var Q = require('q');
var watchify = require('watchify');
var browserify = require('browserify');
var less = require('less');

// dest paths
var PATH_CLIENT_STATIC_DIR = path.join(
  'www');
var PATH_CLIENT_BUNDLE = path.join(
  PATH_CLIENT_STATIC_DIR, 'bundle.js');
var PATH_GEN_STYLES = path.join(
  PATH_CLIENT_STATIC_DIR, 'css');
// src paths
var PATH_CLIENT_MAIN = path.join(
  'app', 'main.js');
var PATH_SRC_STYLES = path.join(
  'styles');


var make_write_bundle = function (bfy, path_bundle) {
  return function () {
    var deferred = Q.defer();
    var stream_bundle = bfy.bundle();
    stream_bundle.pipe(fs.createWriteStream(path_bundle));
    stream_bundle.on('end', function () {
      deferred.resolve();
    });
    return deferred.promise;
  };
};

var build_style = function(filename) {
  var path_src = path.join(PATH_SRC_STYLES, filename);
  var path_dest = path.join(
    PATH_GEN_STYLES,
    path.basename(filename, '.less')) + '.css';
  return Q().then(function () {
    var deferred = Q.defer();
    fs.readFile(path_src, 'utf8', function (err, data) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(data);
      }
    });
    return deferred.promise;
  }).then(function (less_input) {
    return less.render(less_input);
  }).then(function (less_output) {
    var css = less_output.css;
    var deferred = Q.defer();
    fs.writeFile(path_dest, css, function (err) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve();
      }
    });
    return deferred.promise;
  });
};

var build_styles_once = function () {
  return Q().then(function () {
    var deferred = Q.defer();
    fs.readdir(PATH_SRC_STYLES, function(err, files) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(files);
      }
    });
    return deferred.promise;
  }).then(function (files) {
    return Q.all(files.map(build_style));
  });
};

/* cts (boolean): build continuously */
var build_styles = function (cts) {
  return build_styles_once().then(function (res) {
    if (cts) {
      fs.watch(PATH_SRC_STYLES, function () {
        build_styles_once();
      });
    }
    return res;
  });
};


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
  return build_styles(cts).then(function () {
    return build_client_js(cts);
  });
};

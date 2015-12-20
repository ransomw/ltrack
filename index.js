var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');
var Q = require('q');
var watchify = require('watchify');
var browserify = require('browserify');

var PATH_CLIENT_BUNDLE = path.join(
  'www', 'bundle.js');

var PATH_CLIENT_MAIN = path.join(
  'app', 'main.js');


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

/* cts (boolean): build continuously */
module.exports.build_client_js = function (cts) {
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

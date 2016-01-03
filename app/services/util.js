var _ = require('lodash');
var Q = require('q');
var util = require('../util');

var exports = {};

/* convert hoodie promise to A+ */
exports.conv_p = function (hp) {
  var def = Q.defer();
  hp.done(function (res) {
    def.resolve(res);
  }).fail(function (err) {
    def.reject(err);
  });
  return def.promise;
};

module.exports = _.merge(util, exports);

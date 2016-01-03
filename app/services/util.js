var Q = require('q');

/* convert hoodie promise to A+ */
var conv_p = function (hp) {
  var def = Q.defer();
  hp.done(function (res) {
    def.resolve(res);
  }).fail(function (err) {
    def.reject(err);
  });
  return def.promise;
};

module.exports.conv_p = conv_p;

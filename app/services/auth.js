var CONST = require('../constants');
var hoodie = require('../hoodie_inst');
var util = require('./util');

var sign_up = function (username, password) {
  return util.conv_p(hoodie.account.signUp(username, password));
};

var sign_in = function (username, password) {
  return util.conv_p(hoodie.account.signIn(username, password));
};

var sign_out = function (username, password) {
  return util.conv_p(hoodie.account.signOut())

    .catch(function (err) {
      if (err.status === 401) {
        throw new Error(CONST.AUTH_P_ERRS.unauth);
      } else {
        throw err;
      }
    });

};

var reauth = function (password) {
  return util.conv_p(hoodie.account.signIn(
    hoodie.account.username, password,
    {moveData: true})); // don't throw away local data
};

module.exports = function () {
  return {
    sign_up: sign_up,
    sign_in: sign_in,
    sign_out: sign_out,
    reauth: reauth

  };
};

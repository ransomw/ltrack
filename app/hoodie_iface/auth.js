const _ = require('lodash');

const CONST = require('../constants');
const LogoutNoSaveError = require('../err').LogoutNoSaveError;

const hoodie = require('./hoodie_inst');
const conv_p = require('./conv_p');

// match old api in js engine
var _login_username = null;

const _set_login_username = function (hoodie_p, new_login_username) {
  return conv_p(hoodie_p).then(function (hoodie_rv) {
    _login_username = new_login_username;
    return hoodie_rv;
  });
};

const sign_up = function (username, password) {
  return _set_login_username(hoodie.account.signUp({
    username: username,
    password: password
  }), username);
};

const sign_in = function (username, password) {
  return _set_login_username(hoodie.account.signIn({
    username: username,
    password: password
  }), username);
};

const sign_out = function () {
  return _set_login_username(hoodie.account.signOut(), null)
    .catch(function (err) {
      if (err.message === "UnauthenticatedError: Not signed in" ||
          err.status === 401) {
        throw new LogoutNoSaveError();
      } else {
        throw err;
      }
    });
};

const logged_in = function () {
  return !_.isNull(_login_username);
};

const reauth = function (password) {
  if (_.isNull(_login_username)) {
    throw new Error("impl error: shouldn't reauth when not logged in");
  }
  // this is a change from the old api, which called signIn again
  // with the {moveData} optarg
  return Promise.resolve().then(function () {
    return hoodie.account.signIn({
      username: _login_username,
      password: password
    })
  }).catch(function (err) {
    // for in-browser debug
    throw err;
  });
};

var exports = {}

exports.sign_up = sign_up;
exports.sign_in = sign_in;
exports.sign_out = sign_out;
exports.logged_in = logged_in;
exports.reauth = reauth;

module.exports = exports;

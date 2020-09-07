const _ = require('lodash');

const CONST = require('../constants');
const LogoutNoSaveError = require('../err').LogoutNoSaveError;

const conv_p = require('./conv_p');

// match old api in js engine
// set to non-null to forgo login by default
var _login_username = "asdf";

const _set_login_username = function (promise_or_value, new_login_username) {
  return conv_p(promise_or_value).then(function (hoodie_rv) {
    _login_username = new_login_username;
    return hoodie_rv;
  });
};

// mock implementation doesn't check password
const sign_up = function (username, password) {
  return _set_login_username(username, username);
};

const sign_in = function (username, password) {
  return _set_login_username(username, username);
};

const sign_out = function () {
  return _set_login_username("", null)
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
  return Promise.resolve(_login_username);
};

var exports = {}

exports.sign_up = sign_up;
exports.sign_in = sign_in;
exports.sign_out = sign_out;
exports.logged_in = logged_in;
exports.reauth = reauth;

module.exports = exports;

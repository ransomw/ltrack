var CONST = require('../constants');
var hoodie = require('../hoodie_inst');
var util = require('./util');

var sign_up = function (username, password) {
  return util.conv_p(hoodie.account.signUp(username, password));
};

var sign_in = function (username, password) {
  return util.conv_p(hoodie.account.signIn(username, password));
};

module.exports = function () {
  return {
    sign_up: sign_up,
    sign_in: sign_in

  };
};

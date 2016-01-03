var CONST = require('../constants');
var hoodie = require('../hoodie_inst');
var util = require('./util');

var sign_up = function (username, password) {
  return util.conv_p(hoodie.account.signUp(username, password));
};

module.exports = function () {
  return {
    sign_up: sign_up
  };
};

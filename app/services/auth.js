const _ = require('lodash');
const auth_impl = require('../hoodie_iface_mock').auth;

module.exports = function () {
  return _.pick(auth_impl, [
    'sign_up',
    'sign_in',
    'sign_out',
    'reauth'
  ]);
};

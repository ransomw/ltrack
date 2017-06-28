const _ = require('lodash');

if (_.isUndefined(hoodie)) {
  throw new Error("expected globally-defined hoodie instance");
}

module.exports = hoodie;

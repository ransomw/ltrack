/**
 * abstract out hoodie-specific details of data store.
 */
const _ = require('lodash');
const CONST = require('../constants');
const conv_p = require('./conv_p');
const hoodie = require('./hoodie_inst');

const create = function (storeType, data) {
  // hoodie sets id attribute automatically
  return conv_p(hoodie.store.add({
    type: storeType,
    data: data
  }));
};

const read = function (storeType) {
  return conv_p(hoodie.store.findAll()).then(function (docs) {
    return _(docs)
      .filter({type: storeType})
    // account for an upstream api change(s)
      .map(function (storeEntry) {
        const exposedEntry = _.cloneDeep(storeEntry.data);
        if (!_.isUndefined(storeEntry.id)) {
          throw new Error("impl err against upstream api");
        }
        exposedEntry.id = storeEntry._id
        return exposedEntry;
      }).value();
  });
};

const del = function (storeType, id) {
  return conv_p(hoodie.store.remove(storeType, id));
};

const onChange = function (storeType, cb) {
  hoodie.store.on(storeType + ':add', cb);
  hoodie.store.on(storeType + ':update', cb);
  hoodie.store.on(storeType + ':remove', cb);
};

var exports = {};

exports.create = create;
exports.read = read;
exports.del = del;
exports.onChange = onChange;

module.exports = exports;

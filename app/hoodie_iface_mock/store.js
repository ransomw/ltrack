/**
 * api originally from hoodie extraction.
 */
const _ = require('lodash')
const R = require('ramda')
const CONST = require('../constants')
const conv_p = require('./conv_p')

// internal allocators
const _list_store = {list: []}
const _change_handlers = []

const create = (storeType, data) => {
  if(!_.isUndefined(data.id)) {
    throw new Error("'id' is an invalid field name")
  }
  return conv_p({
    type: storeType,
    data: data
  }).then((val) => {
    // ascending integer ids
    max_id = -Infinity
    _list_store.list.forEach((item) => {
      max_id = Math.max(max_id, item._id)
    })
    if (max_id < 0) {
      max_id = 0
    }
    console.log("max id so far")
    console.log(max_id)
    new_entry = _.cloneDeep(val)
    new_entry._id = max_id + 1
    new_entry.id = new_entry._id
    _list_store.list.push(new_entry)
    // for(cb in _change_handlers) { cb() }
    _change_handlers.forEach((cb) => cb())
    return new_entry
  });
};

const read = function (storeType) {
  return conv_p(_list_store.list).then(function (docs) {
    return _(docs)
      .filter({type: storeType})
    // account for an upstream api change(s)
      .map(function (storeEntry) {
        const exposedEntry = _.cloneDeep(storeEntry.data);
        exposedEntry.id = storeEntry._id
        return exposedEntry;
      }).value();
  });
};

const del = function (storeType, id) {
  const pred = (storeEntry) => {
    return storeEntry.type == storeType &&
      storeEntry._id == id
  }
  to_remove_list = _(_list_store.list)
    .filter(pred).value();
  _list_store.list = _(_list_store.list)
    .filter(function (storeEntry) {
      if(pred(storeEntry)) {
        return false
      }
      return true
    }).value();
  _change_handlers.forEach((cb) => cb())
  return Promise.resolve(to_remove_list[0])
};

/**
 * todo: use store type parameter.
 * (and significantly more complicated
 *  events mechanism)
 */
const onChange = function (storeType, cb) {
  _change_handlers.push(cb)
};

var exports = {};

exports.create = create;
exports.read = read;
exports.del = del;
exports.onChange = onChange;

module.exports = exports;

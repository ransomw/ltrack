var CONST = require('../constants');
var hoodie = require('../hoodie_inst');
var util = require('./util');

/* add activity */
var add_act = function (act) {
  // hoodie sets id attribute automatically
  return util.conv_p(hoodie.store.add(CONST.STORE_TYPES.act, act));
};

/* get all activities */
var get_acts = function () {
  return util.conv_p(hoodie.store.findAll(CONST.STORE_TYPES.act));
};

/* get activity by id */
var get_act = function (act_id) {
  return get_acts().then(function (acts) {
    return util.arr_elem(acts.filter(function (act) {
      return act.id === act_id;
    }));
  });
};

/* add entry */
var add_ent = function (ent) {
  return util.conv_p(hoodie.store.add(CONST.STORE_TYPES.ent, ent));
};

/* get all entries */
var get_ents = function () {
  return util.conv_p(hoodie.store.findAll(CONST.STORE_TYPES.ent));
};

/* delete entry */
var del_ent = function (ent_id) {
  return util.conv_p(hoodie.store.remove(CONST.STORE_TYPES.ent, ent_id));
};

var add_curr_ent = function (ent) {
  return util.conv_p(hoodie.store.findAll(CONST.STORE_TYPES.curr_ent))
    .then(function (curr_ents) {
      if (curr_ents.length !== 0) {
        // todo: consider using custom error w/ extra attrs
        //       rather than checking error message string for ctrl flow
        //       and for chaining errors
        throw new Error(CONST.ACT_P_ERRS.engaged);
      } else {
        return util.conv_p(
          hoodie.store.add(CONST.STORE_TYPES.curr_ent, ent));
      }
    });
};

var get_curr_ent = function () {
  try {
    return util.conv_p(hoodie.store.findAll(CONST.STORE_TYPES.curr_ent))
      .then(function (curr_ents) {
        return util.arr_elem(curr_ents, {allow_undef: true});
      });
  } catch (e) {
    if (e.message === CONST.UTIL_ERRS.num) {
      throw new Error(CONST.ACT_P_ERRS.invalid_out);
    } else {
      throw e;
    }
  }
};

var del_curr_ent = function (curr_ent_id) {
  return util.conv_p(hoodie.store.remove(
    CONST.STORE_TYPES.curr_ent, curr_ent_id));
};

/* register callback */
var on_curr_ent_change = function (cb) {
  hoodie.store.on(CONST.STORE_TYPES.curr_ent + ':add', cb);
  hoodie.store.on(CONST.STORE_TYPES.curr_ent + ':update', cb);
  hoodie.store.on(CONST.STORE_TYPES.curr_ent + ':remove', cb);
};

module.exports = function () {
  return {
    add_act: add_act,
    get_acts: get_acts,
    get_act: get_act,
    add_ent: add_ent,
    get_ents: get_ents,
    del_ent: del_ent,
    add_curr_ent: add_curr_ent,
    get_curr_ent: get_curr_ent,
    del_curr_ent: del_curr_ent,
    on_curr_ent_change: on_curr_ent_change

  };
};

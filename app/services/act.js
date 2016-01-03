var CONST = require('../constants');
var hoodie = require('../hoodie_inst');
var util = require('./util');

/* get all activities */
var get_acts = function () {
  return util.conv_p(hoodie.store.findAll(CONST.STORE_TYPES.act));
};

/* get activity by id */
var get_act = function (act_id) {
  return get_acts.then(function (acts) {
    return acts.filter(function (act) {
      return act.id === act_id;
    })[0];
  });
};

/* add entry */
var add_ent = function (ent) {
  return util.conv_p(hoodie.store.add(CONST.STORE_TYPES.ent, ent));
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

module.exports = function () {
  return {
    get_acts: get_acts,
    add_ent: add_ent,
    add_curr_ent: add_curr_ent

  };
};

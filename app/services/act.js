const CONST = require('../constants');
const store = require('../hoodie_iface').store;
const arr_elem = require('../util').arr_elem;

const make_err = function (type, msg) {
  return new Error([type, msg].join(':'));
};

/* add activity */
const add_act = function (act) {
  return store.create(CONST.STORE_TYPES.act, act);
};

/* get all activities */
const get_acts = function () {
  return store.read(CONST.STORE_TYPES.act);
};

/* get activity by id */
const get_act = function (act_id) {
  return get_acts().then(function (acts) {
    return arr_elem(acts.filter(function (act) {
      return act.id === act_id;
    }));
  });
};

/* add entry */
const add_ent = function (ent) {
  return Promise.resolve().then(function () {
    return get_act(ent.act);
  }).then(function (act) {
    if (!act) {
      console.error(ent.act);
      throw make_err(CONST.ACT_P_ERRS.invalid_in,
                           "unknown activity id");
    } else if (act.atype === CONST.ACT_TYPES.interval) {
      if (typeof ent.date_start === 'undefined' ||
          typeof ent.date_stop === 'undefined') {
        console.error(ent);
        throw make_err(CONST.ACT_P_ERRS.invalid_in,
                             "entry missing required field");
      }
      if (!(ent.date_start instanceof Date ||
            ent.date_stop instanceof Date)) {
        console.error(ent);
        throw make_err(CONST.ACT_P_ERRS.invalid_in,
                             "entry dates of incorrect type");
      }
      if (!(ent.date_stop - ent.date_start > 0)) {
        throw make_err(CONST.ACT_P_ERRS.invalid_in,
                             "entry stop must preceed start");
      }
    } else if (act.atype === CONST.ACT_TYPES.point) {
      if (typeof ent.date === 'undefined') {
        console.error(ent);
        throw make_err(CONST.ACT_P_ERRS.invalid_in,
                             "entry missing required field");
      }
      if (!(ent.date instanceof Date)) {
        console.error(ent);
        throw make_err(CONST.ACT_P_ERRS.invalid_in,
                             "entry date of incorrect type");
      }
    } else {
      // programming error
      throw Error("unknown activity type");
    }
  }, function (err) {
    console.error(err);
    throw err;
  }).then(function () {
    return store.create(CONST.STORE_TYPES.ent, ent);
  });
};

/* get all entries */
const get_ents = function () {
  return store.read(CONST.STORE_TYPES.ent);
};

/* delete entry */
const del_ent = function (ent_id) {
  return store.del(CONST.STORE_TYPES.ent, ent_id);
};

const add_curr_ent = function (ent) {
  return store.read(CONST.STORE_TYPES.curr_ent)
    .then(function (curr_ents) {
      if (curr_ents.length !== 0) {
        // todo: consider using custom error w/ extra attrs
        //       rather than checking error message string for ctrl flow
        //       and for chaining errors
        throw new Error(CONST.ACT_P_ERRS.engaged);
      } else {
        return store.create(CONST.STORE_TYPES.curr_ent, ent);
      }
    });
};

const get_curr_ent = function () {
  try {
    return store.read(CONST.STORE_TYPES.curr_ent)
      .then(function (curr_ents) {
        return arr_elem(curr_ents, {allow_undef: true});
      });
  } catch (e) {
    if (e.message === CONST.UTIL_ERRS.num) {
      throw new Error(CONST.ACT_P_ERRS.invalid_out);
    } else {
      throw e;
    }
  }
};

const del_curr_ent = function (curr_ent_id) {
  return store.del(
    CONST.STORE_TYPES.curr_ent, curr_ent_id);
};

/* register callback */
const on_curr_ent_change = function (cb) {
  store.onChange(CONST.STORE_TYPES.curr_ent, cb);
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

module.exports.APP_NAME = 'ltrack';
module.exports.PARTIAL_BASE = 'partials/';
module.exports.STORE_TYPES = {
  act: 'activity',
  ent: 'entry',
  curr_ent: 'curr-entry'
};
module.exports.ACT_TYPES = {
  interval: 'interval',
  point: 'point'
};
module.exports.AUTH_P_ERRS = {
  unauth: 'not authenticated by server'
};
module.exports.ACT_P_ERRS = {
  engaged: 'already engaged in interval activity',
  invalid_in: 'data store in invalid input',
  invalid_out: 'data store in invalid state'
};
module.exports.UTIL_ERRS = {
  num: 'wrong number of elements'
};

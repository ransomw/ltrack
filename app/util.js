var moment = require('moment');
var hoodie = require('./hoodie_inst');
var CONST = require('./constants.js');

// int_ = {start: X, end: Y}, where X and Y support comparison
// returns the intersection of the two intervals
// or null if they don't intersect
var intersection = function (int1, int2) {
  var start, end;
  if (int1.start >= int1.end ||
      int2.start >= int2.end) {
    throw new Error("got invalid interval");
  }
  if (int2.start < int1.start) {
    return intersection(int2, int1);
  } else {
    if (int2.start > int1.end) {
      return null;
    }
    start = int2.start; // >= int1.start
    if (int2.end < int1.end) {
      end = int2.end;
    } else {
      end = int1.end;
    }
    return {start: start, end: end};
  }
};

module.exports.intersection = intersection;

module.exports.log_throw_err = function (err, msg) {
  if (!msg) {
    msg = "unspecified error";
  }
  console.log(msg);
  console.log(err);
  throw new Error(msg);
};

module.exports.logged_in = function () {
  if (hoodie.account.username) {
    return true;
  }
  return false;
};

module.exports.date_str = function (date) {
  var m;
  if (!date) {
    return "";
  }
  m = moment(date);
  return m.format(
    'MMM D H:mm'
  );
};

module.exports.ms_to_str = function(n_ms) {
  var sec;
  var min;
  var hr;
  sec = Math.floor(n_ms/1000);
  min = Math.floor(sec/60);
  if (min < 60) {
    return min + "min";
  }
  hr = min/60;
  return hr.toFixed(1) + "hr";
};

module.exports.date_diff_str = function (start, end) {
  var sec = Math.floor((end - start)/1000);
  var min = Math.floor(sec/60);
  var hr;
  start = new Date(start);
  end = new Date(end);
  sec = Math.floor((end - start)/1000);
  min = Math.floor(sec/60);
  if (min < 60) {
    return min + "min";
  }
  hr = min/60;
  return hr.toFixed(1) + "hr";
};

module.exports.cmp_ents = function (ent1, ent2) {
  var date1, date2;
  if (ent1.date_start) {
    date1 = new Date(ent1.date_start);
  } else {
    date1 = new Date(ent1.date);
  }
  if (ent2.date_start) {
    date2 = new Date(ent2.date_start);
  } else {
    date2 = new Date(ent2.date);
  }
  return date2 - date1;
};



module.exports.arr_elem = function(arr, opt_args) {
  var opts = {} || opt_args;
  if (!Array.isArray(arr)) {
    throw new Error("arr_elem expects array argument");
  }
  if (arr.length > 1 ||
      (opts.allow_undef && arr.length === 0)) {
    throw new Error(CONST.UTIL_ERRS.num);
  }
  return arr[0];
};

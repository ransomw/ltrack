const moment = require('moment');
const logged_in = require('./hoodie_iface_mock').auth.logged_in;
const CONST = require('./constants.js');

// int_ = {start: X, end: Y}, where X and Y support comparison
// returns the intersection of the two intervals
// or null if they don't intersect
const intersection = function (int1, int2) {
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

var exports = {};

exports.intersection = intersection;

exports.logged_in = logged_in;

exports.log_throw_err = function (err, msg) {
  if (!msg) {
    msg = "unspecified error";
  }
  console.error(msg);
  console.error(err);
  throw new Error(msg);
};

exports.date_str = function (date) {
  var m;
  if (!date) {
    return "";
  }
  m = moment(date);
  return m.format(
    'MMM D H:mm'
  );
};

exports.ms_to_str = function(n_ms) {
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

exports.date_diff_str = function (start, end) {
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

exports.cmp_ents = function (ent1, ent2) {
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

exports.arr_elem = function(arr, opt_args) {
  var opts = {} || opt_args;
  if (!Array.isArray(arr)) {
    throw new Error("arr_elem expects array argument");
  }
  if (opts.allow_undef) {
    if (arr.length > 1) {
      throw new Error(CONST.UTIL_ERRS.num);
    }
  } else {
    if (arr.length > 1 ||
        arr.length < 0) {
      throw new Error(CONST.UTIL_ERRS.num);
    }
  }
  return arr[0];
};

exports.combine_date_time = function (date, time) {
  return new Date(date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                  time.getHours(),
                  time.getMinutes(),
                  time.getSeconds());
};

/* note on angular usage from from hoodie conversion:
 * $scope.ent.act is set by using the ng-model
 * attribute/directive/whatev' in the home.html partial.
 *
 * long angular story later, angular has converted
 * _previously_ UUID (string type) from hoodie to string,
 * np.  now that ids are integers, the string conversion
 * from the Angular side is clearer.
 **
 * this function coerces _from_ angular (stringification)
 * _to_ internal representation (integer).
 */
exports.coerce_item_id = (id) => {
  return parseInt(id)
}

module.exports = exports;

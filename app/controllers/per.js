var _ = require('lodash');
var moment = require('moment');
var CONST = require('../constants');
var hoodie = require('../hoodie_inst');
var util = require('../util');

/* Percentage time use */
module.exports = [
  '$scope',
  function PerCtrl($scope) {

    var INT_END = moment();
    var INT_START_DAY = moment(INT_END).subtract(1, 'days');
    var INT_START_DAY3 = moment(INT_END).subtract(3, 'days');
    var INT_START_WEEK = moment(INT_END).subtract(7, 'days');
    var RET_OBJ = [];

    var ent_2_mo_int = function (ent) {
      return {
        start: moment(ent.date_start),
        end: moment(ent.date_stop)
      };
    };

    var make_intersection = function (int1) {
      return function (int2) {
        return util.intersection(int1, int2);
      };
    };

    var mo_int_2_ms = function (inter) {
      if (inter === null) {
        return 0;
      }
      if (inter.start >= inter.end) {
        throw new Error("got invalid interval");
      }
      return inter.end - inter.start;
    };

    var acts = [];
    var ents = [];

    var INT_TYPES = {
      day: "Past 24hr",
      days3: "Past 3 days",
      week: "Past week",
      custom: "Custom time range"
    };

    $scope.INT_TYPES = [
      'day',
      'days3',
      'week'
    ].map(function (t_name) {
      return {
        name: INT_TYPES[t_name],
        value: t_name
      };
    });

    $scope.loading = {
      acts: true,
      ents: true
    };

    $scope.int_type = 'day';

    hoodie.store.findAll(CONST.STORE_TYPES.act)
      .done(function (all_acts) {
        $scope.$apply(function () {
          acts = all_acts.filter(function (act) {
            return act.atype === CONST.ACT_TYPES.interval;
          });
          $scope.loading.acts = false;
        });
      })
      .fail(function (err) {
        util.log_throw_err(
          err,
          "looking up all" + CONST.STORE_TYPES.act +
            "for AllEntsCtrl failed");
      });

    hoodie.store.findAll(CONST.STORE_TYPES.ent)
      .done(function (all_ents) {
        $scope.$apply(function () {
          ents = all_ents;
          $scope.loading.ents = false;
        });
      })
      .fail(function (err) {
        util.log_throw_err(
          err,
          "looking up all" + CONST.STORE_TYPES.ent +
            "for AllEntsCtrl failed");
      });

    $scope.perUse = function () {
      var make_entry = function (etype, etime) {
        return {
          type: etype,
          time: etime,
          per: Math.floor(100*(etime/(int_end-int_start)))
        };
      };
      var int_end = INT_END;
      var int_start;
      var ret_obj;
      var untracked_time;
      if ($scope.loading.acts || $scope.loading.ents) {
        ret_obj = [];
      } else {
        if ($scope.int_type === 'day') {
          int_start = INT_START_DAY;
        } else if ($scope.int_type === 'days3') {
          int_start = INT_START_DAY3;
        } else if ($scope.int_type === 'week') {
          int_start = INT_START_WEEK;
        } else {
          throw new Error("unspecified interval type");
        }
        ret_obj = acts.map(function (act) {
          var act_ents = ents.filter(function (ent) {
            return ent.act === act.id;
          });
          if (act_ents.length > 0) {
            console.log(act_ents);
          }
          var act_time = act_ents
                .map(ent_2_mo_int)
                .map(make_intersection({
                  start: int_start, end: int_end
                }))
                .map(mo_int_2_ms)
                .reduce(function(a, b) {return a + b;}, 0);
          return make_entry(act.name, act_time);
        });
        untracked_time = (int_end - int_start) -
          ret_obj.map(function (entry) {
            return entry.time;
          }).reduce(function(a, b) {return a + b;}, 0);
        // todo: ensure activity cannot be named 'untracked'
        ret_obj.push(make_entry('untracked', untracked_time));
        ret_obj.sort(function (ent1, ent2) {
          return ent2.per - ent1.per;
        });
        ret_obj.forEach(function (rent) {
          rent.time = util.ms_to_str(rent.time);
        });
        ret_obj = ret_obj.filter(function (rent) {
          return rent.per !== 0;
        });
      }
      if (!_.isEqual(ret_obj, RET_OBJ)) {
        RET_OBJ = ret_obj;
      }
      return RET_OBJ;
    };

  }];

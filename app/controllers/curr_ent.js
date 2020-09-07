var _ = require('lodash');
var moment = require('moment');
var CONST = require('../constants');
var util = require('../util');

module.exports = [
  '$scope', '$interval', 'actProvider',
  function ($scope, $interval, actP) {
    const clearLoading = function () {
      _.defer(() => $scope.$apply(function () {
        $scope.loading = false;
      }));
    };

    const setLoading = function () {
      _.defer(() => $scope.$apply(function () {
        $scope.loading = true;
      }));
    };


    var TIME_STR_UPDATE_INT = 1000 * 60; // ms

    var set_time_str = function () {
      var now = moment();
      // prevent digest loop in progress error
      // todo: examine more about how this works
      //       and apply the pattern elsewhere if applicable
      _.defer(function () {
        $scope.$apply(function () {
          var start, dur;
          if (!$scope.curr_ent) {
            $scope.time_str = '';
          } else {
            start = moment($scope.curr_ent.date);
            dur = moment.duration(now - start);
            $scope.time_str =
              ('0' + dur.get('hours')).slice(-2) + " : " +
              ('0' + dur.get('minutes')).slice(-2);
          }
        });
      });
    };

    var update_ctrl_state = function () {
      var curr_ent_err_cb = function (err) {
        if (err.message === CONST.ACT_P_ERRS.invalid_out) {
          throw new Error(
            "programming error: current entries should " +
              "contain at most one element at any time");
        } else {
          console.error("data store call failed to find current entry");
          console.error(err);
          throw new Error(
            "data store call failed to find current entry");
        }
      };
      var curr_ent_p = actP.get_curr_ent()
            .then(function (curr_ent) {
              return curr_ent;
            }, curr_ent_err_cb);
      var act_p = curr_ent_p.then(function (curr_ent) {
        if (curr_ent) {
          return actP.get_act(curr_ent.act);
        }
        return undefined;
      });

      // $scope.loading = true;
      setLoading()

      Promise.all([curr_ent_p, act_p])
        .then(_.spread(function (curr_ent, act) {
          _.defer(() => $scope.$apply(function () {
            $scope.curr_ent = curr_ent;
            if (curr_ent) {
              if (!act) {
                throw new Error(
                  "couldn't find activity for current entry");
              }
              $scope.curr_ent.act_obj = act;
              set_time_str();
            }
          }));
        })).then(clearLoading, clearLoading);
    };

    $scope.stopEnt = function () {
      var curr_ent = _.omit($scope.curr_ent, ['act_obj']);
      var date_stop;
      var ent;
      if ($scope.custom_stop) {
        date_stop = util.combine_date_time(
          $scope.custom_stop.date, $scope.custom_stop.time);
        $scope.custom_stop = undefined;
      } else {
        date_stop = new Date();
      }
      ent = {
        date_start: new Date(curr_ent.date),
        date_stop: date_stop,
        act: curr_ent.act
      };
      // $scope.loading = true;
      setLoading()
      actP.add_ent(ent)
        .then(function (ent) {
          return actP.del_curr_ent(curr_ent.id);
        }).then(function () {}, function (err) {
          var msg = "data store call either " +
                "failed to add interval entry " +
                "or remove current entry";
          console.error(msg);
          console.error(err);
          throw new Error(msg);
        }).then(clearLoading, clearLoading);
    };

    $scope.toggleCustomStop = function () {
      var now;
      if ($scope.custom_stop) {
        $scope.custom_stop = undefined;
      } else {
        now = new Date();
        $scope.custom_stop = {
          date: now,
          time: now
        };
      }
    };

    setLoading();
    // $scope.loading = true;
    $scope.custom_stop = undefined;

    actP.on_curr_ent_change(update_ctrl_state);
    update_ctrl_state();
    // idea for later, needs debugging
    // $scope.time_str = '';
    // $scope.$watch($scope.curr_ent, set_time_str, true);
    $interval(set_time_str, TIME_STR_UPDATE_INT);
  }];

var _ = require('lodash');
var moment = require('moment');
var CONST = require('../constants');

module.exports = [
  '$scope', '$interval', 'actProvider',
  function ($scope, $interval, actP) {

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
      $scope.loading = true;
      actP.get_curr_ent()
        .then(function (curr_ent) {
          _.defer($scope.$apply(function () {
            $scope.curr_ent = curr_ent;
            if (curr_ent) {
              set_time_str();
            }
          }));
        }, function (err) {
          if (err.message === CONST.ACT_P_ERRS.invalid_out) {
            throw new Error(
              "programming error: current entries should " +
                "contain at most one element at any time");
          } else {
            console.log("hoodie.store call failed to find current entry");
            console.log(err);
            throw new Error(
              "hoodie.store call failed to find current entry");
          }
        }).finally(function () {
          _.defer($scope.$apply(function () {
            $scope.loading = false;
          }));
        });
    };

    $scope.stopEnt = function () {
      var curr_ent = $scope.curr_ent;
      var ent = {
        date_start: curr_ent.date,
        date_stop: new Date(),
        act: curr_ent.act
      };
      $scope.loading = true;
      actP.add_ent(ent)
        .then(function (ent) {
          return actP.del_curr_ent(curr_ent.id);
        }).then(function () {}, function (err) {
          var msg = "hoodie.store call either " +
                "failed to add interval entry " +
                "or remove current entry";
          console.log(msg);
          console.log(err);
          throw new Error(msg);
        }).finally(function () {
          _.defer($scope.$apply(function () {
            $scope.loading = false;
          }));
        });
    };

    actP.on_curr_ent_change(update_ctrl_state);

    $scope.loading = true;
    update_ctrl_state();
    // idea for later, needs debugging
    // $scope.time_str = '';
    // $scope.$watch($scope.curr_ent, set_time_str, true);
    $interval(set_time_str, TIME_STR_UPDATE_INT);
  }];

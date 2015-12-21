var _ = require('lodash');
var moment = require('moment');
var hoodie = require('../hoodie_inst');
var CONST = require('../constants');

module.exports = [
  '$scope', '$interval',
  function CurrEntCtrl($scope, $interval) {

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
      hoodie.store.findAll(CONST.STORE_TYPES.curr_ent)
        .done(function (curr_ents) {
          if (curr_ents.length === 1) {
            $scope.$apply(function () {
              $scope.curr_ent = curr_ents[0];
            });
            set_time_str();
          } else if (curr_ents.length === 0) {
            $scope.$apply(function () {
              $scope.curr_ent = undefined;
            });
          } else if (curr_ents.length !== 0) {
            $scope.loading = false;
            throw new Error(
              "programming error: current entries should " +
                "contain at most one element at any time");
          }
          $scope.$apply(function () {
            $scope.loading = false;
          });
        })
        .fail(function (err) {
          console.log("hoodie.store call failed to find current entry");
          console.log(err);
          $scope.loading = false;
          throw new Error(
            "hoodie.store call failed to find current entry");
        });
    };

    $scope.stopEnt = function () {
      $scope.loading = true;
      var curr_ent = $scope.curr_ent;
      var ent = {
        date_start: curr_ent.date,
        date_stop: new Date(),
        act: curr_ent.act
      };
      hoodie.store.add(CONST.STORE_TYPES.ent, ent)
        .done(function (ent) {
          hoodie.store.remove(CONST.STORE_TYPES.curr_ent, curr_ent.id)
            .done(function (curr_ent) {
              // event listener calls update_ctrl_state
            })
            .fail(function (err) {
              console.log(
                "hoodie.store call failed to remove current entry");
              console.log(err);
              $scope.loading = false;
              throw new Error(
                "hoodie.store call failed to remove current entry");
            });
        })
        .fail(function (err) {
          console.log(
            "hoodie.store call failed to add interval entry");
          console.log(err);
          $scope.loading = false;
          throw new Error(
            "hoodie.store call failed to add interval entry");
        });
    };

    hoodie.store.on(CONST.STORE_TYPES.curr_ent + ':add',
                          update_ctrl_state);
    hoodie.store.on(CONST.STORE_TYPES.curr_ent + ':update',
                          update_ctrl_state);
    hoodie.store.on(CONST.STORE_TYPES.curr_ent + ':remove',
                          update_ctrl_state);

    $scope.loading = true;
    update_ctrl_state();

    $interval(set_time_str, TIME_STR_UPDATE_INT);
  }];

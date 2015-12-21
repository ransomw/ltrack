var _ = require('lodash');
var CONST = require('../constants');
var hoodie = require('../hoodie_inst');
var util = require('../util');

module.exports = [
  '$scope', '$routeParams', '$location',
  function EntAddCtrl($scope, $routeParams, $location) {
    var now = new Date();

    var combine_date_time = function (date, time) {
      return new Date(date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      time.getHours(),
                      time.getMinutes(),
                      time.getSeconds());
    };

    $scope.ACT_TYPES = _.cloneDeep(CONST.ACT_TYPES);

    // interval entry
    $scope.ient = {};
    $scope.ient.date_start = now;
    $scope.ient.date_stop = now;
    $scope.ient.time_start = now;
    $scope.ient.time_stop = now;
    // point entry
    $scope.pent = {};
    $scope.pent.date = now;
    $scope.pent.time = now;

    // todo: abstract entry storage and use the abstraction
    //       here and in HomeCtrl
    $scope.addIEnt = function (ientForm) {
      $scope.submitted = true;
      var ent = {};
      if (!$scope.ient ||
          !$scope.ient.date_start ||
          !$scope.ient.date_stop ||
          !$scope.ient.time_start ||
          !$scope.ient.time_stop) {
        alert("fill in all fields");
        return;
      }
      ent.date_start = combine_date_time(
        $scope.ient.date_start, $scope.ient.time_start);
      ent.date_stop = combine_date_time(
        $scope.ient.date_stop, $scope.ient.time_stop);
      ent.act = $scope.act.id;
      hoodie.store.add(CONST.STORE_TYPES.ent, ent)
        .done(function (ent) {
          $scope.$apply(function () {
            $location.path('#/activity/' + $scope.act.id);
          });
        })
        .fail(function (err) { util.log_throw_err(err); });
    };


    $scope.addPEnt = function (pentForm) {
      $scope.submitted = true;
      var ent = {};
      if (!$scope.pent ||
          !$scope.pent.date ||
          !$scope.pent.time) {
        alert("fill in date and time fields");
        return;
      }
      ent.date = combine_date_time(
        $scope.pent.date, $scope.pent.time);
      ent.act = $scope.act.id;
      ent.note = $scope.pent.note || "";
      hoodie.store.add(CONST.STORE_TYPES.ent, ent)
        .done(function (ent) {
          $scope.$apply(function () {
            $location.path('#/activity/' + $scope.act.id);
          });
        })
        .fail(function (err) { util.log_throw_err(err); });
    };

    $scope.loading_act = true;
    hoodie.store.find(CONST.STORE_TYPES.act, $routeParams.act_id)
      .done(function (act) {
        $scope.$apply(function () {
          $scope.act = act;
          $scope.loading_act = false;
        });
      })
      .fail(function (err) { util.log_throw_err(err); });

  }];

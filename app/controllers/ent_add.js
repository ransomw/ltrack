var _ = require('lodash');
var CONST = require('../constants');
var util = require('../util');

module.exports = [
  '$scope', '$routeParams', '$location', 'actProvider',
  function EntAddCtrl($scope, $routeParams, $location, actP) {
    var now = new Date();

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
      ent.date_start = util.combine_date_time(
        $scope.ient.date_start, $scope.ient.time_start);
      ent.date_stop = util.combine_date_time(
        $scope.ient.date_stop, $scope.ient.time_stop);
      ent.act = $scope.act.id;
      actP.add_ent(ent)
        .then(function (ent) {
          _.defer($scope.$apply(function () {
            $location.path('#/activity/' + $scope.act.id);
          }));
        }, function (err) { util.log_throw_err(err); });
    };

    $scope.addPEnt = function (pentForm) {
      $scope.submitted = true;
      var ent = {};
      if (!$scope.pent || !$scope.pent.date || !$scope.pent.time) {
        alert("fill in date and time fields");
        return;
      }
      ent.date = util.combine_date_time(
        $scope.pent.date, $scope.pent.time);
      ent.act = $scope.act.id;
      ent.note = $scope.pent.note || "";
      actP.add_ent(ent)
        .then(function (ent) {
          _.defer($scope.$apply(function () {
            // todo: reverse routing here and other $location.path calls
            $location.path('#/activity/' + $scope.act.id);
          }));
        }, function (err) { util.log_throw_err(err); });
    };

    $scope.loading_act = true;
    actP.get_act($routeParams.act_id)
      .then(function (act) {
        _.defer($scope.$apply(function () {
          $scope.act = act;
          $scope.loading_act = false;
        }));
      }, function (err) { util.log_throw_err(err); });

  }];

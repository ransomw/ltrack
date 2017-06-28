var _ = require('lodash');
var CONST = require('../constants');
var util = require('../util');
var routes = require('../routes');

module.exports = [
  '$scope', 'actProvider',
  function ActsCtrl($scope, actP) {
    const clearLoading = function () {
      _.defer(() => $scope.$apply(function () {
        $scope.loading = false;
      }));
    };
    $scope.reverse = routes.reverse;
    $scope.loading = true;
    actP.get_acts()
      .then(function (acts) {
        $scope.$apply(function () {
          $scope.acts = acts;
        });
      }, function (err) {
        util.log_throw_err(
          err,
          "looking up all activities for home ctrl failed");
      }).then(clearLoading, clearLoading);
  }];

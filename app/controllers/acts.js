var hoodie = require('../hoodie_inst');
var CONST = require('../constants');
var util = require('../util');
var routes = require('../routes');

module.exports = [
  '$scope',
  function ActsCtrl($scope) {
    $scope.reverse = routes.reverse;
    $scope.loading = true;
    hoodie.store.findAll(CONST.STORE_TYPES.act)
      .done(function (acts) {
        $scope.$apply(function () {
          $scope.acts = acts;
          $scope.loading = false;
        });
      })
      .fail(function (err) {
        util.log_throw_err(
          err,
          "looking up all activities for home ctrl failed");
      });
  }];

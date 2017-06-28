var _ = require('lodash');
var util = require('../util');

// re-enter password for server's sake
module.exports = [
  '$scope', '$location', 'authProvider',
  function ($scope, $location, authP) {
    const clearLoading = function () {
      _.defer(() => $scope.$apply(function () {
        $scope.loading = false;
      }));
    };

    $scope.loading = false;

    $scope.loginUser = function (loginForm) {
      $scope.loading = true;
      authP.reauth($scope.login.password)
        .then(function (username) {
          $scope.loading = false;
          _.defer(() => $scope.$apply(function () {
            $location.path('/');
          }));
        }, function (err) {
          console.error("sign in error");
          console.error(err);
          // todo: detailed error information
          alert("login failed");
        }).then(clearLoading, clearLoading);
    };

    if (!util.logged_in()) {
      $scope.$apply(function () {
        $location.path('/');
      });
    }
  }];

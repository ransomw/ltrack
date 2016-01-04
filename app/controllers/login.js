var _ = require('lodash');

module.exports = [
  '$scope', '$location', 'authProvider',
  function LoginCtrl($scope, $location, authP) {
    $scope.loading = false;

    $scope.loginUser = function (loginForm) {
      $scope.loading = true;
      authP.sign_in($scope.login.username, $scope.login.password)
        .then(function (username) {
          $scope.loading = false;
          _.defer($scope.$apply(function () {
            $location.path('/');
          }));
        }, function (err) {
          console.log("sign_in error");
          console.log(err);
          // todo: detailed error information
          alert("login failed");
          $scope.loading = false;
        });
    };

  }];

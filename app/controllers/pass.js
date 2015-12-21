var hoodie = require('../hoodie_inst');
var util = require('../util');

// re-enter password for server's sake
module.exports = [
  '$scope', '$location',
  function ($scope, $location) {
    $scope.loading = false;

    $scope.loginUser = function (loginForm) {
      $scope.loading = true;
      hoodie.account.signIn(
        hoodie.account.username, $scope.login.password,
        {moveData: true}) // don't throw away local data
        .done(function (username) {
          $scope.loading = false;
          $scope.$apply(function () {
            $location.path('/');
          });
        })
        .fail(function (err) {
          console.log("hoodie sign in error");
          console.log(err);
          // todo: detailed error information
          alert("login failed");
          $scope.loading = false;
        });
    };

    if (!util.logged_in()) {
      $scope.$apply(function () {
        $location.path('/');
      });
    }
  }];

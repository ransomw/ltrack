var hoodie = require('../hoodie_inst');

module.exports = [
  '$scope', '$location',
  function LoginCtrl($scope, $location) {
    $scope.loading = false;

    $scope.loginUser = function (loginForm) {
      $scope.loading = true;
      hoodie.account.signIn(
        $scope.login.username, $scope.login.password)
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

  }];

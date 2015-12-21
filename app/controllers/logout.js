var hoodie = require('../hoodie_inst');

module.exports = [
  '$scope', '$location',
  function LogoutCtrl($scope, $location) {
    hoodie.account.signOut()
      .done(function () {
        $scope.$apply(function () {
          $location.path('/');
        });
      })
      .fail(function (err) {
        if (err.status === 401) {
          $scope.$apply(function () {
            $location.path('/pass');
          });
        } else {
          alert("local data couldn't be synced, not signing out");
          $scope.$apply(function () {
            $location.path('/');
          });
        }
      });
  }];

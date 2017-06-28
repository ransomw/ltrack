const _ = require('lodash');

const CONST = require('../constants');
const LogoutNoSaveError = require('../err').LogoutNoSaveError;

module.exports = [
  '$scope', '$location', 'authProvider',
  function LogoutCtrl($scope, $location, authP) {
    const nav_home = function () {
      _.defer(() => $scope.$apply(function () {
        $location.path('/');
      }));
    };
    // todo: $scope.loading to prevent double clicks
    authP.sign_out()
      .then(nav_home, function (err) {
        if (err instanceof LogoutNoSaveError) {
          _.defer(() => $scope.$apply(function () {
            $location.path('/pass');
          }));
        } else {
          alert("unexpected error on signout, see log");
          console.error(err);
          console.error(err.stack);
          nav_home();
        }
      });
  }];

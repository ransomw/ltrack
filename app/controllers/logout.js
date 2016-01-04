var CONST = require('../constants');
var _ = require('lodash');

module.exports = [
  '$scope', '$location', 'authProvider',
  function LogoutCtrl($scope, $location, authP) {
    // todo: $scope.loading to prevent double clicks
    authP.sign_out()
      .then(function () {
        _.defer($scope.$apply(function () {
          $location.path('/');
        }));
      }, function (err) {
        // if (err.status === 401) {
        if (err.message === CONST.AUTH_P_ERRS.unauth) {
          _.defer($scope.$apply(function () {
            $location.path('/pass');
          }));
        } else {
          alert("local data couldn't be synced, not signing out");
          _.defer($scope.$apply(function () {
            $location.path('/');
          }));
        }
      });
  }];

var util = require('../util');

module.exports = [
  '$scope',
  function HeaderCtrl($scope) {
    $scope.logged_in = util.logged_in;
  }];

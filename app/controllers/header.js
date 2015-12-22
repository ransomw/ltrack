var util = require('../util');

module.exports = [
  '$scope',
  function ($scope) {
    $scope.logged_in = util.logged_in;
  }];

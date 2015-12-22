var util = require('../util');
var routes = require('../routes');

module.exports = [
  '$scope',
  function ($scope) {
    $scope.logged_in = util.logged_in;
    $scope.reverse = routes.reverse;
  }];

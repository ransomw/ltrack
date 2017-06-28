var CONST = require('../constants');

// todo: prevent activities with the same name
module.exports = [
  '$scope', '$location', 'actProvider',
  function ActAddCtrl($scope, $location, actP) {
    $scope.ACT_TYPES = [
      { value: CONST.ACT_TYPES.point,
        name: "Point in time"},
      { value: CONST.ACT_TYPES.interval,
        name: "Time interval"}
    ];

    $scope.loading = false;

    $scope.act = {atype: $scope.ACT_TYPES[0].value};

    $scope.addAct = function (actForm) {
      // todo: prevent duplicate activity names
      $scope.loading = true;
      actP.add_act($scope.act)
        .then(function (act) {
          $scope.$apply(function () {
            $location.path('/');
          });
        }, function (err) {
          console.error("error adding activity");
          console.error(err);
          alert("error adding activity");
          $scope.loading = false;
        });
    };
  }];

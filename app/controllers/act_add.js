var hoodie = require('../hoodie_inst');
var CONST = require('../constants');

// todo: prevent activities with the same name
module.exports = [
  '$scope', '$location',
  function ActAddCtrl($scope, $location) {
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
      // hoodie sets id attribute automatically
      hoodie.store.add(CONST.STORE_TYPES.act, $scope.act)
        .done(function (act) {
          $scope.$apply(function () {
            $location.path('/');
          });
        })
        .fail(function (err) {
          console.log("error adding activity");
          console.log(err);
          alert("error adding activity");
          $scope.loading = false;
        });
    };
  }];

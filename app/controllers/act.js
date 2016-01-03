var _ = require('lodash');
var CONST = require('../constants');
var util = require('../util');
var routes = require('../routes');

module.exports = [
  '$scope', '$routeParams', 'actProvider',
  function ActCtrl($scope, $routeParams, actP) {
    var update_ents = function () {
      $scope.loading_ents = true;
      actP.get_ents()
        .then(function (ents) {
          $scope.$apply(function () {
            $scope.ents = ents.filter(function (ent) {
              return ent.act === $routeParams.id;
            }).sort(util.cmp_ents);
          });
        }, function (err) { util.log_throw_err(err); })
        .finally(function () {
          _.defer($scope.$apply(function () {
            $scope.loading_ents = false;
          }));
        });
    };

    $scope.reverse = routes.reverse;

    $scope.loading_act = true;
    $scope.loading_ents = true;
    $scope.ACT_TYPES = _.cloneDeep(CONST.ACT_TYPES);

    $scope.dateStr = util.date_str;
    $scope.dateDiffStr = util.date_diff_str;

    $scope.delEnt = function (ent) {
      actP.del_ent(ent.id)
        .then(function (dent) {
          update_ents();
        }, function (err) { util.log_throw_err(err); });
    };

    actP.get_act($routeParams.id)
      .then(function (act) {
        $scope.$apply(function () {
          $scope.act = act;
        });
      }, function (err) { util.log_throw_err(err); })
      .finally(function () {
        _.defer($scope.$apply(function () {
          $scope.loading_act = false;
        }));
      });

    update_ents();

  }];

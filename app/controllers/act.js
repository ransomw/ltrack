var _ = require('lodash');
var CONST = require('../constants');
var hoodie = require('../hoodie_inst');
var util = require('../util');

module.exports = [
  '$scope', '$routeParams',
  function ActCtrl($scope, $routeParams) {
    var update_ents = function () {
      $scope.loading_ents = true;
      hoodie.store.findAll(CONST.STORE_TYPES.ent)
        .done(function (ents) {
          $scope.$apply(function () {
            $scope.ents = ents.filter(function (ent) {
              return ent.act === $routeParams.id;
            }).sort(util.cmp_ents);
            $scope.loading_ents = false;
          });
        })
        .fail(function (err) { util.log_throw_err(err); });
    };

    $scope.loading_act = true;
    $scope.loading_ents = true;
    $scope.ACT_TYPES = _.cloneDeep(CONST.ACT_TYPES);

    $scope.dateStr = util.date_str;
    $scope.dateDiffStr = util.date_diff_str;

    $scope.delEnt = function (ent) {
      hoodie.store.remove(CONST.STORE_TYPES.ent, ent.id)
        .done(function (dent) {
          update_ents();
        }).fail(function (err) { util.log_throw_err(err); });
    };

    hoodie.store.find(CONST.STORE_TYPES.act, $routeParams.id)
      .done(function (act) {
        $scope.$apply(function () {
          $scope.act = act;
          $scope.loading_act = false;
        });
      })
      .fail(function (err) { util.log_throw_err(err); });

    update_ents();

  }];

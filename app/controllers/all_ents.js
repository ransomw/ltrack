var _ = require('lodash');
var CONST = require('../constants');
var hoodie = require('../hoodie_inst');
var util = require('../util');

module.exports =[
  '$scope',
  function AllEntsCtrl($scope) {

    $scope.dateStr = util.date_str;
    $scope.dateDiffStr = util.date_diff_str;
    $scope.ACT_TYPES = _.cloneDeep(CONST.ACT_TYPES);

    $scope.loading = {
      acts: true,
      ents: true
    };

    $scope.getAct = function (ent) {
      if (!ent || !$scope.acts) {
        return undefined;
      }
      var act = $scope.acts.filter(function (act) {
        return act.id === ent.act;
      })[0];
      if (act) {
        return act;
      };
      return undefined;
    };

    // filter and sort
    $scope.fsEnts = function (ents) {
      var ent_filter = function (ent) {
        var act = $scope.getAct(ent);
        return act.display;
      };

      if (ents) {
        return ents
          .filter(ent_filter)
          .sort(util.cmp_ents);
      }
      return [];
    };

    hoodie.store.findAll(CONST.STORE_TYPES.act)
      .done(function (all_acts) {
        $scope.$apply(function () {
          $scope.acts = all_acts.map(function (act) {
            act.display = true;
            return act;
          });
          $scope.loading.acts = false;
        });
      })
      .fail(function (err) {
        util.log_throw_err(
          err,
          "looking up all" + CONST.STORE_TYPES.act +
            "for AllEntsCtrl failed");
      });

    hoodie.store.findAll(CONST.STORE_TYPES.ent)
      .done(function (all_ents) {
        $scope.$apply(function () {
          $scope.ents = all_ents;
          $scope.loading.ents = false;
        });
      })
      .fail(function (err) {
        util.log_throw_err(
          err,
          "looking up all" + CONST.STORE_TYPES.ent +
            "for AllEntsCtrl failed");
      });

  }]

var _ = require('lodash');
var CONST = require('../constants');
var util = require('../util');
var routes = require('../routes');

module.exports = [
  '$scope', 'actProvider', 'authProvider',
  function HomeCtrl($scope, actP, authP) {
    var get_curr_act = function () {
      return $scope.acts.filter(function (act) {
        return act.id === $scope.ent.act;
      })[0];
    };

    $scope.logged_in = util.logged_in;
    $scope.reverse = routes.reverse;
    $scope.loading = true;
    if (!util.logged_in()) {
      $scope.loading = false;
    } else {
      actP.get_acts()
        .then(function (acts) {
          $scope.$apply(function () {
            $scope.acts = acts;
            // prevent undefined option from appearing
            if ($scope.acts.length !== 0) {
              $scope.ent = {act: $scope.acts[0].id};
            }
            $scope.loading = false;
          });
        }, function (err) {
          console.log(
            "looking up all activities for home ctrl failed");
          console.log(err);
          throw new Error(
            "looking up all activities for home ctrl failed");
        });
    }

    $scope.signupUser = function (signupForm) {
      $scope.loading = true;
      // todo: proper validation
      if ($scope.signup.password !== $scope.signup.password_confirm) {
        alert("passwords don't match");
        $scope.loading = false;
        return;
      }
      authP.sign_up(
        $scope.signup.username.trim(), $scope.signup.password)
        .then(function (username) {
          // todo: sign in user s.t. views update
          alert("signed up!");
        }, function (err) {
          console.log("hoodie sign up error");
          console.log(err);
          // todo: detailed error information
          alert("sign up failed");
        }).finally(function () {
          _.defer($scope.$apply(function () {
            $scope.loading = false;
          }));
        });
    };

    $scope.currActIsPt = function () {
      var curr_act = get_curr_act();
      return curr_act && curr_act.atype === CONST.ACT_TYPES.point;
    };

    $scope.addEnt = function (entForm) {
      var act;
      var ent;
      $scope.loading = true;
      act = get_curr_act();
      if (act.atype === CONST.ACT_TYPES.point) {
        ent = _.cloneDeep($scope.ent);
        ent.date = new Date();
        actP.add_ent(ent)
          .then(function (ent) {
            alert("entry stored");
          }, function (err) {
            console.log("entry store error");
            console.log(err);
            alert("entry store error");
          })
          .finally(function () {
            _.defer($scope.$apply(function () {
              $scope.loading = false;
            }));
          });
      } else if (act.atype === CONST.ACT_TYPES.interval) {
        ent = _.cloneDeep($scope.ent);
        ent.date = new Date();
        ent.act_name = act.name; // convenience
        actP.add_curr_ent(ent)
          .then(function () {
          }, function (err) {
            if (err.message === CONST.ACT_P_ERRS.engaged) {
              alert("already engaged in an interval activity");
            } else {
              console.log("current entry store error");
              console.log(err);
              alert("entry store error");
            }
          })
          .finally(function () {
            _.defer($scope.$apply(function () {
              $scope.loading = false;
            }));
          });
      } else {
        console.log("unknown activity type");
        console.log(act);
        $scope.loading = false;
        throw new Error("unknown activity type");
      }
    };

  }];

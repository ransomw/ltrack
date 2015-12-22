var _ = require('lodash');
var CONST = require('../constants');
var hoodie = require('../hoodie_inst');
var util = require('../util');
var routes = require('../routes');

module.exports = [
  '$scope',
  function HomeCtrl($scope) {
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
      hoodie.store.findAll(CONST.STORE_TYPES.act)
        .done(function (acts) {
          $scope.$apply(function () {
            $scope.acts = acts;
            // prevent undefined option from appearing
            if ($scope.acts.length !== 0) {
              $scope.ent = {act: $scope.acts[0].id};
            }
            $scope.loading = false;
          });
        })
        .fail(function (err) {
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
      hoodie.account.signUp(
        $scope.signup.username.trim(), $scope.signup.password)
        .done(function (username) {
          // todo: sign in user s.t. views update
          alert("signed up!");
          $scope.loading = false;
        })
        .fail(function (err) {
          console.log("hoodie sign up error");
          console.log(err);
          // todo: detailed error information
          alert("sign up failed");
          $scope.loading = false;
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
        hoodie.store.add(CONST.STORE_TYPES.ent, ent)
          .done(function (ent) {
            alert("entry stored");
            $scope.loading = false;
          })
          .fail(function (err) {
            console.log("entry store error");
            console.log(err);
            alert("entry store error");
            $scope.loading = false;
          });
      } else if (act.atype === CONST.ACT_TYPES.interval) {
        ent = _.cloneDeep($scope.ent);
        ent.date = new Date();
        ent.act_name = act.name; // convenience
        hoodie.store.findAll(CONST.STORE_TYPES.curr_ent)
          .done(function (curr_ents) {
            if (curr_ents.length !== 0) {
              alert("already engaged in an interval activity");
              $scope.loading = false;
            } else {
              hoodie.store.add(CONST.STORE_TYPES.curr_ent, ent)
                .done(function (ent) {
                  $scope.loading = false;
                })
                .fail(function (err) {
                  console.log("entry store error");
                  console.log(err);
                  alert("entry store error");
                  $scope.loading = false;
                });
            }
          })
          .fail(function (err) {
            console.log(
              "hoodie.store call failed to find current entry");
            console.log(err);
            throw new Error(
              "hoodie.store call failed to find current entry");
          });
      } else {
        console.log("unknown activity type");
        console.log(act);
        $scope.loading = false;
        throw new Error("unknown activity type");
      }
    };

  }];

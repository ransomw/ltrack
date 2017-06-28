var _ = require('lodash');
var CONST = require('../constants');
var util = require('../util');
var routes = require('../routes');

module.exports = [
  '$scope', 'actProvider', 'authProvider',
  function HomeCtrl($scope, actP, authP) {
    const clearLoading = function () {
      _.defer(() => $scope.$apply(function () {
        $scope.loading = false;
      }));
    };

    var get_curr_act = function () {
      return $scope.acts.filter(function (act) {
        return act.id === $scope.ent.act;
      })[0];
    };

    var make_get_custom_date = function (date_time_obj) {
      return function () {
        if (!date_time_obj.date) {
          return undefined;
        }
        return util.combine_date_time(
          date_time_obj.date, date_time_obj.time);
      };
    };

    // var make_toggle_custom_date = function (date_time_obj) {
    //   return function () {
    //     var now;
    //     if (date_time_obj.date) {
    //       date_time_obj = undefined;
    //     } else {
    //       now = new Date();
    //       date_time_obj.date = now;
    //       date_time_obj.time = now;
    //     }
    //   };
    // };

    /* add interval entry */
    var add_ent_int = function (ent, act) {
      var get_custom_start = make_get_custom_date($scope.custom_date);
      var custom_stop = (make_get_custom_date($scope.custom_date.stop)());
      var add_ent_p;
      if (custom_stop) {
        ent.act = act.id;
        ent.date_start = get_custom_start();
        ent.date_stop = custom_stop;
        add_ent_p = actP.add_ent(ent);
      } else {
        ent.date = get_custom_start() || new Date();
        ent.act = act.id;
        add_ent_p = actP.add_curr_ent(ent);
      }
      return add_ent_p.then(function (new_ent) {
        if (new_ent.type === CONST.STORE_TYPES.ent) {
          alert("created new entry");
          $scope.custom_date = {stop: {}};
        }
      }, function (err) {
        if (err.message === CONST.ACT_P_ERRS.engaged) {
          alert("already engaged in an interval activity");
        } else {
          console.error("current entry store error");
          console.error(err);
          alert("entry store error");
        }
      });
    };

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
          console.error("sign up error");
          console.error(err);
          // todo: detailed error information
          alert("sign up failed");
        }).then(clearLoading, clearLoading);
    };

    $scope.currActIsPt = function () {
      var curr_act = get_curr_act();
      return curr_act && curr_act.atype === CONST.ACT_TYPES.point;
    };

    $scope.currActIsInt = function () {
      var curr_act = get_curr_act();
      return curr_act && curr_act.atype === CONST.ACT_TYPES.interval;
    };

    $scope.addEnt = function (entForm) {
      var act;
      var ent;
      var add_ent_p;
      $scope.loading = true;
      act = get_curr_act();
      if (act.atype === CONST.ACT_TYPES.point) {
        ent = _.cloneDeep($scope.ent);
        ent.date = new Date();
        add_ent_p = actP.add_ent(ent)
          .then(function (ent) {
            alert("entry stored");
            $scope.ent.note = undefined;
          }, function (err) {
            console.error("entry store error");
            console.error(err);
            alert("entry store error");
          });
      } else if (act.atype === CONST.ACT_TYPES.interval) {
        add_ent_p = add_ent_int(_.cloneDeep($scope.ent), act);
      } else {
        console.error("unknown activity type");
        console.error(act);
        $scope.loading = false;
        throw new Error("unknown activity type");
      }
      add_ent_p.then(clearLoading, clearLoading);
    };

    $scope.custom_date = {stop: {}};
    // $scope.toggleCustomStart = (function ($scope) {
    //   make_toggle_custom_date(
    //     $scope.custom_date);
    // }($scope));
    // $scope.toggleCustomStop = (function ($scope) {
    //   make_toggle_custom_date(
    //     $scope.custom_date.stop);
    // }($scope));

    $scope.toggleCustomStart = function () {
      var now;
      if ($scope.custom_date.date) {
        $scope.custom_date = undefined;
      } else {
        now = new Date();
        $scope.custom_date.date = now;
        $scope.custom_date.time = now;
      }
    };

    $scope.toggleCustomStop = function () {
      var now;
      if ($scope.custom_date.stop.date) {
        $scope.custom_date.stop = undefined;
      } else {
        now = new Date();
        $scope.custom_date.stop.date = now;
        $scope.custom_date.stop.time = now;
      }
    };

    $scope.logged_in = util.logged_in;
    $scope.reverse = routes.reverse;

    $scope.loading = true;
    if (!util.logged_in()) {
      $scope.loading = false;
    } else {
      actP.get_acts()
        .then(function (acts) {
          _.defer(() => $scope.$apply(function () {
            $scope.acts = acts;
            // prevent undefined option from appearing
            if ($scope.acts.length !== 0) {
              $scope.ent = {act: $scope.acts[0].id};
            }
            $scope.loading = false;
          }));
        }, function (err) {
          console.error(
            "looking up all activities for home ctrl failed");
          console.error(err);
          throw new Error(
            "looking up all activities for home ctrl failed");
        });
    }

  }];

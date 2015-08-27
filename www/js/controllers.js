define([
  'angular',
  'constants',
  'hoodie',
  'lodash'
], function (angular, CONST, Hoodie, _) {

  /*
   activity:  name, type
   ent: act (activity id), and for according to activity types
      - points: date_start, date_stop
   curr_ent: act (act id), act_name (for convenience)
   */


  // todo: make some clever enum type and put in utils
  var STORE_TYPES = {
    act: 'activity',
    ent: 'entry',
    curr_ent: 'curr-entry'
  };

  var ACT_TYPES = {
    interval: 'interval',
    point: 'point'
  };

  var hoodie = new Hoodie();

  var logged_in = function () {
    if (hoodie.account.username) {
      return true;
    }
    return false;
  };


  var controllers = angular.module(
    CONST.APP_NAME+'.controllers', []);

  controllers.controller('CurrEntCtrl', [
    '$scope',
    function CurrEntCtrl($scope) {
      $scope.loading = true;
      var update_ctrl_state = function () {
        $scope.loading = true;
        hoodie.findAll(STORE_TYPES.curr_ent)
          .done(function (curr_ents) {
            if (curr_ents.length === 1) {
              $scope.curr_ent = curr_ents[0];
            } else if (curr_ents.length === 0) {
              $scope.curr_ent = undefined;
            } else if (curr_ents.length !== 0) {
              $scope.loading = false;
              throw new Error(
                "programming error: current entries should " +
                  "contain at most one element at any time");
            }
            $scope.loading = false;
          })
          .fail(function (err) {
            console.log("hoodie.store call failed to find current entry");
            console.log(err);
            $scope.loading = false;
            throw new Error(
              "hoodie.store call failed to find current entry");
          });
      };

      $scope.stopEnt = function () {
        $scope.loading = true;
        var curr_ent = $scope.curr_ent;
        var ent = {
          date_start: curr_ent.date,
          date_stop: new Date(),
          act: curr_ent.act
        };
        hoodie.store.add(STORE_TYPES.ent, ent)
          .done(function (ent) {
            hoodie.store.remove(STORE_TYPES.curr_ent, curr_ent.id)
              .done(function (curr_ent) {
                // event listener calls update_ctrl_state
              })
              .fail(function (err) {
                console.log(
                  "hoodie.store call failed to remove current entry");
                console.log(err);
                $scope.loading = false;
                throw new Error(
                  "hoodie.store call failed to remove current entry");
              });
          })
          .fail(function (err) {
            console.log(
              "hoodie.store call failed to add interval entry");
            console.log(err);
            $scope.loading = false;
            throw new Error(
              "hoodie.store call failed to add interval entry");
          });
      };

      hoodie.store.on(STORE_TYPES.curr_ent + ':add',
                      update_ctrl_state);
      hoodie.store.on(STORE_TYPES.curr_ent + ':update',
                      update_ctrl_state);
      hoodie.store.on(STORE_TYPES.curr_ent + ':remove',
                      update_ctrl_state);
      update_ctrl_state();
    }]);

  controllers.controller('HeaderCtrl', [
    '$scope',
    function HeaderCtrl($scope) {
      $scope.logged_in = logged_in;
    }]);

  controllers.controller('HomeCtrl', [
    '$scope',
    function HomeCtrl($scope) {
      $scope.logged_in = logged_in;
      $scope.loading = true;
      if (!logged_in()) {
        $scope.loading = false;
      } else {
        hoodie.store.findAll(STORE_TYPES.act)
          .done(function (acts) {
            $scope.acts = acts;
            $scope.loading = false;
          })
          .error(function (err) {
            console.log("looking up all activities for home ctrl failed");
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
          $scope.signup.username, $scope.signup.password)
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

      $scope.addEnt = function (entForm) {
        var act;
        var ent;
        $scope.loading = true;
        act = $scope.acts.filter(function (act) {
          return act.id === $scope.act.id;
        })[0];
        if (act.type === ACT_TYPES.point) {
          ent = _.cloneDeep($scope.ent);
          ent.date = new Date();
          hoodie.store.add(STORE_TYPES.ent, ent)
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
        } else if (act.type === ACT_TYPES.interval) {
          ent = _.cloneDeep($scope.ent);
          ent.date = new Date();
          ent.act_name = act.name; // convenience
          hoodie.store.findAll(STORE_TYPES.curr_ent)
            .done(function (curr_ents) {
              if (curr_ents.length !== 0) {
                alert("already engaged in an interval activity");
              } else {
                hoodie.store.add(STORE_TYPES.curr_ent, ent)
                  .done(function (ent) {
                    alert("started interval entry");
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

    }]);

  controllers.controller('LoginCtrl', [
    '$scope', '$location',
    function LoginCtrl($scope, $location) {
      $scope.loading = false;

      $scope.loginUser = function (loginForm) {
        $scope.loading = true;
        hoodie.account.signIn(
          $scope.login.username, $scope.login.password)
          .done(function (username) {
            $scope.loading = false;
            $scope.$apply(function () {
              $location.path('/');
            });
          })
          .fail(function (err) {
            console.log("hoodie sign in error");
            console.log(err);
            // todo: detailed error information
            alert("login failed");
            $scope.loading = false;
          });
      };

    }]);

  controllers.controller('LogoutCtrl', [
    '$scope', '$location',
    function LogoutCtrl($scope, $location) {
      hoodie.account.signOut()
        .done(function () {
          $scope.$apply(function () {
            $location.path('/');
          });
        })
        .fail(function (err) {
          // todo: from docs this is the only reason for error,
          //       but typecheck error anyway
          alert("local data couldn't be synced, not signing out");
          $scope.$apply(function () {
            $location.path('/');
          });
        });
    }]);

  controllers.controller('ActAddCtrl', [
    '$scope', '$location',
    function LogoutCtrl($scope, $location) {
      $scope.ACT_TYPES = _.cloneDeep(ACT_TYPES);
      $scope.loading = false;

      $scope.addAct = function (actForm) {
        $scope.loading = true;
        // hoodie sets id attribute automatically
        hoodie.store.add(STORE_TYPES.act, $scope.act)
          .done(function () {
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
    }]);

});

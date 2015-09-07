define([
  'angular',
  'constants',
  'hoodie',
  'lodash',
  'moment'
], function (angular, CONST, Hoodie, _, moment) {

  /*
   activity:  name, atype
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

  var log_throw_err = function (err, msg) {
    if (!msg) {
      msg = "unspecified error";
    }
    console.log(msg);
    console.log(err);
    throw new Error(msg);
  };

  var logged_in = function () {
    if (hoodie.account.username) {
      return true;
    }
    return false;
  };

  var date_str = function (date) {
    var m;
    if (!date) {
      return "";
    }
    m = moment(date);
    return m.format(
      'MMM D H:mm'
    );
  };

  var date_diff_str = function (start, end) {
    var sec = Math.floor((end - start)/1000);
    var min = Math.floor(sec/60);
    var hr;
    start = new Date(start);
    end = new Date(end);
    sec = Math.floor((end - start)/1000);
    min = Math.floor(sec/60);
    if (min < 60) {
      return min + "min";
    }
    hr = min/60;
    return hr.toFixed(1) + "hr";
  };

  var cmp_ents = function (ent1, ent2) {
    var date1, date2;
    if (ent1.date_start) {
      date1 = new Date(ent1.date_start);
    } else {
      date1 = new Date(ent1.date);
    }
    if (ent2.date_start) {
      date2 = new Date(ent2.date_start);
    } else {
      date2 = new Date(ent2.date);
    }
    return date2 - date1;
  };

  var controllers = angular.module(
    CONST.APP_NAME+'.controllers', []);

  controllers.controller('CurrEntCtrl', [
    '$scope',
    function CurrEntCtrl($scope) {
      $scope.loading = true;
      var update_ctrl_state = function () {
        $scope.loading = true;
        hoodie.store.findAll(STORE_TYPES.curr_ent)
          .done(function (curr_ents) {
            if (curr_ents.length === 1) {
              $scope.$apply(function () {
                $scope.curr_ent = curr_ents[0];
              });
            } else if (curr_ents.length === 0) {
              $scope.$apply(function () {
                $scope.curr_ent = undefined;
              });
            } else if (curr_ents.length !== 0) {
              $scope.loading = false;
              throw new Error(
                "programming error: current entries should " +
                  "contain at most one element at any time");
            }
            $scope.$apply(function () {
              $scope.loading = false;
            });
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
      var get_curr_act = function () {
        return $scope.acts.filter(function (act) {
          return act.id === $scope.ent.act;
        })[0];
      };

      $scope.logged_in = logged_in;
      $scope.loading = true;
      if (!logged_in()) {
        $scope.loading = false;
      } else {
        hoodie.store.findAll(STORE_TYPES.act)
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
        return get_curr_act().atype === ACT_TYPES.point;
      };

      $scope.addEnt = function (entForm) {
        var act;
        var ent;
        $scope.loading = true;
        act = get_curr_act();
        if (act.atype === ACT_TYPES.point) {
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
        } else if (act.atype === ACT_TYPES.interval) {
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

  // todo: prevent activities with the same name
  controllers.controller('ActAddCtrl', [
    '$scope', '$location',
    function ActAddCtrl($scope, $location) {
      $scope.ACT_TYPES = [
        { value: ACT_TYPES.point,
          name: "Point in time"},
        { value: ACT_TYPES.interval,
          name: "Time interval"}
      ];

      $scope.loading = false;

      $scope.act = {atype: $scope.ACT_TYPES[0].value};

      $scope.addAct = function (actForm) {
        // todo: prevent duplicate activity names
        $scope.loading = true;
        // hoodie sets id attribute automatically
        hoodie.store.add(STORE_TYPES.act, $scope.act)
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
    }]);

  controllers.controller('ActsCtrl', [
    '$scope',
    function ActsCtrl($scope) {
      $scope.loading = true;
      hoodie.store.findAll(STORE_TYPES.act)
        .done(function (acts) {
          $scope.$apply(function () {
            $scope.acts = acts;
            $scope.loading = false;
          });
        })
        .fail(function (err) {
          log_throw_err(
            err,
            "looking up all activities for home ctrl failed");
        });
      }]);


  controllers.controller('ActCtrl', [
    '$scope', '$routeParams',
    function ActCtrl($scope, $routeParams) {
      var update_ents = function () {
        $scope.loading_ents = true;
        hoodie.store.findAll(STORE_TYPES.ent)
          .done(function (ents) {
            $scope.$apply(function () {
              $scope.ents = ents.filter(function (ent) {
                return ent.act === $routeParams.id;
              }).sort(cmp_ents);
              $scope.loading_ents = false;
            });
          })
          .fail(function (err) { log_throw_err(err); });
      };

      $scope.loading_act = true;
      $scope.loading_ents = true;
      $scope.ACT_TYPES = _.cloneDeep(ACT_TYPES);

      $scope.dateStr = date_str;
      $scope.dateDiffStr = date_diff_str;

      $scope.delEnt = function (ent) {
        hoodie.store.remove(STORE_TYPES.ent, ent.id)
          .done(function (dent) {
            update_ents();
          }).fail(function (err) { log_throw_err(err); });
      };

      hoodie.store.find(STORE_TYPES.act, $routeParams.id)
        .done(function (act) {
          $scope.$apply(function () {
            $scope.act = act;
            $scope.loading_act = false;
          });
        })
        .fail(function (err) { log_throw_err(err); });

      update_ents();

    }]);

  controllers.controller('EntAddCtrl', [
    '$scope', '$routeParams', '$location',
    function EntAddCtrl($scope, $routeParams, $location) {
      var now = new Date();

      var combine_date_time = function (date, time) {
        return new Date(date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        time.getHours(),
                        time.getMinutes(),
                        time.getSeconds());
      };

      $scope.ACT_TYPES = _.cloneDeep(ACT_TYPES);

      // interval entry
      $scope.ient = {};
      $scope.ient.date_start = now;
      $scope.ient.date_stop = now;
      $scope.ient.time_start = now;
      $scope.ient.time_stop = now;
      // point entry
      $scope.pent = {};
      $scope.pent.date = now;
      $scope.pent.time = now;

      // todo: abstract entry storage and use the abstraction
      //       here and in HomeCtrl
      $scope.addIEnt = function (ientForm) {
        $scope.submitted = true;
        var ent = {};
        if (!$scope.ient ||
            !$scope.ient.date_start ||
            !$scope.ient.date_stop ||
            !$scope.ient.time_start ||
            !$scope.ient.time_stop) {
          alert("fill in all fields");
          return;
        }
        ent.date_start = combine_date_time(
          $scope.ient.date_start, $scope.ient.time_start);
        ent.date_stop = combine_date_time(
          $scope.ient.date_stop, $scope.ient.time_stop);
        ent.act = $scope.act.id;
        hoodie.store.add(STORE_TYPES.ent, ent)
          .done(function (ent) {
            $scope.$apply(function () {
              $location.path('#/activity/' + $scope.act.id);
            });
          })
          .fail(function (err) { log_throw_err(err); });
      };


      $scope.addPEnt = function (pentForm) {
        $scope.submitted = true;
        var ent = {};
        if (!$scope.pent ||
            !$scope.pent.date ||
            !$scope.pent.time) {
          alert("fill in date and time fields");
          return;
        }
        ent.date = combine_date_time(
          $scope.pent.date, $scope.pent.time);
        ent.act = $scope.act.id;
        ent.note = $scope.pent.note || "";
        hoodie.store.add(STORE_TYPES.ent, ent)
          .done(function (ent) {
            $scope.$apply(function () {
              $location.path('#/activity/' + $scope.act.id);
            });
          })
          .fail(function (err) { log_throw_err(err); });
      };

      $scope.loading_act = true;
      hoodie.store.find(STORE_TYPES.act, $routeParams.act_id)
        .done(function (act) {
          $scope.$apply(function () {
            $scope.act = act;
            $scope.loading_act = false;
          });
        })
        .fail(function (err) { log_throw_err(err); });

    }]);

  controllers.controller('AllEntsCtrl', [
    '$scope',
    function AllEntsCtrl($scope) {

      var store_type_to_scope = function (st_type, sc_var) {
        hoodie.store.findAll(st_type)
          .done(function (all_res) {
            $scope.$apply(function () {
              $scope[sc_var] = all_res;
              $scope.loading[sc_var] = false;
            });
          })
          .fail(function (err) {
            log_throw_err(
              err,
              "looking up all" + st_type + "for AllEntsCtrl failed");
          });
      };

      // $scope.acts = {};
      // $scope.ents = {};
      $scope.dateStr = date_str;
      $scope.dateDiffStr = date_diff_str;
      $scope.ACT_TYPES = _.cloneDeep(ACT_TYPES);

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

        return ents
          .filter(ent_filter)
          .sort(cmp_ents);
      };

      store_type_to_scope(STORE_TYPES.ent, 'ents');

      hoodie.store.findAll(STORE_TYPES.act)
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
          log_throw_err(
            err,
            "looking up all" + STORE_TYPES.act +
              "for AllEntsCtrl failed");
        });

      hoodie.store.findAll(STORE_TYPES.ent)
        .done(function (all_res) {
          $scope.$apply(function () {
            $scope.ents = all_res;
            console.log("*** got entries:");
            console.log($scope.ents);
            $scope.loading.ents = false;
          });
        })
        .fail(function (err) {
          log_throw_err(
            err,
            "looking up all" + STORE_TYPES.ent +
              "for AllEntsCtrl failed");
        });


    }]);

});

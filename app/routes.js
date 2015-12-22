var _ = require('lodash');
var CONST = require('./constants');
var util = require('./util');

var route_defs = [
  {url: '/',
   name: 'home',
   template: 'home.html',
   controller: 'HomeCtrl'
  },
  {url: '/login',
   name: 'login',
   template: 'login.html',
   controller: 'LoginCtrl'
  },
  {url: '/logout',
   name: 'logout',
   template: 'logout.html',
   controller: 'LogoutCtrl'
  },
  {url: '/activity/new',
   name: 'act-add',
   template: 'act_add.html',
   controller: 'ActAddCtrl'
  },
  {url: '/activity/:id',
   name: 'act',
   template: 'act.html',
   controller: 'ActCtrl'
  },
  {url: '/activities',
   name: 'acts',
   template: 'acts.html',
   controller: 'ActsCtrl'
  },
  {url: '/entry/new/:act_id',
   name: 'ent-add',
   template: 'ent_add.html',
   controller: 'EntAddCtrl'
  },
  {url: '/agg/ents',
   name: 'ents',
   template: 'ents.html',
   controller: 'AllEntsCtrl'
  },
  {url: '/agg/per',
   name: 'per',
   template: 'per.html',
   controller: 'PerCtrl'
  },
  {url: '/pass',
   name: 'pass',
   template: 'pass.html',
   controller: 'PassCtrl'
  }
];

// todo: freeze (use deep-freeze npm pkg)

/* arguments for angular's $routeProvider.when */
var get_when_args = function () {
  return route_defs.map(function (def) {
    return [def.url, {
      templateUrl: CONST.PARTIAL_BASE + def.template,
      controller: def.controller
    }];
  });
};

// mutable state ftl T_-
/* name: route name str matching route def
 * params_arg: obj with k-v pairs {'param': val},
 *             with 'param' matching :param in url string
 */
var reverse = function (name, params_arg) {
  var params = params_arg || {};
  var def = util.arr_elem(route_defs.filter(function (def) {
            return def.name === name;
          }));
  var url_to_reverse = def.url.slice();
  var rem_params;
  _.pairs(params).map(_.spread(function (param, val) {
    var param_re = new RegExp(':'+param);
    if (url_to_reverse.match(param_re) === null) {
      throw new Error("invalid param: '" + param + "'");
    }
    url_to_reverse = url_to_reverse.replace(param_re, val);
  }));
  rem_params = url_to_reverse.match(/(\:\w+)/);
  if (rem_params !== null) {
    throw new Error("missing parameters: " + rem_params.join(", "));
  }
  // could use pushState rather than hashtag...
  return '#' + url_to_reverse;
};

module.exports.get_when_args = get_when_args;
module.exports.reverse = reverse;

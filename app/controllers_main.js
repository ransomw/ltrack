var angular = require('angular');
var CONST = require('./constants');
var controllers = require('./controllers');

/*
 activity:  name, atype
 ent: act (activity id), and for according to activity types
 - points: date_start, date_stop
 curr_ent: act (act id), act_name (for convenience)
 */

var angular_module_controllers = angular.module(
  CONST.APP_NAME+'.controllers', []);

angular_module_controllers.controller('PassCtrl', controllers.pass);
angular_module_controllers.controller('HomeCtrl', controllers.home);
angular_module_controllers.controller('LoginCtrl', controllers.login);
angular_module_controllers.controller('LogoutCtrl', controllers.logout);
angular_module_controllers.controller('ActAddCtrl', controllers.act_add);
angular_module_controllers.controller('ActsCtrl', controllers.acts);
angular_module_controllers.controller('ActCtrl', controllers.act);
angular_module_controllers.controller('EntAddCtrl', controllers.ent_add);
angular_module_controllers
  .controller('AllEntsCtrl', controllers.all_ents);
angular_module_controllers.controller('PerCtrl', controllers.per);

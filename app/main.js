window.name = "NG_DEFER_BOOTSTRAP!";

var angular = require('angular');
var routes = require('./routes');
var CONST = require('./constants');
require('angular-route');
require('./controllers_main');
require('./directives_main');

angular.element(document).ready(function () {
  var ltrack_app = angular.module(CONST.APP_NAME, [
    'ngRoute',
    CONST.APP_NAME + '.controllers',
    CONST.APP_NAME + '.directives'
  ]);

  ltrack_app.config(
    ['$routeProvider',
     function($routeProvider) {
       routes.get_when_args().forEach(function (when_args) {
         $routeProvider.when
           .apply($routeProvider, when_args);
       });
       $routeProvider
         .otherwise({
           redirectTo: '/'
         });
     }]);

  angular.bootstrap(document, [CONST.APP_NAME]);
  document.getElementById('visible-content').hidden = false;
});

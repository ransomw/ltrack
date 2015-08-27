require.config({
  paths: {
    angular: 'vendor/bower/angular/angular',
    angularRoute: 'vendor/bower/angular-route/angular-route',
    hoodie: '../_api/_files/hoodie',
    lodash: 'vendor/bower/lodash/dist/lodash.min',
    jquery: 'vendor/bower/jquery/dist/jquery.min',
    moment: 'vendor/bower/moment/min/moment.min'
  },
  baseUrl: 'js',
  shim: {
		angular : {exports : 'angular'},
		angularRoute: ['angular'],
    hoodie: {
      deps: ['jquery'],
      exports: 'Hoodie'
    }
	},
	priority: [
		"angular"
	],
  waitSeconds: 10
});

window.name = "NG_DEFER_BOOTSTRAP!";

require([
  'angular',
  'constants',
  'angularRoute',
  'controllers'
], function(angular, CONST) {


  angular.element(document).ready(function () {
    var catalog_app = angular.module(CONST.APP_NAME, [
      'ngRoute',
      CONST.APP_NAME + '.controllers'
    ]);

    catalog_app.config(
      ['$routeProvider',
       function($routeProvider) {
         $routeProvider
           .when('/', {
             templateUrl: CONST.PARTIAL_BASE + 'home.html',
             controller: 'HomeCtrl'
           })
           .when('/login', {
             templateUrl: CONST.PARTIAL_BASE + 'login.html',
             controller: 'LoginCtrl'
           })
           .when('/logout', {
             templateUrl: CONST.PARTIAL_BASE + 'logout.html',
             controller: 'LogoutCtrl'
           })
           .when('/activity/new', {
             templateUrl: CONST.PARTIAL_BASE + 'act_add.html',
             controller: 'ActAddCtrl'
           })
           .when('/activity/:id', {
             templateUrl: CONST.PARTIAL_BASE + 'act.html',
             controller: 'ActCtrl'
           })
           .when('/activities', {
             templateUrl: CONST.PARTIAL_BASE + 'acts.html',
             controller: 'ActsCtrl'
           })
           .when('/entry/new/:act_id', {
             templateUrl: CONST.PARTIAL_BASE + 'ent_add.html',
             controller: 'EntAddCtrl'
           })
           .otherwise({
             redirectTo: '/'
           });
       }]);

    angular.bootstrap(document, [CONST.APP_NAME]);
    document.getElementById('visible-content').hidden = false;
  });

});

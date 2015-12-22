window.name = "NG_DEFER_BOOTSTRAP!";

var angular = require('angular');
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
         .when('/agg/ents', {
           templateUrl: CONST.PARTIAL_BASE + 'ents.html',
           controller: 'AllEntsCtrl'
         })
         .when('/agg/per', {
           templateUrl: CONST.PARTIAL_BASE + 'per.html',
           controller: 'PerCtrl'
         })
         .when('/pass', {
           templateUrl: CONST.PARTIAL_BASE + 'pass.html',
           controller: 'PassCtrl'
         })
         .otherwise({
           redirectTo: '/'
         });
     }]);

  angular.bootstrap(document, [CONST.APP_NAME]);
  document.getElementById('visible-content').hidden = false;
});

var angular = require('angular');
var CONST = require('./constants');
var directives = require('./directives');

var controllers = require('./controllers');

var angular_module_directives = angular.module(
  CONST.APP_NAME+'.directives', []);

var make_named_controller_directive = function (ctrl_def, template_url) {
  return [
    '$templateRequest', '$compile', '$controller',
    function($templateRequest, $compile, $controller) {
      var DefdCtrl = ctrl_def.slice(-1)[0];
      DefdCtrl.$inject = ctrl_def.slice(0, -1);
      var directive_link = function(scope, $el, attrs) {
        var locals = {};
        locals.$scope = scope;
        $templateRequest(template_url)
          .then(function (template) {
            var link;
            var controller;
            $el.html(template);
            link = $compile($el.contents());
            controller = $controller(DefdCtrl, locals);
            $el.data('$ngControllerController', controller);
            $el.children().data('$ngControllerController',
                                controller);
            link(scope);
          });
      };
      return {
        link: directive_link
      };
    }];
};

angular_module_directives.directive(
  'navBar',
  make_named_controller_directive(
    controllers.header, CONST.PARTIAL_BASE + 'nav.html')
);

angular_module_directives.directive(
  'currEnt',
  make_named_controller_directive(
    controllers.curr_ent, CONST.PARTIAL_BASE + 'curr_ent.html')
);

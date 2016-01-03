var CONST = require('../constants');

var angular_module_services = angular
      .module(CONST.APP_NAME + '.services', []);

angular_module_services
  .factory('actProvider', require('./act'));
angular_module_services
  .factory('authProvider', require('./auth'));

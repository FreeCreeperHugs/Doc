'use strict';

// Declare app level module which depends on views, and components
angular.module('doc', [
  'ngRoute',
  'ngResource',
  'btford.socket-io',
  'doc.client',
  'doc.player',
  'doc.version',
  'docServices'
]).
config(['$routeProvider', "$sceDelegateProvider", function($routeProvider, $sceDelegateProvider) {
  $routeProvider.otherwise({redirectTo: '/'});

  $sceDelegateProvider.resourceUrlWhitelist([
    "self",
    "http://www.youtube.com/**",
    "https://www.youtube.com/**"
    ])
}]).
factory('socket', function (socketFactory) {
  return socketFactory({
    ioSocket: io.connect('localhost:8000')
  });
});
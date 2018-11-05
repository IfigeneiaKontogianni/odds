'use strict';
// Declare app level module which depends on views, and components
angular.module('Admin', []);


angular.module('controlpanel', [
    'ngRoute',
    'Admin'
])
    .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider, $rootScope) {

    $routeProvider
        .when('/', {
            controller: 'controlpanelCtrl',
            templateUrl: 'views/admin.html'
        })
        .when('/admin', {
            controller: 'controlpanelCtrl',
            templateUrl: 'views/admin.html'
        })
        /*.when('/login', {
            controller: 'LoginController',
            templateUrl: 'modules/login/views/login.html'
        })*/
        .when('/home', {
            controller: 'controlpanelCtrl',
            templateUrl: 'views/admin.html'
        })
        /*.when('/', {
            controller: 'HomeController',
            templateUrl: 'modules/home/views/home.html'
        })
        .when('/', {
            controller: 'HomeController',
            templateUrl: 'modules/home/views/home.html'
        })*/
        .otherwise({ redirectTo: '/login' });
        /*$locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });*/



}])
    .run(['$rootScope', '$location', '$http',
        function ($rootScope, $location, $http) {

        }]);

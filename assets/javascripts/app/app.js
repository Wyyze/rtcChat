define([
	'angular',
	'app/controllers',
	'app/room',
	'angularRoute',
	'angularSanitize',
	'angular-ui-router',
	'angularCookies'
	], function (angular) {
		'use strict';
		return angular.module('myApp', [
			'ngRoute',
			'ngSanitize',
			'ui.router',
			'ngCookies',
			'myApp.controllers',
			'myApp.room'
		])
		.config(['$sceDelegateProvider', function($sceDelegateProvider) {
			//$sceDelegateProvider.resourceUrlWhitelist(['^(?:http(?:s)?:\/\/)?(?:[^\.]+\.)?\(vimeo\.com|youtube\.com|player\.ina\.fr)(/.*)?$', 'self']);
		}]);
});

define([
	'angular'
	],
	function (angular) {
	'use strict';
	return angular.module('myApp.controllers', ['ngSanitize'])
		.controller('ChatCtrl', ['$scope','$injector', function($scope, $injector){
			require(['app/controllers/ChatController'], function(ChatCtrl){
				$injector.invoke(ChatCtrl, this,{'$scope':$scope});
			});
		}])
		.controller('LoginFormCtrl', ['$scope','$injector', function($scope, $injector){
			require(['app/controllers/LoginFormController'], function(LoginFormCtrl){
				$injector.invoke(LoginFormCtrl, this,{'$scope':$scope});
			});
		}])
});
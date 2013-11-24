window.name = "NG_DEFER_BOOTSTRAP!";

(function() {
	require({
		urlArgs: "b=" + ((new Date()).getTime()),
		paths: {
			angular: 'vendor/angular/angular',
			angularRoute: 'vendor/angular-route/angular-route',
			angularSanitize: 'vendor/angular-sanitize/angular-sanitize',
			angularCookies: 'vendor/angular-cookies/angular-cookies',
			jquery: 'vendor/jquery/jquery',
			bootstrap: 'vendor/bootstrap/bootstrap',
			'angular-ui-router': "vendor/angular-ui-router/angular-ui-router.min",
			'underscore': 'vendor/underscore-amd/underscore',
			'RTCPeerConnection': 'libs/rtcpeerconnection/rtcpeerconnection.bundle'
		},
		shim: {
			'angular': {
				'exports': 'angular'
			},
			'angularRoute': ['angular'],
			'angularSanitize': ['angular'],
			'angularCookies': ['angular'],
			'angular-ui-router': ['angular'],
		},
		priority: [
			"angular"
		]
	}, [
		'angular',
		'app/app',
		'app/states'
	], function(angular, app) {
		'use strict';
		var $html = angular.element(document.getElementsByTagName('html')[0]);

		angular.element().ready(function() {
			$html.addClass('ng-app');
			angular.bootstrap($html, [app['name']]);
		});
	});
}).call(this);
define(['app/app', 'templates'], function(app, templates) {
	'use strict';

	return app.config(['$stateProvider', '$urlRouterProvider',
		function($stateProvider, $urlRouterProvider) {

			var isLogged = ['$room', '$state', '$q', '$location', function($room, $state, $q, $location){
				if($room.user)
					return true;
				var defered = $q.defer();
				$room.restore(function(err, res){
					if(!err)
						return defered.resolve("logged");
					defered.reject("No logged");
					$location.path("login")
				});
				return defered.promise;
			}];

			$stateProvider
				.state('chat', {
					url: "/chat",
					template: templates.chat,
					controller: 'ChatCtrl',
					resolve: {
						isLogged: isLogged
					}
				})
				.state('login', {
					url: "/login",
					template: templates.login
				})
			$urlRouterProvider.otherwise("/login");
		}
	]);
});
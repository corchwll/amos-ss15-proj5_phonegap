angular.module('MobileTimeRecording.controllers.EditSession', ['MobileTimeRecording.services.Database'])

.controller('EditSessionController', function($scope, Sessions, Projects, $location, ngNotify, $timeout, $routeParams){

	var addSession = function(session) {
	  Sessions.add(session).then(function() {
	  	ngNotify.set(project.name + ' successfully added', {
	  			type: 'success',
	  			position: 'top',
	  			duration: 3000
	  		});
	  	$timeout(function() {
	  		$location.path('#/');
	  	}, 3500);
	  });
  };
});
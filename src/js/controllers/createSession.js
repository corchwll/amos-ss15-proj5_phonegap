angular.module('MobileTimeRecording.controllers.CreateSession', ['MobileTimeRecording.services.Database'])

.controller('CreateSessionController', function($scope, Sessions, Projects, $location, ngNotify, $timeout, $routeParams){
	
	$scope.session = {};
	$scope.session.startTime = '08:00';
	$scope.session.stopTime = '16:00';
	
	$scope.addSession = function(session) {
		session.project_id = $routeParams.projectId;
		session.timestamp_start = Date.parse(session.date + ", " + session.startTime)/1000;
		session.timestamp_stop = Date.parse(session.date + ", " + session.stopTime)/1000;
		if(!session.date) {
			ngNotify.set('Please enter a date', {
				type: 'error',
				position: 'top',
				duration: 3000
			});
		} else if(session.timestamp_start <= session.timestamp_stop) {
			Sessions.add(session).then(function() {
		  	ngNotify.set('Session successfully added', {
		  			type: 'success',
		  			position: 'top',
		  			duration: 3000
		  		});
		  	$timeout(function() {
		  		$(location).attr('href', '#/viewProject/' + session.project_id);
		  	}, 3500);
	  	});
		} else {
			ngNotify.set('negative times are not allowed', {
				type: 'error',
				position: 'top',
				duration: 3000
			});
	  }
  };
});
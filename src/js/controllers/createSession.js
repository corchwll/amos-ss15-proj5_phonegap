angular.module('MobileTimeRecording.controllers.CreateSession', ['MobileTimeRecording.services.Database'])

.controller('CreateSessionController', function($scope, Sessions, Projects, $location, ngNotify, $timeout, $routeParams){
	
	$scope.session = {};
	$scope.session.startTime = '08:00';
	$scope.session.stopTime = '16:00';
	
	/**
	 * This function tests if a session is valid, if so, stores it into the database and shows a respective notification depending on the test.
	 * 
	 * @param  session Session object which contains the session data
	 */
	$scope.addSession = function(session) {
		session.project_id = $routeParams.projectId;
		session.timestamp_start = Date.parse(session.date + ", " + session.startTime)/1000;
		session.timestamp_stop = Date.parse(session.date + ", " + session.stopTime)/1000;
		var day = moment(session.date).format("YYYY-MM-DD");


		if(!session.date) {
			ngNotify.set('Please enter a date', {
				type: 'error',
				position: 'top',
				duration: 3000
			});
		} else if(session.timestamp_start <= session.timestamp_stop) {
			Sessions.getAccumulatedSessionfromDay(day).then(function(workingTimeOfDay) {

				if(60*60*10 < (workingTimeOfDay.working_time + (session.timestamp_stop - session.timestamp_start))) {
					ngNotify.set('The total working hours can not exceed ten hours per day', {
						type: 'error',
						position: 'top',
						duration: 3000
					});
				} else {
					Sessions.checkFullOverlapping(session.timestamp_start, session.timestamp_stop).then(function(result) {
						if(result.overlappings === 0) {
							Sessions.add(session).then(function() {
							  	ngNotify.set('Session successfully added', {
							  			type: 'success',
							  			position: 'top',
							  			duration: 3000
							  		});
							  	$timeout(function() {
							  		$(location).attr('href', '#/viewProject/' + session.project_id);
							  	}, 4000);
						  	});
						} else {
							ngNotify.set('You have already recorded for this time', {
								type: 'error',
								position: 'top',
								duration: 3000
							});
						}
					});
				}
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
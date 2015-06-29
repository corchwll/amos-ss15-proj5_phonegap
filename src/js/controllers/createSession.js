angular.module('MobileTimeAccounting.controllers.CreateSession', ['MobileTimeAccounting.services.Database'])

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
					/* Check for project end date */
					Projects.getById(session.project_id).then(function(project) {
						var finalDate = project.timestamp_final_date;
						if(projectExpired(session.timestamp_start, finalDate)) {
							ngNotify.set('It is not possible to record times after the final project date', {
								type: 'error',
								position: 'top',
								duration: 3000
							});
						} else {
							Sessions.checkFullOverlapping(session.timestamp_start, session.timestamp_stop).then(function(result) {
								if(result.overlappings === 0) {
									Sessions.add(session).then(function() {
										if(day === moment().format("YYYY-MM-DD")) {
											cordova.plugins.notification.local.cancel(1, function() {
											  console.log("Daily notification canceled for today");
											});
										}
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

  /**
   * This function checks if the final project date has been reached already.
   * 
   * @param  currentDate Unix timestamp
   * @param  finalDate   Unix timestamp
   * @return             Boolean
   */
  var projectExpired = function(currentDate ,finalDate) {
  	if(!finalDate) {
  		return false;
  	} else if(currentDate >= finalDate) {
  		return true;
  	} else {
  		return false;
  	}
  };
});
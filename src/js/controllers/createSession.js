angular.module('MobileTimeAccounting.controllers.CreateSession', [])

.controller('CreateSessionController', function($scope, Sessions, Projects, $location, Notify, $timeout, $routeParams, Holidays){
	
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
			Notify.error('Please enter a date');
		} else if(session.timestamp_start <= session.timestamp_stop) {
			Sessions.getAccumulatedSessionfromDay(day).then(function(workingTimeOfDay) {

				if(60*60*10 < (workingTimeOfDay.working_time + (session.timestamp_stop - session.timestamp_start))) {
					Notify.error('The total working hours can not exceed ten hours per day');
				} else {
					/* Check for project end date */
					Projects.getById(session.project_id).then(function(project) {
						var finalDate = project.timestamp_final_date;
						if(projectExpired(session.timestamp_start, finalDate)) {
							Notify.error('It is not possible to record times after the final project date');
						} else {
							Sessions.checkFullOverlapping(session.timestamp_start, session.timestamp_stop).then(function(result) {
								if(result.overlappings === 0) {
									Sessions.add(session).then(function() {
										if(day === moment().format("YYYY-MM-DD")) {
											cordova.plugins.notification.local.cancel(1, function() {
											  console.log("Daily notification canceled for today");
											});
										}
								  	Notify.success('Session successfully added');
								  	$timeout(function() {
								  		$(location).attr('href', '#/viewProject/' + session.project_id);
								  	}, 4000);
							  	});
								} else {
									Notify.error('You have already recorded for this time');
								}
							});
						}
					});
				}
			});

		} else {
			Notify.error('negative times are not allowed');
	  }
  };

  /**
   * This function checks if the specified date is a workday
   * 
   * @param  date 		A date string formatted as 'YYYY/MM/DD'	
   * @return 		    	Boolean
   */
  $scope.checkWorkday = function(date) {
  	if(!date) {
  		return false;
  	} else {

  		// Check if date is a Saturday
  		if(moment(date).day() === 6) {
  			return true;
  		}

  		// Check if date is a Sunday
  		if(moment(date).day() === 0) {
  			return true;
  		}

  		// Get all holidays for the selected year and check if holiday is selected
  		var holidays = Holidays.getHolidaysForYear(moment(date).format("YYYY"));
  		for(var i = 0; i < holidays.length; i++) {
  			if(moment(holidays[i]).format("YYYY/MM/DD") === date) {
					return true;
				}
  		}
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
  	} else if(currentDate > finalDate) {
  		return true;
  	} else {
  		return false;
  	}
  };
});
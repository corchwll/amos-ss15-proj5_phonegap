angular.module('MobileTimeAccounting.controllers.ViewProject', ['MobileTimeAccounting.services.Database'])

.controller('ViewProjectController', function($scope, Projects, Sessions, ngNotify, $timeout, $routeParams){
	
	$scope.timerRunning = false;

	/**
	 * This function loads a project into the view
	 * 
	 */
	$scope.getProject = function() {
		Projects.getById($routeParams.projectId).then(function(project) {
			$scope.project = project;
			$scope.title = project.name;
		});
	};

	/**
	 * This function loads all sessions of a project into the view
	 * 
	 */
	$scope.updateSessions = function() {
		Sessions.getByProjectId($routeParams.projectId).then(function(sessions) {
			$scope.sessions = sessions;
		});
	};

	/**
	 * This function forwards to the creation screen for sessions for a certain project
	 * @param projectId The 5 digit id of a project
	 */
	$scope.addSession = function(projectId) {
		$(location).attr('href', '#/editSession/' + projectId);
	};

	/**
	 * This function computes the duration of a session depending on its start and end.
	 * 
	 * @param   session An object containing a session
	 * @return          A moment object containing a period of time
	 */
  $scope.calculateSessionDuration = function(session) {
  	var start = moment.unix(session.timestamp_start);
  	var stop = moment.unix(session.timestamp_stop);
  	return moment.utc(stop.diff(start)).format("HH:mm");
  };

  /**
   * This function removes a session from the database specified by the session id.
   * 
   * @param   sessionId The id of a session
   */
  $scope.deleteSession = function(session) {
    Sessions.remove(session.id).then(function() {
      $scope.updateSessions();
    });
  };

	/**
	 * This function starts the timer for a project specified by its id.
	 * 
	 * @param  projectId The 5 digit id of a project
	 */
  $scope.startTimer = function (projectId){
  	var startTime = moment().unix();
  	var startDay = moment().format("YYYY-MM-DD");

  	/* Check for project end date */
  	Projects.getById(projectId).then(function(project) {
  		var finalDate = project.timestamp_final_date;
  		if(projectExpired(startTime, finalDate)) {
  			ngNotify.set('It is not possible to record times after the final project date', {
  				type: 'error',
  				position: 'top',
  				duration: 3000
  			});
  		} else {
  			/* Check for maximum working time per day */
  			Sessions.getAccumulatedSessionfromDay(startDay).then(function(workingTimeOfDay) {
  		    /* Check for overlapping sessions */
  		    Sessions.checkSimpleOverlapping(startTime).then(function(result) {
  		    	if(60*60*10 <= workingTimeOfDay.working_time) {
  		    		ngNotify.set('The total working hours can not exceed ten hours per day', {
  						type: 'error',
  						position: 'top',
  						duration: 3000
  					});
  		    	} else if(result.overlappings === 0) {
  				    /* Start timer if it is not already running */
  				    if($scope.timerRunning === false) {
				        $scope.$broadcast('timer-start');
				        $scope.timerRunning = true;
				        starttimeDb(startTime, projectId);
  				    }
  					} else {
  						ngNotify.set('You have already recorded for this time', {
  							type: 'error',
  							position: 'top',
  							duration: 3000
  						});
  					}
  		    });
  	    });
  		}
  	});    
  };

  /**
   * This function stops the timer for a project specified by its id.
   * 
   * @param  projectId The 5 digit id of a project
   */
  $scope.stopTimer = function (projectId){
 		var stopTime = moment().unix();
 		var day = moment().format("YYYY-MM-DD");

  	Sessions.currentSession(projectId).then(function(currentSession) {
  		Sessions.getById(currentSession.currentSessionId).then(function(dbSession) {
  			Sessions.checkFullOverlapping(dbSession.timestamp_start, stopTime).then(function(overlapResult) {
					Sessions.getAccumulatedSessionfromDay(day).then(function(workingTimeOfDay) {
  					var sessionTime = stopTime - dbSession.timestamp_start;

  					if(sessionTime > (60*60*10 - workingTimeOfDay.working_time)) {
  						var session = {};
  						session.project_id = projectId;
  						session.timestamp_stop = dbSession.timestamp_start + (60*60*10 - workingTimeOfDay.working_time);

  						$scope.$broadcast('timer-stop');
  						$scope.timerRunning = false;
  						Sessions.addStop(session).then(function() {
  							$scope.$broadcast('timer-reset');
  							ngNotify.set('The total working hours can not exceed ten hours per day', {
									type: 'error',
									position: 'top',
									duration: 3000
								});
  						});
  					} else if(overlapResult.overlappings === 0) {
    					$scope.$broadcast('timer-stop');
    					$scope.timerRunning = false;
    					stoptimeDb(stopTime, projectId);
    					$scope.$broadcast('timer-reset');
    				} else {
    					$scope.$broadcast('timer-stop');
    					$scope.timerRunning = false;
		    			Sessions.remove(currentSession.currentSessionId).then(function() {
		    				$scope.$broadcast('timer-reset');
		    				ngNotify.set('You have already recorded for this time', {
									type: 'error',
									position: 'top',
									duration: 3000
								});
		    			});
    				}
    			});
  			});
  		});
  	});
  };

	/**
	 * This function inserts the start time of a session into the database.
	 * 
	 * @param   startTime The time of the beginning of the current session
	 * @param   projectId The 5 digit id of a project
	 */
	var starttimeDb = function(startTime, projectId) {
    var session = {};
    session.timestamp_start = startTime;
    session.project_id =  projectId;
    
    Sessions.addStart(session);
	};

	/**
	 * This function inserts the current time as stop time of the current session into the database.
	 *
	 * @param   stopTime The time of the end of the current session
	 * @param  	projectId The 5 digit id of a project
	 */
	var stoptimeDb = function(stopTime, projectId) {
		var session = {};
    session.timestamp_stop = stopTime;
    session.project_id =  projectId;

    Sessions.addStop(session).then(function() {
    	// cordova.plugins.notification.local.cancel(1, function() {
    	//   console.log("Daily notification canceled for today");
    	// });
    	$scope.updateSessions();
    });
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
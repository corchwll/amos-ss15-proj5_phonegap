angular.module('MobileTimeRecording.controllers.ViewProject', ['MobileTimeRecording.services.Database'])

.controller('ViewProjectController', function($scope, Projects, Sessions, ngNotify, $timeout, $routeParams){
	
	$scope.counter = '00:00:00';

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

	/* state whether timer is running or not */
	var state = 0;
	var currentDate;
	var counter;
	var refresh;

	/**
	 * This function starts the timer for a project specified by its id.
	 * 
	 * @param  projectId The 5 digit id of a project
	 */
	$scope.start = function(projectId) {
    var startDate = new Date();
    var startTime = startDate.getTime();
		var startDay = moment(startDate).format("YYYY-MM-DD");

    Sessions.getAccumulatedSessionfromDay(startDay).then(function(workingTimeOfDay) {

	    /* Check for overlapping sessions */
	    Sessions.checkSimpleOverlapping(Math.floor(startTime/1000)).then(function(result) {
	    	if(60*60*10 <= workingTimeOfDay.working_time) {
	    		ngNotify.set('The total working hours can not exceed ten hours per day', {
					type: 'error',
					position: 'top',
					duration: 3000
				});
	    	} else if(result.overlappings === 0) {
			    /* Start counter if it is not already running */
			    if(state === 0) {
			        state = 1;
			        timer(startTime, projectId);
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
  };


	/**
	 * This function stops the timer for a project specified by its id.
	 * 
	 * @param  projectId The 5 digit id of a project
	 */
	$scope.stop = function(projectId) {
    if(state === 1) {
      var stopDate = new Date();
   		var stopTime = stopDate.getTime();
   		var day = moment(stopDate).format("YYYY-MM-DD");

    	Sessions.currentSession(projectId).then(function(result) {
    		Sessions.getById(result.currentSessionId).then(function(result2) {
    			Sessions.checkFullOverlapping(result2.timestamp_start, stopTime).then(function(result3) {
  					Sessions.getAccumulatedSessionfromDay(day).then(function(workingTimeOfDay) {
    					var sessionTime = stopTime - result2.timestamp_start;

    					if(sessionTime > (60*60*10 - workingTimeOfDay.working_time)) {
    						var session = {};
    						session.project_id = projectId;
    						session.timestamp_stop = result2.timestamp_start + (60*60*10 - workingTimeOfDay.working_time);

    						Sessions.addStop(session).then(function() {
    							state = 0;
    							$scope.counter = '00:00:00';
    							ngNotify.set('The total working hours can not exceed ten hours per day', {
										type: 'error',
										position: 'top',
										duration: 3000
									});
    						});
    					} else if(result3.overlappings === 0) {
	    					state = 0;
	       	 				stoptimeDb(projectId);
	    				} else {
	    					state = 0;
			    			ngNotify.set('You have already recorded for this time', {
								type: 'error',
								position: 'top',
								duration: 3000
							});
			    			Sessions.remove(result.currentSessionId);
	    				}
	    			});
    			});
    		});
    	});
    }
	};

	/**
	 * This function refreshes the displayed timer every second and formats the timer.
	 * 
	 * @param   startTime The time of the beginning of the current session
	 * @param   projectId The 5 digit id of a project
	 */
	var timer = function(startTime, projectId) {
    var timeDiff = new Date().getTime() - startTime;

    if(state === 1) {
        // $scope.counter = formatTime(timeDiff);
        $scope.counter = moment.utc(timeDiff).format("HH:mm:ss");
        $timeout(function() {
        	timer(startTime, projectId);
        }, 10);
    }
	};

	/**
	 * This function inserts the start time of a session into the database.
	 * 
	 * @param   startTime The time of the beginning of the current session
	 * @param   projectId The 5 digit id of a project
	 */
	var starttimeDb = function(startTime, projectId) {
    var session = {};
    session.timestamp_start = Math.floor(startTime/1000);
    session.project_id =  projectId;
    
    Sessions.addStart(session);
	};

	/**
	 * This function inserts the current time as stop time of the current session into the database.
	 * 
	 * @param  projectId The 5 digit id of a project
	 */
	var stoptimeDb = function(projectId) {
		var session = {};
    var stopTime = new Date().getTime();
    session.timestamp_stop = Math.floor(stopTime/1000);
    session.project_id =  projectId;

    Sessions.addStop(session).then(function() {
    	cordova.plugins.notification.local.cancel(1, function() {
    	  console.log("Daily notification canceled for today");
    	});
    	$scope.counter = '00:00:00';
    	$scope.updateSessions();
    });
	};

});
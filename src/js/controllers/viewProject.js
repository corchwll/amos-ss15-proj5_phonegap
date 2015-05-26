angular.module('MobileTimeRecording.controllers.ViewProject', ['MobileTimeRecording.services.Database'])

.controller('ViewProjectController', function($scope, Projects, Sessions, $location, ngNotify, $timeout, $routeParams){
	
	$scope.counter = '00:00:00';

	$scope.getProject = function() {
		Projects.getById($routeParams.projectId).then(function(project) {
			$scope.project = project;
			$scope.title = project.name;
		});
	};

	$scope.addSession = function(projectId) {
		$location.path('/editSession/' + projectId);
	};



	/* state whether timer is running or not */
	var state = 0;
	var currentDate;
	var counter;
	var refresh;

	/*
	function start
	The function expects the project id of the project it should start as parameter. If the project is not already running, the timer gets startet and an respective database entry is made, using the function starttimeDb.
	*/
	$scope.start = function(projectId) {
	    var startDate = new Date();
	    var startTime = startDate.getTime();

	    /* Start counter if it is not already running */
	    if(state === 0)
	    {
	        state = 1;
	        timer(startTime, projectId);
	        starttimeDb(startTime, projectId);
	    }
	};

	/*
	function stop
	The function expects the project id of the project it should stop as parameter. If the project is currently running, the timer gets stopped and an respective database entry is made, using the function stoptimeDb.
	*/
	$scope.stop = function(projectId) {
	    if(state === 1) {
	        state = 0;
	        stoptimeDb(projectId);
	    }
	};

	/*
	 Function timer increases the counter element every second, starting from a given start time.
	 */
	var timer = function(startTime, projectId) {
	    var timeDiff = new Date().getTime() - startTime;

	    if(state === 1) {
	        // $scope.counter = formatTime(timeDiff);
	        $scope.counter = moment(timeDiff).subtract(1, 'hour').format("HH:mm:ss");
	        $timeout(function() {
	        	timer(startTime, projectId);
	        }, 10);
	    }
	};

	/*
	 Function starttimeDb inserts the current timestamp into the database table Sessions as starting point of the respective session.
	 */
	var starttimeDb = function(startTime, projectId) {
	    var session = {};
	    session.timestamp_start = Math.floor(startTime/1000);
	    session.project_id =  projectId;
	    
	    Sessions.addStart(session);
	};

	/*
	 Function stoptimeDb updates the current session in the database table Sessions with the current timestamp as end point of the respespectie session.
	 */
	var stoptimeDb = function(projectId) {
			var session = {};
	    var stopTime = new Date().getTime();
	    session.timestamp_stop = Math.floor(stopTime/1000);
	    session.project_id =  projectId;

	    Sessions.addStop(session).then(function() {
	    	$scope.counter = '00:00:00';
	    });
	};

});
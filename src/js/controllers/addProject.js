angular.module('MobileTimeAccounting.controllers.AddProject', ['MobileTimeAccounting.services.Database'])

.controller('AddProjectController', function($scope, Projects, $location, ngNotify, $timeout, $routeParams){

	/**
	 * This function searches a project specified by its id in the database and fills the current values into the edit project form.
	 * 
	 */
	$scope.getProject = function() {
		Projects.getById($routeParams.projectId).then(function(project) {
			$scope.project = project;
			$scope.origDate = project.timestamp_final_date*1000;
		});
	};
	
	/**
	 * This function adds a new project into the database, gives a respective notification and forwards to the main screen.
	 * 
	 * @param  project Project object containing the data of the project
	 */
	$scope.addProject = function(project) {
		// convert date to unix timestamp
		project.date = Date.parse(project.date)/1000;

	  Projects.add(project).then(function() {
	  	ngNotify.set(project.name + ' successfully added', {
	  			type: 'success',
	  			position: 'top',
	  			duration: 3000
	  		});
	  	$timeout(function() {
	  		$(location).attr('href', '#/');
	  	}, 3500);
	  });
  };

  /**
   * This function updates a specified project, gives a respective notification and forwards to the main screen.
   * 
   * @param  project Project object containing the data of the edited project
   */
  $scope.editProject = function(project) {
  	// convert date to unix timestamp
		project.date = Date.parse(project.date)/1000;

		Projects.update(project, project).then(function() {
			ngNotify.set(project.name + ' successfully edited', {
					type: 'success',
					position: 'top',
					duration: 3000
				});
			$timeout(function() {
				$(location).attr('href', '#/');
			}, 3500);
		});
  };

  /**
   * This function starts a GPS localization in order to get the longitude and latitude of the current position.
   * 
   */
  $scope.trackProject = function() {
  	navigator.geolocation.getCurrentPosition(function(position, error) {
  		$timeout(function() {
  		  $scope.project.longitude = position.coords.longitude;
  			$scope.project.latitude = position.coords.latitude;
  		}, 1);
  	}, function(error) {
  		console.log('gps-error: ' + error.code + error.message);
  	}, { enableHighAccuracy: true });
  };
});
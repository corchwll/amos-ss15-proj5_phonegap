angular.module('MobileTimeRecording.controllers.AddProject', ['MobileTimeRecording.services.Database'])

.controller('AddProjectController', function($scope, Projects, $location, ngNotify, $timeout){
	
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
   * This function starts a GPS localization in order to get the longitude and latitude of the current position.
   * 
   */
  $scope.trackProject = function() {
  	navigator.geolocation.getCurrentPosition(function(position) {
  	  $scope.project.longitude = position.coords.longitude;
  		$scope.project.latitude = position.coords.latitude;
  	});
  };
});
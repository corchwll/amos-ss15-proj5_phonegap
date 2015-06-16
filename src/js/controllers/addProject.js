angular.module('MobileTimeRecording.controllers.AddProject', ['MobileTimeRecording.services.Database'])

.controller('AddProjectController', function($scope, Projects, $location, ngNotify, $timeout){
	
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
});
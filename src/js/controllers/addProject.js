angular.module('MobileTimeRecording.controllers.AddProject', ['MobileTimeRecording.services.Database'])

.controller('AddProjectController', function($scope, Projects, $location, ngNotify, $timeout){
	
	$scope.addProject = function(project) {
	  Projects.add(project).then(function() {
	  	ngNotify.set(project.name + ' successfully added', {
	  			type: 'success',
	  			position: 'top',
	  			duration: 3000
	  		});
	  	$timeout(function() {
	  		$location.path('#/');
	  	}, 3500);
	  });
  };
});
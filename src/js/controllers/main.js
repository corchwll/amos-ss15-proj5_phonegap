angular.module('MobileTimeRecording.controllers.Main', ['MobileTimeRecording.services.Database'])

.controller('MainController', function($scope, Projects, $location){
  $scope.projects = [];
  $scope.project = null;
  

  $scope.updateProjects = function() {
  	Projects.all().then(function(projects) {
      $scope.delete = false;
  		$scope.projects = projects;
  	});
  };

  $scope.orderProjects = function(project) {
    if(project.id === '00001') {
      return -1;
    } else if(project.id === '00002') {
      return -1;
    } else if(project.id === '00003') {
      return -1;
    } else if(project.id === '00004') {
      return -1;
    } 
    return project.name;
  };

  $scope.viewProject = function(projectId) {
    $location.path('/viewProject/' + projectId);
  };

  $scope.addProject = function() {
  	$location.path('/addProject');
  };

  $scope.deleteProject = function(project) {
    Projects.archive(project.id).then(function() {
      $scope.updateProjects();
    });
  };
})

.controller('ModalController', function($scope, close) {
  $scope.close = function(result) {
    close(result);
  };
});
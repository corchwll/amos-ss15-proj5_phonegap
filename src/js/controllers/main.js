angular.module('MobileTimeRecording.controllers.Main', ['MobileTimeRecording.services.Database'])

.controller('MainController', function($scope, Projects, $location, ModalService){
  $scope.projects = [];
  $scope.project = null;
  

  $scope.updateProjects = function() {
  	Projects.all().then(function(projects) {
      $scope.delete = false;
  		$scope.projects = projects;
  	});
  };

  $scope.viewProject = function(projectId) {
    $location.path('/viewProject/' + projectId);
  }

  $scope.addProject = function() {
  	$location.path('/addProject');
  };

  $scope.deleteOverlay = function(project) {
    ModalService.showModal({
      templateUrl: 'modal.html',
      controller: 'ModalController'
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(result) {
        if(result === 'Yes') {
          deleteProject(project.id)
        } else {        
          $scope.updateProjects();
        }
      })
    });
  }
  var deleteProject = function(projectId) {
    Projects.archive(projectId).then(function() {
      $scope.updateProjects();
    });
  }
})

.controller('ModalController', function($scope, close) {
  $scope.close = function(result) {
    close(result);
  }
});
angular.module('MobileTimeRecording.controllers.Main', ['MobileTimeRecording.services.Database'])

.controller('MainController', function($scope, Projects, Sessions){
  $scope.projects = [];
  $scope.project = null;
  
  /**
   * This function refreshes the view of the project lists and, therefore, loads all projects from the database.
   * 
   */
  $scope.updateProjects = function() {
  	Projects.all().then(function(projects) {
      $scope.delete = false;
  		$scope.projects = projects;
  	});
  };

  /**
   * This function is used to arrange the projects in alphabetical order them with exception of the four predefined projects which are listed on top.
   * 
   * @param   project An object containing a project
   * @return          The project name
   */
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

  /**
   * This function is used to forward to the display of individual projects
   * 
   * @param   projectId The 5 digit id of a project
   */
  $scope.viewProject = function(projectId) {
    $(location).attr('href', '#/viewProject/' + projectId);
  };

  /**
   * This function is used to forward to the add project screen
   * 
   */
  $scope.addProject = function() {
    $(location).attr('href', '#/addProject');
  };

  /**
   * This function deletes (internally archive) a project specified by its id
   * 
   * @param   project An object containing a project
   */
  $scope.deleteProject = function(project) {
    Projects.archive(project.id).then(function() {
      $scope.updateProjects();
    });
  };
});
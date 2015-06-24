angular.module('MobileTimeRecording.controllers.Main', ['MobileTimeRecording.services.Database'])

.controller('MainController', function($scope, Projects, User, $timeout){
  $scope.projects = [];
  $scope.project = null;

  var gpsSort = 0;
  var currentPosition = {};
  
  /**
   * This function refreshes the view of the project lists and, therefore, loads all projects from the database and sorts them.
   * 
   */
  $scope.updateProjects = function() {
  	Projects.all().then(function(projects) {
      User.all().then(function(user) {
        gpsSort = user[0].location_sort_is_used;
        $scope.delete = false;

        if(gpsSort === 1) {
          navigator.geolocation.getCurrentPosition(function(position) {
            $timeout(function() {
              currentPosition.latitude = position.coords.latitude;
              currentPosition.longitude = position.coords.longitude;
              var stdProjects = projects.splice(0, 4);
              projects.sort(function(a, b) {
                var distA, distB;
                if(a.latitude === 'undefined' && a.longitude === 'undefined') {
                  distA = Number.MAX_VALUE;
                } else {
                  distA = calculateDistance(currentPosition, a);
                }
                if(b.latitude === 'undefined' && b.longitude === 'undefined') {
                  distB = Number.MAX_VALUE;
                } else {
                  distB = calculateDistance(currentPosition, b);
                }

                if(distA === distB) {
                  return 0;
                } else if(distA < distB) {
                  return -1;
                } else if(distA > distB) {
                  return 1;
                }
              });              
              for(var i = 0; i < projects.length; i++) {
                stdProjects.push(projects[i]);
              }
              $scope.projects = stdProjects;
            }, 1);
            
          }, function(error) { 
            console.log('gps-error: ' + error.code + error.message);
          }, { enableHighAccuracy: true });
        } else {
          var stdProjects = projects.splice(0, 4);
          projects.sort(function(a, b) {
            if(a.name === b.name) {
              return 0;
            } else if(a.name < b.name) {
              return -1;
            } else if(a.name > b.name) {
              return 1;
            }
          });
          for(var i = 0; i < projects.length; i++) {
            stdProjects.push(projects[i]);
          }
          $scope.projects = stdProjects;
        }
      });
  	});
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
   * This function is used to forward to the edit page for a specified project
   * 
   * @param  projectId The 5 digit id of a project
   */
  $scope.editProject = function(projectId) {
    $(location).attr('href', '#/editProject/' + projectId);
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

  /**
   * This function calculates the distance between the two positions.
   * The algorithm is based on: http://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates?answertab=active#tab-top
   * 
   * @param   currentPosition An Object containing latitude and longitude
   * @param   project         An Object containing latitude and longitude
   * @return                  The distance between the two postitons
   */
  var calculateDistance = function(currentPosition, project) {
     var lat1 = currentPosition.latitude;
     var lon1 = currentPosition.longitude;
     var lat2 = project.latitude;
     var lon2 = project.longitude;

     var R = 6371; // Radius of the earth in km
     var dLat = (lat2 - lat1) * Math.PI / 180;  // deg2rad below
     var dLon = (lon2 - lon1) * Math.PI / 180;
     var a = 0.5 - Math.cos(dLat)/2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon))/2;

     return R * 2 * Math.asin(Math.sqrt(a));
  };
});
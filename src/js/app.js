angular.module('MobileTimeRecording', [
  'ngRoute',
  'mobile-angular-ui',
  'mobile-angular-ui.core.fastclick',
  'mobile-angular-ui.core.sharedState',
  'mobile-angular-ui.components.scrollable',
  'mobile-angular-ui.components.switch',
  'ngNotify',
  'datetimepicker',
  'confirmClick',
  'MobileTimeRecording.controllers.Main',
  'MobileTimeRecording.controllers.AddProject',
  'MobileTimeRecording.controllers.EditUser',
  'MobileTimeRecording.controllers.CreateSession',
  'MobileTimeRecording.controllers.ViewProject',
  'MobileTimeRecording.controllers.Dashboard',
  'MobileTimeRecording.services.Database'
])

.config(function($routeProvider) {
  $routeProvider
  	.when('/', {
  		templateUrl: 'home.html',
  		controller: 'MainController',
  		reloadOnSearch: false
  	})
  	.when('/addProject', {
  		templateUrl: 'addProject.html',
  		controller: 'AddProjectController',
  		reloadOnSearch: false
  	})
    .when('/viewProject/:projectId', {
      templateUrl: 'viewProject.html',
      controller: 'ViewProjectController',
      reloadOnSearch: false
    })
  	.when('/editUser', {
  		templateUrl: 'editUser.html',
  		controller: 'EditUserController',
  		reloadOnSearch: false
  	})
    .when('/editSession/:projectId', {
      templateUrl: 'createSession.html',
      controller: 'CreateSessionController',
      reloadOnSearch: false
    })
    .when('/dashboard', {
      templateUrl: 'dashboard.html',
      controller: 'DashboardController',
      reloadOnSearch: false
    })
  	.otherwise({
  		redirectTo: '/'
  	});
})

.run(function(DB, Projects) {
	DB.init();
  Projects.populate();
});
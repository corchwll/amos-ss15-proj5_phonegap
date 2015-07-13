angular.module('MobileTimeAccounting', [
  'ngRoute',
  'mobile-angular-ui',
  'mobile-angular-ui.core.fastclick',
  'mobile-angular-ui.core.sharedState',
  'mobile-angular-ui.core.activeLinks',
  'mobile-angular-ui.components.scrollable',
  'mobile-angular-ui.components.switch',
  'ngNotify',
  'datetimepicker',
  'confirmClick',
  'timer',
  'MobileTimeAccounting.controllers.Main',
  'MobileTimeAccounting.controllers.AddProject',
  'MobileTimeAccounting.controllers.EditUser',
  'MobileTimeAccounting.controllers.CreateSession',
  'MobileTimeAccounting.controllers.ViewProject',
  'MobileTimeAccounting.controllers.Dashboard',
  'MobileTimeAccounting.services.Database',
  'MobileTimeAccounting.services.Holidays',
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
  	.when('/editProject/:projectId', {
  		templateUrl: 'editProject.html',
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
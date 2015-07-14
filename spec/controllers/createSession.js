describe('Controller: CreateSessionController', function () {

	// load the createSession's module
	beforeEach(module('MobileTimeAccounting.controllers.CreateSession'));

	// load the database module
	beforeEach(module('MobileTimeAccounting.services.Database'));

	// load the holidays module
	beforeEach(module('MobileTimeAccounting.services.Holidays'));

	// load the notification module
	beforeEach(module('MobileTimeAccounting.services.Notification'));

	var CreateSessionController,
	scope;

	// Initialize the controller and a mock scope
	beforeEach(inject(function ($controller, $rootScope, DB, Projects) {
		scope = $rootScope.$new();
		CreateSessionController = $controller('CreateSessionController', {
			$scope: scope,
			$routeParams: {projectId: '02976'}
		});
		DB.init();
		Projects.populate();
	}));

	describe('Function xxx', function() {
		it('DummyScope', function() {
			expect(true).toBe(true);
			//console.log("Dummy test executed");
		});	

	});

});
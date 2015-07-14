describe('Controller: EditUserController', function () {

	// load the main's module
	beforeEach(module('MobileTimeAccounting.controllers.EditUser'));

	// load the database module
	beforeEach(module('MobileTimeAccounting.services.Database'));

	// load the notification module
	beforeEach(module('MobileTimeAccounting.services.Notification'));

	var EditUserController,
	scope;

	// Initialize the controller and a mock scope
	beforeEach(inject(function ($controller, $rootScope, DB, Projects) {
		scope = $rootScope.$new();
		EditUserController = $controller('EditUserController', {
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
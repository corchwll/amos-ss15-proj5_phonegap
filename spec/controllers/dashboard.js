describe('Controller: DashboardController', function() {

	beforeEach(module('ngNotify'));

	// load the dashboard's module
	beforeEach(module('MobileTimeAccounting.controllers.Dashboard'));

	// load the database module
	beforeEach(module('MobileTimeAccounting.services.Database'));

	// load the holidays module
	beforeEach(module('MobileTimeAccounting.services.Holidays'));

	var DashboardController,
	scope;

	// Initialize the controller and a mock scope
	beforeEach(inject(function ($controller, $rootScope, DB, Projects) {
		scope = $rootScope.$new();
		DashboardController = $controller('DashboardController', {
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
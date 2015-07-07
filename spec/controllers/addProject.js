describe('Controller: AddProjectController', function () {

	beforeEach(module('ngNotify'));

	// load the addProjects's module
	beforeEach(module('MobileTimeAccounting.controllers.AddProject'));

	// load the database module
	beforeEach(module('MobileTimeAccounting.services.Database'));

	var AddProjectController,
	scope;

	// Initialize the controller and a mock scope
	beforeEach(inject(function ($controller, $rootScope, DB, Projects) {
		scope = $rootScope.$new();
		AddProjectController = $controller('AddProjectController', {
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
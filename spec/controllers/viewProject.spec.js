describe('Controller: ViewProjectController', function () {

	beforeEach(module('ngNotify'));

	// load the controller's module
	beforeEach(module('MobileTimeAccounting.controllers.ViewProject'));

	// load the database module
	beforeEach(module('MobileTimeAccounting.services.Database'));

	var ViewProjectController,
			scope,
			DB,
			Projects;

	// Initialize the controller and a mock scope
	beforeEach(inject(function ($controller, $rootScope, DB, Projects) {
		scope = $rootScope.$new();
		ViewProjectController = $controller('ViewProjectController', {
				$scope: scope,
				$routeParams: {projectId: '02976'}
		});
		DB = DB;
		Projects = Projects;
		DB.init();
		Projects.populate();
	}));

	afterEach(function() {
		scope.$digest();
	});

	describe('Function getProject', function() {

		it('Get correct predefined poject Vacation', function(done) {
			$routeParams =  {projectId: '00001'};
			scope.getProject();
			done();
			expect(scope.title).toBeDefined();
			expect(scope.title).toBe('Vacation');
		});
		it('Get correct predefined poject Illness', function(done) {
			$routeParams =  {projectId: '00002'};
			scope.getProject();
			done();
			expect(scope.title).toBe("Illness");
		});
		it('Get correct predefined poject Office', function(done) {
			$routeParams =  {projectId: '00003'};
			scope.getProject();
			done();
			expect(scope.title).toBe("Office");
		});
		it('Get correct predefined poject Training', function(done) {
			$routeParams =  {projectId: '00004'};
			scope.getProject();
			done();
			expect(scope.title).toBe("Training");
		});
	});
	
});
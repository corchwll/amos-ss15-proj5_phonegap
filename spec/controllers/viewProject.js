describe('Controller: ViewProjectController', function () {

	// load the controller's module
	beforeEach(module('MobileTimeAccounting.controllers.ViewProject'));

	// load the database module
	beforeEach(module('MobileTimeAccounting.services.Database'));

	// load the notification module
	beforeEach(module('MobileTimeAccounting.services.Notification'));

	var ViewProjectController,
	scope;

	// Initialize the controller and a mock scope
	beforeEach(inject(function ($controller, $rootScope, DB, Projects) {
		scope = $rootScope.$new();
		ViewProjectController = $controller('ViewProjectController', {
			$scope: scope,
			$routeParams: {projectId: '02976'}
		});
		DB.init();
		Projects.populate();
	}));

	describe('Function getProject', function () {
		it('Get correct predefined poject Vacation', function (done) {
			$routeParams =  {projectId: '00001'};
			inject(function() {
				scope.getProject();
				done();
			});
			expect(scope.title).not.toBeNull();
			expect(scope.title).toBe("Vacation");
		});

		it('Get correct predefined poject Illness', function (done) {
			$routeParams =  {projectId: '00002'};
			inject(function() {
				scope.getProject();
				done();
			});
			expect(scope.title).not.toBeNull();
			expect(scope.title).toBe("Illness");
		});

		it('Get correct predefined poject Office', function (done) {
			$routeParams =  {projectId: '00003'};
			inject(function() {
				scope.getProject();
				done();
			});
			expect(scope.title).not.toBeNull();
			expect(scope.title).toBe("Office");
		});

		it('Get correct predefined poject Training', function (done) {
			$routeParams =  {projectId: '00004'};
			inject(function() {
				scope.getProject();
				done();
			});
			expect(scope.title).not.toBeNull();
			expect(scope.title).toBe("Training");
		});
	});

	describe('Function calculateSessionDuration', function () {
		it('Test if calculation returns correct values', function (done) {
			var session = [];
			var returnValue;
			session.timestamp_start = 0;
			session.timestamp_stop = 660;
			inject(function() {
				returnValue = scope.calculateSessionDuration(session);
				done();
			});
			expect(returnValue).not.toBeNull();
			expect(returnValue).toBe("00:11");
		});
	});

	describe('Function startTimer', function () {
		it('Test if timer gets started', function (done) {
			$routeParams =  {projectId: '00003'};
			expect(scope.timerRunning).toBe(false);
			inject(function() {
				scope.startTimer('00003');
				done();
			});
			expect(scope.timerRunning).toBe(true);
		});
	});
	/*
	describe('Function projectExpired', function () {
		it('Test if not expired project gets recognized as such', function (done) {
			var smallerTimestamp = 946706766;	//01/01/2000 @ 6:06am (UTC)
			var biggerTimestamp = 1450981098;	//12/24/2015 @ 6:18pm (UTC)
			var returnValue;
			inject(function() {
				returnValue = projectExpired(biggerTimestamp, smallerTimestamp);
				done();
			});
			expect(returnValue).not.toBeNull();
			expect(returnValue).toBe(false);
		});

		it('Test if expired project gets recognized as such', function (done) {
			var smallerTimestamp = 946706766;	//01/01/2000 @ 6:06am (UTC)
			var biggerTimestamp = 1450981098;	//12/24/2015 @ 6:18pm (UTC)
			var returnValue;
			//returnValue = projectExpired(biggerTimestamp, smallerTimestamp);
			inject(function() {
				returnValue = projectExpired(biggerTimestamp, smallerTimestamp);
				done();
			});
			expect(returnValue).not.toBeNull();
			expect(returnValue).toBe(true);
		});
	});
	*/
});
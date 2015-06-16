angular.module('MobileTimeRecording.controllers.EditUser', ['MobileTimeRecording.services.Database'])

.controller('EditUserController', function($scope, User, ngNotify, $timeout){
	
	var origUser = {};

	$scope.getUser = function() {
		User.all().then(function(user) {
			if($.isEmptyObject(user)) {
				return;
			}
			origUser.employee_id = user[0].employee_id;
			$scope.editUser = user[0];
		});
	};

	$scope.editProfile = function(editUser) {
		if($.isEmptyObject(origUser)) {
			// Create new user
	  	editUser.registration_date = Math.floor(Date.now() / 1000);
	  	User.add(editUser).then(function() {
	  		ngNotify.set('User profile successfully created', {
	  			type: 'success',
	  			position: 'top',
	  			duration: 3000
	  		});
	  		$timeout(function() {
		  		$(location).attr('href', '#/');
		  	}, 3500);
	  	});
	  } else {
	  	// Update existing user
  		User.update(origUser, editUser).then(function() {
	  		ngNotify.set('User profile successfully updated', {
	  			type: 'success',
	  			position: 'top',
	  			duration: 3000
	  		});
				$timeout(function() {
	  			$(location).attr('href', '#/');
	  		}, 3500);
	  	});
	  }
  };
});
angular.module('MobileTimeAccounting.controllers.EditUser', [])

.controller('EditUserController', function($scope, User, Notify, $timeout){
	
	var origUser = {};

	/**
	 * This function loads the data on the user from the database.
	 * 
	 * @return Empty return, if no user data available, else no return
	 */
	$scope.getUser = function() {
		User.all().then(function(user) {
			if($.isEmptyObject(user)) {
				return;
			}
			origUser.employee_id = user[0].employee_id;
			origUser.location_sort_is_used = user[0].location_sort_is_used;
			$scope.editUser = user[0];
		});
	};

	/**
	 * This function either creates a new user in the database or updates the current user, depending on the existing of data on a user
	 * 
	 * @param   editUser An object containing user data
	 */
	$scope.editProfile = function(editUser) {
		if($.isEmptyObject(origUser)) {
			// Create new user
	  	editUser.registration_date = Math.floor(Date.now() / 1000);
	  	if(editUser.location_sort_is_used === true) {
	  		editUser.location_sort_is_used = 1;
	  	} else {
	  		editUser.location_sort_is_used = 0;
	  	}
	  	User.add(editUser).then(function() {
	  		Notify.success('User profile successfully created');
	  		$timeout(function() {
		  		$(location).attr('href', '#/');
		  	}, 3500);
	  	});
	  } else {
	  	// Update existing user
	  	if(editUser.location_sort_is_used === origUser.location_sort_is_used) {
	  		editUser.location_sort_is_used = origUser.location_sort_is_used;
	  	}	else if(editUser.location_sort_is_used === true) {
	  		editUser.location_sort_is_used = 1;
	  	} else {
	  		editUser.location_sort_is_used = 0;
	  	}
  		User.update(origUser, editUser).then(function() {
	  		Notify.success('User profile successfully updated');
				$timeout(function() {
	  			$(location).attr('href', '#/');
	  		}, 3500);
	  	});
	  }
  };
});
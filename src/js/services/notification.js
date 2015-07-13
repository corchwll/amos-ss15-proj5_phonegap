angular.module('MobileTimeAccounting.services.Notification', ['ngNotify'])

.factory('Notify', function(ngNotify) {
	var self = this;

	/**
	 * This function displays a success notification on top of the screen
	 * 
	 * @param  text The text to be displayed in the notification 
	 */
	self.success = function(text) {
		ngNotify.set(text, {
			type: 'success',
			position: 'top',
			duration: 3000
		});
	};
	
	/**
	 * This function displays a error notification on top of the screen
	 * 
	 * @param  text The text to be displayed in the notification 
	 */
	self.error = function(text) {
		ngNotify.set(text, {
			type: 'error',
			position: 'top',
			duration: 3000
		});
	};
	return self;
})
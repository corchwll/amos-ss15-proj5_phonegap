'use strict';

var CordovaInit = function() {

	var onDeviceReady = function() {
		receivedEvent('deviceready');
	};

	var receivedEvent = function() {
		console.log('Start event received, bootstrapping application setup.');
		angular.bootstrap($('body'), ['MobileTimeAccounting']);
	};

	this.bindEvents = function() {
		document.addEventListener('deviceready', onDeviceReady, false);
		cordova.plugins.notification.local.hasPermission(function(granted) {
		  if (!granted)
		    cordova.plugins.notification.local.promptForPermission();
		});

		/**
		 *  Record time notification
		 */
		var now = new Date();
		var at8pm = now.setHours(20, 0, 0);

		cordova.plugins.notification.local.schedule({
		    id: 1,
		    text: "You haven't recorded your time today",
		    every: 'day',
		    firstAt: moment(at8pm).unix()
		});
	};

	//If cordova is present, wait for it to initialize, otherwise just try to
	//bootstrap the application.
	if (window.cordova !== undefined) {
		console.log('Cordova found, wating for device.');
		this.bindEvents();
	} else {
		console.log('Cordova not found, booting application');
		receivedEvent('manual');
	}
};

$(function() {
	console.log('Bootstrapping!');
	new CordovaInit();
});
angular.module('MobileTimeAccounting.controllers.CreateSession', ['MobileTimeAccounting.services.Database'])

.controller('CreateSessionController', function($scope, Sessions, Projects, $location, ngNotify, $timeout, $routeParams){
	
	$scope.session = {};
	$scope.session.startTime = '08:00';
	$scope.session.stopTime = '16:00';
	
	/**
	 * This function tests if a session is valid, if so, stores it into the database and shows a respective notification depending on the test.
	 * 
	 * @param  session Session object which contains the session data
	 */
	$scope.addSession = function(session) {
		session.project_id = $routeParams.projectId;
		session.timestamp_start = Date.parse(session.date + ", " + session.startTime)/1000;
		session.timestamp_stop = Date.parse(session.date + ", " + session.stopTime)/1000;
		var day = moment(session.date).format("YYYY-MM-DD");

		if(!session.date) {
			ngNotify.set('Please enter a date', {
				type: 'error',
				position: 'top',
				duration: 3000
			});
		} else if(session.timestamp_start <= session.timestamp_stop) {
			Sessions.getAccumulatedSessionfromDay(day).then(function(workingTimeOfDay) {

				if(60*60*10 < (workingTimeOfDay.working_time + (session.timestamp_stop - session.timestamp_start))) {
					ngNotify.set('The total working hours can not exceed ten hours per day', {
						type: 'error',
						position: 'top',
						duration: 3000
					});
				} else {
					/* Check for project end date */
					Projects.getById(session.project_id).then(function(project) {
						var finalDate = project.timestamp_final_date;
						if(projectExpired(session.timestamp_start, finalDate)) {
							ngNotify.set('It is not possible to record times after the final project date', {
								type: 'error',
								position: 'top',
								duration: 3000
							});
						} else {
							Sessions.checkFullOverlapping(session.timestamp_start, session.timestamp_stop).then(function(result) {
								if(result.overlappings === 0) {
									Sessions.add(session).then(function() {
										if(day === moment().format("YYYY-MM-DD")) {
											cordova.plugins.notification.local.cancel(1, function() {
											  console.log("Daily notification canceled for today");
											});
										}
								  	ngNotify.set('Session successfully added', {
							  			type: 'success',
							  			position: 'top',
							  			duration: 3000
							  		});
								  	$timeout(function() {
								  		$(location).attr('href', '#/viewProject/' + session.project_id);
								  	}, 4000);
							  	});
								} else {
									ngNotify.set('You have already recorded for this time', {
										type: 'error',
										position: 'top',
										duration: 3000
									});
								}
							});
						}
					});
				}
			});

		} else {
			ngNotify.set('negative times are not allowed', {
				type: 'error',
				position: 'top',
				duration: 3000
			});
	  }
  };

  /**
   * This function checks if the specified date is a workday
   * 
   * @param  date 		A date string formatted as 'YYYY/MM/DD'	
   * @return 		    	Boolean
   */
  $scope.checkWorkday = function(date) {
  	if(!date) {
  		return false;
  	} else {

  		// Check if date is a Saturday
  		if(moment(date).day() === 6) {
  			return true;
  		}

  		// Check if date is a Sunday
  		if(moment(date).day() === 0) {
  			return true;
  		}

  		// Get all holidays for the selected year and check if holiday is selected
  		var holidays = getHolidaysForYear(moment(date).format("YYYY"));
  		for(var i = 0; i < holidays.length; i++) {
  			if(moment(holidays[i]).format("YYYY/MM/DD") === date) {
					return true;
				}
  		}

  	}
  };

  /**
   * This function checks if the final project date has been reached already.
   * 
   * @param  currentDate Unix timestamp
   * @param  finalDate   Unix timestamp
   * @return             Boolean
   */
  var projectExpired = function(currentDate ,finalDate) {
  	if(!finalDate) {
  		return false;
  	} else if(currentDate > finalDate) {
  		return true;
  	} else {
  		return false;
  	}
  };

  /**
	 * This function computes the dates of holidays in a given year
	 * 
	 * @param   year The year of which the holidays should be computed
	 * @return       An Array containing the holidays of one year
	 */
	var getHolidaysForYear = function(year) {
		var holidays = getFixedHolidays(year);
		var easterSunday = getEastern(year);

		//Karfreitag
		easterSunday = moment(easterSunday).subtract(2, 'days');
		holidays.push(easterSunday);

		//Ostermontag
		easterSunday = moment(easterSunday).add(3, 'days');
		holidays.push(easterSunday);

		//Christi Himmelfahrt
		easterSunday = moment(easterSunday).add(38, 'days');
		holidays.push(easterSunday);

		//Pfingstmontag
		easterSunday = moment(easterSunday).add(11, 'days');
		holidays.push(easterSunday);

		//Fronleichnam
		easterSunday = moment(easterSunday).add(10, 'days');
		holidays.push(easterSunday);

		return holidays;
	};

	/**
	 * This function returns the dates of holidays with fixed day and month in a given year.
	 * 
	 * @param   year The year of which the holidays should be returned
	 * @return       An Array containing the fixed holidays of one year
	 */
	var getFixedHolidays = function(year) {
		var fixedHolidays = [];
		var tmpDate;
		//Neujahrstag
		tmpDate = moment().set({'year': year, 'month': 0, 'date': 1});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//Heilige Drei Koenige
		tmpDate = moment().set({'year': year, 'month': 0, 'date': 6});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//Tag der Arbeit
		tmpDate = moment().set({'year': year, 'month': 4, 'date': 1});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//Maria Himmelfahrt
		tmpDate = moment().set({'year': year, 'month': 7, 'date': 15});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//Tag der deutschen Einheit
		tmpDate = moment().set({'year': year, 'month': 9, 'date': 3});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//Allerheiligen
		tmpDate = moment().set({'year': year, 'month': 10, 'date': 1});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//1. Weihnachtstag
		tmpDate = moment().set({'year': year, 'month': 11, 'date': 25});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//2. Weihnachtstag
		tmpDate = moment().set({'year': year, 'month': 11, 'date': 26});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}

		return fixedHolidays;
	};

		/**
	 * This function checks if a given date is a saturday.
	 * 
	 * @param    date The date to check
	 * @return        A boolean
	 */
	var isSaturday = function(date) {
		if(moment(date).format("dddd") === 'Saturday') {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * This function checks if a given date is a sunday.
	 * 
	 * @param    date The date to check
	 * @return        A boolean
	 */
	var isSunday = function(date) {
		if(moment(date).format("dddd") === 'Sunday') {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * This function calculates the date of the easter sunday in a given year.
	 * 
	 * @param   year The year of which the easter sunday should be calculated
	 * @return       Date of easter sunday
	 */
	var getEastern = function(year) {
		var a = Math.floor(year % 19),
	      b = Math.floor(year / 100),
	      c = Math.floor(year % 100),
	      d = Math.floor(b / 4),
	      e = Math.floor(b % 4),
	      f = Math.floor((b + 8) / 25),
	      g = Math.floor((b - f + 1) / 3),
	      h = Math.floor((19 * a + b - d -g + 15) % 30),
	      i = Math.floor(c / 4),
	      k = Math.floor(c % 4),
	      l = Math.floor((32 + 2 * e + 2 * i - h - k) % 7),
	      m = Math.floor((a + 11 * h + 22 * l) / 451),
	      n = Math.floor((h + l - 7 * m + 114) / 31),
	      p = Math.floor((h + l - 7 * m + 114) % 31);
	  return moment({year: year, month: n - 1, day: p + 1});
	};
});
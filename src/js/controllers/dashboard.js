angular.module('MobileTimeAccounting.controllers.Dashboard', ['MobileTimeAccounting.services.Database'])

.controller('DashboardController', function($scope, Sessions, User, Projects, DummyMonth, $q, $timeout){

	$scope.showVacationInfo = false;

	var x;
	var xLength = 33;
	var y;
	var yLength = 100;
	var times = []; // [days][projects]
	var projectArray = [];

	for(x = 0; x < xLength; x++) {
		times[x] = [];
		for(y = 0; y < yLength; y++) {
			times[x][y] = 0;
		}
	}

	/**
	 * This function calls the individual functions required to update the dashboard view.
	 * 
	 */
	$scope.updateDashboard = function() {
		updateVacation();
		checkVacationInfo();
		getOvertime();
		getLeftVacationDays();
		DummyMonth.populate();
	};

	/**
	 * This function checks if the current date is between 1. January and 30. March and sets the corresponding boolean variable accordingly.
	 * 
	 */
	var checkVacationInfo = function() {
		if(moment().isBetween(moment().month(0).date(1), moment().month(2).date(30))) {
			$scope.showVacationInfo = true;
		} else {
			$scope.showVacationInfo = false;
		}
	};

	/**
	 * This function checks whether this years vacation is already updated and, if not, calls the respective database function.
	 * 
	 */
	var updateVacation = function() {
		User.all().then(function(user) {
			var aprilFirst = moment().month(3).date(1);
			if(moment().add(1, 'day').isAfter(aprilFirst) && moment(user[0].vacation_updated*1000).isBefore(aprilFirst)) {
				User.updateVacation(user[0].employee_id, moment().unix()).then(function(){
					console.log("vacation days updated!");
				});
			}
		});
	};

	/**
	 * This function creates the CSV array containing the working times of one month used for reporting and finally calls the sendCsvFile function
	 * 
	 */
	$scope.createCSV = function() {
		User.all().then(function(user) {
			var userFirstname = user[0].firstname;
			var userLastname = user[0].lastname;
			var month = moment().subtract(1, 'months').format('MM');
			var year = moment().subtract(1, 'months').format('YYYY');
			var daysInMonth = moment().subtract(1, 'months').endOf('month').format('D');
			var start = year + '-' + month + '-' + '01';
			var stop = year + '-' + month + '-' + daysInMonth;

			Projects.all().then(function(projects) {
				for(var i = 0; i < projects.length; i++) {
					projectArray[i] = projects[i].id;
					getProjectTimes(i, projects[i].id, start, stop);
				}
			});
			$timeout(function() {

				for(var j = 0; j < 33; j++) {
					times[j].splice(projectArray.length, (times[j].length - projectArray.length));				
				}

				times.splice(daysInMonth + 2, (times.length + 2 - daysInMonth));

				times[0] = [userFirstname, userLastname, month, year];
				for(var k = 0 ; k < projectArray.length; k++) {
					times[1][k] = projectArray[k];
				}

				sendCsvFile(times);
			}, 2000);
		});
	};

	/**
	 * This function computes the current overtime of the user.
	 * 
	 */
	var getOvertime = function() {
		var hoursPerDay;
		var overTimeInHours = 0;
		var workingTimeSeconds = 0;
		var startDate;
		var stopDate;
		var amountOfHolidays;
		var amountOfWorkdays;
		var currentOvertime;
		var deptInSecs;
		var sessions;
		
		Sessions.all().then(function(result) {
			sessions = result;
			User.all().then(function(user) {
				weeklyWorkingTime = user[0].weekly_working_time;
				currentOvertime = user[0].current_overtime;
				if($.isEmptyObject(sessions)) {
					$scope.overtime = currentOvertime;
				} else {
					Sessions.getFirstStartTimestamp().then(function(result) {
						startDate = moment.unix(result.min_timestamp_start);
						Sessions.getLastStopTimestamp().then(function(result) {
							stopDate = moment.unix(result.max_timestamp_stop);

							amountOfHolidays = getHolidays(startDate, stopDate);
							amountOfWorkdays = calculateWorkdays(startDate, stopDate);
							workingTimeSeconds = sumUpSessions(sessions);

							hoursPerDay = weeklyWorkingTime / 5;

							deptInSecs = (amountOfWorkdays - amountOfHolidays) * hoursPerDay * 3600;

							overTimeInHours = Math.floor((workingTimeSeconds - deptInSecs) / 3600);
								
							$scope.overtime = currentOvertime + overTimeInHours;
						});
					});
				}			
			});
		});		
	};

	/**
	 * This function adds up the working time of a given set of sessions.
	 * 
	 * @param   sessions An object containing data of one or multiple sessions
	 * @return           The overall working time of the given sessions in seconds
	 */
	var sumUpSessions = function(sessions) {
		var recordedTimeInSecs = 0;

		angular.forEach(sessions, function(session) {
			recordedTimeInSecs += (session.timestamp_stop - session.timestamp_start);
		});

		return recordedTimeInSecs;
	};

	/**
	 * This function computes the number of working days in a given timeframe
	 * 
	 * @param   startDate The date of the beginning of the timeframe
	 * @param   stopDate  The date of the end of the timeframe
	 * @return            The number of working days
	 */
	var calculateWorkdays = function(startDate, stopDate) {
		//backup on which weekday the intervall started
		var startWeekDay = moment(startDate).format("d");
		//backup on which weekday the intervall stopped
		var stopWeekDay = moment(stopDate).format("d");
		var days = 0;
		var workDays = 0;

		//start interval on mondays
		startDate = moment(startDate).subtract(startWeekDay, 'd').add(1, 'd');
		//end interval on mondays
		stopDate = moment(stopDate).subtract(stopWeekDay, 'd').add(1, 'd');

		// days = (stopDate - startDate) / (3600 * 24);
		days = stopDate.diff(startDate, 'days');
		workDays = days * 5 / 7;

		//if startWeekDay is sunday
		if(startWeekDay === 0) {
			startWeekDay = 1;
		}

		//if stopWeekDay is sunday
		if(stopWeekDay === 0) {
			stopWeekDay = 1;
		}

		return parseInt(workDays) - parseInt(startWeekDay) + parseInt(stopWeekDay) + 1;
	};

	/**
	 * This function computes the number of holidays in a given timeframe
	 * 
	 * @param   startDate The date of the beginning of the timeframe
	 * @param   stopDate  The date of the end of the timeframe
	 * @return            The number of holidays
	 */
	var getHolidays = function(startDate, stopDate) {
		var amountOfHolidays = 0;

		if(moment(startDate).format("YYYY") === moment(stopDate).format("YYYY")) {
			var holidays = getHolidaysForYear(moment(startDate).format("YYYY"));
			amountOfHolidays += amountOfHolidaysBetween(holidays, startDate, stopDate);
		} else if(moment(stopDate).format("YYYY") - moment(startDate).format("YYYY") === 1) {
			var holidaysInStartYear1 = getHolidaysForYear(moment(startDate).format("YYYY"));
			var holidaysInStopYear1 = getHolidaysForYear(moment(stopDate).format("YYYY"));

			amountOfHolidays += amountOfHolidaysSince(holidaysInStartYear1, startDate);
			amountOfHolidays += amountOfHolidaysUntil(holidaysInStopYear1, stopDate);
		} else if(moment(stopDate).format("YYYY") - moment(startDate).format("YYYY") > 1) {
			var holidaysInStartYear2 = getHolidaysForYear(moment(startDate).format("YYYY"));
			var holidaysInStopYear2 = getHolidaysForYear(moment(stopDate).format("YYYY"));

			amountOfHolidays += amountOfHolidaysSince(holidaysInStartYear2, startDate);
			amountOfHolidays += amountOfHolidaysUntil(holidaysInStopYear2, stopDate);

			for(var i = moment(startDate).format("YYYY") + 1; i < moment(stopDate).format("YYYY"); i++) {
				amountOfHolidays += getHolidaysForYear(i).length;
			}
		}

		return amountOfHolidays;
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

	/**
	 * This function computes the amount of holidays in a given timeframe
	 * 
	 * @param   holidays  An object containing the dates of all holidays of a year
	 * @param   startDate The beginning of the timeframe
	 * @param   stopDate  The end of the timeframe
	 * @return            The number of holidays
	 */
	var amountOfHolidaysBetween = function(holidays, startDate, stopDate) {
		var result = 0;

		angular.forEach(holidays, function(holiday) {
			if(moment(startDate).isBefore(holiday) && moment(stopDate).isAfter(holiday)) {
				result++;
			}
		});

		return result;
	};

	/**
	 * This function computes the amount of holidays from a certain date until the end of the respective year
	 * 
	 * @param   holidays  An object containing the dates of all holidays of a year
	 * @param   startDate The beginning of the timeframe
	 * @return            The number of holidays
	 */
	var amountOfHolidaysSince = function(holidays, startDate) {
		var result = 0;

		for(var i = 0; i < holidays.length; i++) {
			if(moment(startDate).isBefore(holidays[i])) {
				result++;
			}
		}

		return result;
	};

	/**
	 * This function computes the amount of holidays from the beginning of a year until a given date in that year
	 * 
	 * @param   holidays  An object containing the dates of all holidays of a year
	 * @param   stopDate  The end of the timeframe
	 * @return            The number of holidays
	 */
	var amountOfHolidaysUntil = function(holidays, stopDate) {
		var result = 0;

		for(var i = 0; i < holidays.length; i++) {
			if(moment(holidays[i]).isBefore(stopDate)) {
				result++;
			}
		}

		return result;
	};

	/**
	 * This function computes the remaining vacation days
	 * 
	 */
	var getLeftVacationDays = function() {
		var vacationSessions;
		var vacationInSecs;
		var hoursPerDay;
		var vacationInDays;
		var currentVacationTime;
		var weeklyWorkingTime;

		Sessions.getVacationSessions().then(function(result) {
			vacationSessions = result;

			User.all().then(function(user) {
				weeklyWorkingTime = user[0].weekly_working_time;
				currentVacationTime = user[0].current_vacation_time;

				if(!$.isEmptyObject(vacationSessions)) {
					vacationInSecs = sumUpSessions(vacationSessions);			
				} else {
					vacationInSecs = 0;
				}

				hoursPerDay = weeklyWorkingTime / 5;
				vacationInDays = vacationInSecs / (3600 * hoursPerDay);

				$scope.leftVacationDays = currentVacationTime - vacationInDays;
			});
		});
	};

	/**
	 * This function computes the daily working time of a certain project within a given timeframe
	 * 
	 * @param   i         The number of the project
	 * @param   projectId The five digit id of the project
	 * @param   start     The start date of the timeframe
	 * @param   stop      The end date of the timeframe
	 */
	var getProjectTimes = function(i, projectId, start, stop) {
		DummyMonth.projectTimes(projectId, start, stop).then(function(result) {
			for(var k = 0; k < result.length; k++) {
				if(!$.isEmptyObject(result[k])) {
					times[parseInt(result[k].day)+1][i] = result[k].aggr_times;
				}
			}
		});
	};

	/**
	 * This function converts the CSV array to an encoded Base64 CSV String and sends it via the phonegap email plugin
	 * 
	 * @param  file 		The CSV array file
	 */
	var sendCsvFile = function(file) {
		var csv = Papa.unparse(file, { delimiter: ";" });
		var encoded = window.btoa(csv);
		console.log("Generated CSV-file: \n" + csv);
		console.log(encoded);
		window.cordova.plugins.email.open({
			to: 'hr@department.de',
			subject: 'MobileTimeRecording CSV Export File',
			body: 'Please download the csv file',
			attachments: 'base64:export.csv//' + encoded
		});
	};
});
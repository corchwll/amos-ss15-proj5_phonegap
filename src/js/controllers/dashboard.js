angular.module('MobileTimeAccounting.controllers.Dashboard', [])

.controller('DashboardController', function($scope, Sessions, User, Projects, DummyMonth, $q, $timeout, Holidays){

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
			var holidays = Holidays.getHolidaysForYear(moment(startDate).format("YYYY"));
			amountOfHolidays += Holidays.amountOfHolidaysBetween(holidays, startDate, stopDate);
		} else if(moment(stopDate).format("YYYY") - moment(startDate).format("YYYY") === 1) {
			var holidaysInStartYear1 = Holidays.getHolidaysForYear(moment(startDate).format("YYYY"));
			var holidaysInStopYear1 = Holidays.getHolidaysForYear(moment(stopDate).format("YYYY"));

			amountOfHolidays += Holidays.amountOfHolidaysSince(holidaysInStartYear1, startDate);
			amountOfHolidays += Holidays.amountOfHolidaysUntil(holidaysInStopYear1, stopDate);
		} else if(moment(stopDate).format("YYYY") - moment(startDate).format("YYYY") > 1) {
			var holidaysInStartYear2 = Holidays.getHolidaysForYear(moment(startDate).format("YYYY"));
			var holidaysInStopYear2 = Holidays.getHolidaysForYear(moment(stopDate).format("YYYY"));

			amountOfHolidays += Holidays.amountOfHolidaysSince(holidaysInStartYear2, startDate);
			amountOfHolidays += Holidays.amountOfHolidaysUntil(holidaysInStopYear2, stopDate);

			for(var i = moment(startDate).format("YYYY") + 1; i < moment(stopDate).format("YYYY"); i++) {
				amountOfHolidays += Holidays.getHolidaysForYear(i).length;
			}
		}

		return amountOfHolidays;
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
			subject: 'MobileTimeAccounting CSV Export File',
			body: 'Please download the csv file',
			attachments: 'base64:export.csv//' + encoded
		});
	};
});
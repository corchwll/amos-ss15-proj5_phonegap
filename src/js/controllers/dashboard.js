angular.module('MobileTimeRecording.controllers.Dashboard', ['MobileTimeRecording.services.Database'])

.controller('DashboardController', function($scope, Sessions, User, $q){

	$scope.updateDashboard = function() {
		$scope.overtime = getOvertime();
		console.log($scope.overtime);
		$scope.leftVacationDays = getLeftVacationDays();
		console.log($scope.leftVacationDays);

	};

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

		sessions = getAllSessions();

		if(!$.isEmptyObject(sessions)) {
			startDate = getFirstStart();
			stopDate = getLastStop();

			amountOfHolidays = getHolidays(startDate, stopDate);
			amountOfWorkdays = calculateWorkdays(startDate, stopDate);
			workingTimeSeconds = sumUpSessions(sessions);

			weeklyWorkingTime = getWeeklyWorkingTime();
			hoursPerDay = weeklyWorkingTime / 5;

			deptInSecs = (amountOfWorkdays - amountOfHolidays) * hoursPerDay * 3600;

			overTimeInHours = (workingTimeSeconds - deptInSecs) / 3600;
		}

		currentOvertime = getCurrentOvertime();

		return currentOvertime + overTimeInHours;
	};

	var sumUpSessions = function(sessions) {
		var recordedTimeInSecs;

		for(var i = 0; i < sessions.length; i++) {
			recordedTimeInSecs += sessions[i].timestamp_stop - sessions[i].timestamp_start;
		}

		return recordedTimeInSecs;
	};

	var calculateWorkdays = function(startDate, stopDate) {
		//backup on which weekday the intervall started
		var startWeekDay = moment(startDate).format("d");
		//backup on which weekday the intervall stopped
		var stopWeekDay = moment(stopDate).format("d");
		var days;
		var workDays;

		//start interval on mondays
		moment(startDate).subtract(startWeekDay, 'd').add(1, 'd');
		//end interval on mondays
		moment(stopDate).subtract(stopWeekDay, 'd').add(1, 'd');

		days = (stopDate - startDate) / (3600 * 24);
		workDays = days * 5 / 7;

		//if startWeekDay is sunday
		if(startWeekDay === 0) {
			startWeekDay = 1;
		}

		//if stopWeekDay is sunday
		if(stopWeekDay === 0) {
			stopWeekDay = 1;
		}

		return workDays - startWeekDay + stopWeekDay + 1;
	};

	var getHolidays = function(startDate, stopDate) {
		var amountOfHolidays;

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

	var getHolidaysForYear = function(year) {
		var holidays = getFixedHolidays(year);
		var easterSunday = getEastern(year);
		var tmpDate;

		//Karfreitag
		moment(easterSunday).subtract(2, 'days');
		holidays.push(easterSunday);

		//Ostermontag
		moment(easterSunday).add(3, 'days');
		holidays.push(easterSunday);

		//Christi Himmelfahrt
		moment(easterSunday).add(38, 'days');
		holidays.push(easterSunday);

		//Pfingstmontag
		moment(easterSunday).add(11, 'days');
		holidays.push(easterSunday);

		//Fronleichnam
		moment(easterSunday).add(10, 'days');
		holidays.push(easterSunday);

		return holidays;
	};

	var getFixedHolidays = function(year) {
		var fixedHolidays = [];
		var tmpDate;
		//Neujahrstag
		moment(tmpDate).set({'year': year, 'month': 0, 'date': 1});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//Heilige Drei Koenige
		moment(tmpDate).set({'year': year, 'month': 0, 'date': 6});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//Tag der Arbeit
		moment(tmpDate).set({'year': year, 'month': 4, 'date': 1});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//Maria Himmelfahrt
		moment(tmpDate).set({'year': year, 'month': 7, 'date': 15});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//Tag der deutschen Einheit
		moment(tmpDate).set({'year': year, 'month': 9, 'date': 3});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//Allerheiligen
		moment(tmpDate).set({'year': year, 'month': 10, 'date': 1});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//1. Weihnachtstag
		moment(tmpDate).set({'year': year, 'month': 11, 'date': 25});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}
		//2. Weihnachtstag
		moment(tmpDate).set({'year': year, 'month': 11, 'date': 26});
		if(!isSaturday(tmpDate) && !isSunday(tmpDate)) {
			fixedHolidays.push(tmpDate);
		}

		return fixedHolidays;
	};

	var isSaturday = function(date) {
		if(moment(date).format("dddd") === 'Saturday') {
			return true;
		} else {
			return false;
		}
	};

	var isSunday = function(date) {
		if(moment(date).format("dddd") === 'Sunday') {
			return true;
		} else {
			return false;
		}
	};

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

	var amountOfHolidaysBetween = function(holidays, startDate, stopDate) {
		var result = 0;

		for(var i = 0; i < holidays.length; i++) {
			if(moment(startDate).isBefore(holidays[i]) && moment(stopDate).isAfter(holidays[i])) {
				result++;
			}
		}

		return result;
	};


	var amountOfHolidaysSince = function(holidays, startDate) {
		var result = 0;

		for(var i = 0; i < holidays.length; i++) {
			if(moment(startDate).isBefore(holidays[i])) {
				result++;
			}
		}

		return result;
	};

	var amountOfHolidaysUntil = function(holidays, stopDate) {
		var result = 0;

		for(var i = 0; i < holidays.length; i++) {
			if(moment(holidays[i]).isBefore(stopDate)) {
				result++;
			}
		}

		return result;
	};

	var getLeftVacationDays = function() {
		var vacationSessions;
		var vacationInSecs;
		var hoursPerDay;
		var vacationInDays;
		var currentVacationTime;
		var weeklyWorkingTime;

		vacationSessions = getVacationSessions();

		if(!$.isEmptyObject(vacationSessions)) {
			vacationInSecs = sumUpSessions(vacationSessions);			
		} else {
			vacationInSecs = 0;
		}

		weeklyWorkingTime = getWeeklyWorkingTime();
		hoursPerDay = weeklyWorkingTime / 5;

		vacationInDays = vacationInSecs / (3600 * hoursPerDay);

		currentVacationTime = getCurrentVacationTime();

		return currentVacationTime - vacationInDays;
	};

	var getAllSessions = function() {
		return function() {
			var deferred = $q.defer();

			Sessions.all().then(function(result) {
				deferred.resolve(result);
			});

			return deferred.promise;
		};
	};

	var getVacationSessions = function() {
		var deferred = $q.defer();

		Sessions.getHolidaySessions().then(function(result) {
			deferred.resolve(result);
		});

		return deferred.promise;
	};

	var getWeeklyWorkingTime = function() {
		var deferred = $q.defer();

		User.all().then(function(user) {
			deferred.resolve(user[0].weekly_working_time);
		});

		console.log(deferred.promise);

		return deferred.promise;
	};

	var getCurrentVacationTime = function() {
		var deferred = $q.defer();
		
		User.all().then(function(user) {
			deferred.resolve(user[0].current_vacation_time);
		});

		return deferred.promise;
	};

	var getCurrentOvertime = function() {
		var deferred = $q.defer();
		
		User.all().then(function(user) {
			deferred.resolve(user[0].current_overtime);
		});

		return deferred.promise;
	};

	var getFirstStart = function() {
		var deferred = $q.defer();
		
		Sessions.getFirstStartTimestamp().then(function(result) {
			deferred.resolve(result);
		});

		return deferred.promise;
	};

	var getLastStop = function() {
		var deferred = $q.defer();
		
		Sessions.getLastStopTimestamp().then(function(result) {
			deferred.resolve(result);
		});

		return deferred.promise;
	};

});
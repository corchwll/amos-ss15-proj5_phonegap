angular.module('MobileTimeAccounting.services.Holidays', [])

.factory('Holidays', function() {
	var self = this;

	/**
	 * This function computes the dates of holidays in a given year
	 * 
	 * @param   year The year of which the holidays should be computed
	 * @return       An Array containing the holidays of one year
	 */
	self.getHolidaysForYear = function(year) {
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
	 * This function computes the amount of holidays in a given timeframe
	 * 
	 * @param   holidays  An object containing the dates of all holidays of a year
	 * @param   startDate The beginning of the timeframe
	 * @param   stopDate  The end of the timeframe
	 * @return            The number of holidays
	 */
	self.amountOfHolidaysBetween = function(holidays, startDate, stopDate) {
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
	self.amountOfHolidaysSince = function(holidays, startDate) {
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
	self.amountOfHolidaysUntil = function(holidays, stopDate) {
		var result = 0;

		for(var i = 0; i < holidays.length; i++) {
			if(moment(holidays[i]).isBefore(stopDate)) {
				result++;
			}
		}

		return result;
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

	return self;
});

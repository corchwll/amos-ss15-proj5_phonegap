angular.module('MobileTimeRecording.services.Database', ['MobileTimeRecording.config'])

// DB wrapper based on https://gist.github.com/jgoux/10738978
.factory('DB', function($q, DB_CONFIG) {
	var self = this;
	self.db = null;

    /**
     * This function initializes the database and creates the required tables.
     * 
     */
	self.init = function() {
        /* for debug purposes comment sqlitePlugin and uncomment openDatabase */
		self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name});
		// self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);

		angular.forEach(DB_CONFIG.tables, function(table) {
			var columns = [];

			angular.forEach(table.columns, function(column) {
				columns.push(column.name + ' ' + column.type);
			});

			var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
			self.query(query);
			console.log('Table ' + table.name + ' initialized');
		});
	};

    /**
     * This function executes database queries
     * 
     * @param  query    The SQLite query String
     * @param  bindings Array with bindings of query results to question mark wildcards in SQLite query
     * @return          The result set of the SQLite query
     */
	self.query = function(query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();
 
        self.db.transaction(function(transaction) {
            transaction.executeSql(query, bindings, function(transaction, result) {
                deferred.resolve(result);
            }, function(transaction, error) {
                deferred.reject(error);
            });
        });
 
        return deferred.promise;
    };
    
    /**
     * This function pushes all rows of the result set of a SQLite query into an array
     * 
     * @param  result The result set of a SQLite query
     * @return        An array with each row of the result in a separate field.
     */
    self.fetchAll = function(result) {
        var output = [];
 
        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }
        
        return output;
    };
    
    /**
     * This function extracts the first line of a SQLite result set
     * 
     * @param  result The result set of a SQLite query
     * @return        The first line of a result set
     */
    self.fetch = function(result) {
        return result.rows.item(0);
    };
 
    return self;
})

// Table Projects functions
.factory('Projects', function(DB) {
    var self = this;

    /**
     * This function inserts the predefined standard projects into the database table Projects.
     * 
     */
    self.populate = function() {
        self.all().then(function(projects) {
            if(projects.length < 1) {
                DB.query("INSERT INTO Projects (id, name, is_displayed, is_used, is_archived) VALUES (?, ?, ?, ?, ?)", ['00001', 'Vacation', 1, 0, 0]);
                DB.query("INSERT INTO Projects (id, name, is_displayed, is_used, is_archived) VALUES (?, ?, ?, ?, ?)", ['00002', 'Illness', 1, 0, 0]);
                DB.query("INSERT INTO Projects (id, name, is_displayed, is_used, is_archived) VALUES (?, ?, ?, ?, ?)", ['00003', 'Office', 1, 1, 0]);
                DB.query("INSERT INTO Projects (id, name, is_displayed, is_used, is_archived) VALUES (?, ?, ?, ?, ?)", ['00004', 'Training', 1, 1, 0]);
            }
        });
    };
    
    /**
     * This function returns all projects from database table Projects.
     * 
     * @return          Array with all projects, one project per field
     */
    self.all = function() {
        return DB.query('SELECT * FROM Projects ORDER BY id')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };
    
    /**
     * This function returns a certain project specified by the id from database table Projects.
     * 
     * @param  id A five digit id
     * @return    The data of the specified project
     */
    self.getById = function(id) {
        return DB.query('SELECT * FROM Projects WHERE id = (?)', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    /**
     * This function inserts a new project into database table Projects.
     * 
     * @param  project Javascript object with parameters for the new project
     */
    self.add = function(project) {
        var parameters = [project.id, project.name, 1, 1, 0, project.date, project.longitude, project.latitude];
        return DB.query("INSERT INTO Projects (id, name, is_displayed, is_used, is_archived, timestamp_final_date, longitude, latitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", parameters);
    };

    /**
     * This function deletes a project specified by the id from database table Projects.
     * @param  id A five digit id
     */
    self.remove = function(id) {
        return DB.query("DELETE FROM Projects WHERE id = (?)", [id]);
    };

    /**
     * This functions marks a projects specified by the id as archived.
     * @param  id A five digit id
     */
    self.archive = function(id) {
        return DB.query("UPDATE Projects SET is_displayed = 0, is_archived = 1 WHERE id = (?)", [id]);
    };
    
    return self;
})

// Table User functions
.factory('User', function(DB) {
    var self = this;
    
    /**
     * This function returns all user data from database table User.
     * 
     * @return Array with all data on users, one user per field
     */
    self.all = function() {
        return DB.query('SELECT * FROM User')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };
    
    /**
     * This function returns the data of a user specified by the employee id.
     * 
     * @param  id The employee id
     * @return    The data of an user
     */
    self.getById = function(id) {
        return DB.query('SELECT * FROM User WHERE employee_id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    /**
     * This function inserts a new user into the database table User
     * 
     * @param  user Javascript object with parameters for the new user
     */
    self.add = function(user) {
        var parameters = [user.employee_id, user.lastname, user.firstname, user.weekly_working_time, user.total_vacation_time, user.current_vacation_time, user.current_overtime, user.registration_date, user.useGpsSort];
        return DB.query("INSERT INTO User (employee_id, lastname, firstname, weekly_working_time, total_vacation_time, current_vacation_time, current_overtime, registration_date, location_sort_is_used) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", parameters);
    };
    
    /**
     * This functions changes the entire data of a user.
     * 
     * @param  origUser Javascript object with the employee id of the user
     * @param  editUser Javascript object with new parameters for the edited user
     */
    self.update = function(origUser, editUser) {
        var parameters = [editUser.employee_id, editUser.lastname, editUser.firstname, editUser.weekly_working_time, editUser.total_vacation_time, editUser.current_vacation_time, editUser.current_overtime, editUser.location_sort_is_used, origUser.employee_id];
        return DB.query("UPDATE User SET employee_id = (?), lastname = (?), firstname = (?), weekly_working_time = (?), total_vacation_time = (?), current_vacation_time = (?), current_overtime = (?), location_sort_is_used = (?) WHERE employee_id = (?)", parameters);
    };
    
    return self;
})

// Table Sessions functions
.factory('Sessions', function(DB) {
    var self = this;
    
    /**
     * This function returns all session data from database table Sessions.
     * 
     * @return Array with all data of sessions, one session per field
     */
    self.all = function() {
        return DB.query('SELECT * FROM Sessions')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };
    
    /**
     * This function returns the data of a session specified by the session id.
     * 
     * @param   id session id
     * @return     data on one session
     */
    self.getById = function(id) {
        return DB.query('SELECT * FROM Sessions WHERE id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    /**
     * This function returns all sessions for the standard project Holiday.
     * 
     * @return Array with all sessions of standard project Holiday, one session per field
     */
    self.getVacationSessions = function() {
        return DB.query('SELECT * FROM Sessions WHERE project_id = ?', ['00001'])
        .then(function(result) {
            return DB.fetchAll(result);
        });
    };

    /**
     * This function returns the first time a session was started.
     * 
     * @return Array with one field, containing an unix timestamp (in seconds)
     */
    self.getFirstStartTimestamp = function() {
        return DB.query('SELECT MIN(timestamp_start) AS min_timestamp_start FROM Sessions')
        .then(function(result){
            return DB.fetch(result);
        });
    };

    /**
     * This function returns the last time a session was stopped.
     * 
     * @return Array with one field, containing an unix timestamp (in seconds)
     */
    self.getLastStopTimestamp = function() {
        return DB.query('SELECT MAX(timestamp_stop) AS max_timestamp_stop FROM Sessions')
        .then(function(result){
            return DB.fetch(result);
        });
    };

    /**
     * This function returns all sessions for a certain standard project specified by its project id.
     * 
     * @param  projectId A five digit id
     * @return           Array with all sessions of one project, one session per field
     */
    self.getByProjectId = function(projectId) {
        return DB.query('SELECT * FROM Sessions WHERE project_id = ?', [projectId])
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    /**
     * This function returns the time worked on a certain project on a certain day.
     * 
     * @param   date      The date of a certain day
     * @param   projectId A five digit id
     * @return            The accumulated working time of a project on a certain day
     */
    self.getAccumulatedSessionfromDayByProjectId = function(date, projectId) {
        return DB.query('SELECT sum(timestamp_stop - timestamp_start) AS working_time FROM Sessions WHERE date(timestamp_start, "unixepoch", "utc") = (?) AND project_id = (?)', [date, projectId])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    /**
     * This function returns the time workon on a certain day.
     * 
     * @param  date      The date of a certain day
     * @return           The accumulated working time on a certain day
     */
    self.getAccumulatedSessionfromDay = function(date) {
        return DB.query('SELECT sum(timestamp_stop - timestamp_start) AS working_time FROM Sessions WHERE date(timestamp_start, "unixepoch", "utc") = (?)', [date])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    /**
     * This function adds a new complete session into the database table Sessions
     * 
     * @param  session Object containing all parameters of a session
     */
    self.add = function(session) {
        var parameters = [session.project_id, session.timestamp_start, session.timestamp_stop];
        return DB.query("INSERT INTO Sessions (project_id, timestamp_start, timestamp_stop) VALUES (?, ?, ?)", parameters);
    };

    /**
     * This function adds a newly started session into the database table Sessions
     * 
     * @param  session Object containing session id and start timestamp
     */
    self.addStart = function(session) {
        var parameters = [session.project_id, session.timestamp_start];
        return DB.query("INSERT INTO Sessions (project_id, timestamp_start) VALUES (?, ?)", parameters);
    };

    /**
     * This function adds sets the end time of an existing session.
     * 
     * @param  session Object containing session id and stop timestamp
     */
    self.addStop = function(session) {
    	var parameters = [session.timestamp_stop, session.project_id];
    	return DB.query("UPDATE Sessions SET timestamp_stop = (?) WHERE project_id = (?) AND timestamp_stop IS NULL", parameters);
    };

    /**
     * This function deletes a certain session specified by its id from the database table Sessions.
     * @param   id Object containing session id
     */
    self.remove = function(id) {
    	return DB.query("DELETE FROM Sessions WHERE id = (?)", [id]);
    };

    /**
     * This function checks if a given timestamp represents a time during an already existing session in the database.
     * 
     * @param   timestamp A unix timestamp in seconds
     */
    self.checkSimpleOverlapping = function(timestamp) {
        return DB.query("SELECT count(*) AS overlappings FROM Sessions WHERE timestamp_start < ? AND timestamp_stop > ?", [timestamp, timestamp])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    /**
     * This function checks if a given timeframe overlaps in any way with an already existing session in the database.
     * 
     * @param   startTimestamp A unix timestamp in seconds marking the beginning of the timeframe
     * @param   stopTimestamp  A unix timestamp in seconds marking the end of the timeframe
     */
    self.checkFullOverlapping = function(startTimestamp, stopTimestamp) {
        return DB.query("SELECT count(*) AS overlappings FROM Sessions WHERE (timestamp_start < ? AND timestamp_stop > ?) OR (timestamp_start < ? AND timestamp_stop > ?) OR (? < timestamp_start AND timestamp_start < ?) OR (? < timestamp_stop AND timestamp_stop < ?)", [startTimestamp, startTimestamp, stopTimestamp, stopTimestamp, startTimestamp, stopTimestamp, startTimestamp, stopTimestamp])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    /**
     * This function returns the latest started session of the project
     * 
     * @param  projectId A five digit id
     */
    self.currentSession = function(projectId) {
        return DB.query("SELECT max(id) AS currentSessionId FROM Sessions WHERE project_id = ?", [projectId])
        .then(function(result){
            return DB.fetch(result);
        });
    };
    
    return self;
})

// Table DummyMonth functions
.factory('DummyMonth', function(Sessions, DB) {
    var self = this;

    /**
     * This function returns all rows of the database table DummyMonth.
     * 
     * @return  Array with all rows of table DummyMonth, one row per field
     */
    self.all = function() {
        return DB.query('SELECT * FROM DummyMonth')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    /**
     * This function inserts the predefined entries into the database table DummyMonth.
     * The predefiend entries are the the numbers from 01 to 31 (2 digit numbers) and for each entry a 0. The predefined entries illustrate all days of a month.
     * 
     */
    self.populate = function() {
        self.all().then(function(dummys) {
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['01', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['02', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['03', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['04', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['05', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['06', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['07', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['08', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['09', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['10', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['11', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['12', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['13', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['14', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['15', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['16', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['17', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['18', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['19', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['20', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['21', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['22', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['23', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['24', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['25', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['26', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['27', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['28', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['29', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['30', 0]);
            DB.query('INSERT INTO DummyMonth (day, dummy) VALUES (?, ?)', ['31', 0]);
        });        
    };

    /**
     * This function aggregates the daily working time for a certain project and month
     * 
     * @param   projectId A five digit id
     * @param   start     An unix timestamp (in seconds), marking the beginning of the month
     * @param   stop      An unix timestamp (in seconds), marking the end of the month
     * @return            An Array with 31 fields, each containing a day of the month, the prject time and the aggregated working time for the chosen project on this day of the month
     */
    self.projectTimes = function(projectId, start, stop) {
        return DB.query('SELECT DummyMonth.day, Sessions.project_id, ifnull(sum(Sessions.timestamp_stop - Sessions.timestamp_start), 0) AS aggr_times FROM DummyMonth LEFT JOIN Sessions ON DummyMonth.day = strftime("%d", Sessions.timestamp_start, "unixepoch", "utc") WHERE Sessions.project_id = ? AND date(Sessions.timestamp_start, "unixepoch", "utc") >= ? AND date(Sessions.timestamp_stop, "unixepoch", "utc") <= ? GROUP BY DummyMonth.day, Sessions.project_id', [projectId, start, stop])
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    return self;
});
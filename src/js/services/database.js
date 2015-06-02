angular.module('MobileTimeRecording.services.Database', ['MobileTimeRecording.config'])

// DB wrapper based on https://gist.github.com/jgoux/10738978
.factory('DB', function($q, DB_CONFIG) {
	var self = this;
	self.db = null;

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
 
    self.fetchAll = function(result) {
        var output = [];
 
        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }
        
        return output;
    };
 
    self.fetch = function(result) {
        return result.rows.item(0);
    };
 
    return self;
})

// Table Projects functions
.factory('Projects', function(DB) {
    var self = this;

    self.populate = function() {
        self.all().then(function(projects) {
            if(projects.length < 1) {
                DB.query("INSERT INTO Projects (id, name, is_displayed, is_used, is_archived) VALUES (?, ?, ?, ?, ?)", ['00001', 'Holiday', 1, 0, 0]);
                DB.query("INSERT INTO Projects (id, name, is_displayed, is_used, is_archived) VALUES (?, ?, ?, ?, ?)", ['00002', 'Illness', 1, 0, 0]);
                DB.query("INSERT INTO Projects (id, name, is_displayed, is_used, is_archived) VALUES (?, ?, ?, ?, ?)", ['00003', 'Office', 1, 1, 0]);
                DB.query("INSERT INTO Projects (id, name, is_displayed, is_used, is_archived) VALUES (?, ?, ?, ?, ?)", ['00004', 'Training', 1, 1, 0]);
            }
        });
    };
    
    self.all = function() {
        return DB.query('SELECT * FROM Projects')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };
    
    self.getById = function(id) {
        return DB.query('SELECT * FROM Projects WHERE id = (?)', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    self.add = function(project) {
        var parameters = [project.id, project.name, 1, 1, 0, project.date];
        return DB.query("INSERT INTO Projects (id, name, is_displayed, is_used, is_archived, timestamp_final_date) VALUES (?, ?, ?, ?, ?, ?)", parameters);
    };

    self.remove = function(id) {
        return DB.query("DELETE FROM Projects WHERE id = (?)", [id]);
    };

    self.archive = function(id) {
        return DB.query("UPDATE Projects SET is_displayed = 0, is_archived = 1 WHERE id = (?)", [id]);
    };
    
    self.update = function(origProj, editProj) {
        var parameters = [editProj.id, editProj.name, origProj.id];
        return DB.query("UPDATE Projects SET id = (?), name = (?) WHERE id = (?)", parameters);
    };
    
    return self;
})

// Table User functions
.factory('User', function(DB) {
    var self = this;
    
    self.all = function() {
        return DB.query('SELECT * FROM User')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };
    
    self.getById = function(id) {
        return DB.query('SELECT * FROM User WHERE employee_id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    self.add = function(user) {
        var parameters = [user.employee_id, user.lastname, user.firstname, user.weekly_working_time, user.total_vacation_time, user.current_vacation_time, user.current_overtime, user.registration_date];
        return DB.query("INSERT INTO User (employee_id, lastname, firstname, weekly_working_time, total_vacation_time, current_vacation_time, current_overtime, registration_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", parameters);
    };

    self.remove = function(user) {
        var parameters = [user.employee_id];
        return DB.query("DELETE FROM User WHERE employee_id = (?)", parameters);
    };
    
    self.update = function(origUser, editUser) {
        var parameters = [editUser.employee_id, editUser.lastname, editUser.firstname, editUser.weekly_working_time, editUser.total_vacation_time, editUser.current_vacation_time, editUser.current_overtime, origUser.employee_id];
        return DB.query("UPDATE User SET employee_id = (?), lastname = (?), firstname = (?), weekly_working_time = (?), total_vacation_time = (?), current_vacation_time = (?), current_overtime = (?) WHERE employee_id = (?)", parameters);
    };
    
    return self;
})

// Table Sessions functions
.factory('Sessions', function(DB) {
    var self = this;
    
    self.all = function() {
        return DB.query('SELECT * FROM Sessions')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };
    
    self.getById = function(id) {
        return DB.query('SELECT * FROM Sessions WHERE id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    self.getByProjectId = function(projectId) {
        return DB.query('SELECT * FROM Sessions WHERE project_id = ?', [projectId])
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    self.add = function(session) {
        var parameters = [session.project_id, session.timestamp_start, session.timestamp_stop];
        return DB.query("INSERT INTO Sessions (project_id, timestamp_start, timestamp_stop) VALUES (?, ?, ?)", parameters);
    };

    self.addStart = function(session) {
        var parameters = [session.project_id, session.timestamp_start];
        return DB.query("INSERT INTO Sessions (project_id, timestamp_start) VALUES (?, ?)", parameters);
    };

    self.addStop = function(session) {
    	var parameters = [session.timestamp_stop, session.project_id];
    	return DB.query("UPDATE Sessions SET timestamp_stop = (?) WHERE project_id = (?) AND timestamp_stop IS NULL", parameters);
    };

    self.remove = function(id) {
    	return DB.query("DELETE FROM Sessions WHERE id = (?)", [id]);
    };
    
    self.update = function(origSession, editSession) {
    	var parameters = [editSession.id, editSession.project_id, editSession.timestamp_start, editSession.timestamp_stop, origSession.id];
    	return DB.query("UPDATE Sessions SET id = (?), project_id = (?), timestamp_start = (?), timestamp_stop = (?) WHERE id = (?)", parameters);
    };
    
    return self;
});
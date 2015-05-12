/* Wait for device API to load */
document.addEventListener("deviceready", onDeviceReady, false);

var database = null;

/* 
function onDeviceReady
When Cordova is ready the database is opened (at first time, tables are created).
Then the function checkDatabase is called.
*/
function onDeviceReady()
{
 	openDb();
 	createTables();
	checkDatabase();
}

/*
function openDb
Opens the sqlite database
 */
function openDb()
{
    /* open database (without icloud backup -> location: 2; use the built-in Android database classes -> androidDatabaseImplementation: 2 */
    database = window.sqlitePlugin.openDatabase({name: 'mtr.db', location : 2, androidDatabaseImplementation: 2});
}

/* SQL Queries */

var sqlCreateTableProjects = "CREATE TABLE IF NOT EXISTS Projects (id INTEGER PRIMARY KEY, name TEXT)";

var sqlCreateTableSessions = "CREATE TABLE IF NOT EXISTS Sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, timestamp_start INTEGER, timestamp_stop INTEGER)";

var sqlCreateTableUser = "CREATE TABLE IF NOT EXISTS User (employee_id INTEGER PRIMARY KEY, lastname TEXT, firstname TEXT, weekly_working_time INTEGER, total_vacation_time INTEGER, current_vacation_time INTEGER, current_overtime INTEGER, registration_date INTEGER)";

var sqlInsertUser = "INSERT OR REPLACE INTO User (employee_id, firstname, lastname, weekly_working_time, total_vacation_time, current_vacation_time, current_overtime, registration_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

var sqlUpdateUser = "UPDATE User SET employee_id = ?, firstname = ?, lastname = ?, weekly_working_time = ?, total_vacation_time = ?, current_vacation_time = ?, current_overtime = ?, registration_date = ?";

var sqlSelectUser = "SELECT * FROM User";

var sqlCountUser = "SELECT count(*) AS row_count FROM User";

/* 
function createTables
Creates the required tables for the database.
 */
function createTables()
{
	database.transaction(function (tx)
	{
		tx.executeSql(sqlCreateTableProjects, []);
		tx.executeSql(sqlCreateTableSessions, []);
		tx.executeSql(sqlCreateTableUser, []);
	});
}

/* 
function checkDatabase
Checks if database table User is already filled with content from the user and prepares the session storage accordingly, in order to allow the function createProfile to use the correct SQL syntax (INSERT if database emtpy, UPDATE if database already filled with user data). If database already contains user data, function fillForm is called in order to display this data in the html form.
Function has to be called upon page load.
*/
function checkDatabase()
{
	database.transaction(function (tx) 
	{ 
		tx.executeSql(sqlCountUser, [], function(tx, res) 
		{
			row = res.rows.item(0);
			
			if(0 === row.row_count) {
				console.log("DB empty");												//For debugging purposes
			} else {
				console.log("DB filled");												//For debugging purposes
				fillForm();
			}
		}); 
	});
}

/* 
function fillForm
Reads the current content of database table User and fills the form in order to allow the user to edit the data.
*/
function fillForm()
{
	database.transaction(function (tx) 
	{ 
		tx.executeSql(sqlSelectUser, [], function(tx, res) 
		{
			row = res.rows.item(0);
			
			var id = document.getElementById("profile.id");
			var forename = document.getElementById("profile.forename");
			var surname = document.getElementById("profile.surname");
			var weeklyWorkingTime = document.getElementById("profile.weekly_working_time");
			var vacationTime = document.getElementById("profile.total_vacation_time");
			var currentOverTime = document.getElementById("profile.current_overtime");
			var currentVacationTime = document.getElementById("profile.current_vacation_time");

			id.value = row.employee_id;
			forename.value = row.firstname;
			surname.value = row.lastname;
			weeklyWorkingTime.value = row.weekly_working_time;
			vacationTime.value = row.total_vacation_time;
			currentOverTime.value = row.current_vacation_time;
			currentVacationTime.value = row.current_overtime;
		}); 
	});
}

/*
function onError
Prints error message to console output if a sqlite error occurs.
 */
function onError(tx, err)
{
	console.log('Database error: ' + err.message);
}

/* 
function createProfile
Reads the data which the user has entered into the app and inserts or replaces it into the database table User
*/
function createProfile()
{
	console.log('insert button pressed');
	
	var id = document.getElementById("profile.id");
	var forename = document.getElementById("profile.forename");
	var surname = document.getElementById("profile.surname");
	var weeklyWorkingTime = document.getElementById("profile.weekly_working_time");
	var vacationTime = document.getElementById("profile.total_vacation_time");
	var currentOverTime = document.getElementById("profile.current_overtime");
	var currentVacationTime = document.getElementById("profile.current_vacation_time");

	var currentTimestamp = Math.floor(Date.now() / 1000);
	
	database.transaction(function(tx)
	{
    tx.executeSql(sqlInsertUser, [id.value, forename.value, surname.value, weeklyWorkingTime.value, vacationTime.value, currentOverTime.value, currentVacationTime.value, currentTimestamp], function(tx, rs)
		{
		  console.log("User update complete");
		  window.location = "index.html?style=success&message=Hello%20" + forename.value + "%20" + surname.value + ".%20%20Profile%20was%20updated%20successfully!";
    }, onError);
	});
}
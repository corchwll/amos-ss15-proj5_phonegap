/* Wait for device API to load */
document.addEventListener("deviceready", onDeviceReady, false);

var database = null;

/* 
function onDeviceReady
When Cordova is ready database is opened (at first time, tables are created).
*/
function onDeviceReady()
{
 	openDb();
 	createTables();
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

var sqlInsertUser = "INSERT INTO User (employee_id, firstname, lastname, weekly_working_time, total_vacation_time, current_vacation_time, current_overtime, registration_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

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
function onError
Prints error message to console output if a sqlite error occurs.
 */
function onError(tx, err)
{
	console.log('Database error: ' + err.message);
}

/* 
function createProfile
Reads the data which the user has entered into the app and inserts it into the database table User
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
		   console.log("Insert complete");
		   window.location = "index.html?style=success&message=Hello%20" + forename.value + "%20" + surname.value + ".%20%20Registration%20was%20successfull!";
    }, onError); 
	});
}
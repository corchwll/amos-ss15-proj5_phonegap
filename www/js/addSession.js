/* Wait for device API to load */
document.addEventListener("deviceready", onDeviceReady, false);

var database = null;

/* 
function onDeviceReady 
When Cordova is ready database is opened (at first time, tables and views are created).
Then the stored projects are listed.
*/
function onDeviceReady()
{
 	openDb();
 	createTables();
 	setProjectName();
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

/*
function onError
Prints error message to console output if a sqlite error occurs.
 */
function onError(tx, err)
{
	console.log('Database error: ' + err.message);
}

/* SQL Queries */

var sqlCreateTableProjects = "CREATE TABLE IF NOT EXISTS Projects (id INTEGER PRIMARY KEY, name TEXT, is_displayed INTEGER, is_used INTEGER, is_archived INTEGER)";

var sqlCreateTableSessions = "CREATE TABLE IF NOT EXISTS Sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, timestamp_start INTEGER, timestamp_stop INTEGER)";

var sqlCreateTableUser = "CREATE TABLE IF NOT EXISTS User (employee_id INTEGER PRIMARY KEY, lastname TEXT, firstname TEXT, weekly_working_time INTEGER, total_vacation_time INTEGER, current_vacation_time INTEGER, current_overtime INTEGER, registration_date INTEGER)";

var sqlInsertSession = "INSERT INTO Sessions (project_id, timestamp_start, timestamp_stop) VALUES (?, ?, ?)";


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
function setProjectName
Enters the project name into the legend of the HTML-page in order to show the user for which project he enters a session.
*/
function setProjectName()
{
	var projectName = window.sessionStorage.getItem("projectName");
	document.getElementById("pageHead").innerHTML = "Add a session for " + projectName;
}

/* 
function addSession
Reads the data which the user has entered into the app and inserts it into the database table Sessions
*/
function addSession()
{
	var date = document.getElementById("session.date");
	var start = document.getElementById("session.start");
	var stop = document.getElementById("session.stop");

	var projectName = window.sessionStorage.getItem("projectName");
	var projectId = window.sessionStorage.getItem("projectId");	
	var startTimestamp = Date.parse(date.value + ", " + start.value)/1000;
	var stopTimestamp = Date.parse(date.value + ", " + stop.value)/1000;
	
	console.log("startTimestamp: " + startTimestamp);									//For debugging purposes
	console.log("stopTimestamp: " + stopTimestamp);										//For debugging purposes
	
	if (startTimestamp <= stopTimestamp) 
	{
		console.log("Insert into Database");
		database.transaction(function(tx)
		{ 
			tx.executeSql(sqlInsertSession, [projectId, startTimestamp, stopTimestamp], function(tx, res)
			{
			  console.log("Insert complete");
			  window.sessionStorage.removeItem("projectName");
				window.sessionStorage.removeItem("projectId");	
			  window.location = "index.html?style=success&message=Session%20added%20for%20" + projectName;
		  }, onError); 
		});
	} else {
		window.location = "index.html?style=danger&message=negative%20times%20are%20not%20allowed";
	}
}
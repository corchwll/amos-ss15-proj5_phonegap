/* Wait for device API to load */
document.addEventListener("deviceready", onDeviceReady, false);

var database;

/* When Cordova is ready database is opened (at first time, database is created) */
function onDeviceReady()
{
	/* open database (without icloud backup -> location: 2) */
  database = window.sqlitePlugin.openDatabase({name: 'mtr.db', location : 2});				
  console.log("Database opened");													//For debugging purposes
}

/* SQL Queries */

var sqlCreateTableProjects = "CREATE TABLE IF NOT EXISTS Projects (id INTEGER PRIMARY KEY, name TEXT)";

var sqlCreateTableSessions = "CREATE TABLE IF NOT EXISTS Sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, timestamp_start INTEGER, timestamp_stop INTEGER)";

var sqlInsertProjects = "INSERT INTO Projects (id, name) VALUES (?, ?)";

var dataset;

var dataType;

/* 
function initDatabase 
Ensures that database is initialized and contains the required tables.
*/
function initDatabase() 
{
	createTables();
	console.log("Database initilized");													//For debugging purposes
}

/* 
function createTables
Creates the required tables for the database.
 */
function createTables()
{
	database.transaction(function (tx) {tx.executeSql(sqlCreateTableProjects, [])});
	database.transaction(function (tx) {tx.executeSql(sqlCreateTableSessions, [])});
}

/* 
function errorFunction 
For possible future use
*/
/*
function errorFunction()
{
	//TODO
}
*/


/* 
function insertProject
Reads the data which the user has entered into the app and inserts it into the database table Projects
*/
function insertProject()
{
	console.log('insert button pressed');
	var tmpProjectIdRaw = document.getElementById("project.id");
	var tmpProjectNameRaw = document.getElementById("project.name");
	console.log("Insert into Database" + tmpProjectIdRaw.value +  ' ' + tmpProjectNameRaw.value);
	var tmpProjectId = tmpProjectIdRaw.value;
	var tmpProjectName =tmpProjectNameRaw.value;
	console.log("Inserted into Database");
	database.transaction(function (tx) { tx.executeSql(sqlInsertProjects, [tmpProjectId, tmpProjectName], function(tx, res) {
           console.log("insertId: " + res.insertId + " -- probably 1");
           console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");
       }); });
	console.log("Insert complete");
	window.location.replace("index.html");
}


/*
//Former function body: Better structured, but does randomly not work
{
	var tmpProjectIdRaw = document.getElementById("project.id");
	var tmpProjectNameRaw = document.getElementById("project.name");
	var tmpProjectId = tmpProjectIdRaw.value;
	var tmpProjectName =tmpProjectNameRaw.value;
	console.log("Insert into Database");												//For debugging purposes
	database.transaction(function (tx) 
	{ 
		tx.executeSql(sqlInsertProjects, [tmpProjectId, tmpProjectName], function(tx, res) 
		{
			console.log("insertId: " + res.insertId + " -- probably inserted id");		//For debugging purposes
			console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");		//For debugging purposes
		}); 
	});
	console.log("Insert complete");														//For debugging purposes
	window.location.replace("index.html");
}
*/


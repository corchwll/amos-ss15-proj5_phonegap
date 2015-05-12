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

var sqlCreateTableProjects = "CREATE TABLE IF NOT EXISTS Projects (id INTEGER PRIMARY KEY, name TEXT, is_displayed INTEGER, is_used INTEGER, is_archived INTEGER)";

var sqlCreateTableSessions = "CREATE TABLE IF NOT EXISTS Sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, timestamp_start INTEGER, timestamp_stop INTEGER)";

var sqlInsertProjects = "INSERT INTO Projects (id, name, is_displayed, is_used, is_archived) VALUES (?, ?, 1, 1, 0)";

/*
function onError
Prints error message to console output if a sqlite error occurs.
 */
function onError(tx, err)
{
	console.log('Database error: ' + err.message);
}

/* 
function initDatabase 
Ensures that database is initialized and contains the required tables.
*/
function initDatabase() 
{
	createTables();
	console.log("Database initilized");	//For debugging purposes
}

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
	});
}

/* 
function insertProject
Reads the data which the user has entered into the app and inserts it into the database table Projects
*/
function insertProject()
{
	var id = document.getElementById("project.id");
	var name = document.getElementById("project.name");
	console.log("Insert into Database" + id.value +  ' ' + name.value);

	database.transaction(function (tx) 
	{ 
		tx.executeSql(sqlInsertProjects, [id.value, name.value], function(tx, rs)
		{
			console.log("insertId: " + rs.insertId);
			console.log("rowsAffected: " + rs.rowsAffected + " -- should be 1");
    }, onError); 
	});

	console.log("Insert complete");
	window.location = "index.html";
}


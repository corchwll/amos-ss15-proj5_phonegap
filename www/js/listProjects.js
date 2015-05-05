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
 	createTablesAndViews();
 	listProjects();
 	printNotification();
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

var sqlCreateViewTimes = "CREATE VIEW IF NOT EXISTS Aggregated_Times AS SELECT project_id, SUM(timestamp_stop - timestamp_start) AS aggregated_time FROM Sessions GROUP BY project_id"; 

var sqlSelectAllSessions = "SELECT * FROM Sessions";

var sqlDropAllProjects = "DELETE FROM Projects";

/* WHERE timestamp_stop != 0 AND timestamp_start != 0 AND timestamp_stop IS NOT NULL AND timestamp_start IS NOT NULL GROUP BY project_id"; */

var sqlSelectAllProjectsWithTimes = "SELECT Projects.id, Projects.name, Aggregated_Times.aggregated_time FROM Projects LEFT JOIN Aggregated_Times ON Projects.id = Aggregated_Times.project_id";

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
Ensures that database is initialized and contains the required tables and views.
*/
function getProjectsFromDatabase() 
{
	createTablesAndViews();
	console.log("Database initilized");													//For debugging purposes
	listProjects();
}

/* 
function createTablesAndViews
Creates the required tables ad views for the database.
 */
function createTablesAndViews()
{
	database.transaction(function (tx)
	{
		tx.executeSql(sqlCreateTableProjects, []);
		tx.executeSql(sqlCreateTableSessions, []);
		tx.executeSql(sqlCreateViewTimes, []);
	});
}



/* 
function listProjects
Queries and prints the projects from the database table Projects
 */
function listProjects() 
{
	var renderProject = function(row)
	{
		console.log("the time: " + row.aggregated_time);

		return '<div class="panel panel-default">' +
			'<div class="panel-heading" role="tab" id="' + row.id + '" data-toggle="collapse" data-parent="#ProjectList" href="#' + row.id + 'body" aria-expanded="true" aria-controls="collapseOne" onclick="">' +
				'<h4 class="panel-title">' +
					row.name +
				'</h4>' +
			'</div>' +
			'<div id="' + row.id + 'body" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">' +
				'<p>' +
					'<input class="btn btn-default" id="' + row.id + 'counter" value="0:0:0" />' +
					'<button class="btn btn-success" onclick="start(' + row.id + ')"><span class="glyphicon glyphicon-play"></span></button>' +
					'<button class="btn btn-danger" onclick="stop(' + row.id + ')"><span class="glyphicon glyphicon-stop"></span></button>' +
					'<button class="btn btn-info" onclick="addSessionForProject(&quot;' + row.id + '&quot;, &quot;' + row.name + '&quot;)"><span class="glyphicon glyphicon-plus"></span></button>' +
				'</p>' +	
			'</div>' +
		'</div>';
	};

	var render = function(tx, rs)
	{
		var rowOutput = '';
		var projectList = document.getElementById("ProjectList");
		var len = rs.rows.length;
		for(var i = 0; i < len; i++)
		{
			 rowOutput += renderProject(rs.rows.item(i));
		}

		projectList.innerHTML = rowOutput;
	};

	database.transaction(function(tx) 
	{
		tx.executeSql(sqlSelectAllProjectsWithTimes, [], render, onError);
	});
}

/*
function addSessionForProject
This function locally stores the information on which project the user chooses in order to add a session for the project. Furthermore, the function forwards after the storage process to the required page.
*/
function addSessionForProject(projectId, projectName) {
	window.sessionStorage.setItem("projectId", projectId);
	window.sessionStorage.setItem("projectName", projectName);
	window.location = "addSession.html";
}

/*
function printNotification
Prints a notification on top of the screen, if parameters are given in the url.
 */
function printNotification()
{
	/* get url parameter based on 'http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript' */
	var match,
			urlParams = {},
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query  = window.location.search.substring(1);

  while (match = search.exec(query))
  {
  	urlParams[decode(match[1])] = decode(match[2]);
  }

  /* check if any parameter is in object */
  if(!Object.keys(urlParams).length)
  {
  	return;
  }

  document.getElementById("notification").className = "alert alert-" + urlParams.style;
  document.getElementById("notificationInner").innerHTML = '<strong>' + urlParams.message + '</strong>';
}

/* dev function for printing the Sessions table to the console log */
function printSessions()
{
	database.transaction(function(tx)
	{
		tx.executeSql(sqlSelectAllSessions, [], function (tx, results) 
		{
			var len = results.rows.length;
			console.log("Sessions table: " + len + " rows found.");
			for(var i = 0; i < len; i++)
			{
				console.log("Row = " + i + " ID = " + results.rows.item(i).id + " | project_id =  " + results.rows.item(i).project_id + " | timestamp_start =  " + results.rows.item(i).timestamp_start + " | timestamp_stop =  " + results.rows.item(i).timestamp_stop);
			}
		}, onError);
	});
}

/* dev function for dropping all projects from the database */
function dropProjects()
{
	database.transaction(function(tx) 
	{
		tx.executeSql(sqlDropAllProjects, [], function(tx, results) 
		{
			var len = results.rows.length;
			for(var i = 0; i < len; i++)
			{
				console.log("Row: " + i + " ID: " + results.rows.item(i).id + " Name: " + results.rows.item(i).name + "DROPPED!");
			}
		}, onError);
	});
}
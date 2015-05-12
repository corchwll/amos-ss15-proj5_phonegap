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
 	checkStandardProjects();
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

var sqlCreateTableProjects = "CREATE TABLE IF NOT EXISTS Projects (id INTEGER PRIMARY KEY, name TEXT, is_displayed INTEGER, is_used INTEGER, is_archived INTEGER)";

var sqlCreateTableSessions = "CREATE TABLE IF NOT EXISTS Sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, timestamp_start INTEGER, timestamp_stop INTEGER)";

var sqlCreateViewTimes = "CREATE VIEW IF NOT EXISTS Aggregated_Times AS SELECT project_id, SUM(timestamp_stop - timestamp_start) AS aggregated_time FROM Sessions GROUP BY project_id"; 

var sqlSelectAllSessions = "SELECT * FROM Sessions";

var sqlDeleteAllProjects = "DELETE FROM Projects";

var sqlDropTableProjects = "DROP TABLE Projects";

/* WHERE timestamp_stop != 0 AND timestamp_start != 0 AND timestamp_stop IS NOT NULL AND timestamp_start IS NOT NULL GROUP BY project_id"; */

var sqlSelectAllProjectsWithTimes = "SELECT Projects.id, Projects.name, Projects.is_displayed, Projects.is_used, Aggregated_Times.aggregated_time FROM Projects LEFT JOIN Aggregated_Times ON Projects.id = Aggregated_Times.project_id";

var sqlInsertStandardProjectIllness = "INSERT INTO Projects (id, name, is_displayed, is_used, is_archived) VALUES ('1', 'Illness', '1', '0', '0')";

var sqlInsertStandardProjectTraining = "INSERT INTO Projects (id, name, is_displayed, is_used, is_archived) VALUES ('2', 'Training', '1', '1', '0')";

var sqlInsertStandardProjectHoliday = "INSERT INTO Projects (id, name, is_displayed, is_used, is_archived) VALUES ('3', 'Holiday', '1', '0', '0')";

var sqlCheckStandardProjects = "SELECT * FROM Projects WHERE (name = 'Illness' AND id = 1) OR (name = 'Training' AND id = 2) OR (name = 'Holiday' AND id = 3)";

var sqlDeleteStandardProjects = "DELETE FROM Projects WHERE name = 'Illness' OR name = 'Training' OR name = 'Holiday'";

/*
function onError
Prints error message to console output if a sqlite error occurs.
 */
function onError(tx, err)
{
	console.log('Database error: ' + err.message);
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
function checkStandardProjects
Checks if the predefined standard projects are already in the database and calls function addStandardProject, if they are not already in the database.
*/
function checkStandardProjects()
{
	database.transaction(function (tx) 
	{
		tx.executeSql(sqlCheckStandardProjects, [], function(tx, res) 
		{
			if (res.rows.length !== 3) 
			{
				tx.executeSql(sqlDeleteStandardProjects, [], function(tx, res) 
				{
					addStandardProject(sqlInsertStandardProjectIllness);
					addStandardProject(sqlInsertStandardProjectTraining);
					addStandardProject(sqlInsertStandardProjectHoliday);
				});
			}
		}); 
	});
}

/*
function addStandardProject
Generic execution of SQL code given as parameter. However, only able to process SQL code without wild cards (question marks) or returns. (Thus only Insert or Updates possible).
*/
function addStandardProject(sqlCode)
{
	database.transaction(function (tx)
	{
		tx.executeSql(sqlCode, []);
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

		if(0 === row.is_displayed) 
		{
			return '';
		} else if (0 === row.is_used) {
			return '<div class="panel panel-default">' +
				'<div class="panel-heading" role="tab" id="' + row.id + '" data-toggle="collapse" data-parent="#ProjectList" href="#' + row.id + 'body" aria-expanded="true" aria-controls="collapseOne" onclick="">' +
					'<h4 class="panel-title">' +
						row.name +
					'</h4>' +
				'</div>' +
				'<div id="' + row.id + 'body" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">' +
					'<p>' +
						'<button class="btn btn-info" onclick="addSessionForProject(&quot;' + row.id + '&quot;, &quot;' + row.name + '&quot;)"><span class="glyphicon glyphicon-plus"></span></button>' +
					'</p>' +	
				'</div>' +
			'</div>';

		} else {
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
		}
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

/* dev function for deleting all projects from the database */
function deleteProjects()
{
	database.transaction(function(tx) 
	{
		tx.executeSql(sqlDeleteAllProjects, [], function(tx, results) 
		{
			var len = results.rows.length;
			for(var i = 0; i < len; i++)
			{
				console.log("Row: " + i + " ID: " + results.rows.item(i).id + " Name: " + results.rows.item(i).name + "DELETED!");
			}
		}, onError);
	});
}

/* dev funtion for dropping the Projects table */
function dropTableProjects()
{
	database.transaction(function(tx) 
	{
		tx.executeSql(sqlDropTableProjects, [], function(tx, results) 
		{
			console.log("Table Projects dropped!");
		}, onError);
	});
}
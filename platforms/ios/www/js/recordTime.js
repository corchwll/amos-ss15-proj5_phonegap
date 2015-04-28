/* ATTENTION:
Functions demand an already initialized database!
*/

/* Wait for device API to load */
document.addEventListener("deviceready", onDeviceReady, false);

var database;

/* When Cordova is ready database is opened (at first time, database is created) */
function onDeviceReady()
{
    /* open database (without icloud backup -> location: 2) */
  database = window.sqlitePlugin.openDatabase({name: 'mtr.db', location : 2});              
  console.log("Database opened");                                                   //For debugging purposes
}

/* SQL Queries */

//var sqlCreateTableProjects = "CREATE TABLE IF NOT EXISTS Projects (id INTEGER PRIMARY KEY, name TEXT)";

//var sqlCreateTableSessions = "CREATE TABLE IF NOT EXISTS Sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, timestamp_start INTEGER, timestamp_stop INTEGER)";

var sqlInsertSession = "INSERT INTO Sessions (project_id, timestamp_start) VALUES (?, ?)";

var sqlUpdateSession = "UPDATE Sessions SET timestamp_stop = ? WHERE project_id = ? AND timestamp_stop IS NULL";



/* state whether timer is running or not */
var state = 0;
var currentDate;
//var stopTime;
var counter;
var refresh;

/*
 The behaviour of function startStop depends on the current internal state. The function either starts the timer, stops the timer or resets the internal state, if the timer was stopped by function stop.
 */
function startStop(projectId)
{
    var startDate = new Date();
    var startTime = startDate.getTime();

    /* Start counter if it is not already running */
    if(state === 0)
    {
        state = 1;
        timer(startTime, projectId);
        starttimeDb(startTime, projectId);
    } else if(state === 1)
    {
        state = 0;
        stoptimeDb(projectId);
    } else if(state === 2)
    {
        state = 0;
    }
}

/*
 Function stop only stops the timer and, thus, is meant for the stop-button.
 If timer was stopped already by function stop or function startStop, it does not change the state.
 If timer is running, it changes the internal state to 2, in order to mark the stoppage with the stop function/button.
 */
function stop(projectId)
{
    if(state === 0)
    {
        state = 0;
    } else if(state === 1)
    {
        state = 2;
        stoptimeDb(projectId);
    } else if(state === 2)
    {
        state = 2;
    }
}

/*
 Function timer increases the counter element every second, starting from a given start time.
 */
function timer(startTime, projectId)
{
    currentDate = new Date();
    var elementID = projectId + 'counter';
    counter = document.getElementById(elementID);

    var timeDiff = currentDate.getTime() - startTime;

    if(state === 1)
    {
        counter.value = formatTime(timeDiff);
        refresh = setTimeout('timer(' + startTime + ', ' + projectId + ');', 10);
    }
}

/*
 Function formatTime converts unformatted time into seconds, minutes and hours and returns them as combined string.
 */
function formatTime(unformattedTime)
{
    var second = Math.floor(unformattedTime/1000);
    var minute = Math.floor(unformattedTime/60000);
    var hour = Math.floor(unformattedTime/3600000);
    second = second - (60 * minute);
    minute = minute - (60 * hour);
    return hour + ':' + minute + ':' + second;
}

/*
 Function starttimeDb inserts the current timestamp into the database table Sessions as starting point of the respective session.
 */
function starttimeDb(startTime, projectId)
{
    var startTimeSeconds = Math.floor(startTime/1000);
    database.transaction(function (tx) {tx.executeSql(sqlInsertSession, [projectId, startTimeSeconds], function(tx, res) {
       console.log("insertId: " + res.insertId + " --");
       console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");
   }); });
}

/*
 Function stoptimeDb updates the current session in the database table Sessions with the current timestamp as end point of the respespectie session.
 */
function stoptimeDb(projectId)
{
    var latestOpenSessionLocal;
    var stopDate = new Date();
    var stopTime = stopDate.getTime();
    var stopSeconds = Math.floor(stopTime/1000);
    
   
   database.transaction(function (tx) {tx.executeSql(sqlUpdateSession, [stopSeconds, projectId], function(tx, res) {
       //console.log("insertId: " + res.insertId + " --");
       //console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");
   }); });
   console.log("Session completed");
}

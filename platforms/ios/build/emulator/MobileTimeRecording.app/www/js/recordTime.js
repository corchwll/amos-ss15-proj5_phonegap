/* state whether timer is running or not */
var state = 0;
var currentDate;
//var stopTime;
var counter;
var refresh;

/*
 The behaviour of function startStop depends on the current internal state. The function either starts the timer, stops the timer or resets the internal state, if the timer was stopped by function stop.
 */
function startStop()
{
    var startDate = new Date();
    var startTime = startDate.getTime();

    /* Start counter if it is not already running */
    if(state === 0)
    {
        state = 1;
        timer(startTime);
    } else if(state === 1)
    {
        state = 0;
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
function stop()
{
    if(state === 0)
    {
        state = 0;
    } else if(state === 1)
    {
        state = 2;
    } else if(state === 2)
    {
        state = 2;
    }
}

/*
 Function timer increases the counter element every second, starting from a given start time.
 */
function timer(startTime)
{
    currentDate = new Date();
    counter = document.getElementById('counter');

    var timeDiff = currentDate.getTime() - startTime;

    if(state === 1)
    {
        counter.value = formatTime(timeDiff);
        refresh = setTimeout('timer(' + startTime + ');', 10);
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

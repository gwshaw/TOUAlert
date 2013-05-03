//
// Decision logic for TOU (Time-Of-Use) Alert MS Sidebar Gadget
// Decides correct usage time to display in side bar
//


// JSLint Flags
/*jslint browser: true, devel: true, windows: true, undef: true, nomen: true,
    eqeqeq: true, bitwise: true, regexp: true, immed: true
*/

/*members Action, Gadget, Settings, backgroundColor, closeAction, color,
    commit, getDate, getDay, getElementById, getFullYear, getHours,
    getMinutes, getMonth, innerHTML, length, message, onSettingsClosed,
    onreadystatechange, read, readyState, setDate, settingsUI, style,
    toDateString, visibilityChanged, visible, write, writeString
*/

/*global settingsMessage message mainBody*/

var iTimer = null;
var tTimer = null;
var lastYear;

var PartialPeak = "PP";
var OffPeak = "OP";
var Peak = "PK";
var TOU = ""; // "PK" peak, "PP" partial-peak, or "OP" off-peak

// Naming:
// MF Monday-Friday, SS Saturday-Sunday, W Winter, S Summer, P Partial
// [MF|SS][W|S]{P}Peak[Start|End]
var MFWPPeakStartHour = null;
var MFWPPeakEndHour = null;
var MFSPPeakStart1Hour = null;
var MFSPPeakEnd1Hour = null;
var MFSPeakStartHour = null;
var MFSPeakEndHour = null;
var MFSPPeakStart2Hour = null;
var MFSPPeakEnd2Hour = null;
var SSSPPeakStartHour = null;
var SSSPPeakEndHour = null;


var firstSummerMonth = null; // May=4
var firstWinterMonth = null; // November=10


// Create settings for each Holiday date
// and an array of all holiday dates for the current year
var holidays;

function setHolidays(year)
{
    function floatingDate(inYear, inMonth, nTh, targetDow)
    {
        // find the earliest date in month the n-th repetition of a day could occur
        // 3rd Friday: nTh = 3; 1st Monday: nTh = 1
        var earliestDate = 1 + 7 * (nTh - 1);
        // Day-of-week (DOW): 0=Sunday, 1=Monday, etc.
        var earliestDow = (new Date(inYear, inMonth, earliestDate)).getDay();
        var offset = targetDow - earliestDow + (targetDow < earliestDow ? 7 : 0);
        return new Date(inYear, inMonth, earliestDate + offset);
    }

    // note that months in Date object are zero based
    var NewYearsDay = new Date(year, 0, 1).toDateString();       // New Years
    var PresDay = floatingDate(year, 1, 3, 1).toDateString();        // President's Day, 3rd Monday in February
    var MemDay = floatingDate(year, 4, 4, 1);         // Memorial Day, last Monday in May, get 4th Monday and adjust
    (MemDay.getDate() < 25) ? MemDay.setDate(MemDay.getDate() + 7) : MemDay;
    MemDay = MemDay.toDateString();
    var IndieDay = new Date(year, 6, 4).toDateString();          // Independence Day
    var LaborDay = floatingDate(year, 8, 1, 1).toDateString();       // Labor Day, 1st Monday in September
    var VetsDay = new Date(year, 10, 11);         // Veterans Day, November 11, or Monday if Sunday, Friday if Saturday
    (VetsDay.getDay() === 0) ? VetsDay.setDate(12) : ((VetsDay.getDay() === 6) ? VetsDay.setDate(10) : VetsDay);
    VetsDay = VetsDay.toDateString();
    var ThanksDay = floatingDate(year, 10, 4, 4).toDateString();     // Thanksgiving Day, 4th Thursday in November
    var XmasDay = new Date(year, 11, 25).toDateString();         // Independence Day
    
    holidays = [NewYearsDay, PresDay, MemDay, IndieDay, LaborDay, VetsDay, ThanksDay, XmasDay];

    System.Gadget.Settings.writeString("NewYearsDay", NewYearsDay);
    System.Gadget.Settings.writeString("PresDay", PresDay);
    System.Gadget.Settings.writeString("MemDay", MemDay);
    System.Gadget.Settings.writeString("IndieDay", IndieDay);
    System.Gadget.Settings.writeString("LaborDay", LaborDay);
    System.Gadget.Settings.writeString("VetsDay", VetsDay);
    System.Gadget.Settings.writeString("ThanksDay", ThanksDay);
    System.Gadget.Settings.writeString("XmasDay", XmasDay);
}

// Return true if the to.DateString value matches any entry in the holidays array.
function isHoliday(today)
{
    for (var i = 0, len = holidays.length; i < len; i++)
    {
        if (holidays[i] === today)
        {
             return true;
        }
    }
    return false;
}


function TOU_AlertCheck()
{
    // Get Current Time & Date
    var xDate = new Date();
    var xHour = xDate.getHours();
    var xMonth = xDate.getMonth();
    var xYear = xDate.getFullYear();

    function isWinterMonth(month)
    {
        return ((month < firstSummerMonth) || (month >= firstWinterMonth));
    }
    
    function isWeekDay(today)
    {
        var DOW = today.getDay();
        return ((DOW !== 0) && (DOW !== 6));
    }
    
    function isMFWinterPartialPeak(hour)
    {
        return ((hour >=MFWPPeakStartHour) && (hour < MFWPPeakEndHour));
    }
    
    function isMFSummerPeak(hour)
    {
        return ((hour >= MFSPeakStartHour) && (hour < MFSPeakEndHour));
    }
    
    function isMFSummerPartialPeak(hour)
    {
        return ((hour >=MFSPPeakStart1Hour) && (hour < MFSPPeakEnd1Hour)) ||
               ((hour >= MFSPPeakStart2Hour) && (hour < MFSPPeakEnd2Hour));
    }
    
    function isSSSummerPartialPeak(hour)
    {
        return ((hour >=SSSPPeakStartHour) && (hour < SSSPPeakEndHour));
    }
    

    
    try
    {
        if (xYear !== lastYear)
        {
            setHolidays(xYear);
        }

        // Set default for logic checks
        TOU = OffPeak;

        if (!isHoliday(xDate.toDateString()))
        {
            if (isWinterMonth(xMonth))
            {
            // Winter time schedule
                if (isWeekDay(xDate) && isMFWinterPartialPeak(xHour))
                {
                    TOU = PartialPeak;
                }
            }
            else
            {
            // Summer time schedule
                if (isWeekDay(xDate))
                {
                    if (isMFSummerPeak(xHour))
                    {
                        TOU = Peak;
                    }
                    else if (isMFSummerPartialPeak(xHour))
                    {
                        TOU = PartialPeak;
                    }
                }
                // Weekend
                else if (isSSSummerPartialPeak(xHour))
                {
                    TOU = PartialPeak;
                }
            }
        }
    }
    catch(err){message.innerHTML = "TOUAlert:" + err.message;}
}


function showTOUAlert()
{
    TOU_AlertCheck();
    
    var elem = document.getElementById("mainBody");
    var msg =  document.getElementById("message");

    if (TOU === Peak)
    {
        msg.innerHTML = 'Time-of-Use:<br/>Peak';
        elem.style.backgroundColor = "Red";
        elem.style.color = "White";
    }
    else if (TOU === PartialPeak)
    {
        msg.innerHTML = 'Time-of-Use:<br/>Partial-Peak';
        elem.style.backgroundColor = "Yellow";
        elem.style.color = "Black";
    }
    else if (TOU === OffPeak)
    {
        msg.innerHTML = 'Time-of-Use:<br/>Off-Peak';
        elem.style.backgroundColor = "Green";
        elem.style.color = "White";
    }
    else
    {
        msg.innerHTML = "Message Error";
    }
}


var notUpdated;                     // Update occurred while not on screen
var msPerHour = 60 * 60 * 1000;     // milliseconds per hour

function updateTOUAlert()
{
    // Only update screen when it is visible
    if (System.Gadget.visible)
    {    
        showTOUAlert();
        notUpdated = false;
    }
    else
    // Timer went off when off-screen so data is out of date
    // and timer not needed until on screen.
    {
        notUpdated = true;
        clearInterval(iTimer);
    }
}


function startIntervalTimer()
{
    iTimer = setInterval(updateTOUAlert, msPerHour);
    updateTOUAlert();
}

function checkVisibility()
{
    // If a change to visible and timer went off then
    // update screen and restart timer.
    if (System.Gadget.visible && notUpdated)
    {
        updateTOUAlert();
        
    // Compute 30 seconds past start of next hour for timeout
        var nowTime = new Date().getTime();
        // Compute one hour from now, allowing day rollover
        var thenTime = new Date(nowTime + msPerHour);
        // Drop minutes and set to 30 seconds after hour to tolerate inaccurate intervals
        thenTime.setMinutes(0,30,0);
        // Compute time until 30 seconds after next hour
        var timeout = thenTime - nowTime;
        // timeout at 30 seconds past next hour, then start 1hr intervals
        tTimer = setTimeout(startIntervalTimer, timeout);
    }
}


// Load setting needed for comparison logic
function loadSettings()
{
    function loadOneSetting(settingLabel, defaultValue)
    {
        var value = System.Gadget.Settings.read(settingLabel);

        if (String(value) === "")
        {
            value = defaultValue;
            System.Gadget.Settings.write(settingLabel, value);
        }
        return (value);
    }

    MFWPPeakStartHour = loadOneSetting("MFWPPeakStart", 17);
    MFWPPeakEndHour = loadOneSetting("MFWPPeakEnd", 20);
  
    MFSPPeakStart1Hour = loadOneSetting("MFSPPeak1Start", 10);
    MFSPPeakEnd1Hour = loadOneSetting("MFSPPeak1End", 13);
  
    MFSPeakStartHour = loadOneSetting("MFSPeakStart", 13);
    MFSPeakEndHour = loadOneSetting("MFSPeakEnd", 19);
  
    MFSPPeakStart2Hour = loadOneSetting("MFSPPeak2Start", 19);
    MFSPPeakEnd2Hour = loadOneSetting("MFSPPeak2End", 21);

    SSSPPeakStartHour = loadOneSetting("SSSPPeakStart", 17);
    SSSPPeakEndHour = loadOneSetting("SSSPPeakEnd", 20);
    
    firstSummerMonth = loadOneSetting("firstSummerMonth", 4);
    firstWinterMonth = loadOneSetting("firstWinterMonth", 10);
}


function settingsClosed(event)
{
    if(event.closeAction === event.Action.commit)
    {   
        loadSettings();
        updateTOUAlert();
    }
}


document.onreadystatechange = function()
{    
    if(document.readyState === "complete")
    {
        loadSettings();
        System.Gadget.settingsUI = "Settings.htm";
        System.Gadget.onSettingsClosed = settingsClosed;
        lastYear = new Date().getFullYear();
        setHolidays(lastYear);

        // Initialize screen to not up to date
        notUpdated = true;
        System.Gadget.visibilityChanged = checkVisibility;
    }
};
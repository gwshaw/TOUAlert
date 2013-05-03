//
// Settings for TOU (Time-Of-Use) Alert MS Sidebar Gadget
// Selects three "pages" of settings for PG&E TOU E-6 metering
//

// JS Lint Flags
/*jslint browser: true, devel: true, windows: true, onevar: true, undef: true, nomen: true,
eqeqeq: true, plusplus: true, bitwise: true, regexp: true, immed: true */

/*global 
 htmlNewYearsDay, htmlPresDay, htmlMemDay, htmlIndieDay, htmlLaborDay,
 htmlVetsDay, htmlThanksDay, htmlXmasDay, MFWPPeakStartBox, MFWPPeakEndBox,
 MFSPPeak1StartBox, MFSPPeak1EndBox, MFSPeakStartBox, MFSPeakEndBox,
 MFSPPeak2StartBox, MFSPPeak2EndBox, SSSPPeakStartBox, SSSPPeakEndBox
*/

/*members Action, Gadget, Settings, cancel, closeAction, commit, display,
     getElementById, innerHTML, length, message, name, onSettingsClosing,
     onreadystatechange, read, readString, readyState, replace, style, value,
     write
*/


// Display a message at the bottom of the Settings page
function settingsMessage(msg)
{
    document.getElementById("SettingsMsg").innerHTML = "<br />" + msg;
}

function SETTINGS_Change_Section(section)
{
    document.getElementById("Winter-Sec").style.display="none";
    document.getElementById("Summer-Sec").style.display="none";
    document.getElementById("Holiday-Sec").style.display="none";

    document.getElementById(section).style.display="block";

    settingsMessage("");
}


// load input box values from saved settings
function SETTINGS_Winter_Restore()
{
    MFWPPeakStartBox.value = System.Gadget.Settings.read("MFWPPeakStart");
    MFWPPeakEndBox.value = System.Gadget.Settings.read("MFWPPeakEnd");
    
    document.getElementById("WinterStartMenu").selectedIndex = System.Gadget.Settings.read("firstWinterMonth");

}

// load input box values from saved settings
function SETTINGS_Summer_Restore()
{
    MFSPPeak1StartBox.value = System.Gadget.Settings.read("MFSPPeak1Start");
    MFSPPeak1EndBox.value = System.Gadget.Settings.read("MFSPPeak1End");

    MFSPeakStartBox.value = System.Gadget.Settings.read("MFSPeakStart");
    MFSPeakEndBox.value = System.Gadget.Settings.read("MFSPeakEnd");

    MFSPPeak2StartBox.value = System.Gadget.Settings.read("MFSPPeak2Start");
    MFSPPeak2EndBox.value = System.Gadget.Settings.read("MFSPPeak2End");

    SSSPPeakStartBox.value = System.Gadget.Settings.read("SSSPPeakStart");
    SSSPPeakEndBox.value = System.Gadget.Settings.read("SSSPPeakEnd");

    document.getElementById("SummerStartMenu").selectedIndex = System.Gadget.Settings.read("firstSummerMonth");
}

// load input box values from saved settings

function SETTINGS_Holiday_Restore()
{
    htmlNewYearsDay.innerHTML = System.Gadget.Settings.readString("NewYearsDay");
    htmlPresDay.innerHTML = System.Gadget.Settings.readString("PresDay");
    htmlMemDay.innerHTML = System.Gadget.Settings.readString("MemDay");
    htmlIndieDay.innerHTML = System.Gadget.Settings.readString("IndieDay");
    htmlLaborDay.innerHTML = System.Gadget.Settings.readString("LaborDay");
    htmlVetsDay.innerHTML = System.Gadget.Settings.readString("VetsDay");
    htmlThanksDay.innerHTML = System.Gadget.Settings.readString("ThanksDay");
    htmlXmasDay.innerHTML = System.Gadget.Settings.readString("XmasDay");
}


document.onreadystatechange = function()
{
    SETTINGS_Change_Section('Winter-Sec');
    
    if(document.readyState === "complete")
    {
        // load input box and screen values from saved settings
        SETTINGS_Winter_Restore();
        SETTINGS_Summer_Restore();
        SETTINGS_Holiday_Restore();
    }
};


function writeSetting(settingLabel, settingBox)
{
    var settingValue = settingBox.value.replace(/^\s+|\s+$/g,"");

    function isNumber(value)
    {
        // use == and not ===
        return (value - 0) == value && value.length > 0;
    }

    if (isNumber(settingValue))
    {
        if (settingValue >= 0 && settingValue <= 23)
        {
            System.Gadget.Settings.write(settingLabel, settingValue);
        }
        else
        {
            throw {name: 'BadField', message: 'All fields must be from 0 to 23.'};
        }
    }
    else
    {
        throw {name: 'BadField', message: 'All fields must be numeric.'};
    }
}


System.Gadget.onSettingsClosing = function(event)
{
    // User clicks OK
    if (event.closeAction === event.Action.commit) 
    {
        try
        {
            writeSetting("MFWPPeakStart", MFWPPeakStartBox);
            writeSetting("MFWPPeakEnd", MFWPPeakEndBox);
            writeSetting("MFSPPeak1Start", MFSPPeak1StartBox);
            writeSetting("MFSPPeak1End", MFSPPeak1EndBox);
            writeSetting("MFSPeakStart", MFSPeakStartBox);
            writeSetting("MFSPeakEnd", MFSPeakEndBox);
            writeSetting("MFSPPeak2Start", MFSPPeak2StartBox);
            writeSetting("MFSPPeak2End", MFSPPeak2EndBox);
            System.Gadget.Settings.write("firstWinterMonth", document.getElementById("WinterStartMenu").selectedIndex);
            
            writeSetting("SSSPPeakStart", SSSPPeakStartBox);
            writeSetting("SSSPPeakEnd", SSSPPeakEndBox);
            System.Gadget.Settings.write("firstSummerMonth", document.getElementById("SummerStartMenu").selectedIndex);

            // allow settings to close
            event.cancel = false;
        }
        catch(err)
        {
            if (err.name === "BadField")
            {
                settingsMessage(err.message);
            }
            else
            {
                settingsMessage(err.message);
                throw(err);
            }
            // Do NOT allow settings page to close
            event.cancel = true;
        }
    }
    // User clicks Cancel
    else if (event.closeAction === event.Action.cancel)
    {
    // Allow settings page to close
        event.cancel = false;
    }
};
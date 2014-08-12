/**
 * Created by Kevin on 2014-07-15.
 */
var lastUpdate = localStorage.getItem("lastUpdate");
var nextUpdate = localStorage.getItem("nextUpdate");
var updateDiff = localStorage.getItem("updateDiff");
var theme = localStorage.theme;

if (updateDiff === null) {
    "use strict";
    updateDiff = 30;
    localStorage.setItem("updateDiff", 30);
}
if (nextUpdate === null) {
    "use strict";
    localStorage.setItem("nextUpdate", getNextUpdate(new Date(), 1));
}

if (theme === undefined){
    "use strict";
    localStorage.theme = "a";
    theme = "a";
}

function getNextUpdate(currentDateTime, minutes) {
    "use strict";
    return new Date(currentDateTime.getTime() + minutes * 60000);
}

function setUpdateDates() {
    "use strict";
    var date = new Date();
    localStorage.setItem("lastUpdate", date);
    lastUpdate = date;
    var nextDate = getNextUpdate(date, updateDiff);
    localStorage.setItem("nextUpdate", nextDate);
    nextUpdate = nextDate;
}

function stormLoad(data) {
    "use strict";
    window.storms = data.storms.storm;
    localStorage.setItem("storms", JSON.stringify(storms));
}

function trackLoad(data) {
    "use strict";
    window.tracks = data.tracks.storm;
    localStorage.setItem("tracks", JSON.stringify(tracks));
}

function loadData() {
    "use strict";
    $.ajax({
        method: "GET",
        url: "json/storms.json",
        dataType: "json",
        error: function (jqxhr, textStatus, errorThrown) {
            alert("An Error has occurred :" + textStatus +"\n" + errorThrown);
        },
        success: stormLoad
    });
    $.ajax({
        method: "GET",
        url: "json/tracks.json",
        dataType: "json",
        error: function (jqxhr, textStatus, errorThrown) {
            alert("An Error has occurred :" + textStatus +"\n" + errorThrown);
        },
        success: trackLoad
    });
}

function checkData(forceLoad) {
    "use strict";
    if (lastUpdate === null) {
        loadData();
        setUpdateDates();
    } else if (new Date() > new Date(nextUpdate)) {
        loadData();
        setUpdateDates();
    } else if(forceLoad){
        loadData();
        setUpdateDates();
    } else if (typeof tracks === "undefined" || typeof storms === "undefined") {
        window.tracks = JSON.parse(localStorage.getItem("tracks"));
        window.storms = JSON.parse(localStorage.getItem("storms"));
    }
}


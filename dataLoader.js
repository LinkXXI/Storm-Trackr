/**
 * Created by Kevin on 2014-07-15.
 */
var lastUpdate = localStorage.getItem("lastUpdate");
var nextUpdate = localStorage.getItem("nextUpdate");
var updateDiff = localStorage.getItem("updateDiff");

if (updateDiff === null) {
    updateDiff = 30;
    localStorage.setItem("updateDiff", 30);
}
window.nextUpdate = function (currentDateTime, minutes){
    return  new Date(currentDateTime.getTime() + minutes*60000)
}
function setUpdateDates() {
    var date = new Date();
    localStorage.setItem("lastUpdate", date);
    var nextDate = nextUpdate(date, updateDiff);
    localStorage.setItem("nextUpdate", nextDate);
}
function stormLoad(data) {
    window.storms = data;
    localStorage.setItem("storms", JSON.stringify(data));
}
function trackLoad(data){
    window.tracks=data;
    localStorage.setItem("tracks", JSON.stringify(data));
}
function loadData(){
    $.ajax({
        method:"GET",
        url:"storms.json",
        dataType:"json",
        error:function(){alert("An Error has occured")},
        success: stormLoad
    });
    $.ajax({
        method:"GET",
        url:"tracks.json",
        dataType:"json",
        error:function(){alert("An Error has occured")},
        success: trackLoad
    });
}

function checkData() {
    if (lastUpdate === null) {
        loadData();
        setUpdateDates();
    } else if (new Date() > nextUpdate) {
        loadData();
        setUpdateDates();
    } else if(typeof tracks === "undefined" || typeof storms === "undefined"){
        window.tracks = JSON.parse(localStorage.getItem("tracks"));
        window.storms = JSON.parse(localStorage.getItem("storms"));
    }
}

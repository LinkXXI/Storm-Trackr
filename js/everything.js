//DATA LOADER JS

var lastUpdate = localStorage.getItem("lastUpdate");
var nextUpdate = localStorage.getItem("nextUpdate");
var updateDiff = localStorage.getItem("updateDiff");

if (updateDiff === null) {
    "use strict";
    updateDiff = 30;
    localStorage.setItem("updateDiff", 30);
}
if (nextUpdate === null) {
    "use strict";
    localStorage.setItem("nextUpdate", getNextUpdate(new Date(), 1));
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


// INDEX PAGE WEATHER LOAD

navigator.geolocation.getCurrentPosition((function (location) {
    "use strict";
    $.simpleWeather({
        location: location.coords.latitude + ', ' + location.coords.longitude,
        units: "C",
        success: function (weather) {
            console.log(weather);
            var html = "<h1>Current Conditions</h1>";
            html += "<h2><img src='" + weather.thumbnail + "'/>" + weather.alt.temp + '&deg;' + weather.alt.unit + "</h2>";
            html += weather.city + ", " + weather.region;
            console.log(html);
            $("#weather").html(html);
        }
    });
}));

// REPORTS PAGE JS

$(document).on('pagecreate', '#stormsByYear', function () {
    "use strict";
    var listString = "";
    var stormsYearsArray = [];
    for (var storm in storms) {
        //get the storms year
        var stormYear = storms[storm].start.split("/")[0];
        //check if the ley exists
        if (stormsYearsArray[stormYear] === undefined) {
            stormsYearsArray[stormYear] = [];
        }
        //put the origional index into the storm object for future usage
        storms[storm].origIndex = storm;
        // add storm to array
        stormsYearsArray[stormYear].push(storms[storm]);
    }
    //loop through storm years
    for (var key in stormsYearsArray) {
        var yearsStorms = stormsYearsArray[key];
        var speed = 0;
        var strongestStorm = "";
        //find the strongest storm
        for (storm in yearsStorms) {
            var aStorm = yearsStorms[storm];
            if (aStorm.maxKM > speed) {
                speed = aStorm.maxKM;
                strongestStorm = aStorm.name;
            }
        }
        //add header
        listString += "<li data-role='list-divider'>Year: " + key + "<br />Strongest Storm: " + strongestStorm + "<br />Storm Windspeed (kmph): " + speed + "</li>";
        //add all the other storms.
        for (storm in yearsStorms) {
            var aStorm = yearsStorms[storm];
            listString += "<li><a href='' data-index='" + aStorm.origIndex + "'>" + aStorm.name + "</a></li>";
        }
    }
    $("#stormsByYearList").append(listString).listview("refresh");
    $(this).on('vclick', 'ul li a', function () {
        window.stormDetails = storms[$(this).attr('data-index')];
        $.mobile.changePage("#stormDetails");
    });
});

$(document).on('pagecreate', '#stormsByCategory', function () {
    "use strict";
    var categoryArray = [];
    categoryArray.TD = [];
    categoryArray.TS = [];
    categoryArray.C1 = [];
    categoryArray.STS = [];
    categoryArray.C2 = [];
    categoryArray.C3 = [];
    categoryArray.C4 = [];
    categoryArray.C5 = [];
    var i = 0;
    for (var storm in storms) {
        storms[storm].origIndex = i;
        categoryArray[storms[storm].category].push(storms[storm]);
        i++;
    }
    var listString = "";
    for (var key in categoryArray) {
        listString += "<li data-role='list-divider'>Category: " + key + "</li>";
        for (storm in categoryArray[key]) {
            var aStorm = categoryArray[key][storm];
            listString += "<li><a href='' data-index='" + aStorm.origIndex + "'>" + aStorm.name + "</a></li>";
        }
    }
    $("#stormsByCategoryList").append(listString).listview('refresh');
    $(this).on('vclick', 'ul li a', function () {
        window.stormDetails = storms[$(this).attr('data-index')];
        $.mobile.changePage("#stormDetails");
    });
});

$(document).on('pagebeforeshow', '#stormDetails', function () {
    "use strict";
    var content = $(this).find("[data-role='content']").html("");
    $(content).append(
            "<h1>" + stormDetails.name + "</h1>" +
            "<Table>" +
            "<tr><td>Start date</td><td>" + stormDetails.start + "</td></tr>" +
            "<tr><td>End date</td><td>" + stormDetails.end + "</td></tr>" +
            "<tr><td>Category</td><td>" + stormDetails.category + "</td></tr>" +
            "<tr><td>Max Speed KM/h</td><td>" + stormDetails.maxKM + "</td></tr>" +
            "<tr><td>Max Speed M/h</td><td>" + stormDetails.maxMPH + "</td></tr>" +
            "<tr><td>Min MBAR</td><td>" + stormDetails.minMBAR + "</td></tr>" +
            "<tr><td>Deaths</td><td>" + stormDetails.deaths + "</td></tr>" +
            "<tr><td>Damage</td><td>" + stormDetails.damage + "</td></tr></table>"
    );
    var regions = "<h1>Areas Affected</h1>";
    for (var string in  stormDetails.area) {
        regions += stormDetails.area[string] + "<br />";
    }
    $(content).append(regions);
});

//CHARTS PAGE JS

google.load("visualization", "1", {packages:["corechart"]});
$(document).on('pageshow', '#stormStrength', function () {
    "use strict";
    var strongStorms = 0;
    var weakerStorms = 0;
    for(var storm in storms){
        switch(storms[storm].category){
            case "TD":
                weakerStorms++;
                break;
            case "TS":
                weakerStorms++;
                break;
            case "C1":
                weakerStorms++;
                break;
            case "C2":
                weakerStorms ++;
                break;
            case "C3":
                strongStorms ++;
                break;
            case "C4":
                strongStorms ++;
                break;
            case "C5":
                strongStorms ++;
                break;
            case "STS":
                strongStorms ++;
                break;
            default:
                break;
        }
    }
    var data = google.visualization.arrayToDataTable([
        ['blank','Severe Storms (C3 and up)','Weak Storms (Under C3)','Total Storms'   ],//, "Number of Storms"],
        ['' , strongStorms, weakerStorms, storms.length],
        //'Weak Storms (Under C3)' , weakerStorms],
        //['Total Storms' , storms.length]
    ]);
    var options = {
        vAxis:{title: "# Storms"},
        backgroundColor: {fill: "transparent"}
    };
    var chart = new google.visualization.BarChart($("#strengthChart").get(0));
    chart.draw(data, options);
});

$(document).on('pageshow', '#deathsByCategory', function () {
    "use strict";
    var td = 0;
    var ts = 0;
    var c1 = 0;
    var c2 = 0;
    var c3 = 0;
    var c4 = 0;
    var c5 = 0;
    for(var storm in storms){
        switch(storms[storm].category){
            case "TD":
                td+= parseInt(storms[storm].deaths.split(" ")[0]);
                break;
            case "TS":
                ts+= parseInt(storms[storm].deaths.split(" ")[0]);
                break;
            case "C1":
                c1+= parseInt(storms[storm].deaths.split(" ")[0]);
                break;
            case "C2":
                c2+= parseInt(storms[storm].deaths.split(" ")[0]);
                break;
            case "C3":
                c3+= parseInt(storms[storm].deaths.split(" ")[0]);
                break;
            case "C4":
                c4+= parseInt(storms[storm].deaths.split(" ")[0]);
                break;
            case "C5":
                c5+= parseInt(storms[storm].deaths.split(" ")[0]);
                break;
            case "STS":
                c2+= parseInt(storms[storm].deaths.split(" ")[0]);
                break;
            default:
                break;
        }
    }
    var data = google.visualization.arrayToDataTable([
        ['Category', "Number of Deaths"],
        ['Tropical Depression' , td],
        ['Tropical Storm' , ts],
        ['Category 1' , c1],
        ['Category 2' , c2],
        ['Category 3' , c3],
        ['Category 4' , c4],
        ['Category 5' , c5]
    ]);
    var options = {
        title: "Number of Deaths by Category of Storm",
        backgroundColor: {fill: "transparent"}
    };
    var chart = new google.visualization.PieChart($("#deathsChart").get(0));
    $(window).resize(function () {
        chart.draw(data, options);
    });
    chart.draw(data, options);
});

// TRACKS PAGE JS

var map;
var markers = [];
var hurricanePath;

$(document).on("pagecreate", "#tracksMain", function () {
    "use strict";
    var tracksList = $("#tracksList");
    var append = "";
    $.each(tracks, function (i, track) {
        append += "<li><a href='#mapPage' data-id='" + i + "'>" + track.name + "</a></li>";
    });
    $(tracksList).append(append);
    tracksList.listview("refresh");
});

$(document).on("pageinit", "#mapPage", function () {
    "use strict";
    function init(){
        var mapOptions = {
            center: new google.maps.LatLng(30, -67),
            zoom: 4
        };
        map = new google.maps.Map(document.getElementById("hurricaneMap"), mapOptions);
    }
    setTimeout(init, 300);
});

$(document).on("pagebeforehide", '#mapPage', function () {
    "use strict";
    for(var i = 0; i < markers.length; i++){
        markers[i].setMap(null);
    }
    markers = [];
    hurricanePath.setMap(null);
});

$(document).on("vclick", '#tracksList li a', function () {
    "use strict";
    var track = tracks[$(this).attr('data-id')];
    function placeMarkers() {
        $('#nameTarget').html(' ' + track.name);
        var path = [];
        track.event.forEach(function(event){
            var latLng = new google.maps.LatLng(event.lat, event.long * - 1);
            path.push(latLng);
            var marker = new google.maps.Marker({
                position: latLng,
                map: map,
                title: event.date.toString() + event.time.toString(),
                animation: google.maps.Animation.DROP
            });
            markers.push(marker);

            var contentString = "<div id='content'>" +
                "<h3>"+event.date +" " + event.time +"h</h3>" +
                "<p>Stage: " + event.stage + "</p>" +
                "<p>Mbar: " + event.mbar + "</p>" +
                "<p>Windspeed: " + event.windspeed + "</p>" +
                "</div>";

            var infowindow = new google.maps.InfoWindow({
                content: contentString,
                closed: true
            });

            google.maps.event.addListener(marker, 'click', function(){
                if(infowindow.closed) {
                    infowindow.open(map, marker);
                    infowindow.closed = false;
                }
                else{
                    infowindow.close();
                    infowindow.closed = true;
                }
            });
        });
        var lineSymbol =    {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
        };
        hurricanePath = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#000000',
            strokeOpacity: 0.75,
            stokeWeight: 2,
            icons:[{
                icon:lineSymbol,
                offset: '100%'
            }],
            map:map
        });
        //hurricanePath.setMap(map);
    }

    setTimeout(placeMarkers, 500);

});


// SETTINGS PAGE JS
$(document).on("pagecreate", "#settingsMain", function () {
    "use strict";
    var isDirty = false;
    $("#lastUpdate").val(lastUpdate);
    var updateTimeSetting = $("#updateTimeSetting").val(updateDiff);
    updateTimeSetting.slider("refresh");
});
$("#save").click(function () {
    "use strict";
    updateDiff = $("#updateTimeSetting").val();
    localStorage.setItem("updateDiff", updateDiff);
    history.back();
});
function forceUpdate() {
    "use strict";
    checkData(true);
    $('#lastUpdate').val(lastUpdate);
}


var db = require('../db/database_utils.js');
var async = require('async');
var bar = require('../db/bar_db_utils.js');
var hotel = require('../db/hotel_db_utils.js');
var restaurant = require('../db/restaurant_db_utils.js');

var min = function (one, two) {
    if (one < two) {
        return one; 
    } else {
        return two; 
    }
};

var makeRestaurantThumbnail = function (restaurant) {
    var result = "";

    result += "<div class=\"col-sm-3\">";
    result += "<div class=\"thumbnail\">";

    if (restaurant["image"]) {
        result += "<img src=\"" + restaurant["image"] + "\">";
    }
    result += "<div class=\"caption\">"
    result += "<h3>" + restaurant["name"] + "</h3>";

    // fourchette de prix
    //
    // places maximum
    //
    // emporter des plat ?
    //
    // livraison
    //
    // fermeture

    result += "</div>"; // Closing "caption".
    result += "</div>"; // Closing "thumbnail".
    result += "</div>"; // Closing "col-sm-3"
};

var makeHotelThumbnail = function (hotel) {
    var result = "";

    result += "<div class=\"col-sm-3\">";
    result += "<div class=\"thumbnail\">";

    if (hotel["image"]) {
        result += "<img src=\"" + hotel["image"] + "\">";
    }
    result += "<div class=\"caption\">"
    result += "<h3>" + hotel["name"] + "</h3>";

    // Nombre d'étoile.
    //
    // Nombre de chambre
    //
    // Prix pour une nuit en chambre double.

    result += "</div>"; // Closing "caption".
    result += "</div>"; // Closing "thumbnail".
    result += "</div>"; // Closing "col-sm-3"
};

var makeBarThumbnail = function (bar) {
    var result = "";

    result += "<div class=\"col-sm-3\">";
    result += "<div class=\"thumbnail\">";

    if (hotel["image"]) {
        result += "<img src=\"" + bar["image"] + "\">";
    }
    result += "<div class=\"caption\">"
    result += "<h3>" + bar["name"] + "</h3>";

    // fumeur ?
    //
    // petite restauration

    result += "</div>"; // Closing "caption".
    result += "</div>"; // Closing "thumbnail".
    result += "</div>"; // Closing "col-sm-3"
};

var makeCarousel = function (list, design) {
     var result = ""; 

    result += "<div class=\"item active\">";
    var i = 0;
    for (i = 0; i < min(list.length, 3); ++i) {
        result += design(list[i]);
    }
    result += "</div>";

    while (i < list.length) {
        result += "<div class=\"item\">"
        for (i = 0; i < 4; ++i) {
            result += design(list[i]);
        }
        result += "</div>";
    }

    return result;
};

module.exports = {
    count_list : function (list) {
        return list.length;
    },

    stars_maker : function (number) {
        console.log(number)
        var result = "";
        var MAX_STARS = 5;
        var i = 0;
        for (i = 1; i <= MAX_STARS; ++i) {
            if (i <= number) {
                result += "<i class=\"fa fa-star\" aria-hidden=\"true\"></i>"
            } else if ((number % (i - 1)) && (number % (i - 1)) < 1) {
                result += "<i class=\"fa fa-star-half-o\" aria-hidden=\"true\"></i>"
            } else {
                result += "<i class=\"fa fa-star-o\" aria-hidden=\"true\"></i>"
            }
        }

        return result;
    },


    icon : function (type) {
        switch (type) {
            case "bar":
                return "<span class=\"glyphicon glyphicon-glass\" aria-hidden=\"true\"></span>";
            case "hotel":
                return "<span class=\"glyphicon glyphicon-bed\" aria-hidden=\"true\"></span>";
            case "restaurant":
                return "<span class=\"glyphicon glyphicon-cutlery\" aria-hidden=\"true\"></span>";
            default:
                return "";
        }
    },

    deleteProfile : function (profileName, userName) {
        var result = "";
        if (profileName == userName) {
            result = "<a href=\"/user/remove/" + userName + "\">Delete</a>";
        }
        return result;
    },

    timetable : function (timetable, id, admin) {
        var result = "<table class=\"table\">"; 
        var days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        console.log("With timetable : " + timetable);
        for (var i = 0; i < timetable.length; ++i) {
            if ((i % 2) == 0) {
                // Matin
                result += "</tr><tr><td>" + days[Math.floor(i/2)] + "</td>";
            }

            result += "<td>";
            if (timetable[i] == "1") {
                result += "Fermé";
            } else {
                result += "Ouvert";
            }
            if (admin) {
                result += " <a href=\"/establishments/restaurant/update/" + id + "/timetable/" +  timetable + "/" + i + "\">Toggle</a>"
            }
            result += "</td>";
        }


        result += "</tr></table>";
        return result;
    },

    thumbnailing : function (establishments) {
        var result = "";  

        var current = -1;

        result += "<div class=\"row\">";
        for (var i = 0; i < establishments.length; ++i) {
            if ( (i % 3) == 0) {
                result += "</div>";
                result += "<div class=\"row\">";
            }

            result += "<div class=\"col-sm-6 col-md-4\"><div class=\"thumbnail\">";
            result += "<img src=\"/establishments/image/" + establishments[i].id + "\">";
            result += "<div class=\"caption\">";

            result += "<h3>" + establishments[i].name + "</h3>";

            result += "<p><span class=\"glyphicon glyphicon-road\" aria-hidden=\"true\"></span>" + establishments[i].address_street + ", " + establishments[i].address_number + " (" + establishments[i].address_town + ")." + "</p>";
            result += "<p><span class=\"glyphicon glyphicon-earphone\" aria-hidden=\"true\"></span>" + establishments[i].phone_number + "</p>";
            if (establishments[i].website)
                result += "<p><span class=\"glyphicon glyphicon-cloud\" aria-hidden=\"true\"></span><a href=\"" + establishments[i].website + "\">" + establishments[i].website + "</a></p>";
            result += "<p><a href=\"/establishments/" + establishments[i].id + "\" class=\"btn btn-success\" role=\"button\">Me montrer</a></p>";
            result += "</div>";
            result += "</div>";
            result += "</div>";
        }

        result += "</div>";

        return result;
    },

    average : function (comments) {
        var result = 0;    

        for (var i = 0; i < comments.length; ++i) {
            result += comments[i].rating; 
        }

        return result / comments.length;
    },
};

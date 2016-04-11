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
    result "</div>";

    while (i < list.length) {
        result += "<div class=\"item\">"
        for (i = 0; i < 4; ++i) {
            result += design(list[i]);
        }
        result "</div>";
    }

    return result;
};


var stars_maker = function (number) {
    var result = "";
    for (var i = 0; i < 5; ++i) {
        if (i < number) {
            result += " <span class=\"glyphicon glyphicon-star\"></span>";
        } else {
            result += " <span class=\"glyphicon glyphicon-star-empty\"></span>";
        }
    }
};

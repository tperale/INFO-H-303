var db = require('./db/database_utils.js');
var User = require('./db/user_db.js');
var fs = require("fs");
var inspect = require('util').inspect;
var date_utils = require('./js/date_utils.js');

var parse = require('xml-parser');
// var xml_file = process.env.CLOUD_DIR + "/db/datas/" + "Cafes.xml";

var bar_xml_file = "./db/datas/Cafes.xml";
var restaurant_xml_file = "./db/datas/Restaurants.xml";

// --------------------------------------------------------

var account = {};
var add_user = function (name, date) {
    if (!account[name]) {
        account[name] = {name : name, date : date};
    } else {
        account[name].date = date_utils.min_date(date, account[name].date);
    }

    db.add_user({ username : name, email : name + "@gmail.com", password : "default"});
};

var add_admin = function (name, date) {
    if (!account[name]) {
        account[name] = {name : name, date : date};
    } else {
        account[name].date = date_utils.min_date(date, account[name].date);
    }

    User.add_admin ({ username : name, email : name + "@gmail.com", password : "default" });
};

var parse_label = function (labels) {
    var result = [];
    for (var i = 0; i < labels.length; ++i) {
        var tmp = {};
        tmp.name = labels[i].attributes[name];

        tmp.labeler = [];

        var labeler = labels[i].children;
        for (var i = 0; i < labeler.length; ++i) {
            tmp.labeler.push(labeler[i].attributes.nickname);
            add_user(name);
        }
    }
};

var parse_comment = function (comments) {
    var result = [];
    for (var i = 0; i < comments.length; ++i) {
        var tmp = {};
        tmp.nickname = comments[i].attributes.nickname;

        tmp.date = comments[i].attributes.date;
        tmp.stars = comments[i].attributes.stars
        tmp.comment = comments[i].attributes.comment

        // Checking the user who commented.
        add_user(tmp.nickname, tmp.date);
    }
};

var parse_bars = function () {
    var obj = parse(fs.readFileSync(bar_xml_file, 'utf8'));

    // console.log(inspect(obj, { colors: true, depth: Infinity }));

    var bars_array = obj.root.children;

    for (var i = 0; i < bars_array.length; ++i) {
        var bar_obj = {};

        var bar = bars_array[i];

        var info = bar.children[0];
        var comment = bar.children[1];
        var label = bar.children[2];

        bar_obj.name = info.children[0].content;
        bar_obj.creation_date = bar.attributes.creationDate;
        bar_obj.created_by = bar.attributes.nickname;

        var address = info.children[1].children; // Array of info

        bar_obj.address_street = address[0].content;
        bar_obj.address_number = address[1].content;
        bar_obj.address_zip = address[2].content;
        bar_obj.address_town = address[3].content;

        bar_obj.longitude = address[4].content; // Must be Integer
        bar_obj.latitude =  address[5].content; // Must be Integer

        var current = 2; // Garde en mémoire le numéro utilisé mtn.

        bar_obj.phone_number = null;
        bar_obj.website = null;
        if (info.children.length > current && info.children[current].name == "Tel") {
            bar_obj.phone_number = info.children[current].content;
            ++current;
        } else if (info.children.length > current && info.children[current].name == "Site") {
            bar_obj.website = info.children[current].attributes.link;
            ++current;
        }

        if (info.children.length > current && info.children[current].name == "Tel") {
            bar_obj.phone_number = info.children[current].content;
            ++current;
        } else if (info.children > current && info.children[current].name == "Site") {
            bar_obj.website = info.children[current].attributes.link;
            ++current;
        }

        bar_obj.smokers = 0;
        bar_obj.snacks = 0;
        if (info.children.length > current) {
            if (info.children[current].name == "Smoking") {
                bar_obj.smokers = 1;
            } else if (info.children[current].name == "Snack") {
                bar_obj.snacks = 1;
            } 

            if ((info.children.length > current) && info.children[current].name == "Snack") {
                bar_obj.snacks = 1;
            }
        }

        db.new_bar(bar_obj, function () {
        
        });
    }
};

var parse_restaurant = function () {
    var obj = parse(fs.readFileSync(restaurant_xml_file, 'utf8'));

    // console.log(inspect(obj, { colors: true, depth: Infinity }));

    var restaurants_array = obj.root.children;

    for (var i = 0; i < restaurants_array.length; ++i) {
        var restaurant_obj = {};

        var restaurant = restaurants_array[i];
        var info = restaurant.children[0];

        restaurant_obj.name = info.children[0].content;
        restaurant_obj.creation_date = restaurant.attributes.creationDate;
        restaurant_obj.created_by = restaurant.attributes.nickname;

        add_admin(restaurant_obj.created_by, restaurant_obj.creation_date);

        var address = info.children[1].children; // Array of info
        restaurant_obj.address_street = address[0].content;
        restaurant_obj.address_number = address[1].content;
        restaurant_obj.address_zip = address[2].content;
        restaurant_obj.address_town = address[3].content;

        restaurant_obj.longitude = address[4].content; // Must be Integer
        restaurant_obj.latitude =  address[5].content; // Must be Integer

        var current = 2; // Garde en mémoire le numéro utilisé mtn.

        restaurant_obj.phone_number = null;
        restaurant_obj.website = null;
        if (info.children.length > current && info.children[current].name == "Tel") {
            restaurant_obj.phone_number = info.children[current].content;
            ++current;
        } else if (info.children.length > current && info.children[current].name == "Site") {
            restaurant_obj.website = info.children[current].attributes.link;
            ++current;
        }

        if (info.children.length > current && info.children[current].name == "Tel") {
            restaurant_obj.phone_number = info.children[current].content;
            ++current;
        } else if (info.children > current && info.children[current].name == "Site") {
            restaurant_obj.website = info.children[current].attributes.link;
            ++current;
        }

        var horaire = null;
        if (info.children.length > current && info.children[current].name == "Closed") {
            // restaurant_obj.phone_number = info.children[current].content; // Array of info
            ++current;
        }

        restaurant_obj.takeaway = 0;
        if (info.children.length > current && info.children[current].name == "TakeAway") {
            restaurant_obj.takeaway = 1;
            ++current;
        }

        restaurant_obj.delivery = 0;
        if (info.children.length > current && info.children[current].name == "Delivery") {
            restaurant_obj.delivery = 1;
            ++current;
        }

        restaurant_obj.price = 0;
        if (info.children.length > current && info.children[current].name == "PriceRange") {
            restaurant_obj.price = info.children[current].content;
            ++current;
        }

        restaurant_obj.seat_number = 0;
        if (info.children.length > current && info.children[current].name == "Banquet") {
            seat_number = info.children[current].attributes.capacity;
            ++current;
        }
 
        console.log(inspect(restaurant_obj, { colors: true, depth: Infinity }));
 
        // console.log("-----------------------------------------------");
        // console.log("RESTAURANT : " + name + " (created by : " +  est_create_name + " on " + est_create_date + ").");
        // console.log("Address is : " + address_street + ", " +  address_num + " : " + address_city + " (" + address_zip + ").");
        // console.log("Longitude : " + longitude + " + latitude " +  latitude);
        // console.log("Phone : " + phone_number);
        // console.log("-----------------------------------------------");

        // db.new_restaurant(latitude, longitude, name, address_street, address_city, address_num, address_zip, phone_number, website, takeaway, delivery, price, seat_number);
        db.new_restaurant(restaurant_obj, function (id) {
            // var comments = restaurant.children[1];
            // parse_comments(comments, id);

            // var labels = restaurant.children[2];
            // parse_labels(labels, id);
        });
    }
};

parse_bars();
parse_restaurant();
// update_date_user();

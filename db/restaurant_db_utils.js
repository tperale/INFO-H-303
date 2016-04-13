var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");

var misc = require('./database_misc.js');

// var file  = process.env.CLOUD_DIR + "/" + "test.db";
var file  = "./db/test.db";
var creation_script_file = "./db/create.sql";

var exists = fs.existsSync(file);

if (!exists) {
    console.log("Creating DB file.");
    fs.openSync(file, "w");
}

var db = new sqlite3.Database(file);

db.serialize(function () {
    if (!exists) {
        fs.readFile(creation_script_file, 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            db.run(data); 
        });
    }
});

module.exports = {
    new_restaurant : function (obj, callback) {
        var establishment = {
            $name : obj.name,
            $latitude : obj.latitude,
            $longitude : obj.longitude,
            $address_street : obj.address_street,
            $address_town : obj.address_town,
            $address_number : obj.address_number,
            $address_zip : obj.address_zip,
            $phone_number : obj.phone_number,
            $website : obj.website,
            $created_by : obj.created_by

        };

        var restaurant = {
            $price : obj.price,
            $seat_number : obj.seat_number,
            $takeaway : obj.takeaway,
            $delivery : obj.delivery,
            $timetable : obj.timetable
        };

        misc.insert_establishment(establishment, function (id) {
            var command = "INSERT INTO restaurant (id, price, seat_number, takeaway, delivery, timetable) VALUES (" + id + ", $price, $seat_number, $takeaway, $delivery, $timetable)";
            var st = db.prepare(command);
            st.run(restaurant, function (err) {
                if (err) {
                    console.log("ERROR WHILE INSERTING RESTAURANT : " + err);
                    return;
                }
            });
            callback(id);
        });
    },

    get_restaurant : function (id) {
        var restaurant = {
            id : id,
            type : "restaurant",
            latitude : null,
            longitude : null,
            name : null,
            address_street : null,
            address_town : null,
            address_number : null,
            address_zip : null,
            phone_number : null,
            website : null,
            created_by : null,

            price : null,
            seat_number : null,
            takeaway : null,
            delivery : null,
            timetable : null
        };

        var cmd = "SELECT latitude, longitude, name, address_street, address_town, address_zip, address_number, phone_number, website, picture, created_by FROM establishment WHERE id=" + id;
        db.get(cmd, function(err, row) {
            if (err) {
                console.log("ERROR WHILE getting id : " + err + " WITH : " + cmd); 
                return;
            } else if (!row) {
                console.log("ID does not exist.");
                return;            
            }

            restaurant.latitude = row.latitude;
            restaurant.longitude = row.longitude;
            restaurant.name = row.name;
            restaurant.address_street = row.address_street;
            restaurant.address_town = row.address_town;
            restaurant.address_number = row.address_number;
            restaurant.address_zip = row.address_zip;
            restaurant.phone_number = row.phone_number;
            restaurant.website = row.website;
            restaurant.created_by = row.created_by;
        });

        db.get("SELECT price, seat_number, takeaway, delivery, timetable FROM restaurant WHERE id=" + id, function(err, row) {
            if (err) {
                console.log("ERROR WHILE getting id : " + err + " WITH : " + cmd); 
                return;
            } else if (!row) {
                console.log("ID does not exist.");
                return;            
            }

            restaurant.price = row.price;
            restaurant.seat_number = row.seat_number;
            restaurant.takeaway = row.takeaway;
            restaurant.delivery = row.delivery;
            restaurant.timetable = row.timetable;
        });

        return restaurant;
    },

    get_restaurant_id : function (callback) {
        var result = [];

        db.all("SELECT id FROM restaurant", function (err, rows) {
            rows.map(function (currentValue, index, array) {
                result.push(currentValue.id);
            });
            callback(result);
        });

        return result;
    },

};

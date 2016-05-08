var sqlite3 = require('sqlite3').verbose();

var async = require('async');

var misc = require('./database_misc.js');

// var file  = process.env.CLOUD_DIR + "/" + "test.db";
var file  = "./db/test.db";
var creation_script_file = "./db/create.sql";

var db = new sqlite3.Database(file);

db.serialize(function () {
    db.run("PRAGMA foreign_keys = ON"); 
});

module.exports = {
    new_hotel : function (obj, callback) {
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

        var hotel = {
            $stars : obj.stars,
            $room_number : obj.room_number,
            $price : obj.price,
        };

        misc.insert_establishment(establishment, function (id) {
            var command = "INSERT INTO hotel (id, stars, room_number, price) VALUES (" + id + ", $stars, $room_number, $price)";
            var st = db.prepare(command);
            st.run(hotel, function (err) {
                if (err) {
                    console.log("ERROR WHILE INSERTING HOTEL : " + err);
                    return;
                }
                if (callback) {
                    callback(id); 
                }
            });
        });
    },

    get_hotel : function (id, callback) {
        var cmd = "SELECT e.*, h.* from establishment e INNER JOIN hotel h on e.id=h.id WHERE e.id=" + id;
        db.get(cmd, function(err, row) {
            if (err) {
                console.log("ERROR WHILE getting id : " + err + " WITH : " + cmd); 
                return;
            } else if (!row) {
                console.log("ID does not exist.");
                return;
            } else {
                row.type = "hotel";
                row.hotel = true;

                if (callback) {
                    callback(null, row);  
                }
            }
        });
    },

    get_hotel_id : function (callback) {
        db.all("SELECT id FROM hotel", function (err, rows) {
            async.map(rows, function (value, callback) {
                setTimeout(function() {                                    
                    callback(null, value.id);
                }, 200); 
            }, callback);
        });
    },
};

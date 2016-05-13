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

    update : function (id, column, value, callback) {
        var cmd = "UPDATE restaurant SET " + column + "=? WHERE id=?";
        db.run(cmd, [value, id], callback);
    },

    get_restaurant : function (id, callback) {
        var cmd = "SELECT e.*, r.* from establishment e INNER JOIN restaurant r on e.id=r.id WHERE e.id=" + id;
        db.get(cmd, function(err, row) {
            if (err) {
                console.log("ERROR WHILE getting id : " + err + " WITH : " + cmd); 
                return;
            } else if (!row) {
                console.log("ID does not exist.");
                return;            
            } else {
                row.type = "restaurant";
                row.restaurant = true;
                callback(null, row);  
            }
        });
    },

    get_restaurant_id : function (callback) {
        db.all("SELECT id FROM restaurant", function (err, rows) {
            async.map(rows, function (value, callback) {
                setTimeout(function() {                                    
                    callback(null, value.id);
                }, 200); 
            }, callback);
        });
    },

};

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
    new_hotel : function (obj, callback) 
    {
        var establishment = {
            $latitude : obj.latitude,
            $longitude : obj.longitude,
            $name : obj.name,
            $address_street : obj.address_street,
            $address_town : obj.address_town,
            $address_number : obj.address_number,
            $address_zip : obj.address_zip,
            $phone_number : obj.phone_number,
            $website : obj.website,
            $created_by : obj.creator

        };

        var hotel = {
            $stars : obj.stars,
            $room_number : obj.room_number,
            $price : obj.price
        };

        misc.insert_establishment(establishment, function (id) {
            var command = "INSERT INTO hotel (id, stars, room_number, price) VALUES (" + id + ", $stars, $room_number, $price)";
            var st = db.prepare(command);
            st.run(hotel, function (err) {
                if (err) {
                    console.log("ERROR WHILE INSERTING HOTEL : " + err);
                    return;
                }
            });
        });
    },

    get_hotel : function (id) {
        var hotel = {
            id : id,
            type : "hotel",
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

            stars : null,
            room_number : null,
            price : null
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

            hotel.latitude = row.latitude;
            hotel.longitude = row.longitude;
            hotel.name = row.name;
            hotel.address_street = row.address_street;
            hotel.address_town = row.address_town;
            hotel.address_number = row.address_number;
            hotel.address_zip = row.address_zip;
            hotel.phone_number = row.phone_number;
            hotel.website = row.website;
            hotel.created_by = row.created_by;
        });

        db.get("SELECT stars, room_number, price FROM hotel WHERE id=" + id, function(err, row) {
            if (err) {
                console.log("ERROR WHILE getting id : " + err + " WITH : " + cmd); 
                return;
            } else if (!row) {
                console.log("ID does not exist.");
                return;            
            }
            bar.smokers = row.smokers;
            bar.snacks = row.snacks;
        });

        return hotel;
    },

    get_hotel_id : function () {
        var result = [];

        db.each("SELECT id FROM hotel", function (err, row) {
            result.push(row.id);
        });

        return result;
    },


};

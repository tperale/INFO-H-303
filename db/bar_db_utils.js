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
    new_bar : function (obj, callback) {
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

        var bar = {
            $smokers : obj.smokers,
            $snacks : obj.snacks,
        };

        misc.insert_establishment(establishment, function (id) {
            var command = "INSERT INTO bar (id, smokers, snacks) VALUES (" + id + ", $smokers, $snacks)";
            var st = db.prepare(command);
            st.run(bar, function (err) {
                if (err) {
                    console.log("ERROR WHILE INSERTING BAR : " + err);
                    return;
                }
                if (callback) {
                    callback(id); 
                }
            });
        });
    },

    get_bar : function (id) {
        var bar = {
            id : id,
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

            smokers : null,
            snacks : null
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

            bar.latitude = row.latitude;
            bar.longitude = row.longitude;
            bar.name = row.name;
            bar.address_street = row.address_street;
            bar.address_town = row.address_town;
            bar.address_number = row.address_number;
            bar.address_zip = row.address_zip;
            bar.phone_number = row.phone_number;
            bar.website = row.website;
            bar.created_by = row.created_by;
        });

        db.get("SELECT smokers, snacks FROM bar WHERE id=" + id, function(err, row) {
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

        return bar;
    },
};

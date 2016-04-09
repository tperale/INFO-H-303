var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");

// var file  = process.env.CLOUD_DIR + "/" + "test.db";
var file  = "./db/test.db";
var creation_script_file = "create.sql";

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

/*
 * {
 *  latitude,
 *  longitude,
 *  name,
 *  address_street,
 *  address_town,
 *  address_number,
 *  phone_number,
 *  website,
 *  picture,
 *  created_by
 * }
 */
var insert_establishment = function (establishment, callback) {
    var command = "INSERT INTO establishment (latitude, longitude, name, address_street, address_town, address_zip, address_number, phone_number, website, picture, created_by)\
                                    VALUES ($latitude, $longitude, $name, $address_street, $address_town, $address_zip, $address_number, $phone_number, $website, $picture, $created_by)";
    var st = db.prepare(command);

    console.log(command);

    st.run(establishment, function (err) {
        if (err) {
            console.log("ERROR WHILE INSERTING ESTABLISHMENT : " + err); 
            return;
        }
        var cmd = "SELECT id FROM establishment WHERE latitude=" + establishment.$latitude + " AND longitude=" + establishment.$longitude;
        db.get(cmd, function(err, row) {
            if (err) {
                console.log("ERROR WHILE getting id : " + err + " WITH : " + cmd); 
                return;
            }
            console.log("ROW ID " + row.id);
            callback(row.id); 
        });
    });
};

module.exports = {
    new_hotel : function () {
        var stmt = db.prepare("INSERT INTO VALUES (?)");
        for (var i = 0; i < 10; i++) {
            stmt.run("Ipsum " + i);
        }
        stmt.finalize();
    },

    get_hotel : function (id) {
        
    },

    new_bar : function (latitude,
                        longitude,
                        name,
                        address_street,
                        address_town,
                        address_number,
                        address_zip,
                        phone_number,
                        website,
                        smoker,
                        snacks,
                        creator) 
    {
        var establishment = {
            $latitude : latitude,
            $longitude : longitude,
            $name : name,
            $address_street : address_street,
            $address_town : address_town,
            $address_number : address_number,
            $address_zip : address_zip,
            $phone_number : phone_number,
            $website : website,
            $created_by : creator
        };

        var bar = {
            $smoker : smoker,
            $snacks : snacks,
        };

        insert_establishment(establishment, function (id) {
            var command = "INSERT INTO bar (id, smoker_allowed, snacks) VALUES (" + id + ", $smoker, $snacks)";
            var st = db.prepare(command);
            st.run(bar, function (err) {
                if (err) {
                    console.log("ERROR WHILE INSERTING BAR : " + err);
                    return;
                }
            });
        });
    },

    get_bar : function (id) {
        var bar = {
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

            smoker : null,
            snacks : null
        };

        var cmd = "SELECT latitude, longitude, name, address_street, address_town, address_zip, address_number, phone_number, website, picture, created_by FROM establishment WHERE id=" + id;
        db.get(cmd, function(err, row) {
            if (err) {
                console.log("ERROR WHILE getting id : " + err + " WITH : " + cmd); 
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
            console.log("OKOK");
        });

        db.get("SELECT smoker_allowed, snacks FROM bar WHERE id=" + id, function(err, row) {
            if (err) {
                console.log("ERROR WHILE getting id : " + err + " WITH : " + cmd); 
                return;
            }
            bar.smoker = row.smoker_allowed;
            bar.snacks = row.snacks;
        });

        return bar;
    },

    get_establishment_type : function (id) {
        var result = {};

        db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
            console.log(row.id + ": " + row.info);
        });
    },

    search_establishment : function (name) {
        var result = [];

        db.each("SELECT id, name FROM establishment WHERE name LIKE '%" + name + "%';", function(err, row) {
            result.push({ 
                id : row.id,
                name : row.name
            });
        });
    },

    get_establishment_locations : function () {
        return [{latitude : 50.8491, longitude : 4.3659}, {latitude : 50.8391, longitude : 4.3750}, {latitude : 50.8500, longitude : 4.3650}];
    }
};

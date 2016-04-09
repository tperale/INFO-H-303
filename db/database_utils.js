var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");

// var file  = process.env.CLOUD_DIR + "/" + "test.db";
var file  = "test.db";
var creation_script_file = process.env.CLOUD_DIR + "/" + "create.sql";

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
 *  creator
 * }
 */
var insert_establishment = function (establishment, callback) {
    // var stmt = db.prepare("INSERT INTO establishment (latitude, longitude, name, address_street, address_town, address_number, phone_number, website, picture, creation_date, created_by) VALUES (?)");
    var command = "INSERT INTO establishment (latitude, longitude, name, address_street, address_town, address_zip, address_number, phone_number, website, picture, created_by) VALUES (";

    command += establishment.latitude + ", ";
    command += establishment.longitude + ", ";
    command += "\"" + establishment.name + "\"" + ", ";
    command += "\"" + establishment.address_street + "\"" + ", ";
    command += "\"" + establishment.address_town + "\"" +  ", ";
    command += establishment.address_zip + ", ";
    command += establishment.address_number + ", ";
    command += "\"" + establishment.phone_number + "\"" + ", ";
    command += establishment.website + ", ";
    // command += establishment.picture + ", ";
    command += null + ", ";
    command += "\"" + establishment.creator + "\"";

    command += ")"

    console.log(command);

    // stmt.run(command, function (err, row) {
    db.run(command, function (err) {
        if (err) {
            console.log("ERROR WHILE INSERTING ESTABLISHMENT : " + err); 
            console.log(err);
        }
        var cmd = "SELECT id FROM establishment WHERE latitude=" + establishment.latitude + " AND longitude=" + establishment.longitude;
        db.get(cmd, function(err, row) {
            if (err) {
                console.log("ERROR WHILE getting id : " + err + " WITH : " + cmd); 
                return;
            }
            console.log("ROW ID " + row.id);
            callback(establishment, row.id); 
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
        var bar = {
            latitude : latitude,
            longitude : longitude,
            name : name,
            address_street : address_street,
            address_town : address_town,
            address_number : address_number,
            address_zip : address_zip,
            phone_number : phone_number,
            website : website,
            smoker : smoker,
            snacks : snacks,
            creator : creator
        };

        insert_establishment(bar, function (obj, id) {
            var command = "INSERT INTO bar (id, smoker_allowed, snacks) VALUES (" + id + ", " + obj.smoker + ", " + obj.snacks + ")";
            db.run(command, function (err, row) {
                if (err) {
                    console.log("ERROR WHILE INSERTING BAR : " + err);
                    return;
                }
            });
        });
    },

    get_hotel : function (id) {

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

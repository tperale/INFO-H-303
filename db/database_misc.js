var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");

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
    insert_establishment : function (establishment, callback) {
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
                if (callback)
                    callback(row.id); 
            });
        });
    }
};

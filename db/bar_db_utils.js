var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");

var async = require('async');

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

    get_bar : function (id, callback) {
        var cmd = "SELECT e.*, b.* from establishment e INNER JOIN bar b on e.id=b.id WHERE e.id=" + id;
        db.get(cmd, function(err, row) {
            if (err) {
                console.log("ERROR WHILE getting id : " + err + " WITH : " + cmd); 
            } else if (!row) {
                console.log("ID does not exist.");
            } else {
                row.type = "bar";
                row.bar = true;
                callback(null, row);  
            }
        });
    },

    get_bar_id : function (callback) {
        db.all("SELECT id FROM bar", function (err, rows) {
            async.map(rows, function (value, callback) {
                setTimeout(function() {                                    
                    callback(null, value.id);
                }, 200); 
            }, callback);
        });
    },
};

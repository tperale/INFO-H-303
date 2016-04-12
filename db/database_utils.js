var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");

// var file  = process.env.CLOUD_DIR + "/" + "test.db";
var file  = "./db/test.db";
var creation_script_file = "./db/create.sql";

var exists = fs.existsSync(file);

var restaurant_db_utils = require('./restaurant_db_utils.js');
var bar_db_utils = require('./bar_db_utils.js');
var hotel_db_utils = require('./hotel_db_utils.js');

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
    new_hotel : hotel_db_utils.new_hotel,

    get_hotel : hotel_db_utils.get_hotel,

    /* latitude,
     * longitude,
     * name,
     * address_street,
     * address_town,
     * phone_number,
     * website,
     * creator,
     * price,
     * seat_number,
     * takeaway,
     * delivery,
     * timetable
     */

    get_restaurant : restaurant_db_utils.get_restaurant,
    new_restaurant : restaurant_db_utils.new_restaurant,

    new_bar : bar_db_utils.new_bar,
    get_bar : bar_db_utils.get_bar,

    add_user : function (obj, callback) {
        var user = {
            
        };
    },

    add_admin : function (obj, callback) {
        db.get("SELECT username FROM account WHERE username=" + obj.username, function(err, row) {
            // if (err) {
            //     console.log("ERROR getting username (" + obj.username + ") in ACCOUNT : " + err);
            //     return;
            // }

            if (row) {
                // User already exist, promotion to admin.
                db.run("UPDATE account SET admin=1 WHERE username=" + obj.username, function (err) {
                    if (err) {
                        console.log("CANNOT update to admin.");
                    }
                    callback();
                });
            } else {
                // Undefined row, need to add new user.
                var admin = {};
                admin.$username = obj.username;

                if (obj.email) {
                    admin.$email = obj.email;
                } else {
                    admin.$email = obj.username + "@horeca.com";
                }

                if (obj.password) {
                    admin.$password = obj.password;
                } else {
                    admin.$password = "admin";
                }

                var command = "INSERT INTO account (username, email, password, admin) VALUES ($username, $email, $password, 1)";
                var st = db.prepare(command);
                st.run(admin, function (err) {
                    if (err) {
                        console.log("ERROR WHILE INSERTING ACCOUNT : " + err);
                        return;
                    }
                    if (callback) 
                        callback();
                });
            }
        });
    },

    get_establishment_type : function (id, callback) {
        db.get("SELECT id FROM bar WHERE id=" + id, function(err, row) {
            if (err) {
                console.log(err); 
                return;
            } else if (!row) {
                return;
            }
            callback("bar");
        });

        db.get("SELECT id FROM restaurant WHERE id=" + id, function(err, row) {
            if (err) {
                console.log(err); 
                return;
            } else if (!row) {
                return;
            }
            callback("restaurant");
        });

        db.get("SELECT id FROM hotel WHERE id=" + id, function(err, row) {
            if (err) {
                console.log(err); 
                return;
            } else if (!row) {
                return;
            }
            callback("hotel");
        });
    },

    get_establishment_image : function (id, callback) {
    
    },

    search_establishment : function (name) {
        var result = [];

        db.each("SELECT id, name FROM establishment WHERE name LIKE '%" + name + "%'", function(err, row) {
            result.push({ 
                id : row.id,
                name : row.name
            });
        });
    },

    pick_random : function (number, establishment_number) {
        var result = [];
        for (var i = 0; i < number; ++i) {
            var id = Math.floor(Math.random() * (establishment_number + 1));
            console.log(" RANDOM : " + id);
            this.get_establishment_type (id, function (type) {
                switch (type) {
                    case "bar":
                        result.push(bar_db_utils.get_bar(id));
                        // result.push(id);
                        break;
                    case "restaurant":
                        result.push(restaurant_db_utils.get_restaurant(id));
                        // result.push(id);
                        break;
                    case "hotel":
                        result.push(hotel_db_utils.get_hotel(id));
                        // result.push(id);
                        break;
                }
            });
        }
        return result;
    },

    get_establishment_locations : function (callback) {
        var result = [];

        db.each("SELECT id, name, latitude, longitude FROM establishment", function(err, row) {
            result.push({ 
                latitude : row.latitude,
                longitude : row.longitude,
                name : row.name,
                id : row.id
            });
        }, function (err, row) {
            if (err) {
                console.log(err);            
            }
            callback(result);
        });
    }
};

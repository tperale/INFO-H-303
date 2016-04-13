var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");
var async = require("async");

// var file  = process.env.CLOUD_DIR + "/" + "test.db";
var file  = "./db/test.db";
var creation_script_file = "./db/create.sql";

var exists = fs.existsSync(file);

var restaurant_db_utils = require('./restaurant_db_utils.js');
var bar_db_utils = require('./bar_db_utils.js');
var hotel_db_utils = require('./hotel_db_utils.js');

var Random = require('random-js');
var range = require('range');

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

var get_establishment_type = function (id, callback) {
    db.get("SELECT id FROM bar WHERE id=" + id, function(err, row) {
        if (err) {
            console.log(err); 
            return;
        } else if (!row) {
            return;
        }
        callback("bar", id);
    });

    db.get("SELECT id FROM restaurant WHERE id=" + id, function(err, row) {
        if (err) {
            console.log(err); 
            return;
        } else if (!row) {
            return;
        }
        callback("restaurant", id);
    });

    db.get("SELECT id FROM hotel WHERE id=" + id, function(err, row) {
        if (err) {
            console.log(err); 
            return;
        } else if (!row) {
            return;
        }
        callback("hotel", id);
    });
};


var get_establishment = function (id, callback) {
    get_establishment_type(id, function (type, id) {
        switch (type) {
            case "bar":
                callback(bar_db_utils.get_bar(id));
                break;
            case "restaurant":
                callback(restaurant_db_utils.get_restaurant(id));
                break;
            case "hotel":
                callback(hotel_db_utils.get_hotel(id));
        }  
    });
};

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

    get_establishment_type : get_establishment_type,

    get_establishment : get_establishment,
        
    get_establishment_image : function (id, callback) {
        db.get("SELECT image FROM establishment WHERE id=" + id, callback);
    },

    search_establishment : function (name, callback) {
        db.all("SELECT id FROM establishment WHERE UPPER(name) LIKE '%" + name.toUpperCase().replace(" ", "%") + "%'", function(err, rows) {
            async.map(rows, function (values, callback) {
                get_establishment(values.id, function (establishment) {
                    var result = establishment;

                    setTimeout(function() { 
                        callback(null, result);
                    }, 200); 
                });
            }, callback);
        });
    },

    pick_random_from : function (number, array) {
        var result = [];

        var random_id = Random.sample(Random.engines.nativeMath, array, number);

        random_id.map(function (currentValue, index, array) {
            get_establishment_type (currentValue, function (type, id) {
                switch (type) {
                    case "bar":
                        result.push(bar_db_utils.get_bar(id));
                        break;
                    case "restaurant":
                        result.push(restaurant_db_utils.get_restaurant(id));
                        break;
                    case "hotel":
                        result.push(hotel_db_utils.get_hotel(id));
                        break;
                }
            });
        });

        return result;
    },

    pick_random : function (number, establishment_number) {
        return this.pick_random_from (number, range.range(1, establishment_number + 1));
    },

    pick : function (type, callback) {
        switch (type) {
            case "bar":
                bar_db_utils.get_bar_id(callback);
                break;
            case "restaurant":
                restaurant_db_utils.get_restaurant_id(callback);
                break;
            case "hotel":
                hotel_db_utils.get_hotel_id(callback);
                break;
        }
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

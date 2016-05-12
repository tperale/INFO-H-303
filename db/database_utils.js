var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");
var async = require("async");

// var file  = process.env.CLOUD_DIR + "/" + "test.db";
var file  = "./db/test.db";
var creation_script_file = "./db/create.sql";

var Restaurant = require('./restaurant_db_utils.js');
var Bar = require('./bar_db_utils.js');
var Hotel = require('./hotel_db_utils.js');

var Random = require('random-js');
var range = require('range');

var db = new sqlite3.Database(file);

db.serialize(function () {
    db.run("PRAGMA foreign_keys = ON"); 
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
                Bar.get_bar(id, callback);
                break;
            case "restaurant":
                Restaurant.get_restaurant(id, callback)
                break;
            case "hotel":
                Hotel.get_hotel(id, callback);
        }  
    });
};

module.exports = {
    remove : function (id, callback) {
        cmd = "DELETE FROM establishment WHERE id=" + id;

        db.run(cmd, function (err) {
            callback(err);
        });
    },


    new_hotel : Hotel.new_hotel,

    get_hotel : Hotel.get_hotel,

    get_restaurant : Restaurant.get_restaurant,
    new_restaurant : Restaurant.new_restaurant,

    new_bar : Bar.new_bar,
    get_bar : Bar.get_bar,

    get_establishment_type : get_establishment_type,

    get_establishment : get_establishment,

    get_name : function (id, callback) {
        db.get("SELECT name FROM establishment WHERE id=" + id, function (err, row) {
            if (err) {
                console.log("ERROR GETTING name : " + err); 
                callback(err, null);
            }
            callback(null, row.name);
        });
    },
        
    get_establishment_image : function (id, callback) {
        db.get("SELECT * FROM establishment WHERE id=" + id, function (err, row) {
            if (err) {
                console.log("ERROR GETTING PICTURE : " + err); 
                callback(err, null);
            }
            callback(null, row);
        });
    },

    rankings : function (callback) {
        var cmd = "SELECT e.* \
            FROM establishment AS e, comments AS c \
            WHERE e.id=c.establishment_id \
            GROUP BY c.establishment_id HAVING COUNT(c.establishment_id)>=3 \
            ORDER BY AVG(c.rating) DESC";
        db.all(cmd, callback);
    },

    discover : function (callback) {
        var cmd = "SELECT e.* \
            FROM establishment e, comments c \
            WHERE e.id=c.establishment_id \
            GROUP BY c.establishment_id HAVING COUNT(c.establishment_id)<=1"    
        db.all(cmd, callback);
    },

    update : function (id, column, value, callback) {
        var cmd = "UPDATE establishment SET " + column + "=";
        if (typeof(value) == "number") {
            cmd += String(value);
        } else {
            cmd += "'" + String(value) + "'";
        }
        cmd += " WHERE id=" + id;
        db.run(cmd, callback);
    },

    insert_picture : function (id, image, callback) {
        db.run("UPDATE establishment SET picture=? WHERE id=?", image, id, callback);
    },

    search_establishment : function (name, callback) {
        db.all("SELECT id FROM establishment WHERE UPPER(name) LIKE '%" + name.toUpperCase().replace(" ", "%") + "%'", function(err, rows) {
            async.map(rows, function (values, callback) {
                get_establishment(values.id, function (err, establishment) {
                    setTimeout(function() { 
                        callback(null, establishment);
                    }, 200); 
                });
            }, callback);
        });
    },

    pick_random_from : function (number, array, callback) {
        if (array.length == 0) {
            return callback(null, array);        
        }

        var random_id = Random.sample(Random.engines.nativeMath, array, number);

        console.log("sample : " + random_id);

        async.map(random_id, function (value, callback) {
            get_establishment_type (value, function (type, id) {
                console.log("type is : " + type);
                switch (type) {
                    case "bar":
                        Bar.get_bar(id, function (err, result) {
                            callback(err, result);
                        });
                        break;
                    case "restaurant":
                        Restaurant.get_restaurant(id, function (err, result) {
                            callback(err, result);
                        });
                        break;
                    case "hotel":
                        Hotel.get_hotel(id, function (err, result) {
                            callback(err, result);
                        });
                        break;
                }
            });
        }, callback);
    },

    pick : function (type, callback) {
        switch (type) {
            case "bar":
                Bar.get_bar_id(callback);
                break;
            case "restaurant":
                Restaurant.get_restaurant_id(callback);
                break;
            case "hotel":
                Hotel.get_hotel_id(callback);
                break;
            default:
                db.all("SELECT id FROM establishment", function (err, rows) {
                    async.map(rows, function (value, callback) {
                        setTimeout(function() { 
                            callback(null, value.id);
                        }, 200); 
                    }, callback);
                });
        }
    },

    get_establishment_locations : function (callback) {
        db.all("SELECT id, name, latitude, longitude FROM establishment", function(err, row) {
            if (err) {
                console.log(err);            
            }
            callback(row);
        });
    }
};

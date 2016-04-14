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
                bar_db_utils.get_bar(id, callback);
                break;
            case "restaurant":
                restaurant_db_utils.get_restaurant(id, callback)
                break;
            case "hotel":
                hotel_db_utils.get_hotel(id, callback);
        }  
    });
};

module.exports = {
    new_hotel : hotel_db_utils.new_hotel,

    get_hotel : hotel_db_utils.get_hotel,

    get_restaurant : restaurant_db_utils.get_restaurant,
    new_restaurant : restaurant_db_utils.new_restaurant,

    new_bar : bar_db_utils.new_bar,
    get_bar : bar_db_utils.get_bar,

    get_establishment_type : get_establishment_type,

    get_establishment : get_establishment,
        
    get_establishment_image : function (id, callback) {
        db.get("SELECT image FROM establishment WHERE id=" + id, callback);
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
        var random_id = Random.sample(Random.engines.nativeMath, array, number);

        async.map(random_id, function (values, callback) {
            get_establishment_type (values.id, function (type, id) {
                switch (type) {
                    case "bar":
                        bar_db_utils.get_bar(id, function (err, result) {
                             setTimeout(function() { 
                                callback(null, result);
                            }, 200); 
                        });
                        break;
                    case "restaurant":
                        restaurant_db_utils.get_restaurant(id, function (err, result) {
                            setTimeout(function() { 
                                callback(null, result);
                            }, 200); 
                        });
                        break;
                    case "hotel":
                        hotel_db_utils.get_hotel(id, function (err, result) {
                            setTimeout(function() { 
                                callback(null, result);
                            }, 200); 
                        });
                        break;
                }
            });
        }, callback);
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
            default:
                db.all("SELECT id FROM establishment", callback)
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

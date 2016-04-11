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
            if (callback)
                callback(row.id); 
        });
    });
};

module.exports = {
    new_hotel : function (latitude,
                          longitude,
                          name,
                          address_street,
                          address_town,
                          address_number,
                          address_zip,
                          phone_number,
                          website,
                          creator,
                          stars,
                          room_number,
                          price) 
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

        var hotel = {
            $stars : stars,
            $room_number : room_number,
            $price : price
        };

        insert_establishment(establishment, function (id) {
            var command = "INSERT INTO hotel (id, stars, room_number, price) VALUES (" + id + ", $stars, $room_number, $price)";
            var st = db.prepare(command);
            st.run(bar, function (err) {
                if (err) {
                    console.log("ERROR WHILE INSERTING HOTEL : " + err);
                    return;
                }
            });
        });
    },

    get_hotel : function (id) {
        var hotel = {
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
            bar.smoker = row.smoker_allowed;
            bar.snacks = row.snacks;
        });

        return hotel;
    },

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
    new_restaurant : function (obj, callback) {
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

        var restaurant = {
            $price : obj.price,
            $seat_number : obj.seat_number,
            $takeaway : obj.takeaway,
            $delivery : obj.delivery,
            $timetable : obj.timetable
        };

        insert_establishment(establishment, function (id) {
            var command = "INSERT INTO restaurant (id, price, seat_number, takeaway, delivery, timetable) VALUES (" + id + ", $price, $seat_number, $takeaway, $delivery, $timetable)";
            var st = db.prepare(command);
            st.run(restaurant, function (err) {
                if (err) {
                    console.log("ERROR WHILE INSERTING BAR : " + err);
                    return;
                }
            });
            callback(id);
        });
    },

    get_restaurant : function (id) {
        var restaurant = {
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

            price : null,
            seat_number : null,
            takeaway : null,
            delivery : null,
            timetable : null
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

            restaurant.latitude = row.latitude;
            restaurant.longitude = row.longitude;
            restaurant.name = row.name;
            restaurant.address_street = row.address_street;
            restaurant.address_town = row.address_town;
            restaurant.address_number = row.address_number;
            restaurant.address_zip = row.address_zip;
            restaurant.phone_number = row.phone_number;
            restaurant.website = row.website;
            restaurant.created_by = row.created_by;
            console.log("OKOK");
        });

        db.get("SELECT price, seat_number, takeaway, delivery, timetable FROM restaurant WHERE id=" + id, function(err, row) {
            if (err) {
                console.log("ERROR WHILE getting id : " + err + " WITH : " + cmd); 
                return;
            } else if (!row) {
                console.log("ID does not exist.");
                return;            
            }

            restaurant.price = row.price;
            restaurant.seat_number = row.seat_number;
            restaurant.takeaway = row.takeaway;
            restaurant.delivery = row.delivery;
            restaurant.timetable = row.timetable;
        });

        return bar;
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
            console.log("OKOK");
        });

        db.get("SELECT smoker_allowed, snacks FROM bar WHERE id=" + id, function(err, row) {
            if (err) {
                console.log("ERROR WHILE getting id : " + err + " WITH : " + cmd); 
                return;
            } else if (!row) {
                console.log("ID does not exist.");
                return;            
            }
            bar.smoker = row.smoker_allowed;
            bar.snacks = row.snacks;
        });

        return bar;
    },

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

    search_establishment : function (name) {
        var result = [];

        db.each("SELECT id, name FROM establishment WHERE name LIKE '%" + name + "%'", function(err, row) {
            result.push({ 
                id : row.id,
                name : row.name
            });
        });
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

var sqlite3 = require('sqlite3').verbose();
var async = require('async');

var file  = "./db/test.db";

var db = new sqlite3.Database(file);

db.serialize(function () {});

module.exports = {
    add_comment : function (establishment_id, username, rating, picture, comment, callback) {
        var comment = {
            $establishment_id : establishment_id,
            $username : username,
            $rating : rating,  
            $picture : picture,
            $comment_text : comment 
        };

        var command = "INSERT INTO comments (establishment_id, username, rating, picture_attached, comment_text) VALUES ($establishment_id, $username, $rating, $picture, $comment_text)";
        var st = db.prepare(command);
        st.run(comment, function (err) {
            if (err) {
                console.log("Error inserting comment " + err);
            } else if (callback) {
                callback(); 
            }
        });
    },

    get_attached_picture : function (name, timestamp, callback) {
        db.get("SELECT picture_attached FROM comments WHERE username='" + name + "' AND timestamp='" + timestamp + "'", function (err, row) {
            if (err) {
                console.log("Error getting picture from comment : " + err);
                callback(err, null);
            } else if (row) {
                callback(null, row.picture_attached);
            } else {
                console.log("No result.");
            }
        });
    },

    remove_comment : function (id, callback) {
        db.run("DELETE FROM comments WHERE id=" + id, callback);
    },

    /* @desc : Get comments from an establishment.
     *
     * @param {establishment_id} : ID of the establishment.
     *
     * @param {callback} : function (err, result) {}
     */
    get_comments : function (establishment_id, callback) {
        db.all("SELECT * FROM comments WHERE establishment_id=" + establishment_id + " ORDER BY timestamp", function (err, rows) {
            if (err) {
                callback(err, null); 
            } else {
                async.map(rows, function (values, callback) {
                    setTimeout(function() { 
                        callback(null, values);
                    }, 200); 
                }, callback);
            }
        });            
    },

    get_all : function (name, callback) {
         db.all("SELECT * FROM comments WHERE username='" + name + "' ORDER BY timestamp", function (err, rows) {
            if (err) {
                callback(err, null); 
            } else {
                async.map(rows, function (values, callback) {
                    setTimeout(function() { 
                        callback(null, values);
                    }, 200); 
                }, callback);
            }
        });            
    },

    get_average : function (establishment_id, callback) {
         db.get("SELECT AVG(rating) as score FROM comments WHERE establishment_id=" + establishment_id, function (err, row) {
             if (err) {
                 callback (err, null);
             } else {
                 callback (null, row.score);
             }
         });
    },
};

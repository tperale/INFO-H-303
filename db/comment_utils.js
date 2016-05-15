var sqlite3 = require('sqlite3').verbose();
var async = require('async');

var file  = "./db/test.db";

var db = new sqlite3.Database(file);

db.serialize(function () {
    db.run("PRAGMA foreign_keys = ON"); 
});

var delete_vote = function (username, comment_id, callback) {
    db.run("DELETE FROM comment_rating WHERE username='" + username + "' AND comments=" + comment_id, callback)
};

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
        db.get("SELECT picture_attached FROM comments WHERE username='" + name + "' AND timestamp='" + timestamp + "' ORDER BY timestamp DESC", function (err, row) {
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
        var cmd = "SELECT * FROM comments WHERE establishment_id=" + establishment_id + " ORDER BY timestamp"
        db.all(cmd, function (err, rows) {
            if (err) {
                callback(err, null); 
            }
            async.map(rows, function (comment_row, callback) {
                var rates = "SELECT * FROM comment_rating WHERE comments=" + comment_row.id;
                db.all(rates, function (err, rating_rows) {
                    if (err) {
                        callback(err, null);
                    }
                    comment_row.ratings = rating_rows;
                    callback(null, comment_row);
                });
            }, callback);
        });            
    },

    upvote : function (username, comments, callback) {
        var comment_rating = {
            $username : username,
            $comments : comments,
            $up : 1
        };

        delete_vote(username, comments, function (err) {
            if (err) {
                callback(err)
            }

            var command = "INSERT INTO comment_rating (username, comments, up) VALUES ($username, $comments, $up)";
            var st = db.prepare(command);
            st.run(comment_rating, function (err) {
                if (err) {
                    console.log("Error inserting comment rate " + err);
                } else if (callback) {
                    callback(); 
                }
            });
        });
    },

    downvote : function (username, comments, callback) {
        var comment_rating = {
            $username : username,
            $comments : comments,
            $down : 1
        };

        delete_vote(username, comments, function (err) {
            if (err) {
                callback(err)
            }

            var command = "INSERT INTO comment_rating (username, comments, down) VALUES ($username, $comments, $down)";
            var st = db.prepare(command);
            st.run(comment_rating, function (err) {
                if (err) {
                    console.log("Error inserting comment rate " + err);
                } else if (callback) {
                    callback(); 
                }
            });
        });
    },



    /* @desc : Get all commands from a username.
     *
     * @param {name} : User to retrive comments from.
     *
     * @param {callback} : function (err, results) {}
     */
    get_all : function (name, callback) {
         db.all("SELECT c.*, e.name AS establishment_name FROM comments AS c, establishment AS e WHERE username='" + name + "' AND c.establishment_id=e.id ORDER BY timestamp", callback);
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

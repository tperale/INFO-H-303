var sqlite3 = require('sqlite3').verbose();
var async = require('async');

var file  = "./db/test.db";

var db = new sqlite3.Database(file);

db.serialize(function () {});

module.exports = {
    add_label : function (establishment_id, username, text, callback) {
        var label = {
            $id : establishment_id,
            $username : username,
            $name : text
        };

        var command = "INSERT INTO label (establishment_id, username, name) VALUES ($id, $username, $name)";
        var st = db.prepare(command);
        st.run(label, function (err) {
            if (err) {
                console.log(err);
            } else if (callback) {
                callback(); 
            }
        });
    },

    remove_label : function (id, callback) {
        db.run("DELETE FROM label WHERE id=" + id, callback);
    },

    /* @desc : 
     *
     * @param {establishment_id} :
     *
     * @param {callback} : function (err, result) {}
     */
    get_labels : function (establishment_id, callback) {
        // TODO ne pas loader les doublons.
        db.all("SELECT id, name FROM label WHERE establishment_id=" + establishment_id + " GROUP BY name ORDER BY COUNT(name)", function (err, rows) {
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
    }
};

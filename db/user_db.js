var sqlite3 = require('sqlite3').verbose();

var file  = "./db/test.db";

var db = new sqlite3.Database(file);

db.serialize(function () {
    db.run("PRAGMA foreign_keys = ON"); 
});

function Account (name, admin) {
    this.name = name;

    this.admin = admin;

    this.verify = function (password, callback) {
        var cmd = "SELECT username FROM account WHERE username='" + this.name + "' AND password='" + password + "'";
        db.get(cmd, function (err, row) {
            if (err) {
                callback(err, null); 
            } else if (row) {
                // Si l'utilisateur a été trouvé.
                callback(null, true);
            } else {
                // Résultat indéfini donc on a rien trouvé dans la bdd.
                callback(null, false);
            }
        });
    };
}

module.exports = {
    find : function (username, callback) {
        db.get("SELECT username, admin FROM account WHERE username='" + username + "'", function (err, row) {
            if (err) {
                callback(err, null); 
            } else if (row) {
                // Si l'utilisateur a été trouvé.
                callback(null, new Account(row.username, row.admin));
            } else {
                // Résultat indéfini donc on a rien trouvé dans la bdd.
                callback(null, null);
            }
        }) 
    },

    remove : function (name, callback) {
        db.run("DELETE FROM account WHERE username='" + name + "'", callback);
    },

    // create : function (obj) {
    //     var user = {
            
    //     };

    //     db.run("INSERT username, email, password 
    // }

    add_user : function (obj, callback) {
        var user = {
            $username : obj.username,
            $email : obj.email,
            $password : obj.password
        };

        var command = "INSERT INTO account (username, email, password) VALUES ($username, $email, $password)";
        var st = db.prepare(command);
        st.run(user, function (err) {
            if (err) {
                callback(err, null);
                return;
            }
            if (callback) {
                callback(null, new Account(obj.username, 0));
            }
        });
    },

    /* @desc : Promote or add a user to administration post.
     *
     * @param {obj} : { username : ...,
     *                  email : ...,
     *                  password : ...,
     *                }
     *
     * @param {callback} : 
     */
    add_admin : function (obj, callback) {
        db.get("SELECT username FROM account WHERE username='" + obj.username + "'", function(err, row) {
            if (err) {
                callback(err, null);
            } else if (row) {
                // User already exist, promotion to admin.
                db.run("UPDATE account SET admin=1 WHERE username=" + obj.username, function (err) {
                    if (err) {
                        console.log("CANNOT update to admin.");
                    } else {
                        callback(null, new Account(obj.username, 1));
                    }
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
                        callback(null, new Account(obj.username, 1));
                });
            }
        });
    },
};

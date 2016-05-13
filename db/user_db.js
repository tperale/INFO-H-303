var sqlite3 = require('sqlite3').verbose();

var file  = "./db/test.db";

var db = new sqlite3.Database(file);

db.serialize(function () {
    db.run("PRAGMA foreign_keys = ON"); 
});

function Account (obj) {
    this.name = obj.username;
    this.admin = obj.admin;
    this.email = obj.email;
    this.creation_date = obj.creation_date;

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
        db.get("SELECT * FROM account WHERE username='" + username + "'", function (err, row) {
            if (err) {
                callback(err, null); 
            } else if (row) {
                // Si l'utilisateur a été trouvé.
                callback(null, new Account(row));
            } else {
                // Résultat indéfini donc on a rien trouvé dans la bdd.
                callback(null, null);
            }
        }) 
    },

    search : function (query, callback) {
        db.all("SELECT * FROM account WHERE username LIKE '%" + query + "%'", function (err, rows) {
            if (err) {
                callback(err, null); 
            } else if (rows) {
                // Si l'utilisateur a été trouvé.
                callback(null, rows);
            } else {
                // Résultat indéfini donc on a rien trouvé dans la bdd.
                callback(null, null);
            }
        }) 
    },

    update : function (username, column, value, callback) {
        var cmd = "UPDATE account SET " + column +  "=? WHERE username=?";
        // var cmd = "UPDATE account SET " + column + "=";
        // if (typeof(value) == "number") {
        //     cmd += String(value);
        // } else {
        //     cmd += "'" + String(value) + "'";
        // }
        // cmd += " WHERE id=" + id;
        db.run(cmd, [value, username], callback);
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
                callback(null, new Account(obj));
            }
        });
    },

    /* @desc : Donne une liste de personne que l'utilisateur entré en
     *      paramètre a des chances d'aimer.
     * @param {name} : Uitlisateur pour lequel on veut trouver d'autres utilisateurs.
     * @param {callback} : function (err, results) pass la liste des utilisateurs qui 
     *      ont aimé trois établissement que {name} a aimé.
     */
    like : function (name, callback) {
        var cmd = "SELECT DISTINCT c1.username FROM comments AS c1 \
            INNER JOIN comments AS c2 ON ?= c2.username \
                AND c1.establishment_id=c2.establishment_id \
                AND c2.rating>=4 AND c1.rating>=4 \
            WHERE c1.username!=?\
            GROUP BY c1.username \
            HAVING COUNT(c1.username)>=3"
        db.all(cmd, [name, name], callback);
    },

    /* @desc : Met à jour le status d'administrateur d'un utilisateur.
     *
     * @param {name} :
     * @param {admin} : 
     * @param {callback} : function(err)
     */
    update_admin : function (name, admin, callback) {
        db.run("UPDATE account SET admin=? WHERE username=?", [admin, name], callback);
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
                        obj.admin = 1;
                        callback(null, new Account(obj));
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
                        obj.admin = 1;
                        callback(null, new Account(obj));
                });
            }
        });
    },

    get_all : function (callback) {
        db.all("SELECT * FROM account", callback);
    }
};

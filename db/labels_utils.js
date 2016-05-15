var sqlite3 = require('sqlite3').verbose();
var async = require('async');

var file  = "./db/test.db";

var db = new sqlite3.Database(file);

db.serialize(function () {
    db.run("PRAGMA foreign_keys = ON"); 
});



/* @desc : Model pour faciliter l'ajout de label à la base de donnée.
 *
 * @param {obj} : Peut avoir les valeurs suivante :
 *      - establishment_id : ID de l'établissement auquel on veut ajouter le label.
 *      - username : Nom de la personne qui ajoute le label.
 *      - name : Contenu du label.
 */
// var LabelsModel = function (obj) {
//     this._table = "label";
//     this.$establishment_id = obj.establishment_id;
//     this.$name = obj.name;
//     this.$username = obj.username;

//     this.save = function (callback) {
//         var command = "INSERT INTO label (establishment_id, username, name) VALUES ($id, $username, $name)";
//         var st = db.prepare(command);
//         st.run(this, function (err) {
//             if (err) {
//                 console.log(err);
//             } else if (callback) {
//                 callback(); 
//             }
//         });
//     };

//     this._makecmd = function (query, callback) {
//         async.map(Object.keys(query), function (item, callback) {
//             callback(null, [item, query[item]].join("="));
//         }, function (err, res) {
//             if (err) {
//                callback(err, null);
//             }
//             callback(null, res.join(" "));
//         });
//     };

//     this.query(query, callback) {
//         this._makecmd(query, function (err, cond) {
//             var cmd =  "SELECT * FROM " + this._table + " WHERE " + cond;
//             db.all(cmd, function (err, rows) {
                 
//             });
//         });
       
//     };
// };

module.exports = {
    /* @desc : Ajoute un label.
     *
     * @param {establishment_id} : ID de l'établissement sur lequel il faut
     *      ajouter le label.
     *
     * @param {username} : Nom d'utilisateur de la personne qui a ajouté le label.
     *
     * @param {text} : Contenu du label.
     */
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

    /* @desc : Supprime le label d'"ID" passé en paramètre.
     *
     * @param {id} : Label à supprimer.
     */
    remove_label : function (id, callback) {
        db.run("DELETE FROM label WHERE id=" + id, callback);
    },

    /* @desc : Recherche tout les labels du nom passé en paramètre.
     *
     * @param {name} : Nom d'utilisateur qu'on doit rechercher.
     */
    get_all : function (name, callback) {
        var cmd = "SELECT l.*, e.name AS establishment_name FROM label AS l, establishment AS e WHERE username='" + name + "' AND e.id=l.establishment_id";
         db.all(cmd, callback);
    },

    /* @desc Renvoie les labels utilisé par les établissements les plus populaire.
     */
    popular : function (callback) {
        var cmd = "SELECT AVG(c.rating), l.name \
            FROM label AS l \
            JOIN comments AS c \
                ON c.establishment_id=l.establishment_id \
            GROUP BY l.name HAVING COUNT(DISTINCT l.establishment_id)>=5 \
            ORDER BY AVG(c.rating)";
        db.all(cmd, callback);
    },

    /* @desc :  
     *
     * @param {establishment_id} :
     *
     * @param {callback} : function (err, result) {}
     */
    get_labels : function (establishment_id, callback) {
        // TODO ne pas loader les doublons.
        db.all("SELECT id, name, COUNT(name) AS number FROM label WHERE establishment_id=" + establishment_id + " GROUP BY name ORDER BY COUNT(name) DESC ", function (err, rows) {
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

    /* @desc : Chercher tout les labels ayant le nom passé en paramètre.
     *
     * @param {query} : Label rechché.
     */
    search_label : function (query, callback) {
        db.all("SELECT *, COUNT(establishment_id) AS number FROM label WHERE name LIKE '%" + query + "%' GROUP BY establishment_id", function (err, rows) {
            if (err) { 
                return callback(err, null); 
            }

            callback(null, rows);
        });
    }
};

var express = require('express');
var router = express.Router();
var Label = require('../db/labels_utils.js');
var db = require('../db/database_utils.js');
var Helpers = require('../js/handlebars_helpers.js');
var async = require('async');

/* @desc : Ajoute un label à un article.
 */
router.post('/', function (req, res) {
    if (!req.user || !req.body.label) {
        return res.redirect(303, '/error');
    }

    var labels = req.body.label.split(',');
    labels.map(function (label) {
        Label.add_label(req.query.id, req.user.name, label, function () {
            res.redirect('back');
        });
    });
});

/* @desc : Supprime  un label d'un article.
 */
router.get('/remove/:id', function (req, res) {
    if (req.user.admin) {
        Label.remove_label(req.params.id, function (err) {
            if (err) {
                console.log("Error removing a label : " + err); 
            }
            res.redirect('back');
        });
    } else {
        // Not authorized. 
    }
});

/* @desc Permet d'áfficher tout les restaurant qui ont pour label ":name".
 */
router.get('/:name',  function (req, res) {
    Label.search_label(req.params.name, function (err, labels) {
        if (err) {
            console.log(err);
            return res.redirect(303, 'error');
        }
        
        async.parallel([
            function(callback) {
                async.map(labels, function (label, map_callback) {
                    db.get_establishment(label.establishment_id, function (err, restaurant) {
                        if (err) {
                            console.log(err);
                        }
                        map_callback(null, restaurant);
                    });
                }, callback);
            }, function(callback) {
                Label.popular(callback);
            }
        ], function (err, results) {
            // Passing the restaurants to the page.
            res.render('label', {
                name : req.params.name,
                labels : labels.length,

                establishments : results[0],
                also : results[1],

                user : req.user,

                helpers : {
                    thumbnailing : Helpers.thumbnailing
                }
            });
        });
    });
});

module.exports = router;

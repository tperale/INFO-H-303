var express = require('express');
var router = express.Router();
var Label = require('../db/labels_utils.js');

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
});


module.exports = router;

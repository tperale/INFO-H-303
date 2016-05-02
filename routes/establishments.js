var express = require('express');
var router = express.Router();

var helpers_fun = require('../js/handlebars_helpers.js');

var db = require('../db/database_utils.js');
var User = require('../db/user_db.js');
var Label = require('../db/labels_utils.js');
var Comments = require('../db/comment_utils.js');

var async = require('async');

router.get('/', function (req, res) {
    async.parallel([
        function (callback) {
            db.pick("restaurant", function (err, result) {
                 db.pick_random_from(3, result, function (err, result) {
                    callback(null, result);
                 });
            });
        },

        function (callback) {
            db.pick("bar", function (err, result) {
                 db.pick_random_from(3, result, function (err, result) {
                    callback(null, result);
                 });
            });
        },

        // function (callback) {
        //     db.pick("hotel", function (err, result) {
        //          db.pick_random_from(3, result, function (err, result) {
        //              callback(null, result);
        //          });
        //     });
        //     setTimeout(function() {
        //         callback(null, []);
        //     }, 200);
        // }
    ], function (err, result) {
        res.render('establishments/showoff', {
            restaurants : result[0],
            bars : result[1],

            user : req.user,

            helpers : {
                thumbnailing : helpers_fun.thumbnailing
            },
        }) 
    });
});

router.get('/restaurants',  function (req, res) {
    db.pick("restaurant", function (err, result) {
        db.pick_random_from(6, result, function (err, result) {
            res.render('establishments/showoff', {
                restaurants : result,

                user : req.user,

                helpers : {
                    thumbnailing : helpers_fun.thumbnailing
                }
            });
        });
    });
});

router.get('/bars',  function (req, res) {
    db.pick("bar", function (err, result) {
        db.pick_random_from(6, result, function (err, result) {
            res.render('establishments/showoff', {
                bars : result,

                user : req.user,

                helpers : {
                    thumbnailing : helpers_fun.thumbnailing
                }
            });
        });
    });
});

router.get('/hotels',  function (req, res) {
    db.pick("hotel", function (err, result) {
        db.pick_random_from(3, result, function (result) {
            res.render('establishments/showoff', {
                hotels : result,

                user : req.user,

                helpers : {
                    thumbnailing : helpers_fun.thumbnailing
                }
            });
        });
    });
});

router.get('/image/:id', function (req, res) {
    db.get_establishment_image(req.params.id, function (err, result) {
        if (result) {
            res.send(result);
        } else {
            res.redirect(302, 'http://blog.forbestravelguide.com/wp-content/uploads/2013/09/FTG-HeroShot-MXDC-CreditOliviaBoinet.jpg');
        }
    });
});

router.get('/bar/:id',  function (req, res) {
    async.parallel([
        function(callback) { // Getting the "bar" establishment.
            db.get_bar(req.params.id, function (err, result) {
                setTimeout(function() {
                    callback(null, result);
                }, 200);
            });
        }, function(callback) { // Getting the comments.
            Comments.get_comments(req.params.id, function (err, results) {
                if (err) {
                    console.log("Error getting comments : " + err);
                }

                setTimeout(function() {
                    callback(null, results);
                }, 200);
            });
        }, function(callback) { // Getting the labels.
            Label.get_labels(req.params.id, function (err, results) {
                if (err) {
                    console.log("Error getting labels : " + err);
                }

                setTimeout(function() {
                    callback(null, results);
                }, 200);
            })
        }
    ], function (err, results) {
        res.render('establishments/establishment', {
            establishment : results[0],
            comments : results[1],
            labels : results[2],

            user : req.user,

            helpers : {
                icon : helpers_fun.icon
            }
        });
    });

});

router.get('/hotel/:id',  function (req, res) {
    res.render('establishments/hotel', {
        establishment : db.get_hotel(req.params.id),
        comments : [],
        labels : [],

        user : req.user,
    });
});

router.get('/restaurant/:id',  function (req, res) {
    async.parallel([
        function(callback) { // Getting the "bar" establishment.
            db.get_restaurant(req.params.id, function (err, result) {
                setTimeout(function() {
                    callback(null, result);
                }, 200);
            });

        }, function(callback) { // Getting the comments.
            Comments.get_comments(req.params.id, function (err, results) {
                if (err) {
                    console.log("Error getting comments : " + err);
                }

                setTimeout(function() {
                    callback(null, results);
                }, 200);
            });
        }, function(callback) { // Getting the labels.
            Label.get_labels(req.params.id, function (err, result) {
                var ret = [];
                if (err) {
                    console.log("Error getting labels : " + err);
                } else {
                    ret = result;
                }

                setTimeout(function() {
                    callback(null, ret);
                }, 200);
            })
        }
    ], function (err, results) {
        res.render('establishments/establishment', {
            establishment : results[0],
            comments : results[1],
            labels : results[2],

            user : req.user,

            helpers : {
                icon : helpers_fun.icon
            }
        });
    });
});

router.get('/:id',  function (req, res) {
    db.get_establishment_type(req.params.id, function (type) {
        res.redirect(type + '/' + req.params.id);
    });
});

module.exports = router;

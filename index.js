var database_utils = require('./db/database_utils.js');
var utils = require('./js/utils.js');
var User = require('./db/user_db.js');
var Label = require('./db/labels_utils.js');

var async = require('async');

var helpers_fun = require('./js/handlebars_helpers.js');

var express = require('express');
var session = require('express-session');
var parseurl = require('parseurl');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var app = express();

app.disable('x-powered-by');

var handlebars = require('express-handlebars').create({
    defaultLayout : 'main'
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(require('body-parser').urlencoded({extended : true}));

var formidable = require('formidable');

var credentials = require('./credentials.js');
app.use(require('cookie-parser')(credentials.cookieSecret));

app.use(session ({
    resave : false,
    saveUninitialized : true,
    secret : credentials.cookieSecret,
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

/* Importing differents pages */

app.get('/',  function (req, res) {
    /* [
     *  {
     *      latitude : ...,
     *      longitude : ...,
     *      name : ...,
     *      id : ...
     *  }
     * ]
     */
    async.parallel([
        function (callback) {
            database_utils.get_establishment_locations(function (result) {
                setTimeout(function() {
                    callback(null, result);
                }, 200);
            });
        },

        function (callback) {
             database_utils.pick(null, function (err, result) {
                 database_utils.pick_random_from(6, result, function (err, result) {
                    setTimeout(function() {
                        callback(null, result);
                    }, 200);
                 });
            });
        }
    ], function (err, result) {
        res.render('home', {
            main : utils.average_location_calculus(result[0]),
            number : result[0].length,
            location : result[0],
            establishments : result[1],

            user : req.user,

            helpers : {
                // number_of_establishment : helpers_fun.count_list
                count_list : helpers_fun.count_list,
                thumbnailing : helpers_fun.thumbnailing
            }
        });
    });
});

app.get('/establishments/',  function (req, res) {
    async.parallel([
        function (callback) {
            database_utils.pick("restaurant", function (err, result) {
                 database_utils.pick_random_from(3, result, function (result) {
                    setTimeout(function() {
                        callback(null, result);
                    }, 200);
                 });
            });
        },

        function (callback) {
            database_utils.pick("restaurant", function (err, result) {
                 database_utils.pick_random_from(3, result, function (result) {
                    setTimeout(function() {
                        callback(null, result);
                    }, 200);
                 });
            });
        },

        function (callback) {
            // database_utils.pick("restaurant", function (err, result) {
            //      database_utils.pick_random_from(3, result, function (result) {
            //         setTimeout(function() {
            //             callback(null, result);
            //         }, 200);
            //      });
            // });
            setTimeout(function() {
                callback(null, []);
            }, 200);
        }
    ], function (err, result) {
        res.render('establishments/showoff', {
            restaurant : result[0],
            bars : result[1],
            

            user : req.user,
        }) 
    });
});

app.get('/establishments/restaurants',  function (req, res) {
    database_utils.pick("restaurant", function (err, result) {
        database_utils.pick_random_from(6, result, function (err, result) {
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

app.get('/establishments/bars',  function (req, res) {
    database_utils.pick("bar", function (err, result) {
        database_utils.pick_random_from(6, result, function (err, result) {
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

app.get('/establishments/hotels',  function (req, res) {
    database_utils.pick("hotel", function (err, result) {
        database_utils.pick_random_from(3, result, function (result) {
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

app.get('/establishment/:id',  function (req, res) {
    database_utils.get_establishment_type(req.params.id, function (type) {
        res.redirect('/' + type + '/' + req.params.id);
    });
});

app.get('/contact',  function (req, res) {
    res.render('contact', {
            user : req.user,
    });
});

app.get('/image/:id', function (req, res) {
    database_utils.get_establishment_image(req.query.form, function (err, result) {
        if (result) {
            res.send(result);
        } else {
            res.redirect(302, 'http://blog.forbestravelguide.com/wp-content/uploads/2013/09/FTG-HeroShot-MXDC-CreditOliviaBoinet.jpg');
        }
    });
});

app.post('/process', function(req, res) {
    console.log("Form : " + req.query.form);
    console.log("CSRF token : " + req.body._csrf);
    console.log("Email : " + req.body.email);
    console.log("Question : " + req.body.ques);
    res.redirect(303, '/thankyou');
});

app.get('/search',  function (req, res) {
    console.log("Got a query (GET) : " + req.params.query);
});

app.post('/search', function (req, res){
    console.log("Got a query (POST) : " + req.body.query);
    database_utils.search_establishment(req.body.query, function (err, result) {
        res.render('establishments/showoff', {
            establishments : result,

            user : req.user,

            helpers : {
                thumbnailing : helpers_fun.thumbnailing
            }
        });
    });
    
});

app.get('/about/me',  function (req, res) {
    res.render('about/me', {
        user : req.user,
    });
});

app.get('/about/project',  function (req, res) {
    res.render('about/project', {
        user : req.user,
    });
});

app.get('/about/website',  function (req, res) {
    res.render('about/website', {
        user : req.user,
    });
});

app.get('/about',  function (req, res) {
    res.render('about/me', {
        user : req.user,
    });
});

/* @desc Permet d'afficher une photo qu'un utilisateur a afficher en commentaire.
 */
app.get('/user/:name/comment/:timestamp/:picture',  function (req, res) {
});

/* @desc Permet d'afficher le profil d'un utilisateur du site.
 */
app.get('/user/:name',  function (req, res) {
    User.find(req.params.name, function (err, user) {
        res.render('user', {
            user : req.user,
        });
    });
});

/* @desc Permet d'áfficher tout les restaurant qui ont pour label ":name".
 */
app.get('/label/:name',  function (req, res) {
});

app.get('/bar/:id',  function (req, res) {
    async.parallel([
        function(callback) { // Getting the "bar" establishment.
            database_utils.get_bar(req.params.id, function (err, result) {
                setTimeout(function() {
                    callback(null, result);
                }, 200);
            });
        }, function(callback) { // Getting the comments.
            setTimeout(function() {
                callback(null, []);
            }, 200);
        }, function(callback) { // Getting the labels.
            Label.get_labels(req.params.id, function (err, result) {
                if (err) {
                    console.log("Error getting labels : " + err);
                }

                setTimeout(function() {
                    callback(null, result);
                }, 200);
            })
        }
    ], function (err, results) {
        res.render('establishments/bar', {
            establishment : results[0],
            comments : results[1],
            labels : results[2],

            user : req.user,
        });
    });

});

app.get('/hotel/:id',  function (req, res) {
    res.render('establishments/hotel', {
        establishment : database_utils.get_hotel(req.params.id),
        comments : [],
        labels : [],

        user : req.user,
    });
});

app.get('/restaurant/:id',  function (req, res) {
    async.parallel([
        function(callback) { // Getting the "bar" establishment.
            database_utils.get_restaurant(req.params.id, function (err, result) {
                setTimeout(function() {
                    callback(null, result);
                }, 200);
            });

        }, function(callback) { // Getting the comments.
            setTimeout(function() {
                callback(null, []);
            }, 200);
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
        res.render('establishments/restaurant', {
            establishment : results[0],
            comments : results[1],
            labels : results[2],

            user : req.user,
        });
    });
});

app.get('/testhotel',  function (req, res) {
    res.render('establishments/hotel', {
        hotel : {
            "creator" : "thomas",
            "creation-date" : "10/11/08",
            "name" : "Hotel du bonheur",
            "latitude" : 50.84665,
            "longitude" : 4.34782,
            "phone_number" : "+324768366",
            "street" : "Boulevard de l'empereur",
            "number" : 134,
            "town" : "Bruxelle",
            "postal_code" : 1000,
            "website" : "http://www.salutcestcool.com"
        },
        comments : [
            {
                title : "Sympa mais le personnel grogne.",
                date : "10/03/16",
                text : "C'était pas mal mais le personnel est désagréable un d'eux m'a grogné dessus."
            },
            {
                title : "Ça se passe ou quoi ?",
                date : "13/03/16",
                text : "C'était pas mal mais le personnel est trop agréable."
            }

        ],
        labels : [
            {label_name : "cheap"},
            {label_name : "good value"},
        ]
    });
});

/* ---------------------------------------------
 *    label handling.
 * ---------------------------------------------
 */
app.get('/label', function (req, res) {
});

app.post('/label/', function (req, res) {
    if (req.user) {
        Label.add_label(req.query.id, req.user.name, req.body.title, function () {
            res.redirect(301, '/establishment/' + req.query.id);
        });
    }
});

/* ---------------------------------------------
 *    login/signup functions.
 * ---------------------------------------------
 */
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/signup', function (req, res) {
   res.render('signup', {
        user : req.user,
   });
});

app.post('/signup', function (req, res) {
    if (req.body.password != req.body.password_verif) {
        res.render('signup', {
            password_error : true
        });
        return; 
    }
    
    passport.authenticate('local', { 
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true})
});

app.get('/login', function (req, res) {
   res.render('login', {
        user : req.user,
    });
});

app.post('/login', passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true 
}));

passport.serializeUser(function(user, done) {
    done(null, user.name);
});

passport.deserializeUser(function(name, done) {
    User.find(name, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.find(username, function (err, user) {
            if (err) { 
                return done(err);
            } 
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            user.verify(password, function (err, result) {
                if (result) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Incorrect password.' });
                }
            });
        });
    }
));

/* --------------------------------------------
 *      error handler.
 * --------------------------------------------
 */
app.use(function(req, res, next) {
    var views = req.session.views;

    if (!views) {
        views = req.session.views = {}; 
    }

    var pathname = parseurl(req).pathname;

    views[pathname] = (views[pathname] || 0) + 1;

    next();
});

app.use(function(req, res, next) {
    console.log("Looking for URL : " + req.url);
    next();
});

/* @desc Page not found error.
 */
app.use(function(req, res) {
    res.type('text/html');
    res.status(404);
    res.render('404', {
        user : req.user,
    });
});

/* @desc Server Error handler.
 */
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500', {
        user : req.user,
    });
});

app.listen(app.get('port'), function () {
    console.log("Express started on port : " + app.get('port') + " press Ctrl + C to stop.");
});

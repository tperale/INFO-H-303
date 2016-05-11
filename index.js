var database_utils = require('./db/database_utils.js');
var utils = require('./js/utils.js');
var User = require('./db/user_db.js');
var Label = require('./db/labels_utils.js');
var Comments = require('./db/comment_utils.js');

var helpers_fun = require('./js/handlebars_helpers.js');

var async = require('async');
var fs = require('fs');
var express = require('express');
var session = require('express-session');
var parseurl = require('parseurl');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var util = require('util');

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

var flash = require('connect-flash');
app.use(flash());

app.use(session ({
    resave : false,
    saveUninitialized : true,
    secret : credentials.cookieSecret,
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

var AdminRoutes = require('./routes/admin.js');
app.use('/admin', AdminRoutes);
var LabelRoutes = require('./routes/label.js');
app.use('/label', LabelRoutes);
var EstablishmentsRoutes = require('./routes/establishments.js');
app.use('/establishments', EstablishmentsRoutes);

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
                console.log("pick + " + JSON.stringify(result));
                 database_utils.pick_random_from(6, result, function (err, rand) {
                    setTimeout(function() {
                        callback(null, rand);
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

app.get('/contact',  function (req, res) {
    res.render('contact', {
            user : req.user,
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
    async.parallel([
        function(callback) {
            database_utils.search_establishment(req.body.query, function (err, results) {
                callback(err, results);
            });
        }, function (callback) {
            Label.search_label(req.body.query, function (err, results) {
                callback(err, results) 
            });
        }, function (callback) {
            User.search(req.body.query, function (err, results) {
                callback(err, results) 
            });
        }
        ], function(err, results) {
            res.render('establishments/showoff', {
                establishments : results[0],
                labels : results[1],
                users : results[2],

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

app.get('/user/remove/:name',  function (req, res) {
    if (req.params.name != req.user.name) {
        return res.redirect(303, '404');
    }

    User.remove(req.params.name, function (err) {
        if (err) {
            console.log("Erreur pour supprimer l'utilisateur : " + err);
        }
        return res.redirect(303, '/');
    });
});

/* @desc Permet d'afficher le profil d'un utilisateur du site.
 */
app.get('/user/:name',  function (req, res) {
    async.parallel([
        function(callback) { // Getting the "bar" establishment.
            User.find(req.params.name, function (err, result) {
                setTimeout(function() {
                    callback(null, result);
                }, 200);
            });
        }, function(callback) { // Getting the comments.
            Comments.get_all(req.params.name, function (err, results) {
                if (err) {
                    console.log("Error getting comments : " + err);
                }
                setTimeout(function() {
                    callback(null, results);
                }, 200);
            });
        }, function(callback) { // Getting the comments.
            Label.get_all(req.params.name, function (err, results) {
                if (err) {
                    console.log("Error getting comments : " + err);
                }
                setTimeout(function() {
                    callback(null, results);
                }, 200);
            });
        }
    ], function (err, results) {
        res.render('user', {
            profile : results[0],

            comments : results[1],

            labels : results[2],

            user : req.user,

            helpers : {
                deleteProfile : helpers_fun.deleteProfile
            }
        });
    });
});

/* ------------------------------------------
 *  Gestion des établissements.
 * ------------------------------------------
 */
app.post('/file-upload',  function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file) {
        if (err) {
            return res.redirect(303, '/error'); 
        }

        fs.readFile(file.file.path, function (err, data) {
            database_utils.insert_picture(req.query.id, data, function (err) {
                if (err) {
                    console.log("Error uploading the picture : " + err);
                }
                res.redirect('back');
            });
        });
    });
});

/* ---------------------------------------------
 *    commentaire functions.
 * ---------------------------------------------
 */

/* @desc Permet d'afficher une photo qu'un utilisateur a afficher en commentaire.
 */
app.get('/user/:name/comment/:timestamp/picture',  function (req, res) { 
    Comments.get_attached_picture(req.params.name, req.params.timestamp, function (err, result) {
        if (result) {
            res.send(result);
        } 
    });
});

/* @desc : Supprime un commentaire.
 */
app.get('/comment/remove/:id', function (req, res) {
    if (req.user.admin) {
        Comments.remove_comment(req.params.id, function (err) {
            if (err) {
                console.log("Error removing a comment : " + err); 
            }
            res.redirect('back');
        });
    } else {
        // Not authorized. 
    }
});


app.post('/comment/:comment_id/up', function (req, res) {
    if (req.user) {
        Comments.upvote(req.user.name, req.params.comment_id, function () {}) 
    }
    res.redirect('back');
});

app.post('/comment/:comment_id/down', function (req, res) {
    if (req.user) {
        Comments.downvote(req.user.name, req.params.comment_id, function () {}) 
    }
    res.redirect('back');
});
/* @desc : User comment on an establishment.
 */
app.post('/comment', function (req, res) {
    if (!req.user) {
        return;
    }

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file) {
        if (err) {
            return res.redirect(303, '/error'); 
        }

        console.log("Fields : " + util.inspect(fields) + " and file " + util.inspect(file));

        if (file.picture.size) {
            fs.readFile(file.picture.path, function (err, data) {
                Comments.add_comment(req.query.id, req.user.name, fields.rating, data, fields.comment, function (err) {
                    res.redirect('back');
                });
            });
        } else {
            Comments.add_comment(req.query.id, req.user.name, fields.rating, null, fields.comment, function (err) {
                res.redirect('back');
            });
        }
    });
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
            password_error : true,

            user : req.user,
        });
        return; 
    }

    User.add_user({ username : req.body.username, email : req.body.email, password : req.body.password }, function (err, user) {
        passport.authenticate('local', { 
            successRedirect: '/',
            failureRedirect: '/signup',
            failureFlash: true})
    });
});

app.get('/login', function (req, res) {
   res.render('login', {
        user : req.user,
    });
});

app.post('/login', passport.authenticate('local', { 
    successRedirect: 'back',
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

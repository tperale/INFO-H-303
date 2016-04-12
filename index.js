var database_utils = require('./db/database_utils.js');
var utils = require('./js/utils.js');

var helpers_fun = require('./js/handlebars_helpers.js');

var express = require('express');

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
    var establishments_locations = database_utils.get_establishment_locations(function (establishments_locations) {
        res.render('home', {
            main : utils.average_location_calculus(establishments_locations),
            number : establishments_locations.length,
            location : establishments_locations,
            establishments : database_utils.pick_random(6, establishments_locations.length),

            helpers : {
                // number_of_establishment : helpers_fun.count_list
                count_list : helpers_fun.count_list,
                thumbnailing : helpers_fun.thumbnailing
            }
        });
    });
});

app.use(function(req, res, next) {
    console.log("Looking for URL : " + req.url);
    next();
});

app.get('/establishments/restaurants/',  function (req, res) {
    res.render('establishments/restaurants');
});

app.get('/establishments/bars',  function (req, res) {
    res.render('establishments/bars');
});

app.get('/establishments/hotels',  function (req, res) {
    res.render('establishments/hotels');
});

app.get('/establishment/:id',  function (req, res) {
    database_utils.get_establishment_type(req.params.id, function (type) {
        res.redirect('/' + type + '/' + req.params.id);
    });
});

app.get('/contact',  function (req, res) {
    res.render('contact', { csrf : 'CSRF token' } );
});

app.get('/thankyou', function (req, res) {
    res.render('thankyou');
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
    // res.redirect(303, '/?q=' + req.body.query);
});

app.get('/about/me',  function (req, res) {
    res.render('about/me');
});

app.get('/about/project',  function (req, res) {
    res.render('about/project');
});

app.get('/about/website',  function (req, res) {
    res.render('about/website');
});

app.get('/about',  function (req, res) {
    res.render('about/me');
});

/* @desc Permet d'afficher une photo qu'un utilisateur a afficher en commentaire.
 */
app.get('/user/:name/comment/:timestamp/:picture',  function (req, res) {
});

/* @desc Permet d'afficher le profil d'un utilisateur du site.
 */
app.get('/user/:name',  function (req, res) {
});

/* @desc Permet d'áfficher tout les restaurant qui ont pour label ":name".
 */
app.get('/label/:name',  function (req, res) {
});

app.get('/bar/:id',  function (req, res) {
    res.render('establishments/bar', {
        establishment : database_utils.get_bar(req.params.id),
        comments : [],
        labels : []
    });
});

app.get('/hotel/:id',  function (req, res) {
    res.render('establishments/hotel', {
        establishment : database_utils.get_bar(req.params.id),
        comments : [],
        labels : []
    });
});

app.get('/restaurant/:id',  function (req, res) {
    res.render('establishments/restaurant', {
        establishment : database_utils.get_bar(req.params.id),
        comments : [],
        labels : []
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

var session = require('express-session');
var parseurl = require('parseurl');
app.use(session ({
    resave : false,
    saveUninitialized : true,
    secret : credentials.cookieSecret,
}));

app.use(function(req, res, next) {
    var views = req.session.views;

    if (!views) {
        views = req.session.views = {}; 
    }

    var pathname = parseurl(req).pathname;

    views[pathname] = (views[pathname] || 0) + 1;

    next();
});

/* @desc Page not found error.
 */
app.use(function(req, res) {
    res.type('text/html');
    res.status(404);
    res.render('404');
});

/* @desc Server Error handler.
 */
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500')
});

app.listen(app.get('port'), function () {
    console.log("Express started on port : " + app.get('port') + " press Ctrl + C to stop.");
});

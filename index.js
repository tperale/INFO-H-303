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
    res.render('home');
});

app.use(function(req, res, next) {
    console.log("Looking for URL : " + req.url);
    next();
});

app.get('/establishments/restaurants',  function (req, res) {
    res.render('establishments/restaurants');
});

app.get('/establishments/bars',  function (req, res) {
    res.render('establishments/bars');
});

app.get('/establishments/hotels',  function (req, res) {
    res.render('establishments/hotels');
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

app.get('/label/:name',  function (req, res) {
});

app.get('/testhotel',  function (req, res) {
    res.render('establishments/hotel', {
        hotel : {
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

/* Page not found error.
 */
app.use(function(req, res) {
    res.type('text/html');
    res.status(404);
    res.render('404');
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

app.get('/viewcount', function (req, res, next) {
    res.send('You viewed this page ' + req.session.views['/viewcount'] + ' times.');
});

var fs = require("fs");
app.get('/readfile', function (req, res, next) {
    fs.readFile('./public/randomfile.txt', function (err, data) {
        if (err) {
            return console.error(err);
        }
        res.send("FILE : " + data.toString());
    });
});

/* Server Error handler.
 */
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500')
});

app.listen(app.get('port'), function () {
    console.log("Express started on port : " + app.get('port') + " press Ctrl + C to stop.");
});

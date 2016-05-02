var express = require('express');
var router = express.Router();
var formidable = require('formidable');                                                                                                                                        

router.get('/add', function (req, res) {
    if ((!req.user) || (!req.user.admin)) {
        return res.redirect(303, '404');
    
    }

    res.render('admin', {
        user : req.user,
    });
});

router.post('/add/restaurant', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file) {
        if (err) {
            console.log("Error in form : " + err);
            return res.redirect(303, '/error');
        }
    });
});

router.post('/add/bar', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file) {
        if (err) {
            console.log("Error in form : " + err);
            return res.redirect(303, '/error');
        }
    });
});

router.post('/add/hotel', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file) {
        if (err) {
            console.log("Error in form : " + err);
            return res.redirect(303, '/error');
        }
    });
});

module.exports = router;

var express = require('express');
var router = express.Router();

router.get('/add', function (req, res) {
    if ((!req.user) || (!req.user.admin)) {
        return res.redirect(303, '404');
    
    }

    res.render('admin', {
        user : req.user,
    });
});

router.post('/add', function (req, res) {

});

module.exports = router;

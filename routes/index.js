var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session) {
        req.session.destroy();
    }
    res.render('login');
});

router.get('/index', function (req, res) {
    if (req.session) {
        req.session.destroy();
    }
    res.render('login')
})

module.exports = router;

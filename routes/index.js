var express = require('express');
var router = express.Router();


/* GET home page. */
/**
 * 跳转到登陆页
 * @param req
 * @param res
 * @param next
 */
function index(req, res, next) {
    //销毁登陆状态
    if (req.session) {
        req.session.destroy();
    }
    res.render('login')
}

router.get('/', index);

router.get('/index', index);

module.exports = router;

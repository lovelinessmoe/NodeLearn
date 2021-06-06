var express = require('express');
var router = express.Router();

var db = require('../module/database');
connection = db.connection;

function index(req, res, next) {
    let t_id = req.session.teacherinfo.t_id;
    sql = "SELECT c.c_id,c.c_name,c.credit,cc.cc_name,c.c_no FROM plan_course_list AS pcl LEFT JOIN course AS c ON pcl.c_id=c.c_id LEFT JOIN course_cate AS cc ON cc.cc_id=c.cc_id WHERE pcl.t_id=1 AND pcl.pcl_status=1";
    connection.query(sql, [t_id],
        function (err, stuClass) {
            res.render("Teacher/index",
                {
                    teacher: req.session.teacherinfo,
                    stuClass: stuClass
                });
        })
}


router.get('*', function (req, res, next) {
    if (!req.session.teacherinfo) {
        res.redirect('/');
    } else {
        next();
    }
})

router.get('/', index);
router.get('/index', index);
router.get('/CourseSelect', function (req, res) {
    let t_id = req.session.teacherinfo.t_id;
    sql = "SELECT c.c_id,c.c_name,c.credit,cc.cc_name,c.c_no,pcl.t_id FROM plan_course_list AS pcl LEFT JOIN course AS c ON pcl.c_id=c.c_id LEFT JOIN course_cate AS cc ON cc.cc_id=c.cc_id";
    connection.query(sql, [t_id],
        function (err, stuClass) {
            res.render("Teacher/CourseSelect",
                {
                    teacher: req.session.teacherinfo,
                    stuClass: stuClass
                });
        })
})
router.get('/User', function (req, res) {
    res.render('Teacher/User', {teacher: req.session.teacherinfo})
})

router.get('/DropClass', function (req, res) {


    res.send("haha");

})


module.exports = router;

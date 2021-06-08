var express = require('express');
var router = express.Router();

var db = require('../module/database');
conn = db.connection;

/**
 * 跳转到老师的index
 * @param req
 * @param res
 * @param next
 */
function index(req, res, next) {
    let t_id = req.session.teacherinfo.t_id;
    sql = "SELECT pcl.pcl_id,c.c_id,c.c_name,c.credit,cc.cc_name,c.c_no FROM plan_course_list AS pcl LEFT JOIN course AS c ON pcl.c_id=c.c_id LEFT JOIN course_cate AS cc ON cc.cc_id=c.cc_id WHERE pcl.t_id=1 AND pcl.pcl_status=1";
    conn.query(sql, [t_id],
        function (err, stuClass) {
            res.render("Teacher/index",
                {
                    teacher: req.session.teacherinfo,
                    stuClass: stuClass
                });
        })
}


/**
 * 过滤没有登陆的用户
 * 跳转到login
 */
router.get('*', function (req, res, next) {
    if (!req.session.teacherinfo) {
        res.redirect('/');
    } else {
        next();
    }
})

router.get('/', index);
router.get('/index', index);

/**
 * 选课界面
 */
router.get('/CourseSelect', function (req, res) {
    let t_id = req.session.teacherinfo.t_id;
    sql = "SELECT pcl.pcl_id,c.c_id,c.c_name,c.credit,cc.cc_name,c.c_no,pcl.t_id FROM plan_course_list AS pcl LEFT JOIN course AS c ON pcl.c_id=c.c_id LEFT JOIN course_cate AS cc ON cc.cc_id=c.cc_id";
    conn.query(sql, [t_id],
        function (err, stuClass) {
            res.render("Teacher/CourseSelect",
                {
                    teacher: req.session.teacherinfo,
                    stuClass: stuClass
                });
        })
})

/**
 * 用户修改界面
 */
router.get('/User', function (req, res) {
    res.render('Teacher/User', {teacher: req.session.teacherinfo})
})

/**
 * 退课
 * @param pcl_id 选课计划的ID
 */
router.get('/DropClass', function (req, res) {
    let pcl_id = req.query.pcl_id;
    let sql = "UPDATE plan_course_list SET t_id = 0 , pcl_status = 0 WHERE pcl_id = ?";
    try {
        conn.query(sql, [pcl_id],
            function (err, rows) {
                if (rows < 1) {
                    res.send("退课失败");
                } else {
                    res.send("退课成功");
                }
            });
    } catch (e) {
        res.send(e);
    }
})

/**
 * 选课
 * 更新教师ID和状态
 */
router.get('/AddClass', function (req, res) {
    let pcl_id = req.query.pcl_id;
    let t_id = req.session.teacherinfo.t_id;
    let sql = "UPDATE plan_course_list SET t_id = ? , pcl_status = 1 WHERE pcl_id = ?";
    try {
        conn.query(sql, [t_id, pcl_id],
            function (err, rows) {
                if (rows < 1) {
                    res.send("选课失败");
                } else {
                    res.send("选课成功");
                }
            });
    } catch (e) {
        res.send(e);
    }
})
/**
 * 修改信息
 * 只能修改DESC
 */
router.post('/EditInfo', function (req, res) {
    let desc = req.body.desc;
    let t_id = req.session.teacherinfo.t_id;

    let sql = "UPDATE teacher SET `desc` = ?  WHERE t_id = ?";
    try {
        conn.query(sql, [desc, t_id],
            function (err, rows) {
                if (rows < 1) {
                    res.json({code: 500, msg: "更新失败"});
                } else {
                    res.json({code: 200, msg: "更新成功"});
                }
            });
    } catch (e) {
        res.send(e);
    }
})
/**
 * 修改密码
 * @param originalPassWord 愿密码
 * @param passWord 修改的密码
 * @param confirmPassword 确认的密码
 */
router.post('/EditPwd', function (req, res) {
    let t_id = req.session.teacherinfo.t_id;

    let originalPassWord = req.body.originalPassWord;
    let passWord = req.body.passWord;
    let confirmPassword = req.body.confirmPassword;

    console.log(originalPassWord + ":" + passWord + ":" + confirmPassword);
    console.log("data");
    let PWD = req.session.PWD;

    if (passWord === confirmPassword) {
        if (originalPassWord === PWD) {
            let sql = "UPDATE account SET a_pwd = ?  WHERE t_id = ?";
            try {
                conn.query(sql, [passWord, t_id],
                    function (err, rows) {
                        if (rows < 1) {
                            res.json({code: 500, msg: "更新失败"});
                        } else {
                            res.json({code: 200, msg: "更新成功"});
                        }
                    });
            } catch (e) {
                res.send(e);
            }
        }
    }
})

module.exports = router;

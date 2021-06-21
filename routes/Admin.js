var express = require('express');
var router = express.Router();

var db = require('../module/database');
conn = db.connection;
const mysql = require('../module/mysql');

/**
 * 跳转ADMIN INDEX
 * AllClass 课程数量
 * AllTTP 培养方案数量
 * AllTeacher 教师数量
 * as kkk 是count(*)不能直接传递
 */
function index(req, res, next) {
    try {
        let sql = "SELECT count(*) as kkk FROM classroom";
        conn.query(sql,
            function (err, AllClass) {
                sql = "SELECT count(*) as kkk FROM talent_training_profram";
                conn.query(sql, function (err, AllTTP) {
                    sql = "SELECT count(*) as kkk FROM teacher";
                    conn.query(sql, function (err, AllTeacher) {
                        res.render("Admin/index",
                            {
                                Admin: req.session.Admin,
                                AllClass: AllClass[0].kkk,
                                AllTTP: AllTTP[0].kkk,
                                AllTeacher: AllTeacher[0].kkk
                            });
                    })

                })
            })
    } catch (e) {
        console.log(e);
    }
}

/**
 * 非管理员不能访问/Admin
 */
router.get('*', function (req, res, next) {
    if (!req.session.Admin) {
        res.redirect('/');
    } else {
        next();
    }
})

router.get('/', index);
router.get('/index', index);

/**
 * 培养方案界面
 * 查出所有培养方案
 */
router.get('/TTP', function (req, res, next) {
    let ttp_year = req.query.ttp_year;
    if (ttp_year === null || ttp_year === undefined || ttp_year === '') {
        ttp_year = '%';
    }

    let search = req.query.search;
    if (search === null || search === undefined || search === '') {
        search = '%';
    } else {
        search = '%' + search + '%';
    }
    try {
        let sql = "SELECT * FROM talent_training_profram WHERE ttp_year like ? and ttp_title like ?";
        conn.query(sql, [ttp_year, search], function (err, rows) {
            res.render('Admin/TTP',
                {
                    Admin: req.session.Admin,
                    TTP: rows
                });
        })
    } catch (e) {
        console.log(e);
    }
});
/**
 * 增加培养方案
 */
router.post('/AddTTP', function (req, res, next) {
    let ttp_title = req.body.ttp_title,
        ttp_year = req.body.ttp_year,
        ggBiXiu_credit = req.body.ggBiXiu_credit,
        zyBiXiu_credit = req.body.zyBiXiu_credit,
        tsXuanXiu_credit = req.body.tsXuanXiu_credit,
        zyXuanXiu_credit = req.body.zyXuanXiu_credit;

    try {
        if (ttp_title === null || ttp_title === undefined ||
            ttp_year === null || ttp_year === undefined ||
            ggBiXiu_credit === null || ggBiXiu_credit === undefined ||
            zyBiXiu_credit === null || zyBiXiu_credit === undefined ||
            tsXuanXiu_credit === null || tsXuanXiu_credit === undefined ||
            zyXuanXiu_credit === null || zyXuanXiu_credit === undefined) {
            throw new Error();
        }

        let sql = "INSERT INTO talent_training_profram (ttp_title,ttp_year,ggBiXiu_credit,zyBiXiu_credit,tsXuanXiu_credit,zyXuanXiu_credit) VALUES (?,?,?,?,?,?)";
        conn.query(sql, [ttp_title, ttp_year, ggBiXiu_credit, zyBiXiu_credit, tsXuanXiu_credit, zyXuanXiu_credit],
            function (err, rows) {
                if (rows.length < 1) {
                    res.json({code: 0, msg: "增加失败"});
                } else {
                    res.json({code: 200, msg: "增加成功"});
                }
            })
    } catch (e) {

    }
})
/**
 * TTPModify 的界面
 */
router.get('/TTPModify', function (req, res, next) {
    let ttp_id = req.query.ttp_id;
    console.log(ttp_id + "ttp_id");
    try {
        let sql = "SELECT * FROM talent_training_profram where ttp_id = ? limit 1";
        conn.query(sql, [ttp_id],
            function (err, TTP) {
                res.render('Admin/TTPModify', {TTP: TTP[0]});
            })
    } catch (e) {
        console.log(e);
    }
})
/**
 * 修改培养方案
 */
router.post('/ModifyTTP', function (req, res, next) {
    let ttp_id = req.body.ttp_id,
        ttp_title = req.body.ttp_title,
        ttp_year = req.body.ttp_year,
        ggBiXiu_credit = req.body.ggBiXiu_credit,
        zyBiXiu_credit = req.body.zyBiXiu_credit,
        tsXuanXiu_credit = req.body.tsXuanXiu_credit,
        zyXuanXiu_credit = req.body.zyXuanXiu_credit;

    try {
        let sql = "UPDATE talent_training_profram SET ttp_title=?,ttp_year=?,ggBiXiu_credit=?,zyBiXiu_credit=?,tsXuanXiu_credit=?,zyXuanXiu_credit=? WHERE ttp_id=?";
        conn.query(sql, [ttp_title, ttp_year, ggBiXiu_credit, zyBiXiu_credit, tsXuanXiu_credit, zyXuanXiu_credit, ttp_id],
            function (err, rows) {
                if (rows.length < 1) {
                    res.json({code: 0, msg: "修改失败"});
                } else {
                    res.json({code: 200, msg: "修改成功"});
                }
            })
    } catch (e) {
        console.log(e);
    }

})
/**
 * 删除培养方案
 */
router.post('/DeleteTTP', function (req, res, next) {
    let ttp_id = req.body.ttp_id;

    try {
        let sql = "DELETE FROM talent_training_profram WHERE ttp_id=?";
        conn.query(sql, [ttp_id],
            function (err, rows) {
                if (rows.length < 1) {
                    res.json({code: 0, msg: "删除失败"});
                } else {
                    res.json({code: 200, msg: "删除成功"});
                }
            })
    } catch (e) {
        console.log(e);
    }
})
/**
 * 课程界面
 */
router.get('/Course', async (req, res, next) => {
    let ttp_id = req.query.ttp_id;

    //拼接where查询子语句
    let where = "WHERE ";
    let like = "";
    if (ttp_id === undefined || ttp_id === '') {
        ttp_id = 1;
    }

    where += "c.ttp_id = " + ttp_id + " and ";

    let cc_id = req.query.cc_id;
    if (cc_id !== undefined && cc_id !== '') {
        where += "cc.cc_id = " + cc_id + " and ";
    }
    let c_name = req.query.c_name;
    if (c_name !== undefined && c_name !== '') {
        like += "c.c_name like '%" + c_name + "%' and ";
    }
    let c_no = req.query.c_no;
    if (c_no !== undefined && c_no !== '') {
        like += "c.c_no like '%" + c_no + "%' and ";
    }

    let where_sql = where + like;

    //消除前后空格
    where_sql = where_sql.replace(/(^\s*)|(\s*$)/g, "");


    //最后有and删除
    if (where_sql.length > 0 && where_sql.endsWith('and')) {
        where_sql = where_sql.substring(0, where_sql.length - 3);
    }

    let sql = "SELECT ttp_title FROM talent_training_profram WHERE ttp_id = ?"
    let ttp_title = await mysql.query(sql, [ttp_id]);

    try {
        let sql = 'SELECT c_id,c.c_name,cc.cc_name,c.c_no,c.credit,c.c_id,ttp.ttp_title,c.ttp_id FROM course AS c LEFT JOIN course_cate AS cc ON cc.cc_id=c.cc_id LEFT JOIN talent_training_profram AS ttp ON ttp.ttp_id=c.ttp_id ' + where_sql;
        conn.query(sql,
            function (err, Course) {
                //TODO
                res.render('Admin/Course', {
                    Admin: req.session.Admin,
                    Course: Course,
                    ttp_title: ttp_title
                })
            })
    } catch (e) {
        console.log(e);
    }
})
/**
 * 获取课程类型
 */
router.post('/getCCType', function (req, res, next) {
    try {
        let sql = "SELECT * FROM course_cate";
        conn.query(sql,
            function (err, Course) {
                res.json(Course);
            })
    } catch (e) {
        console.log(e);
    }
})
/**
 * 获取培养方案列表
 */
router.post('/getTTPid', function (req, res, next) {
    try {
        let sql = "SELECT * FROM talent_training_profram";
        conn.query(sql,
            function (err, TTPid) {
                res.json(TTPid);
            })
    } catch (e) {
        console.log(e);
    }
})
/**
 * 获取专业列表
 */
router.post('/getMajor', async (req, res, next) => {

    let sql = "SELECT * FROM major";
    let newVar = await mysql.query(sql);
    res.json(newVar);

})
/**
 * 增加课程
 */
router.post('/AddCourse', async (req, res, next) => {
    const {course_title, major, c_no, ttp_id, credit, cc_id} = req.body;

    let sql = "INSERT INTO course (c_name, cc_id, c_no, ttp_id, m_id, credit) VALUES (?,?,?,?,?,?)";
    let rows = await mysql.query(sql, [course_title, cc_id, c_no, ttp_id, major, credit]);
    if (rows.length < 1) {
        res.json({code: 0, msg: "增加失败"});
    } else {
        res.json({code: 200, msg: "增加成功"});
    }
})
/**
 * CourseModify的界面
 */
router.get('/CourseModify', async (req, res, next) => {
    const {c_id} = req.query;
    let sql = `SELECT c_id, c_name, cc_id, c_no, ttp_id, m_id, credit
               FROM course
               WHERE c_id = ?`;
    let course = await mysql.query(sql, [c_id]);
    res.render('Admin/CourseModify', {course: course[0]});
})
/**
 * 修改课程信息
 */
router.post('/ModifyCourse', async (req, res, next) => {
    const {c_id, course_title, major, c_no, ttp_id, credit, cc_id} = req.body;
    let sql = `UPDATE course
               SET c_name=?,
                   cc_id=?,
                   c_no=?,
                   ttp_id=?,
                   m_id=?,
                   credit=?
               WHERE c_id = ?`
    let rows = await mysql.query(sql, [course_title, cc_id, c_no, ttp_id, major, credit, c_id]);
    if (rows.length < 1) {
        res.json({code: 0, msg: "修改失败"});
    } else {
        res.json({code: 200, msg: "修改成功"});
    }
})
/**
 * 删除课程
 */
router.post('/DeleteCourse', async (req, res, next) => {
    const c_id = req.body.c_id;
    let sql = "DELETE FROM course WHERE c_id=?";
    let rows = await mysql.query(sql, [c_id]);
    if (rows.length < 1) {
        res.json({code: 0, msg: "删除失败"});
    } else {
        res.json({code: 200, msg: "删除成功"});
    }
})
/**
 * 排课计划界面
 */
router.get('/SchPlan', async (req, res) => {
    const {search, cap_term} = req.query;
    let where_sql = ``;
    if (search != undefined) {
        where_sql += `and cap_title like '%${search}%'`;
    }
    if (cap_term != undefined) {
        where_sql += `and cap_term = ${cap_term}`;
    }

    let sql = `SELECT cap_id,cap_title,cap_term FROM course_arrangement_plan WHERE 1=1 ${where_sql}`
    let CAP = await mysql.query(sql);
    res.render("Admin/SchPlan",
        {
            Admin: req.session.Admin,
            CAP: CAP
        });
});


module.exports = router;

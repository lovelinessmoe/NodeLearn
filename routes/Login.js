var express = require('express');
var router = express.Router();

//引入mysql
var db = require('../module/database');
connection = db.connection;

/**
 * 登陆
 * @param username 用户名
 * @param password 密码
 * @return 跳转到对应index
 */
router.post('/', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    let sql = ""
    try {
        sql = "select a_id,a_name,login_name,`desc`,type,t_id,a_pwd from account where login_name = ? && a_pwd = ? limit 1"
        let query = connection.query(sql, [username, password],
            function (err, rs) {
                if (rs.length < 1) {
                    return res.send("用户名或密码错误");
                }
                //改密码时候用
                //存登陆密码
                req.session.PWD = rs[0].a_pwd;
                //ADMIN
                if (rs[0].type === 1) {
                    //管理员直接保存account的
                    req.session.Admin = rs[0];
                    res.redirect("/Admin");
                } else if (rs[0].type === 2) {
                    //TEACHER
                    let t_id = rs[0].t_id;
                    sql = "select * from teacher where t_id = ? limit 1";
                    connection.query(sql, [t_id],
                        function (err, teacher) {
                            //教师存teacher表里的
                            req.session.teacherinfo = teacher[0];
                            res.redirect("/Teacher");
                        })
                }
            })
    } catch (e) {
        console.log(e);
        return next("Error");
    }

});

module.exports = router;

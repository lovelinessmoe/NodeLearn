const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true})); //support x-www-form-urlencoded
app.use(bodyParser.json());
// app.use(expressValidator());


//导入Session11
const session = require('express-session');
const FileStore = require('session-file-store')(session);

var LoginSession = 'hello';


//创建Session中间件
const sessionMiddleware = session({
    name: LoginSession,
    store: new FileStore(), //本地文件储存
    secret: 'Hello World Loveliness',//加密KEY
    cookie: {maxAge: 60 * 60 * 24}//最大存活时间
})

app.use(sessionMiddleware)


// 静态资源导入
// app.use('/public', express.static('public'));

// mysql connection
var connection = require('express-myconnection'),
    mysql = require('mysql');

//解决跨域问题
app.use((req, res, next) => {
//判断路径
    if (req.path !== '/' && !req.path.includes('.')) {
        res.set({
            'Access-Control-Allow-Credentials': true, //允许后端发送cookie
            'Access-Control-Allow-Origin': req.headers.origin || '*', //任意域名都可以访问,或者基于我请求头里面的域
            'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type', //设置请求头格式和类型
            'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',//允许支持的请求方式
            'Content-Type': 'application/json; charset=utf-8'//默认与允许的文本格式json和编码格式
        })
    }
    req.method === 'OPTIONS' ? res.status(204).end() : next()
})


app.use(
    connection(mysql, {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'mysql',
        database: 'TeacherManger',
        debug: true
    }, 'request')
);

app.get('/', function (req, res) {
    res.send('Start!!!')
});

//RESTful route
// const router = express.Router();

app.post('/login', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    const session = req.session;
    console.log(username + ':' + password);
    req.getConnection(function (err, conn) {
        if (err) {
            return next("Cannot connect");
        }
        let query = conn.query('select * from admin where a_name = ? && a_pwd = ? limit 1',
            [username, password],
            function (err, rows) {
                if (err) {
                    console.log(err);
                    return next("Error");
                }
                if (rows.length < 1) {
                    return res.send("No records");
                }
                session.regenerate(function (err) {
                    if (err) {
                        return res.json({code: "0", msg: "error", data: null, count: 0});
                    } else {
                        session.loginUser = rows;
                        res.json({code: "1", msg: "success", data: null, count: 0});
                    }
                })
            })
    })
})

app.post('/logout', function (req, res) {
    //TODO
    req.session.destroy(function (err) {
        if (err) {
            res.json({code: "0", msg: "error", data: err, count: 0});
            return;
        }
        res.clearCookie(LoginSession);
        return;
    })
})


app.get('/table', function (req, res, next) {
    let page = req.query.page;
    let limit = req.query.limit;
    req.getConnection(function (err, conn) {
        if (err) {
            return next("Cannot conn");
        }

        let query = conn.query("select * from teacher ",)

    })

})


const server = app.listen(3000, function () {
    let host = server.address().address;
    let port = server.address().port;
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
});

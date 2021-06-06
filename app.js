const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const ejs = require('ejs');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.engine('ejs', ejs.__express);
app.set('view engine', 'ejs');

app.use(cookieParser('session'));
app.use(session({
    secret: 'Hello World Loveliness',
    name: 'login',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: {maxAge: 800000},  //即800s后session和相应的cookie失效过期
    resave: false,
    saveUninitialized: true,
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const LoginRouter = require('./routes/Login');
const AdminRouter = require('./routes/Admin');
const TeacherRouter = require('./routes/Teacher');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', LoginRouter);
app.use('/Admin', AdminRouter);
app.use('/Teacher', TeacherRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    console.error(err);
    res.render('error');
});

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
});

module.exports = app;

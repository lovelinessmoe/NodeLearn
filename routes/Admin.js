var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'mysql',
    database: 'TeacherManger',
    debug: true
});

connection.connect();

router.post('/login', function (req, res, next) {


});

module.exports = router;

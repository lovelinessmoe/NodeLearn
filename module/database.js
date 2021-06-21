var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'mysql',
    database: 'TeacherManger',
    debug: false
});

connection.connect();

exports.connection = connection;

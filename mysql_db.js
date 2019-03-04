var mysql = require('mysql')

var connection = mysql.createConnection({
	host: 'localhost',
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: 'practice'
});

module.exports = connection;

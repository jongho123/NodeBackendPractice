const mysql = require('mysql')

/*
  mysql database 설정 필요.
  user와 password는 환경변수로 설정해주어야 함.
*/
const connection = mysql.createConnection({
	host: 'localhost',
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.NODE_ENV=='test'? 'practice_testing' : 'practice'
});

module.exports = connection;

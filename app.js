var express = require('express');
var path = require('path');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var logger = require('morgan');

var db = require('./mysql_db');
db.connect();

var indexRouter = require('./routes/index');
var todosRouter = require('./routes/todos');
var authRouter = require('./routes/auth');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SECRET_KEY? process.env.SECRET_KEY : 'secret_key', 
  name: 'sessionId',
  resave: false,
  cookie: {
    maxAge: 10 * 60 * 1000 // 10분
  },
  store: new redisStore()
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/todos', todosRouter);
app.use('/auth', authRouter);

module.exports = app;

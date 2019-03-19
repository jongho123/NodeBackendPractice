const express = require('express');
const db = require('../mysql_db');
const bcrypt = require('bcrypt');
const router = express.Router();

const SELECT_ONE = 'SELECT * FROM user WHERE username=?';
const INSERT_ONE = 'INSERT INTO user (username, password) VALUES (?, ?)';

const Auth = {
  // 유저 생성
  createUser: function(req, res) {
    // username undefined OR length is 0 이면 에러
    if (Auth._checkInvalid(req.body.username)) {
      res.sendStatus(400);
      return;
    }

    // password undefined OR length is 0 이면 에러
    if (Auth._checkInvalid(req.body.password)) {
      res.sendStatus(400);
      return;
    }

    if (req.body.username.length > 50) {
      res.sendStatus(400);
      return;
    }

    bcrypt.hash(req.body.password, 10, function(err, hash) {
      db.query(INSERT_ONE, [req.body.username, hash], function(err, result) {
        if (err) res.sendStatus(500);
        else res.send({insertId: result.insertId});
      });
    });
  },
  // 유저 로그인
  loginUser: function(req, res) {
    if (req.session.uid) {
      res.sendStatus(200);
    } else {
      if (Auth._checkInvalid(req.body.username)) {
        res.sendStatus(400);
        return;
      }
      if (Auth._checkInvalid(req.body.password)) {
        res.sendStatus(400);
        return;
      }

      db.query(SELECT_ONE, [req.body.username], function(err, rows) {
        if (err) res.sendStatus(500);
        if (rows.length == 0) {
          res.sendStatus(400);
          return;
        }

        bcrypt.compare(req.body.password, rows[0].password.toString(), function(err, result) {
          if (err) throw err;
          if (result) {
            req.session.uid = rows[0].user_id;
            res.sendStatus(200);
          }
          else res.sendStatus(400);
        });
      });
    }
  },
  // 유저 로그아웃
  logoutUser: function(req, res) {
    if (req.session.uid) {
      req.session.destroy(function(err) {
        if (err) res.sendStatus(400);
        else res.sendStatus(200);
      });
    } else {
      res.sendStatus(400);
    }
  },
  _checkInvalid(key) {
    if (!key)
      return true;

    if (key.length < 1)
      return true;

    return false;
  }
}

router.post('/create', Auth.createUser)
      .post('/login', Auth.loginUser);

router.get('/logout', Auth.logoutUser); 

module.exports = router;

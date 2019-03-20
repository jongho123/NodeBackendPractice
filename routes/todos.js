const express = require('express');
const db = require('../mysql_db');
const router = express.Router();

const SELECT_ALL = 'SELECT * FROM todo WHERE user_id = ?';
const SELECT_ONE = 'SELECT * FROM todo WHERE user_id = ? AND todo_id = ?';
const INSERT_ONE = 'INSERT INTO todo (user_id, text, is_complete) VALUES (?, ?, ?)';
const UPDATE_ONE = 'UPDATE todo SET text=?, is_complete=? WHERE user_id=? AND todo_id=?';
const DELETE_ONE = 'DELETE FROM todo WHERE user_id = ? AND todo_id = ?';

const Todo = {
  // 모든 todo list 반환
  getAllTodos: function(req, res) {
    if (!req.session.uid) {
      res.sendStatus(401);
      return;
    }

    db.query(SELECT_ALL, [req.session.uid], function(err, rows) {
      if (err) throw err;
      res.send(rows);
    });
  },

  // todo 만들기
  createTodo: function(req, res) {
    if (!req.session.uid) {
      res.sendStatus(401);
      return;
    }

    const todo_text = req.body.text;
    const is_complete = 0;

    // todo의 text가 없을 경우 bad request
    if (todo_text == undefined) {
      res.sendStatus(400);
      return ;
    }

    db.query(INSERT_ONE, [req.session.uid, todo_text, is_complete],
      function (err, results) {
        if (err) throw err;
        
        res.send({insertId: results.insertId});
      }
    );
  },

  // Todo의 id를 이용해 select
  getTodo: function(req, res) {
    const id = req.params.id;

    // id가 숫자가 아닌 경우 bad request
    if (isNaN(parseInt(id))) {
      res.sendStatus(400);
      return ;
    }

    if (!req.session.uid) {
      res.sendStatus(401);
      return;
    }
    
    db.query(SELECT_ONE, [req.session.uid, id], function (err, rows) {
      if (err) throw err;
      res.send(rows);
    });
  },

  // 해당 id에 해당하는 Todo 수정
  updateTodo: function(req, res) {
    const id = req.params.id;

    // id가 숫자가 아닌 경우 bad request
    if (isNaN(parseInt(id))) {
      res.sendStatus(400);
      return ;
    }

    if (!req.session.uid) {
      res.sendStatus(401);
      return;
    }
 
    let todo_text = req.body.text;
    let is_complete = req.body.is_complete;

    db.query(SELECT_ONE, [req.session.uid, id], function (err, rows) {
      if (err) throw err;

      if (rows.length == 0) {
        res.sendStatus(400);
        return;
      }
      
      if (todo_text == undefined)
        todo_text = rows[0].text;

      if (is_complete == undefined)
        is_complete = rows[0].is_complete;

      is_complete = is_complete == true;
      db.query(UPDATE_ONE, [todo_text, is_complete, req.session.uid, id], function (err, results) {
          if (err) throw err;

          res.sendStatus(200);
        }
      );
    });
  },

  // id에 해당하는 Todo 지우기
  deleteTodo: function(req, res) {
    const id = req.params.id;

    // id가 숫자가 아닌 경우 bad request
    if (isNaN(parseInt(id))) {
      res.sendStatus(400);
      return ;
    }

    if (!req.session.uid) {
      res.sendStatus(401);
      return;
    }
 
    db.query(DELETE_ONE, [req.session.uid, id], function (err, results) {
      if (err) throw err;

      res.sendStatus(200);
    });
  },
}

/* GET users listing. */
router.get('/', Todo.getAllTodos)
      .post('/', Todo.createTodo);

router.get('/:id', Todo.getTodo)
      .put('/:id', Todo.updateTodo)
      .delete('/:id', Todo.deleteTodo);

module.exports = router;

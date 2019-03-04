var express = require('express');
var db = require('../mysql_db');
var router = express.Router();

const SELECT_ALL = 'SELECT * FROM todo';
const SELECT_ONE = 'SELECT * FROM todo WHERE todo_id=?';
const INSERT_ONE = 'INSERT INTO todo (todo_text, is_complete) VALUES (?, ?)';
const UPDATE_ONE = 'UPDATE todo SET todo_text=?, is_complete=? WHERE todo_id = ?';
const DELETE_ONE = 'DELETE FROM todo WHERE todo_id = ?';

var Todo = {
	// 모든 todo list 반환
	getAllTodos: function(req, res) {
		db.query(SELECT_ALL, function(err, rows) {
			if (err) throw err;
			res.send(rows);
		});
	},

	// todo 만들기
	createTodo: function(req, res) {
		var todo_text = req.body['todo_text'];
		var is_complete = 0;

		db.query(INSERT_ONE, [todo_text, is_complete],
			function (err, rows) {
				if (err) throw err;
				res.sendStatus(200);
			}
		);
	},

	// Todo의 id를 이용해 select
	getTodo: function(req, res) {
		var id = req.params.id;
		db.query(SELECT_ONE, [id], function (err, rows) {
			if (err) throw err;
			res.send(rows);
		});
	},

	// 해당 id에 해당하는 Todo 수정
	updateTodo: function(req, res) {
		var id = req.params.id;
		var todo_text = req.body['todo_text'];
		var is_complete = req.body['is_complete']==='true';

		db.query(UPDATE_ONE, [todo_text, is_complete, id],
			function (err, rows) {
				if (err) throw err;

				res.sendStatus(200);
			}
		);
	},

	// id에 해당하는 Todo 지우기
	deleteTodo: function(req, res) {
		var id = req.params.id;

		db.query(DELETE_ONE, [id], function (err, rows) {
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

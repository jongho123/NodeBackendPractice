const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../app');
const db = require('../../mysql_db');

const test_data = [
  {
    text: 'test1',
    is_complete: 1
  },
  {
    text: 'test2',
    is_complete: 0
  },
  {
    text: 'test3',
    is_complete: 0
  }
]

describe('Todos Route', function() {
  // 각 테스트의 테스트 데이터 초기화
  before(function() {
    db.query("DELETE FROM todo", function(err, result) {
      db.query("INSERT INTO todo (text, is_complete) VALUES ?", [test_data.map(todo => Object.values(todo))], function(err, result) {
        if (err)
          return done(err);
        let insertId = result.insertId;
        test_data.forEach(data => {
          data.todo_id = insertId;
          insertId += 1;
        });
      });
    });
  });
  describe('GET /, getAll', function() {
    it('전체 리스트가 리턴되어야 함.', function(done) {
      request(app)
        .get('/todos')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          // 배열인지 확인
          expect(res.body).to.be.a('Array');
          
          // 길이 비교
          expect(test_data.length).to.equals(res.body.length);
          done();
        });
    });
  });
  describe('GET /:id, getOne', function() {
    it('빈 데이터 반환.', function(done) {
      request(app)
        .get(`/todos/${test_data[0].todo_id-1}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.length).to.equals(0);
          done();
        });
    });
    it('하나의 데이터 반환.', function(done) {
      request(app)
        .get(`/todos/${test_data[0].todo_id}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.length).to.equals(1);
          expect(res.body[0].todo_id).equals(test_data[0].todo_id);
          done();
        });
    });
    it('잘못된 URL 입력. 에러 반환.', function(done) {
      request(app)
        .get('/todos/hello')
        .expect(400, done);
    });
  });
  describe('POST /, createOne', function() {
    it('추가된 데이터의 ID 반환', function(done) {
      const text = 123;
      request(app)
        .post('/todos')
        .send({text: text})
        .expect(200)
        .end((err, res) => {
          let newTodo = {};
          newTodo.text = text;
          newTodo.is_complete = 0;
          newTodo.todo_id = res.body.insertId;
          test_data.push(newTodo);
          done();
        });
    });
    it('데이터 없는 입력. 에러 반환', function(done) {
      request(app)
        .post('/todos')
        .send({})
        .expect(400, done);
    });
  });
  describe('PUT /:id, editOne', function() {
    it('빈 데이터 입력. OK 반환', function(done) {
      request(app)
        .put(`/todos/${test_data[0].todo_id}`)
        .send({})
        .expect(200, done);
    });
    it('데이터 변경. status 200 반환', function(done) {
      const newText = 'test1';
      request(app)
        .put(`/todos/${test_data[0].todo_id}`)
        .send({text: newText})
        .expect(200, done);
    });
    it('잘못된 url id 입력. 에러 반환', function(done) {
      request(app)
        .put('/todos/hello')
        .send({text: 'dummy'})
        .expect(400, done);
    });
  });
  describe('DELETE /:id, deleteOne', function() {
    it('데이터 삭제. status 200 반환', function(done) {
      request(app)
        .delete(`/todos/${test_data[0].todo_id}`)
        .expect(200, done);
    });
    it('잘못된 url id 입력. 에러 반환', function(done) {
      request(app)
        .delete('/todos/hello')
        .expect(400, done);
    });
  });
});


const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../app');
const db = require('../../mysql_db');
const bcrypt = require('bcrypt');

const test_user = {
  username: 'todo_test1',
  password: '1234'
}

const origin_data = [
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

let test_data;
let sessionId;

app.get('/mock/login', function(req, res) {
  req.session.uid = test_user.user_id;
  res.sendStatus(200);
});

app.get('/mock/logout', function(req, res) {
  if (req.session.uid) {
    req.session.destroy(function(err) {
      res.sendStatus(200);
    });
  }
  else
    res.sendStatus(404);
});

const login = (done) => {
  request(app)
    .get('/mock/login')
    .expect(200)
    .end(function(err, res) {
      sessionId = res.headers['set-cookie'][0].split(';')[0];
      done();
    });
};
const logout = (done) => {
  request(app)
    .get('/mock/logout')
    .set('cookie', sessionId)
    .expect(200, done);
};

describe('Todos Route', function() {
  // 테스트용 user 데이터 추가
  before((done) => {
    db.query("SELECT * FROM user WHERE username=?", [test_user.username], function(err, rows) {
      if (err) expect.fail();
      if (rows.length == 0) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(test_user.password,salt);

        db.query("INSERT INTO user (username, password) VALUES (?, ?)", [test_user.username, hash], function (err, result) {
          if (err) expect.fail(err);
          test_user.user_id = result.insertId;
          login(done);
        });
      } else {
        test_user.user_id = rows[0].user_id;
        login(done);
      }
    });
  });

  // 매번 describe 마다 database의 todo 데이터 초기화
  beforeEach((done) => {
    // object array 복사
    test_data = origin_data.map(todo => JSON.parse(JSON.stringify(todo)));

    db.query("DELETE FROM todo", function(err, result) {
      db.query("INSERT INTO todo (user_id, text, is_complete) VALUES ?", [origin_data.map(todo => [test_user.user_id, todo.text, todo.is_complete])], function(err, result) {
        if (err)
          return done(err);
        let insertId = result.insertId;
        test_data.forEach(data => {
          data.todo_id = insertId;
          insertId += 1;
        });

        done();
      });
    });
  });

  after((done) => {
    logout(done);
  });

  describe('GET /, getAll', function() {
    it('전체 리스트가 리턴되어야 함.', function(done) {
      request(app)
        .get('/todos')
        .set('cookie', sessionId)
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
    it('로그인 되지 않음. 401 에러 반환.', function(done) {
      request(app)
        .get('/todos')
        .expect(401, done);
    });
  });

  describe('GET /:id, getOne', function() {
    it('빈 데이터 반환.', function(done) {
      request(app)
        .get(`/todos/${test_data[0].todo_id-1}`)
        .set('cookie', sessionId)
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
        .set('cookie', sessionId)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.length).to.equals(1);
          expect(res.body[0].todo_id).equals(test_data[0].todo_id);
          done();
        });
    });
    it('로그인 되지 않음. 401 에러 반환.', function(done) {
      request(app)
        .get(`/todos/${test_data[0].todo_id}`)
        .expect(401, done);
    });
    it('잘못된 URL id 입력. 400 에러 반환.', function(done) {
      request(app)
        .get('/todos/hello')
        .set('cookie', sessionId)
        .expect(400, done);
    });
  });
  
  describe('POST /, createOne', function() {
    it('추가된 데이터의 ID 반환', function(done) {
      const text = 123;
      request(app)
        .post('/todos')
        .set('cookie', sessionId)
        .send({text: text})
        .expect(200)
        .end((err, res) => {
          expect(typeof res.body.insertId).to.equal('number');
          done();
        });
    });
    it('데이터 없는 입력. 400 에러 반환', function(done) {
      request(app)
        .post('/todos')
        .set('cookie', sessionId)
        .send({})
        .expect(400, done);
    });
    it('로그인 되지 않음. 401 에러 반환.', function(done) {
      request(app)
        .post('/todos')
        .send({text: 'dummy'})
        .expect(401, done);
    });
  });

  describe('PUT /:id, editOne', function() {
    it('빈 데이터 입력. OK 반환', function(done) {
      request(app)
        .put(`/todos/${test_data[0].todo_id}`)
        .set('cookie', sessionId)
        .send({})
        .expect(200, done);
    });
    it('데이터 변경. status 200 반환', function(done) {
      const newText = 'new_test1';
      request(app)
        .put(`/todos/${test_data[0].todo_id}`)
        .set('cookie', sessionId)
        .send({text: newText})
        .expect(200, done);
    });
    it('데이터 존재하지 않음. 400 에러 반환', function(done) {
      const newText = 'new_test1';
      request(app)
        .put(`/todos/${test_data[0].todo_id - 1}`)
        .set('cookie', sessionId)
        .send({text: newText})
        .expect(400, done);
    });
    it('잘못된 url id 입력. 400 에러 반환', function(done) {
      request(app)
        .put('/todos/hello')
        .set('cookie', sessionId)
        .send({text: 'dummy'})
        .expect(400, done);
    });
    it('로그인 되지 않음. 401 에러 반환.', function(done) {
      request(app)
        .put(`/todos/${test_data[0].todo_id}`)
        .send({})
        .expect(401, done);
    });
  });

  describe('DELETE /:id, deleteOne', function() {
    it('데이터 삭제. status 200 반환', function(done) {
      request(app)
        .delete(`/todos/${test_data[0].todo_id}`)
        .set('cookie', sessionId)
        .expect(200, done);
    });
    it('잘못된 url id 입력. 400 에러 반환', function(done) {
      request(app)
        .delete('/todos/hello')
        .set('cookie', sessionId)
        .expect(400, done);
    });
    it('로그인 되지 않음. 401 에러 반환.', function(done) {
      request(app)
        .delete(`/todos/${test_data[0].todo_id}`)
        .expect(401, done);
    });
  });
});


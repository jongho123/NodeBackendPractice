const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../app');
const db = require('../../mysql_db');
const bcrypt = require('bcrypt');

const user_data = {
  username: 'auth_test1',
  password: '1234'
};
const user_data2 = {
  username: 'auth_test2',
  password: '1234'
};

const longname_data = {
  username: '',
  password: '1234'
};

for (let i = 0; i < 51; i++) {
  longname_data.username += i % 10;
}

describe('Auth Route', function() {
  before((done) => {
    db.query("DELETE FROM user WHERE username=?", [user_data.username], function(err, result) {
      bcrypt.hash(user_data.password, 10, function(err, hash) {
        if (err) return expect.fail(err);
        db.query("INSERT INTO user (username, password) VALUES (?, ?)", [user_data.username, hash], function(err, result) {
          if (err) return expect.fail(err);
          done();
        });
      });
    });
  });
 
  // 각 테스트의 테스트 데이터 초기화
  describe('POST /create, createUser', function() {
    const createUrl = '/auth/create';
    afterEach(() => {
      db.query("DELETE FROM user WHERE username=?", [user_data2.username], function(err, result) {
        if (err) expect.fail();
      });
    });
    it('유저가 생성되고 user_id가 반환.', function(done) {
      request(app)
        .post(createUrl)
        .send(user_data2)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          // 숫자인지 확인
          expect(typeof res.body.insertId).to.equal('number');
          done();
        });
    });
    it('유저의 아이디가 중복됨. 500 에러 반환.', function(done) {
      request(app)
        .post(createUrl)
        .send(user_data)
        .expect(500, done)
    });
    it('유저의 아이디가 너무김. 400 에러 반환.', function(done) {
      request(app)
        .post(createUrl)
        .send(longname_data)
        .expect(400, done)
    });
  });
  describe('POST /login, loginUser', function() {
    const loginUrl = '/auth/login';
    it('성공적인 로그인.', function(done) {
      request(app)
        .post(loginUrl)
        .send(user_data)
        .expect(200, done)
    });
    it('아이디 없음. 400 에러 반환', function(done) {
      request(app)
        .post(loginUrl)
        .send({
          password: user_data.password
        })
        .expect(400, done)
    });
    it('아이디 길이 0. 400 에러 반환', function(done) {
      request(app)
        .post(loginUrl)
        .send({
          username: '',
          password: user_data.password
        })
        .expect(400, done)
    });
    it('패스워드 없음. 400 에러 반환', function(done) {
      request(app)
        .post(loginUrl)
        .send({
          username: user_data.username
        })
        .expect(400, done)
    });
    it('패스워드 길이 0. 400 에러 반환', function(done) {
      request(app)
        .post(loginUrl)
        .send({
          username: user_data.username,
          password: ''
        })
        .expect(400, done)
    });
    it('아이디 존재하지 않음. 400 에러 반환', function(done) {
      request(app)
        .post(loginUrl)
        .send({
          username: 'nouser',
          password: user_data.password
        })
        .expect(400, done)
    });
    it('비밀번호 틀림. 400 에러 반환', function(done) {
      request(app)
        .post(loginUrl)
        .send({
          username: user_data.username,
          password: 'invalid'
        })
        .expect(400, done)
    });
    it('아이디 너무김. 400 에러 반환', function(done) {
      request(app)
        .post(loginUrl)
        .send(longname_data)
        .expect(400, done)
    });
  });
  describe('GET /logout, logoutUser', function() {
    const logoutUrl = '/auth/logout';
    let cookie;
    before((done) => {
      request(app)
        .post('/auth/login')
        .send(user_data)
        .end((err, res) => {
          cookie = res.headers['set-cookie'][0].split(';')[0];
          done();
        });
    })
    it('정상적인 로그아웃', function(done) {
      request(app)
        .get(logoutUrl)
        .set('cookie', cookie)
        .expect(200, done)
    });
    it('이미 세션 만료됨. 에러 반환', function(done) {
      request(app)
        .get(logoutUrl)
        .set('cookie', cookie)
        .expect(400, done);
    });
  });
});


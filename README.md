# node/express backend practice

## required
- Node.js (v8.12 사용)
- npm (v6.8 사용)
- Mysql (v5.7.25 사용) [document](https://github.com/jongho123/NodeBackendPractice/blob/master/doc/database_v1.md#database-%EB%B2%84%EC%A0%84)
- Redis (v4.0.9 사용)

## 모듈 설치
```sh
$ npm install
```

## 설정
```sh
# DB 계정 설정
$ export MYSQL_USER=userid
$ export MYSQL_PASSWORD=password

# 포트번호 설정. 하지 않으면 3000
# 아직은 index page를 서버에서 주지 않기 때문에
# 변경하면 프론트엔드 proxy 포트 번호도 변경 해주어야 함.
$ export PORT=nodejs port

# 세션의 시크릿 키 설정
# 세션 암호화에 사용된다고 함.
$ export SECRET=secret_key
```

## 실행
```sh
$ npm start
```

## 테스트
```sh
$ npm test
```

## 문서
- [APIs](https://github.com/jongho123/NodeBackendPractice/blob/master/doc/apis.md)
- [Testing](https://github.com/jongho123/NodeBackendPractice/blob/master/doc/testing.md#testing-%ED%95%98%EA%B8%B0-%EC%A0%84-%ED%95%84%EC%9A%94%ED%95%9C-%EA%B2%83)

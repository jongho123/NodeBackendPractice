## Todos API

### /todos
- METHOD: GET
- DESCRIPTION: 모든 Todo의 리스트들을 리턴한다.
- REQUIRE: 없음
- RETURNS
```javascript
[
    {
        "todo_id": 8,
        "text": "test1",
        "is_complete": 0
    },
    {
        "todo_id": 9,
        "text": "test2",
        "is_complete": 0
    },
    {
        "todo_id": 10,
        "text": "test3",
        "is_complete": 0
    }
]
```
### /todos
- METHOD: POST
- DESCRIPTION: 해당 text로 todo를 만든다. 생성후 만들어진 Todo의 Id를 리턴한다.
- REQUIRE: 
```javascript
// reqeust body
{
    "text": 'new todo text'
}
```
- RETURNS
```javascript
{
    "insertId": 11
}
```

### /todos/:id
- METHOD: GET
- DESCRIPTION: 해당하는 id의 Todo를 리턴한다.
- REQUIRE: 없음.
- RETURNS
```javascript
[
    {
        "todo_id": 11,
        "text": "test4",
        "is_complete": 0
    }
]
```
- ERRORS
  - status 400: id에 숫자가 아닌 값이 들어왔을 때 반환

### /todos/:id
- METHOD: PUT
- DESCRIPTION: 해당하는 id의 text나 complete를 수정한다.
- REQUIRE
```javascript
// 넘겨진 프로퍼티에 해당하는 속성을 수정함.
{
    "text": "new todo text",
    "is_complete": 1
}
```
- RETURNS: status 200
- ERRORS
  - status 400: id에 숫자가 아닌 값이 들어왔을 때 반환

### /todos/:id
- METHOD: DELETE
- DESCRIPTION: 해당하는 id의 Todo를 삭제
- REQUIRE: 없음
- RETURNS: status 200
- ERRORS
  - status 400: id에 숫자가 아닌 값이 들어왔을 때 반환

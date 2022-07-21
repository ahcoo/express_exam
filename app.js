// app.js
//const express = require("express");
import express from "express"; //와 같은 뜻
import mysql from "mysql2/promise";
const app = express();
const port = 3000;

const pool = mysql.createPool({
  host: "localhost",
  user: "sbsst",
  password: "sbs123414",
  database: "a9",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/todos", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM todo ORDER BY id DESC");

  res.json(rows);
});

/*async 
func1() {


}
func2() {

10초걸리는함수가있다고함.
}

fuc3() {


}
js : 
func1 이 끝날 때까지 기다린 후 func2 실행, func2 실행이 끝날 때까지 기다린 후 func3을 실행.


node js : 쭉 실행 후 기다림. → 테이블 내용이 표시되지 않은채로 끝내버림.
→DB와 메모리 중 더 빠른 것은 메모리이기 때문에 빨리 출력되는 쪽으로 출력해버리니 DB출력이 안됨.

→ async : await을 사용하여 "await 뒤에 있는 것이 실행될 때까지 기다려"라고 명령.

*/

//'배열 비구조화 할당' 검색해보기.

function sum(a, b) {
  return a + b;
}
//sum함수

/*
//익명함수
function (a, b) {
    return a + b
}
sum()
 */

/*

const sum = function(a, b) {
    return a + b
}
sum()
//으로도 가능
*/

/*
const sum = (a, b) => {
    return a + b
}
//Arrow function
*/

app.get("/", (req, res) => {
  const a = sum("한", "글");
  res.send(a);
});
/*get = http 계열의 통신 메소드. 
아래는 객체. 알기 쉽도록 이름을 아래와 같이 정함.
req = 받은 편지(request)
res = 응답 (response)*/

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

//app.listen (A, () =>)
//A를 실행하면 다음 함수를 실행하겠다

app.get("/todos", function (req, res) {
  console.log("/todos 요청이 실행되었습니다.");
  res.send("Hi");
});

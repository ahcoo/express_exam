// app.js
//const express = require("express");
import express from "express"; //와 같은 뜻
import mysql from "mysql2/promise";
import axios from "axios";
import cors from "cors";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

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

app.get("/todos/:id", async (req, res) => {
  // /todos/:id → id를 변수로 사용할 수 있음
  const { id } = req.params;

  const [rows] = await pool.query(`SELECT * FROM todo WHERE id = ?`, [id]);

  if (rows.length === 0) {
    res.status(404).json({ msg: "not found" });
    return;
  }

  res.json(rows[0]);
});

app.patch("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { perform_date, text } = req.body;

  const [rows] = await pool.query(
    `
    SELECT *
    FROM todo
    WHERE id = ?
    `,
    [id]
  );

  if (rows.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
  }

  if (!perform_date) {
    res.status(400).json({
      msg: "perform_date required",
    });
    return;
  }

  if (!text) {
    res.status(400).json({
      msg: "text required",
    });
    return;
  }

  const [rs] = await pool.query(
    `
    UPDATE todo
    SET perform_date = ?,
    text = ?
    WHERE id = ?
    `,
    [perform_date, text, id]
  );

  const [updatedTodos] = await pool.query(
    `
    SELECT *
    FROM todo
    ORDER BY id DESC
    `
  );
  res.json(updatedTodos);
});
app.patch("/todos/check/:id", async (req, res) => {
  //id값 받아오기
  const { id } = req.params;
  //row 세로 : 컬럼 , row : 내용
  //할 일의 check 초기상태를 체크해야 함
  const [[rows]] = await pool.query(
    `
    SELECT *
  FROM todo where id = ?
  `,
    //↓↓ ?에는 id가 들어가야 함
    [id]
  );
  //↓↓ 하지만 id에 없는 id값이 들어온다면 에러처리를 해야 함.
  if (!rows) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }
  //↓↓ 문제가 없다면 수정을 해줘야 함 → 수정하는 mySQL 구문 작성
  await pool.query(
    `
  UPDATE todo
  SET checked = ?
  WHERE id = ?
  `,
    //불러온 다음 체크가 됐다면 체크를 풀고, 체크가 안됐다면 체크를 해줘야 함 → !로 변경
    [!rows.checked, id]
  );
  res.send(id);
}); /**/

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;

  const [[todoRow]] = await pool.query(
    `
  SELECT *
  FROM todo
  WHERE id = ?`,
    [id]
  );

  if (todoRow === undefined) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  const [rs] = await pool.query(
    `DELETE FROM todo
  WHERE id = ?`,
    [id]
  );

  res.json({
    msg: `${id}번 할 일이 삭제되었습니다.`,
  });
});

// app.post("/todos", async (req, res) => {
//   //const { id } = req.params;
//   const { reg_date } = req.body;
//   const { perform_date } = req.body;
//   const { is_completed } = req.body;
//   const { content } = req.body;

//   const [rows] = await pool.query(`SELECT * FROM todo`);
//   /*
//   if (rows.length === 0) {
//     res.status(404).json({
//       msg: "not found",
//     });
//   }*/

//   //"" > false, 실행안됨. !"" > true, 실행됨.
//   /*if (!reg_date) {
//     //!perform_date가 비어있다면 실행
//     res.status(400).json({
//       msg: "reg_date required",
//     });
//     return;
//   }*/

//   if (!perform_date) {
//     //!perform_date가 비어있다면 실행
//     res.status(400).json({
//       msg: "perform_date required",
//     });
//     return;
//   }

//   if (!is_completed) {
//     //!perform_date가 비어있다면 실행
//     res.status(400).json({
//       msg: "is_completed required",
//     });
//     return;
//   }

//   if (!content) {
//     //!content가 비어있다면 실행
//     res.status(400).json({
//       msg: "content required",
//     });
//     return;
//   }

//   const [rs] = await pool.query(
//     `INSERT todo SET
//     reg_date = NOW(),
//     perform_date = ?,
//     is_completed = ?,
//     content = ?`,
//     [perform_date, checked, text]
//   );

//   //console.log("id", id);
//   //console.log("perform_date", perform_date);
//   //console.log("content", content);
//   res.json({
//     msg: `할 일이 생성되었습니다.`,
//   });
// });

app.post("/todos", async (req, res) => {
  const {
    body: { text },
  } = req;
  await pool.query(
    `
  INSERT INTO todo
  SET reg_date = NOW(),
  perform_date = '2022-05-18 07:00:00',
  checked = 0,
  text = ?;
  `,
    [text]
  );

  const [newRows] = await pool.query(`
  SELECT * FROM
  todo
  ORDER BY id DESC`);
  res.json(newRows);
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

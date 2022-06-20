const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const cors = require("cors");
const { query } = require("express");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "lig_mn",
});

router.use(express.json());
router.use(cors());

router.get("/api/matches", (req, res) => {
  const ended = req.query.ended;
  let whereEnded = "";

  if (ended === "true") {
    whereEnded = "where ended_at is not null";
  } else if (ended === "false") {
    whereEnded = "where ended_at is null";
  }

  const sqlSelect =
    "select \
            w1.firstname as w1_firstname, w1.surname as w1_surname, \
            w2.firstname as w2_firstname, w2.surname as w2_surname, \
            m.* \
          from matches m \
          join wrestlers w1 on w1.id = m.wrestler1_id \
          join wrestlers w2 on w2.id = m.wrestler2_id " +
    whereEnded;

  db.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

router.get("/api/matches/:id", (req, res) => {
  const matchId = req.params.id;
  const sqlSelect =
    "select \
            w1.firstname as w1_firstname, w1.surname as w1_surname, \
            w2.firstname as w2_firstname, w2.surname as w2_surname, \
            m.* \
          from matches m \
          join wrestlers w1 on w1.id = m.wrestler1_id \
          join wrestlers w2 on w2.id = m.wrestler2_id where opaque_id = ?";
  db.query(sqlSelect, matchId, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result[0]);
    }
  });
});

router.post("/api/matches", (req, res) => {
  const opaqueId = req.body.opaque_id;
  const wrestler1Id = req.body.wrestler1_id;
  const wrestler2Id = req.body.wrestler2_id;
  const totalDuration = 600;
  const sqlInsert =
    " \
    INSERT INTO matches \
      (opaque_id, wrestler1_id, wrestler2_id, wrestler1_score, wrestler2_score, \
        created_at, started_at, ended_at, total_duration, remaining_duration) \
    VALUES(?, ?, ?, 0, 0, NOW(), NULL, NULL, ?, ?); \
  ";

  db.query(
    sqlInsert,
    [opaqueId, wrestler1Id, wrestler2Id, totalDuration, totalDuration],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

module.exports = router;

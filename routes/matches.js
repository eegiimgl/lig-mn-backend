const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const cors = require("cors");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "lig_mn",
});

router.use(express.json());
router.use(cors());

router.get("/api/matches", (req, res) => {
  const sqlSelect = "SELECT * FROM matches";
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
  const sqlSelect = "SELECT * FROM matches WHERE opaque_id = ?";
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
  const totalDuration = 300;
  const sqlInsert =
    " \
    INSERT INTO matches \
      (opaque_id, wrestler1_id, wrestler2_id, wrestler1_score, wrestler2_score, created_at, started_at, ended_at, total_duration, remaining_duration) \
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

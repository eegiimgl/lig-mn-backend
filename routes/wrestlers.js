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

router.get("/api/wrestlers/:id", (req, res) => {
  const wrestlerId = req.params.id;
  const sqlSelect = "select * from wrestlers where id = ?";
  db.query(sqlSelect, wrestlerId, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result[0]);
    }
  });
});

module.exports = router;

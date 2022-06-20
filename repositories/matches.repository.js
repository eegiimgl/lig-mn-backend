const mysql = require("mysql");

class MatchesRepository {
  constructor() {
    this.db = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "password",
      database: "lig_mn",
    });
  }

  updateMatch(opaqueId, wrestler1Id, wrestler2Id, remainingDuration) {
    const sqlUpdate =
      "UPDATE matches \
            SET wrestler1_score = ?, wrestler2_score = ?, remaining_duration = ? \
            WHERE opaque_id = ?;";

    this.db.query(
      sqlUpdate,
      [wrestler1Id, wrestler2Id, remainingDuration, opaqueId],
      (err) => {
        if (err) {
          console.log(err);
        }
        console.log(`Match updated with id: ${opaqueId}`);
      }
    );
  }

  startMatch(opaqueId) {
    const sqlUpdate =
      "UPDATE matches \
            SET started_at = now() \
            WHERE opaque_id = ?;";

    this.db.query(sqlUpdate, opaqueId, (err) => {
      if (err) {
        console.log(err);
      }
      console.log(`Match finished with id: ${opaqueId}`);
    });
  }

  finishMatch(opaqueId, winnerNo) {
    const w1Point = winnerNo == 1 ? 1 : 0;
    const w2Point = winnerNo == 2 ? 1 : 0;
    const sqlUpdate =
      "UPDATE matches \
            SET ended_at = now(), wrestler1_point = ?, wrestler2_point = ? \
            WHERE opaque_id = ?;";

    this.db.query(sqlUpdate, [w1Point, w2Point, opaqueId], (err) => {
      if (err) {
        console.log(err);
      }
      console.log(`Match finished with id: ${opaqueId}`);
    });
  }
}

module.exports = { MatchesRepository };

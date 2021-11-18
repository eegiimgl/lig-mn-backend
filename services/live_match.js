const MatchState = {
  RUNNING: 1,
  STOPPED: 2,
  FINISHED: 3,
};

class LiveMatches {
  constructor() {
    this.liveMatches = [];
    this.interval = null;
  }

  add(match) {
    if (!this.existById(match.matchId)) {
      match.state = MatchState.STOPPED;
      match.wrestler1Score = 0;
      match.wrestler2Score = 0;
      this.liveMatches.push(match);
    }
  }

  existById(matchId) {
    return this.liveMatches.some((x) => x.matchId === matchId);
  }

  startTimer(matchId) {
    let match = this.liveMatches.find((x) => x.matchId === matchId);
    match.state = MatchState.RUNNING;
  }

  pauseTimer(matchId) {
    let match = this.liveMatches.find((x) => x.matchId === matchId);
    match.state = MatchState.STOPPED;
  }

  remove(matchId) {
    this.liveMatches = this.liveMatches.filter((x) => x.matchId !== matchId);
  }

  incrementPoint(matchId, wrestlerNo) {
    let match = this.liveMatches.find((x) => x.matchId === matchId);
    if (wrestlerNo == 1) {
      match.wrestler1Score++;
    } else {
      match.wrestler2Score++;
    }
  }

  decrementPoint(matchId, wrestlerNo) {
    let match = this.liveMatches.find((x) => x.matchId === matchId);
    if (wrestlerNo == 1 && match.wrestler1Score > 0) {
      match.wrestler1Score--;
    } else if (wrestlerNo == 2 && match.wrestler1Score > 0) {
      match.wrestler2Score--;
    }
  }

  runTimer(io) {
    if (
      !this.interval &&
      this.liveMatches.some((x) => x.state != MatchState.FINISHED)
    ) {
      this.interval = setInterval(() => this.runTimerAndBroadcast(io), 1000);
    } else if (!this.liveMatches.some((x) => x.state != MatchState.FINISHED)) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  runTimerAndBroadcast(io) {
    for (let match of this.liveMatches) {
      if (match.state == MatchState.RUNNING) {
        match.remainingSeconds--;
      }

      if (match.remainingSeconds === 0) {
        match.state = MatchState.FINISHED;
      }
    }

    const matchInfo = this.liveMatches.map((x) => {
      return {
        matchId: x.matchId,
        timer: this.convertTimer(x.remainingSeconds),
        wrestler1Score: x.wrestler1Score,
        wrestler2Score: x.wrestler2Score,
      };
    });

    io.emit("liveMatchesBroadcastingEvent", matchInfo);
  }

  convertTimer(remainingSeconds) {
    const minutes = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
    return `${minutes} : ${seconds}`;
  }
}

module.exports = { LiveMatches };

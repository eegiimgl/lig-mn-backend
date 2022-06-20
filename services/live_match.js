const MatchState = {
  RUNNING: 1,
  STOPPED: 2,
  FINISHED: 3,
};

class LiveMatches {
  constructor(matchesRepository) {
    this.liveMatches = [];
    this.interval = null;
    this.matchesRepository = matchesRepository;
  }

  add(match) {
    if (!this.existById(match.matchId)) {
      match.state = MatchState.STOPPED;
      match.wrestler1Score = 0;
      match.wrestler2Score = 0;
      this.liveMatches.push(match);
    }

    this.matchesRepository.startMatch(match.matchId);
  }

  existById(matchId) {
    return this.liveMatches.some((x) => x.matchId === matchId);
  }

  startTimer(matchId) {
    let match = this.liveMatches.find((x) => x.matchId === matchId);
    match.state = MatchState.RUNNING;
    this.updateMatch(match);
  }

  pauseTimer(matchId) {
    let match = this.liveMatches.find((x) => x.matchId === matchId);
    match.state = MatchState.STOPPED;
    this.updateMatch(match);
  }

  finish(matchId, winnerNo) {
    this.liveMatches = this.liveMatches.filter((x) => x.matchId !== matchId);
    this.matchesRepository.finishMatch(matchId, winnerNo);
  }

  incrementPoint(matchId, wrestlerNo) {
    let match = this.liveMatches.find((x) => x.matchId === matchId);
    if (wrestlerNo == 1) {
      match.wrestler1Score++;
    } else {
      match.wrestler2Score++;
    }

    this.updateMatch(match);
  }

  decrementPoint(matchId, wrestlerNo) {
    let match = this.liveMatches.find((x) => x.matchId === matchId);
    if (wrestlerNo == 1 && match.wrestler1Score > 0) {
      match.wrestler1Score--;
    } else if (wrestlerNo == 2 && match.wrestler1Score > 0) {
      match.wrestler2Score--;
    }

    this.updateMatch(match);
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

    const eventBaseName = "liveMatchesBroadcastingEvent";
    const matchInfos = this.liveMatches.map((x) => {
      const matchObj = {
        matchId: x.matchId,
        timer: this.convertTimer(x.remainingSeconds),
        wrestler1Score: x.wrestler1Score,
        wrestler2Score: x.wrestler2Score,
      };

      io.emit(eventBaseName + `-${x.matchId}`, matchObj);
      return matchObj;
    });

    io.emit(eventBaseName, matchInfos);
  }

  updateMatch(match) {
    this.matchesRepository.updateMatch(
      match.matchId,
      match.wrestler1Score,
      match.wrestler2Score,
      match.remainingSeconds
    );
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

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const routerMatches = require("./routes/matches");
const { LiveMatches } = require("./services/live_match");
const { MatchesRepository } = require("./repositories/matches.repository");

const port = 4001;
const app = express();

app.use(routerMatches);
app.use(cors);

const server = http.createServer(app);

const io = socketIo(server, { cors: { origin: "*" } });

const matchesRepository = new MatchesRepository();
let matches = new LiveMatches(matchesRepository);

io.on("connection", (socket) => {
  console.log(`New client connected with id: ${socket.client.id}`);

  socket.on("disconnect", () => {
    console.log(`Client disconnected with id: ${socket.client.id}`);
  });

  socket.on("matchEvent", (data) => {
    console.log(`Match Event: ${data.action} with ID: ${data.matchId}`);

    if (data.action === "create") {
      matches.add({
        matchId: data.matchId,
        remainingSeconds: data.remainingSeconds,
      });
    } else if (data.action === "play") {
      matches.startTimer(data.matchId);
    } else if (data.action == "pause") {
      matches.pauseTimer(data.matchId);
    } else if (data.action == "finish") {
      matches.remove(data.matchId);
    } else if (data.action == "pointIncrement") {
      matches.incrementPoint(data.matchId, data.wrestlerNo);
    } else if (data.action == "pointDecrement") {
      matches.decrementPoint(data.matchId, data.wrestlerNo);
    }
    matches.runTimer(io);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

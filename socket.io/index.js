// index.js

const express = require("express");
const app = express();
const webSocket = require("./socket");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const server = app.listen(3001, () => {
  console.log("listening on *:3001");
});

webSocket(server);
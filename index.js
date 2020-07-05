"use strict";

const http = require("http");
const mongoose = require("mongoose");
var redis = require("redis");
const app = require("./src/main/App");

require("dotenv").config({ path: "./variables.env" });

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

global.redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

redisClient.on("connect", () => {
  console.log("connected");
});

redisClient.on("error", err => {
  console.error(`Redis -> 🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.connection.on("error", err => {
  console.error(`Mongodb -> 🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

httpServer.listen(PORT, err => {
  if (err) {
    console.log(err);
  } else {
    console.log("Server Started On http://localhost:" + PORT);
  }
});

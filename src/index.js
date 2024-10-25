const express = require("express");
const hostname = process.env.HOSTNAME;
const port = process.env.PORT || 3000;
const app = express();
const cors = require("cors");
const http = require("http");

require('dotenv').config({ path: ".env" });
require("../src/config/db/connection");


const Server = http.createServer(app);
Server.timeout = 10000;



app.use(cors({ origin: '*' }))
app.use(express.json());
app.use("/api/v1", require("../src/routes/api.routes"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


Server.listen(process.env.PORT || 3000, function () {
    console.log("Ready to go!");
  });
  
module.exports = { Server };

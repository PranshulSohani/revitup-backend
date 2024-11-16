const express = require("express");
const hostname = process.env.HOSTNAME;
const port = process.env.PORT || 3000;
const app = express();
const cors = require("cors");
const http = require("http");
const path = require('path');
require('dotenv').config({ path: ".env" });
require("../src/config/db/connection");


const Server = http.createServer(app);
Server.timeout = 10000;



app.use(cors({ origin: '*' }))
app.use(express.json());
app.use("/api", require("../src/routes/api.routes"));
app.use("/admin", require("../src/routes/admin.routes"));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


Server.listen(process.env.PORT || 3000, function () {
    console.log("Ready to go!");
  });
  
module.exports = { Server };

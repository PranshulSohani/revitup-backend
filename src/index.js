const express = require("express");

require('dotenv').config({ path: ".env" });
require("../src/config/db/connection");
const userRouter = require('./router/userRoute');

var cors = require('cors')

const hostname = process.env.HOSTNAME;
const port = process.env.PORT || 3000;
const app = express();

app.use(cors({ origin: '*' }))
app.use(express.json());
app.use("/api/v1/", userRouter);

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


app.listen(port, () => {
    console.log(`connection is live at host and port :${hostname}:${port}`);
})

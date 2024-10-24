const express = require("express");
const app = express();

require("../src/config/db/connection");

let cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0",
    () => console.log(`Server running on ${PORT}`));

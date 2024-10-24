const mongoose = require("mongoose");

const DataBaseURL = "mongodb://localhost:27017/revitupDB";

mongoose.connect(DataBaseURL)
    .then(() => console.log("Successfully connected to database"))
    .catch((err) => console.log(`Error while connecting to database : ${err}`));
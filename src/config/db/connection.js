const mongoose = require("mongoose");

const DataBaseURL = process.env.MONGO_DB_URL;

mongoose.connect(DataBaseURL)
    .then(() => console.log("Successfully connected to database"))
    .catch((err) => console.log(`Error while connecting to database : ${err}`));
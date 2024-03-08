const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./configs/mongodb.js");
const bodyParser = require("body-parser");
const path = require("path");

//schedulers
require("./scheduler/bestSellingScheduler.js");

dotenv.config();

// Connect to mongodb database
connectDB();

const app = express();

app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "/public")));
// app.use("/public/", express.static("public"));
app.use(express.json({ limit: '100mb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);

// Routes
require("./routes/index.js")(app);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on ${PORT}`);
});

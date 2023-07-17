const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoutes = require("./routes").auth;
const courseRoutes = require("./routes").course;
const updateUserRoutes = require("./routes").updateUser;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");
const port = process.env.PORT || 5000;

//connect to mongoDB
mongoose
  // .connect("mongodb://127.0.0.1:27017/mernDB0716")
  .connect(process.env.MONGODB_CONNECTION)
  .then(() => {
    console.log("Connect to mongodb...");
  })
  .catch((e) => {
    console.log(e);
  });

//set middleware and view engine
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/user", authRoutes);
app.use(
  "/api/user/update",
  passport.authenticate("jwt", { session: false }),
  updateUserRoutes
);
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoutes
);

// app.listen(8080, () => {
//   console.log("Sever running on port 8080");
// });

app.listen(port, () => {
  console.log("Sever running on port 8080");
});

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
  .connect(process.env.MONGODB_CONNECTION)
  .then(() => {
    console.log("Connect to mongodb...");
  })
  .catch((e) => {
    console.log(e);
  });

//set middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 要求進入 /api/user/update與 /api/courses路徑時，必須先經過passport驗證JWT
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

app.listen(port, () => {
  console.log("Sever running on port" + port);
});

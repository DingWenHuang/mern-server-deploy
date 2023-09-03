const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");

router.get("/test", (req, res) => {
  return res.send("test routes.js.....");
});

router.head("/wakeup", async (req, res) => {
  await User.findOne({ email: "wakeup@test.com" }).exec();
});

// 註冊使用者
router.post("/register", async (req, res) => {
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { username, email, password, role } = req.body;
  let foundEmail = await User.findOne({ email }).exec();
  if (foundEmail) {
    return res
      .status(400)
      .send("信箱已被註冊過，請嘗試另一個信箱，或以此信箱進行登入");
  }

  try {
    let newUser = new User({ username, email, password, role });
    let savedUser = await newUser.save();
    let userObj = {
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      date: savedUser.date,
      role: savedUser.role,
    };
    return res.status(201).send({
      msg: "成功註冊使用者",
      userObj,
    });
  } catch (e) {
    returnres.send(e);
  }
});

// 登入使用者
router.post("/login", async (req, res) => {
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { email, password } = req.body;
  let foundUser = await User.findOne({ email }).exec();
  if (!foundUser) {
    return res.status(401).send("無法找到使用者，請確認信箱是否輸入錯誤");
  }

  let userObj = {
    _id: foundUser._id,
    username: foundUser.username,
    email: foundUser.email,
    date: foundUser.date,
    role: foundUser.role,
  };

  foundUser.comparePassword(password, (err, isMatch) => {
    if (err) return res.status(500).send(err);

    if (isMatch) {
      let tokenObject = { _id: foundUser._id, email: foundUser.email };
      let token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        msg: "登入成功",
        token: "JWT " + token,
        user: userObj,
      });
    } else {
      return res.status(401).send("密碼錯誤");
    }
  });
});

module.exports = router;

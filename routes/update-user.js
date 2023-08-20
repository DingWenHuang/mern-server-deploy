const router = require("express").Router();
const updateUserValidation = require("../validation").updateUserValidation;
const changePasswordValidation =
  require("../validation").changePasswordValidation;
const User = require("../models").user;
const bcrypt = require("bcrypt");

router.get("/", (req, res, next) => {
  console.log("we are in update-user route...");
  next();
});

// 更新使用者的名稱跟信箱
router.patch("/changeInfo/:_id", async (req, res) => {
  let { error } = updateUserValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { _id } = req.params;
  let { username, email, password } = req.body;

  if (_id != req.user._id) {
    return res.status(400).send("請以正確的JWT進行請求");
  }

  try {
    let foundUser = await User.findOne({ _id }).exec();
    if (!foundUser) {
      return res.status(401).send("無法找到使用者");
    }

    let foundUserByEmail = await User.findOne({ email }).exec();
    if (foundUserByEmail && !foundUserByEmail._id.equals(_id)) {
      return res.status(400).send("信箱已被其他使用者註冊過，請嘗試另一個信箱");
    }

    foundUserByEmail.comparePassword(password, async (err, isMatch) => {
      if (err) return res.status(500).send(err);

      if (isMatch) {
        let updatedUser = await User.findOneAndUpdate(
          { _id },
          { username, email },
          {
            new: true,
            runValidators: true,
          }
        ).exec();
        return res.send(updatedUser);
      } else {
        return res.status(401).send("密碼錯誤");
      }
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

// 更新使用者密碼
router.patch("/changePassword/:_id", async (req, res) => {
  let { error } = changePasswordValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { _id } = req.params;
  let { oldPassword, newPassword } = req.body;

  if (_id != req.user._id) {
    return res.status(400).send("請以正確的JWT進行請求");
  }

  try {
    let foundUser = await User.findOne({ _id }).exec();
    if (!foundUser) {
      return res.status(401).send("無法找到使用者");
    }

    foundUser.comparePassword(oldPassword, async (err, isMatch) => {
      if (err) return res.status(500).send(err);

      if (isMatch) {
        let hashedPassword = await bcrypt.hash(newPassword, 12);

        let updatedUser = await User.findOneAndUpdate(
          { _id },
          { password: hashedPassword },
          {
            new: true,
            runValidators: true,
          }
        ).exec();
        return res.send(updatedUser);
      } else {
        return res.status(401).send("密碼錯誤");
      }
    });
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;

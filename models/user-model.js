const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlenght: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlenght: 6,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "instructor"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// instance method
userSchema.methods.isStudent = function () {
  return this.role == "student";
};

userSchema.methods.isInstructor = function () {
  return this.role == "instructor";
};

// 建立一個方法，用來比對使用者輸入的密碼與資料庫中的密碼是否相同
userSchema.methods.comparePassword = async function (password, callback) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    callback(null, result);
  } catch (e) {
    callback(e, result);
  }
};

// 當使用者註冊或更新密碼時，將密碼加密後再存入資料庫
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModefied("password")) {
    let hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);

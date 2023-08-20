const router = require("express").Router();
const courseValidation = require("../validation").courseValidation;
const Course = require("../models").course;

// 建立新課程
router.post("/", async (req, res) => {
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user.isStudent()) {
    return res.status(403).send("只有老師才可以新增課程");
  }

  let { title, description, price } = req.body;

  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
    });
    await newCourse.save();
    return res.send("課程創建成功");
  } catch (e) {
    return res.status(500).send("無法創建課程。。。");
  }
});

// 取得所有課程
router.get("/", async (req, res) => {
  let { sort } = req.query;
  let sortObj;
  switch (sort) {
    case "date-desc":
      sortObj = { date: -1 };
      break;
    case "date-asc":
      sortObj = { date: 1 };
      break;
    case "students-desc":
      sortObj = { studentLength: -1 };
      break;
    case "students-asc":
      sortObj = { studentLength: 1 };
      break;
    case "price-desc":
      sortObj = { price: -1 };
      break;
    case "price-asc":
      sortObj = { price: 1 };
      break;
  }
  try {
    let coursesFound = await Course.find({})
      .populate("instructor", ["username", "email"])
      .sort(sortObj)
      .exec();
    return res.send(coursesFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 透過ID查詢特定課程
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 透過ID更新特定課程
router.patch("/:_id", async (req, res) => {
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user.isStudent()) {
    return res.status(403).send("只有老師才可以更新課程");
  }

  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id })
      .populate("instructor", ["username", "email"])
      .exec();
    if (!courseFound) {
      return res.status(400).send("無法找到該課程");
    }
    if (!courseFound.instructor.equals(req.user._id)) {
      return res.status(403).send("只有該課程講師才可以更新課程");
    }
    let updatedCourse = await Course.findByIdAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true,
    });
    return res.send({
      msg: "課程更新成功",
      updatedCourse,
    });
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 透過ID刪除特定課程
router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;

  if (req.user.isStudent()) {
    return res.status(403).send("只有老師才可以刪除課程");
  }

  try {
    let courseFound = await Course.findOne({ _id }).exec();
    if (!courseFound) {
      return res.status(400).send("無法找到該課程");
    }
    if (!courseFound.instructor.equals(req.user._id)) {
      return res.status(403).send("只有該課程講師才可以刪除課程");
    }
    await Course.deleteOne({ _id }).exec();
    return res.send("成功刪除課程");
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 透過講師ID查詢開設的課程
router.get("/instructor/:_instructor_id", async (req, res) => {
  if (req.user.isStudent()) {
    return res.status(403).send("只有老師才可以查詢開設的課程");
  }

  let { _instructor_id } = req.params;
  try {
    let coursesFound = await Course.find({ instructor: _instructor_id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(coursesFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 透過學生ID查詢註冊的課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  try {
    let coursesFound = await Course.find({ students: _student_id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(coursesFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 透過課程名稱查詢課程
router.get("/findByName/:title", async (req, res) => {
  let { title } = req.params;
  let { sort } = req.query;
  let sortObj;
  switch (sort) {
    case "date-desc":
      sortObj = { date: -1 };
      break;
    case "date-asc":
      sortObj = { date: 1 };
      break;
    case "students-desc":
      sortObj = { studentLength: -1 };
      break;
    case "students-asc":
      sortObj = { studentLength: 1 };
      break;
    case "price-desc":
      sortObj = { price: -1 };
      break;
    case "price-asc":
      sortObj = { price: 1 };
      break;
  }

  try {
    let coursesFound = await Course.find({
      title: { $regex: title, $options: "i" },
    })
      .populate("instructor", ["username", "email"])
      .sort(sortObj)
      .exec();
    return res.send(coursesFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 註冊課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id }).exec();

    if (!courseFound.students.includes(req.user._id)) {
      courseFound.students.push(req.user._id);
      courseFound.studentLength++;
      await courseFound.save();
      return res.send("註冊成功");
    } else {
      return res.status(400).send("您已經註冊過該課程");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 退選課程
router.patch("/drop/:_id", async (req, res) => {
  let { _id } = req.params;

  try {
    let courseFound = await Course.findOne({ _id });

    if (!courseFound) {
      return res.status(400).send("找不到該課程，無法取消註冊課程");
    }
    if (!courseFound.students.includes(req.user._id)) {
      return res.status(403).send("非該課程學生，無法取消註冊課程");
    }
    let updatedCourse = await Course.updateOne(
      courseFound,
      { $pull: { students: req.user._id }, $inc: { studentLength: -1 } },
      {
        new: true,
        runValidators: true,
      }
    );
    return res.send({
      msg: "成功更新課程",
      course: updatedCourse,
    });
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;

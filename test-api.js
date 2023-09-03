const supertest = require("supertest");
require("./server");
const assert = require("chai").assert;
const mongoose = require("mongoose");

const api = supertest("http://localhost:5000");

const studentObj = new Object({
  username: "student12345",
  email: "student12345@test.com",
  password: "student12345",
  role: "student",
});

const anotherStudentObj = new Object({
  username: "student56789",
  email: "student56789@test.com",
  password: "student56789",
  role: "student",
});

const instructorObj = new Object({
  username: "instructor12345",
  email: "instructor12345@test.com",
  password: "instructor12345",
  role: "instructor",
});

const anotherInstructorObj = new Object({
  username: "instructor56789",
  email: "instructor56789@test.com",
  password: "instructor56789",
  role: "instructor",
});

const courseObj = new Object({
  title: "test course",
  description: "test course",
  price: "5000",
});

// 函式用於註冊用戶
async function registerUser(userObj) {
  try {
    const res = await api
      .post("/api/user/register")
      .set("Content-Type", "application/json")
      .send(userObj);
    return res;
  } catch (err) {
    throw err;
  }
}

// 函式用於登入用戶
async function loginUser(email, password) {
  try {
    const res = await api
      .post("/api/user/login")
      .set("Content-Type", "application/json")
      .send({ email, password });
    return res;
  } catch (err) {
    throw err;
  }
}

// 函式用於註冊與登入用戶
async function registerAndLoginUser(userObj) {
  try {
    const registerRes = await registerUser(userObj);
    assert.equal(registerRes.status, 201);
    assert.equal(registerRes.body.msg, "成功註冊使用者");
    assert.equal(registerRes.body.userObj.username, userObj.username);
    assert.equal(registerRes.body.userObj.email, userObj.email);
    assert.equal(registerRes.body.userObj.role, userObj.role);

    const loginRes = await loginUser(userObj.email, userObj.password);
    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.msg, "登入成功");
    assert.equal(loginRes.body.user.username, userObj.username);
    assert.equal(loginRes.body.user.email, userObj.email);
    assert.equal(loginRes.body.user.role, userObj.role);

    return loginRes;
  } catch (err) {
    throw err;
  }
}

// 函式用於更新用戶資料
async function updateUser(userId, authToken, updateObj) {
  try {
    const res = await api
      .patch("/api/user/update/changeInfo/" + userId)
      .set("Content-Type", "application/json")
      .set("Authorization", authToken)
      .send(updateObj);
    return res;
  } catch (err) {
    throw err;
  }
}

// 函式用於變更密碼
async function changePassword(userId, authToken, updateObj) {
  try {
    const res = await api
      .patch("/api/user/update/changePassword/" + userId)
      .set("Content-Type", "application/json")
      .set("Authorization", authToken)
      .send(updateObj);
    return res;
  } catch (err) {
    throw err;
  }
}

// 函式用於創建課程
async function createCourse(authToken, courseObj) {
  try {
    const res = await api
      .post("/api/courses")
      .set("Content-Type", "application/json")
      .set("Authorization", authToken)
      .send(courseObj);
    return res;
  } catch (err) {
    throw err;
  }
}

// 函式用於取得講師開設的課程
async function getInstructorCourses(userId, authToken) {
  try {
    const res = await api
      .get("/api/courses/instructor/" + userId)
      .set("Content-Type", "application/json")
      .set("Authorization", authToken);
    return res;
  } catch (err) {
    throw err;
  }
}

// 函式用於更新課程
async function updateCourse(courseId, authToken, updateObj) {
  try {
    const res = await api
      .patch("/api/courses/" + courseId)
      .set("Content-Type", "application/json")
      .set("Authorization", authToken)
      .send(updateObj);
    return res;
  } catch (err) {
    throw err;
  }
}

// 函式用於刪除課程
async function deleteCourse(courseId, authToken) {
  try {
    const res = await api
      .delete("/api/courses/" + courseId)
      .set("Content-Type", "application/json")
      .set("Authorization", authToken);
    return res;
  } catch (err) {
    throw err;
  }
}

// 函式用於註冊講師並登入且創建課程
async function registerAndLoginInstructorAndCreateCourse(
  instructorObj,
  courseObj
) {
  try {
    // 註冊並登入講師
    const loginRes = await registerAndLoginUser(instructorObj);

    // 取得登入後的authToken
    let authToken = loginRes.body.token;

    // 創建課程
    const createCourseRes = await createCourse(authToken, courseObj);
    assert.equal(createCourseRes.status, 201);
    assert.equal(createCourseRes.body.msg, "課程創建成功");
    assert.equal(createCourseRes.body.course.title, courseObj.title);
    assert.equal(
      createCourseRes.body.course.description,
      courseObj.description
    );
    assert.equal(createCourseRes.body.course.price, courseObj.price);
    assert.equal(
      createCourseRes.body.course.instructor,
      loginRes.body.user._id
    );
    return { loginRes, createCourseRes };
  } catch (err) {
    throw err;
  }
}

// 函式用於取得所有的課程
async function getAllCourses(authToken) {
  try {
    const res = await api
      .get("/api/courses")
      .set("Content-Type", "application/json")
      .set("Authorization", authToken);
    return res;
  } catch (err) {
    throw err;
  }
}

// 函式用於學生註冊課程
async function enrollCourse(courseId, authToken) {
  try {
    const res = await api
      .post("/api/courses/enroll/" + courseId)
      .set("Content-Type", "application/json")
      .set("Authorization", authToken);
    return res;
  } catch (err) {
    throw err;
  }
}

// 函式用於取得學生註冊的課程
async function getStudentCourses(userId, authToken) {
  try {
    const res = await api
      .get("/api/courses/student/" + userId)
      .set("Content-Type", "application/json")
      .set("Authorization", authToken);
    return res;
  } catch (err) {
    throw err;
  }
}

// 函式用於退選學生註冊的課程
async function dropCourse(courseId, authToken) {
  try {
    const res = await api
      .patch("/api/courses/drop/" + courseId)
      .set("Content-Type", "application/json")
      .set("Authorization", authToken);
    return res;
  } catch (err) {
    throw err;
  }
}

// 每個測試前都清除資料庫內的使用者資料與課程資料
beforeEach(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/testDB");
  const { courses, users } = mongoose.connection.collections;
  await courses.deleteMany({});
  await users.deleteMany({});
});

describe("User register", () => {
  it("register - success", async () => {
    try {
      let { username, email, role } = studentObj;

      // 註冊用戶
      const registerRes = await registerUser(studentObj);
      assert.equal(registerRes.status, 201);
      assert.equal(registerRes.body.msg, "成功註冊使用者");
      assert.equal(registerRes.body.userObj.username, username);
      assert.equal(registerRes.body.userObj.email, email);
      assert.equal(registerRes.body.userObj.role, role);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("register - invalid username", async () => {
    try {
      // 用戶名稱太短
      let newUser = new Object({
        username: "an",
        email: "test12345@test.com",
        password: "test12345",
        role: "student",
      });

      // 註冊用戶
      const registerRes = await registerUser(newUser);
      assert.equal(registerRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("register - invalid email", async () => {
    try {
      // 用戶email格式錯誤
      let newUser = new Object({
        username: "test12345",
        email: "test12345.com",
        password: "test12345",
        role: "student",
      });

      // 註冊用戶
      const registerRes = await registerUser(newUser);
      assert.equal(registerRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("register - invalid password", async () => {
    try {
      // 用戶密碼太短
      let newUser = new Object({
        username: "test12345",
        email: "test12345@test.com",
        password: "test",
        role: "student",
      });

      // 註冊用戶
      const registerRes = await registerUser(newUser);
      assert.equal(registerRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("register - invalid role", async () => {
    try {
      // 用戶角色錯誤
      let newUser = new Object({
        username: "test12345",
        email: "test12345@test.com",
        password: "test12345",
        role: "player",
      });

      // 註冊用戶
      const registerRes = await registerUser(newUser);
      assert.equal(registerRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("register - email already registered", async () => {
    try {
      let { username, email, role } = studentObj;

      const registerRes = await registerUser(studentObj);
      assert.equal(registerRes.status, 201);
      assert.equal(registerRes.body.msg, "成功註冊使用者");
      assert.equal(registerRes.body.userObj.username, username);
      assert.equal(registerRes.body.userObj.email, email);
      assert.equal(registerRes.body.userObj.role, role);

      // 以相同的email重複註冊
      const registerRes2 = await registerUser(studentObj);
      assert.equal(registerRes2.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});

describe("User login", () => {
  it("login - success", async () => {
    try {
      let { username, email, password, role } = studentObj;

      // 註冊用戶
      const registerRes = await registerUser(studentObj);
      assert.equal(registerRes.status, 201);
      assert.equal(registerRes.body.msg, "成功註冊使用者");
      assert.equal(registerRes.body.userObj.username, username);
      assert.equal(registerRes.body.userObj.email, email);
      assert.equal(registerRes.body.userObj.role, role);

      // 登入用戶
      const loginRes = await loginUser(email, password);
      assert.equal(loginRes.status, 200);
      assert.equal(loginRes.body.msg, "登入成功");
      assert.equal(loginRes.body.user.username, username);
      assert.equal(loginRes.body.user.email, email);
      assert.equal(loginRes.body.user.role, role);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("login - email not found", async () => {
    try {
      let { username, email, password, role } = studentObj;

      // 註冊用戶
      const registerRes = await registerUser(studentObj);
      assert.equal(registerRes.status, 201);
      assert.equal(registerRes.body.msg, "成功註冊使用者");
      assert.equal(registerRes.body.userObj.username, username);
      assert.equal(registerRes.body.userObj.email, email);
      assert.equal(registerRes.body.userObj.role, role);

      // 以不存在的email登入
      email = "unknowe@test.com";
      const loginRes = await loginUser(email, password);
      assert.equal(loginRes.status, 401);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("login - wrong password", async () => {
    try {
      let { username, email, password, role } = studentObj;

      // 註冊用戶
      const registerRes = await registerUser(studentObj);
      assert.equal(registerRes.status, 201);
      assert.equal(registerRes.body.msg, "成功註冊使用者");
      assert.equal(registerRes.body.userObj.username, username);
      assert.equal(registerRes.body.userObj.email, email);
      assert.equal(registerRes.body.userObj.role, role);

      // 以錯誤的密碼登入
      password = "unknowePassword";
      const loginRes = await loginUser(email, password);
      assert.equal(loginRes.status, 401);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});

describe("User update", () => {
  it("update info - change username success", async () => {
    try {
      let { username, email, password, role } = studentObj;

      // 註冊並登入用戶
      const loginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 更新username
      let updatedObj = new Object({
        username: "newUsername",
        email,
        password,
      });
      const updateRes = await updateUser(
        loginRes.body.user._id,
        authToken,
        updatedObj
      );
      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.body.username, updatedObj.username);
      assert.equal(updateRes.body.email, email);
      assert.equal(updateRes.body.role, role);

      // 重新登入
      const loginRes2 = await loginUser(email, password);
      assert.equal(loginRes2.status, 200);
      assert.equal(loginRes2.body.msg, "登入成功");
      assert.equal(loginRes2.body.user.username, updatedObj.username);
      assert.equal(loginRes2.body.user.email, email);
      assert.equal(loginRes2.body.user.role, role);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("update info - invalid username", async () => {
    try {
      let { username, email, password, role } = studentObj;

      // 註冊並登入用戶
      const loginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 更新username-太短
      let updatedObj = new Object({
        username: "XD",
        email,
        password,
      });

      const updateRes = await updateUser(
        loginRes.body.user._id,
        authToken,
        updatedObj
      );
      assert.equal(updateRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("update info - change email success", async () => {
    try {
      let { username, email, password, role } = studentObj;

      // 註冊並登入用戶
      const loginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 更新email
      let updatedObj = new Object({
        username,
        email: "newEmail@test.com",
        password,
      });

      const updateRes = await updateUser(
        loginRes.body.user._id,
        authToken,
        updatedObj
      );
      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.body.username, username);
      assert.equal(updateRes.body.email, updatedObj.email);
      assert.equal(updateRes.body.role, role);

      // 以新email登入
      const loginRes2 = await loginUser(updatedObj.email, password);
      assert.equal(loginRes2.status, 200);
      assert.equal(loginRes2.body.msg, "登入成功");
      assert.equal(loginRes2.body.user.username, username);
      assert.equal(loginRes2.body.user.email, updatedObj.email);
      assert.equal(loginRes2.body.user.role, role);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("update info - invalid email", async () => {
    try {
      let { username, email, password, role } = studentObj;

      // 註冊並登入用戶
      const loginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 更新email-格式錯誤
      let updatedObj = new Object({
        username,
        email: "newEmail.com",
        password,
      });

      const updateRes = await updateUser(
        loginRes.body.user._id,
        authToken,
        updatedObj
      );
      assert.equal(updateRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("update info - wrong password", async () => {
    try {
      let { username, email, password, role } = studentObj;

      // 註冊並登入用戶
      const loginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 提供錯誤的密碼
      let updatedObj = new Object({
        username,
        email,
        password: "wrongPassword",
      });

      const updateRes = await updateUser(
        loginRes.body.user._id,
        authToken,
        updatedObj
      );
      assert.equal(updateRes.status, 401);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("change password - success", async () => {
    try {
      let { username, email, password, role } = studentObj;

      // 註冊並登入用戶
      const loginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 更新密碼
      let updatedObj = new Object({
        oldPassword: password,
        newPassword: "newPassword",
      });

      const updateRes = await changePassword(
        loginRes.body.user._id,
        authToken,
        updatedObj
      );
      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.body.username, username);
      assert.equal(updateRes.body.email, email);
      assert.equal(updateRes.body.role, role);

      // 以新密碼登入
      const loginRes2 = await loginUser(email, updatedObj.newPassword);
      assert.equal(loginRes2.status, 200);
      assert.equal(loginRes2.body.msg, "登入成功");
      assert.equal(loginRes2.body.user.username, username);
      assert.equal(loginRes2.body.user.email, email);
      assert.equal(loginRes2.body.user.role, role);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("change password - invalid new password", async () => {
    try {
      let { username, email, password, role } = studentObj;

      // 註冊並登入用戶
      const loginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 更新密碼-太短
      let updatedObj = new Object({
        oldPassword: password,
        newPassword: "new",
      });

      const updateRes = await changePassword(
        loginRes.body.user._id,
        authToken,
        updatedObj
      );
      assert.equal(updateRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("change password - wrong oldPassword", async () => {
    try {
      let { username, email, password, role } = studentObj;

      // 註冊並登入用戶
      const loginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 更新密碼-舊密碼錯誤
      let updatedObj = new Object({
        oldPassword: "wrongPassword",
        newPassword: "newPassword",
      });

      const updateRes = await changePassword(
        loginRes.body.user._id,
        authToken,
        updatedObj
      );
      assert.equal(updateRes.status, 401);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});

describe("Instructor create course", () => {
  it("create course - success", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程
      const createCourseRes = await createCourse(authToken, courseObj);
      assert.equal(createCourseRes.status, 201);
      assert.equal(createCourseRes.body.msg, "課程創建成功");
      assert.equal(createCourseRes.body.course.title, courseObj.title);
      assert.equal(
        createCourseRes.body.course.description,
        courseObj.description
      );
      assert.equal(createCourseRes.body.course.price, courseObj.price);
      assert.equal(
        createCourseRes.body.course.instructor,
        loginRes.body.user._id
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("create course - invalid role", async () => {
    try {
      let { username, email, password, role } = studentObj;

      // 註冊並登入學生
      const loginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程
      const createCourseRes = await createCourse(authToken, courseObj);
      assert.equal(createCourseRes.status, 403);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("create course - invalid title", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程-標題太短
      let newCourseObj = new Object({
        title: "test",
        description: "test course",
        price: "5000",
      });
      const createCourseRes = await createCourse(authToken, newCourseObj);
      assert.equal(createCourseRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("create course - invalid description", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程-描述太短
      let newCourseObj = new Object({
        title: "test course",
        description: "test",
        price: "5000",
      });
      const createCourseRes = await createCourse(authToken, newCourseObj);
      assert.equal(createCourseRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("create course - invalid price", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程-價格太高
      let newCourseObj = new Object({
        title: "test course",
        description: "test course",
        price: "50000",
      });
      const createCourseRes = await createCourse(authToken, newCourseObj);
      assert.equal(createCourseRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});

describe("Instructor search course", () => {
  it("search course - success", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程
      const createCourseRes = await createCourse(authToken, courseObj);
      assert.equal(createCourseRes.status, 201);
      assert.equal(createCourseRes.body.msg, "課程創建成功");
      assert.equal(createCourseRes.body.course.title, courseObj.title);
      assert.equal(
        createCourseRes.body.course.description,
        courseObj.description
      );
      assert.equal(createCourseRes.body.course.price, courseObj.price);
      assert.equal(
        createCourseRes.body.course.instructor,
        loginRes.body.user._id
      );

      // 取得已開設的課程
      const searchCourseRes = await getInstructorCourses(
        loginRes.body.user._id,
        authToken
      );
      assert.equal(searchCourseRes.status, 200);
      assert.equal(searchCourseRes.body.length, 1);
      assert.equal(searchCourseRes.body[0].title, courseObj.title);
      assert.equal(searchCourseRes.body[0].description, courseObj.description);
      assert.equal(searchCourseRes.body[0].price, courseObj.price);
      assert.equal(
        searchCourseRes.body[0].instructor._id,
        loginRes.body.user._id
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("search course - no course", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 取得已開設的課程
      const searchCourseRes = await getInstructorCourses(
        loginRes.body.user._id,
        authToken
      );
      assert.equal(searchCourseRes.status, 200);
      assert.equal(searchCourseRes.body.length, 0);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("search course - invalid role", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程
      const createCourseRes = await createCourse(authToken, courseObj);
      assert.equal(createCourseRes.status, 201);
      assert.equal(createCourseRes.body.msg, "課程創建成功");
      assert.equal(createCourseRes.body.course.title, courseObj.title);
      assert.equal(
        createCourseRes.body.course.description,
        courseObj.description
      );
      assert.equal(createCourseRes.body.course.price, courseObj.price);
      assert.equal(
        createCourseRes.body.course.instructor,
        loginRes.body.user._id
      );

      // 註冊並登入學生
      const loginRes2 = await registerAndLoginUser(studentObj);

      // 取得學生的authToken
      let authToken2 = loginRes2.body.token;

      // 以學生身分取得講師已開設的課程
      const searchCourseRes = await getInstructorCourses(
        loginRes.body.user._id,
        authToken2
      );
      assert.equal(searchCourseRes.status, 403);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});

describe("Instructor update course", () => {
  it("update course - success", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程
      const createCourseRes = await createCourse(authToken, courseObj);
      assert.equal(createCourseRes.status, 201);
      assert.equal(createCourseRes.body.msg, "課程創建成功");
      assert.equal(createCourseRes.body.course.title, courseObj.title);
      assert.equal(
        createCourseRes.body.course.description,
        courseObj.description
      );
      assert.equal(createCourseRes.body.course.price, courseObj.price);
      assert.equal(
        createCourseRes.body.course.instructor,
        loginRes.body.user._id
      );

      // 更新課程
      let updatedCourse = {
        title: "updated course",
        description: "updated course",
        price: "8000",
      };

      const updateCourseRes = await updateCourse(
        createCourseRes.body.course._id,
        authToken,
        updatedCourse
      );
      assert.equal(updateCourseRes.status, 200);
      assert.equal(updateCourseRes.body.msg, "課程更新成功");
      assert.equal(updateCourseRes.body.course.title, updatedCourse.title);
      assert.equal(
        updateCourseRes.body.course.description,
        updatedCourse.description
      );
      assert.equal(updateCourseRes.body.course.price, updatedCourse.price);

      // 取得更新後的課程
      const getCourseRes = await getInstructorCourses(
        loginRes.body.user._id,
        authToken
      );
      assert.equal(getCourseRes.status, 200);
      assert.equal(getCourseRes.body.length, 1);
      assert.equal(getCourseRes.body[0].title, updatedCourse.title);
      assert.equal(getCourseRes.body[0].description, updatedCourse.description);
      assert.equal(getCourseRes.body[0].price, updatedCourse.price);
      assert.equal(getCourseRes.body[0].instructor._id, loginRes.body.user._id);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("update course - invalid course id", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程
      const createCourseRes = await createCourse(authToken, courseObj);
      assert.equal(createCourseRes.status, 201);
      assert.equal(createCourseRes.body.msg, "課程創建成功");
      assert.equal(createCourseRes.body.course.title, courseObj.title);
      assert.equal(
        createCourseRes.body.course.description,
        courseObj.description
      );
      assert.equal(createCourseRes.body.course.price, courseObj.price);
      assert.equal(
        createCourseRes.body.course.instructor,
        loginRes.body.user._id
      );

      // 更新課程
      let updatedCourse = {
        title: "updated course",
        description: "updated course",
        price: "8000",
      };

      // 提供錯誤的課程id進行更新
      let wrongCourseId = "123456789012345678901234";

      const updateCourseRes = await updateCourse(
        wrongCourseId,
        authToken,
        updatedCourse
      );
      assert.equal(updateCourseRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("update course - invalid role", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程
      const createCourseRes = await createCourse(authToken, courseObj);
      assert.equal(createCourseRes.status, 201);
      assert.equal(createCourseRes.body.msg, "課程創建成功");
      assert.equal(createCourseRes.body.course.title, courseObj.title);
      assert.equal(
        createCourseRes.body.course.description,
        courseObj.description
      );
      assert.equal(createCourseRes.body.course.price, courseObj.price);
      assert.equal(
        createCourseRes.body.course.instructor,
        loginRes.body.user._id
      );

      // 註冊並登入學生
      const loginRes2 = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      authToken = loginRes2.body.token;

      // 更新課程
      let updatedCourse = {
        title: "updated course",
        description: "updated course",
        price: "8000",
      };

      const updateCourseRes = await updateCourse(
        createCourseRes.body.course._id,
        authToken,
        updatedCourse
      );
      assert.equal(updateCourseRes.status, 403);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("update course - not this course's instructor", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程
      const createCourseRes = await createCourse(authToken, courseObj);
      assert.equal(createCourseRes.status, 201);
      assert.equal(createCourseRes.body.msg, "課程創建成功");
      assert.equal(createCourseRes.body.course.title, courseObj.title);
      assert.equal(
        createCourseRes.body.course.description,
        courseObj.description
      );
      assert.equal(createCourseRes.body.course.price, courseObj.price);
      assert.equal(
        createCourseRes.body.course.instructor,
        loginRes.body.user._id
      );

      // 註冊並登入另一位講師
      const loginRes2 = await registerAndLoginUser(anotherInstructorObj);

      // 取得登入後的authToken
      authToken = loginRes2.body.token;

      // 更新課程
      let updatedCourse = {
        title: "updated course",
        description: "updated course",
        price: "8000",
      };

      const updateCourseRes = await updateCourse(
        createCourseRes.body.course._id,
        authToken,
        updatedCourse
      );
      assert.equal(updateCourseRes.status, 403);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});

describe("Instructor delete course", () => {
  it("delete course - success", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程
      const createCourseRes = await createCourse(authToken, courseObj);
      assert.equal(createCourseRes.status, 201);
      assert.equal(createCourseRes.body.msg, "課程創建成功");
      assert.equal(createCourseRes.body.course.title, courseObj.title);
      assert.equal(
        createCourseRes.body.course.description,
        courseObj.description
      );
      assert.equal(createCourseRes.body.course.price, courseObj.price);
      assert.equal(
        createCourseRes.body.course.instructor,
        loginRes.body.user._id
      );

      // 刪除課程
      const deleteCourseRes = await deleteCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(deleteCourseRes.status, 204);

      // 取得已開設的課程
      const searchCourseRes = await getInstructorCourses(
        loginRes.body.user._id,
        authToken
      );
      assert.equal(searchCourseRes.status, 200);
      assert.equal(searchCourseRes.body.length, 0);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("delete course - course id not found", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程
      const createCourseRes = await createCourse(authToken, courseObj);
      assert.equal(createCourseRes.status, 201);
      assert.equal(createCourseRes.body.msg, "課程創建成功");
      assert.equal(createCourseRes.body.course.title, courseObj.title);
      assert.equal(
        createCourseRes.body.course.description,
        courseObj.description
      );
      assert.equal(createCourseRes.body.course.price, courseObj.price);
      assert.equal(
        createCourseRes.body.course.instructor,
        loginRes.body.user._id
      );

      // 錯誤的課程id
      let wrongCourseId = "123456789012345678901234";

      // 刪除課程
      const deleteCourseRes = await deleteCourse(wrongCourseId, authToken);
      assert.equal(deleteCourseRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("delete course - invalid role", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程
      const createCourseRes = await createCourse(authToken, courseObj);
      assert.equal(createCourseRes.status, 201);
      assert.equal(createCourseRes.body.msg, "課程創建成功");
      assert.equal(createCourseRes.body.course.title, courseObj.title);
      assert.equal(
        createCourseRes.body.course.description,
        courseObj.description
      );
      assert.equal(createCourseRes.body.course.price, courseObj.price);
      assert.equal(
        createCourseRes.body.course.instructor,
        loginRes.body.user._id
      );

      // 註冊並登入學生
      const loginRes2 = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      authToken = loginRes2.body.token;

      // 刪除課程
      const deleteCourseRes = await deleteCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(deleteCourseRes.status, 403);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("delete course - not this course's instructor", async () => {
    try {
      let { username, email, password, role } = instructorObj;

      // 註冊並登入講師
      const loginRes = await registerAndLoginUser(instructorObj);

      // 取得登入後的authToken
      let authToken = loginRes.body.token;

      // 創建課程
      const createCourseRes = await createCourse(authToken, courseObj);
      assert.equal(createCourseRes.status, 201);
      assert.equal(createCourseRes.body.msg, "課程創建成功");
      assert.equal(createCourseRes.body.course.title, courseObj.title);
      assert.equal(
        createCourseRes.body.course.description,
        courseObj.description
      );
      assert.equal(createCourseRes.body.course.price, courseObj.price);
      assert.equal(
        createCourseRes.body.course.instructor,
        loginRes.body.user._id
      );

      // 註冊並登入另一名講師
      const loginRes2 = await registerAndLoginUser(anotherInstructorObj);

      // 取得登入後的authToken
      authToken = loginRes2.body.token;

      // 刪除課程
      const deleteCourseRes = await deleteCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(deleteCourseRes.status, 403);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});

describe("Student search course", () => {
  it("search course - success", async () => {
    try {
      // 註冊並登入講師且創建課程
      await registerAndLoginInstructorAndCreateCourse(instructorObj, courseObj);

      // 註冊並登入學生
      const studentLoginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = studentLoginRes.body.token;

      // 取得所有講師開設的課程
      const searchCourseRes = await getAllCourses(authToken);
      assert.equal(searchCourseRes.status, 200);
      assert.equal(searchCourseRes.body.length, 1);
      assert.equal(searchCourseRes.body[0].title, courseObj.title);
      assert.equal(searchCourseRes.body[0].description, courseObj.description);
      assert.equal(searchCourseRes.body[0].price, courseObj.price);
      assert.equal(
        searchCourseRes.body[0].instructor.username,
        instructorObj.username
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("search course - no courses", async () => {
    try {
      // 註冊並登入學生
      const studentLoginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = studentLoginRes.body.token;

      // 取得所有講師開設的課程
      const searchCourseRes = await getAllCourses(authToken);
      assert.equal(searchCourseRes.status, 200);
      assert.equal(searchCourseRes.body.length, 0);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("search course - invalid role", async () => {
    try {
      // 註冊並登入講師且創建課程
      let { loginRes } = await registerAndLoginInstructorAndCreateCourse(
        instructorObj,
        courseObj
      );

      // 取得講師的authToken
      let authToken = loginRes.body.token;

      // 以講師身分，取得所有講師開設的課程
      const searchCourseRes = await getAllCourses(authToken);
      assert.equal(searchCourseRes.status, 403);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});

describe("Student enroll course", () => {
  it("enroll course - success", async () => {
    try {
      // 註冊並登入講師且創建課程
      let { createCourseRes } = await registerAndLoginInstructorAndCreateCourse(
        instructorObj,
        courseObj
      );

      // 註冊並登入學生
      const studentLoginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = studentLoginRes.body.token;

      // 註冊課程
      const enrollCourseRes = await enrollCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(enrollCourseRes.status, 200);
      assert.equal(enrollCourseRes.body.msg, "註冊成功");
      assert.equal(
        enrollCourseRes.body.course.title,
        createCourseRes.body.course.title
      );
      assert.equal(
        enrollCourseRes.body.course.description,
        createCourseRes.body.course.description
      );
      assert.equal(
        enrollCourseRes.body.course.price,
        createCourseRes.body.course.price
      );
      assert.equal(
        enrollCourseRes.body.course.instructor,
        createCourseRes.body.course.instructor
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("enroll course - course id not found", async () => {
    try {
      // 註冊並登入講師且創建課程
      let { createCourseRes } = await registerAndLoginInstructorAndCreateCourse(
        instructorObj,
        courseObj
      );

      // 註冊並登入學生
      const studentLoginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = studentLoginRes.body.token;

      // 註冊課程-錯誤的課程id

      let wrongCourseId = "123456789012345678901234";

      const enrollCourseRes = await enrollCourse(wrongCourseId, authToken);
      assert.equal(enrollCourseRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("enroll course - duplicate enrollment", async () => {
    try {
      // 註冊並登入講師且創建課程
      let { createCourseRes } = await registerAndLoginInstructorAndCreateCourse(
        instructorObj,
        courseObj
      );

      // 註冊並登入學生
      const studentLoginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = studentLoginRes.body.token;

      // 註冊課程
      const enrollCourseRes = await enrollCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(enrollCourseRes.status, 200);
      assert.equal(enrollCourseRes.body.msg, "註冊成功");
      assert.equal(
        enrollCourseRes.body.course.title,
        createCourseRes.body.course.title
      );
      assert.equal(
        enrollCourseRes.body.course.description,
        createCourseRes.body.course.description
      );
      assert.equal(
        enrollCourseRes.body.course.price,
        createCourseRes.body.course.price
      );
      assert.equal(
        enrollCourseRes.body.course.instructor,
        createCourseRes.body.course.instructor
      );

      // 註冊課程-重複註冊
      const enrollCourseRes2 = await enrollCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(enrollCourseRes2.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("enroll course - invalid role", async () => {
    try {
      // 註冊並登入講師且創建課程
      let { loginRes, createCourseRes } =
        await registerAndLoginInstructorAndCreateCourse(
          instructorObj,
          courseObj
        );

      // 取得講師的authToken
      let authToken = loginRes.body.token;

      // 註冊課程
      const enrollCourseRes = await enrollCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(enrollCourseRes.status, 403);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});

describe("Student get enrolled courses", () => {
  it("get enrolled course - success", async () => {
    try {
      // 註冊並登入講師且創建課程
      let { createCourseRes } = await registerAndLoginInstructorAndCreateCourse(
        instructorObj,
        courseObj
      );

      // 註冊並登入學生
      const studentLoginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = studentLoginRes.body.token;

      // 註冊課程
      const enrollCourseRes = await enrollCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(enrollCourseRes.status, 200);
      assert.equal(enrollCourseRes.body.msg, "註冊成功");
      assert.equal(
        enrollCourseRes.body.course.title,
        createCourseRes.body.course.title
      );
      assert.equal(
        enrollCourseRes.body.course.description,
        createCourseRes.body.course.description
      );
      assert.equal(
        enrollCourseRes.body.course.price,
        createCourseRes.body.course.price
      );
      assert.equal(
        enrollCourseRes.body.course.instructor,
        createCourseRes.body.course.instructor
      );

      // 取得學生已註冊的課程
      const getEnrolledCourseRes = await getStudentCourses(
        studentLoginRes.body.user._id,
        authToken
      );
      assert.equal(getEnrolledCourseRes.status, 200);
      assert.equal(getEnrolledCourseRes.body.length, 1);
      assert.equal(
        getEnrolledCourseRes.body[0].title,
        createCourseRes.body.course.title
      );
      assert.equal(
        getEnrolledCourseRes.body[0].description,
        createCourseRes.body.course.description
      );
      assert.equal(
        getEnrolledCourseRes.body[0].price,
        createCourseRes.body.course.price
      );
      assert.equal(
        getEnrolledCourseRes.body[0].instructor._id,
        createCourseRes.body.course.instructor
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("get enrolled course - no enrolled courses", async () => {
    try {
      // 註冊並登入講師且創建課程
      let { createCourseRes } = await registerAndLoginInstructorAndCreateCourse(
        instructorObj,
        courseObj
      );

      // 註冊並登入學生
      const studentLoginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = studentLoginRes.body.token;

      // 取得學生已註冊的課程
      const getEnrolledCourseRes = await getStudentCourses(
        studentLoginRes.body.user._id,
        authToken
      );
      assert.equal(getEnrolledCourseRes.status, 200);
      assert.equal(getEnrolledCourseRes.body.length, 0);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("get enrolled course - invalid role", async () => {
    try {
      // 註冊並登入講師且創建課程
      let { loginRes, createCourseRes } =
        await registerAndLoginInstructorAndCreateCourse(
          instructorObj,
          courseObj
        );

      // 註冊並登入學生
      const studentLoginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = studentLoginRes.body.token;

      // 註冊課程
      const enrollCourseRes = await enrollCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(enrollCourseRes.status, 200);
      assert.equal(enrollCourseRes.body.msg, "註冊成功");
      assert.equal(
        enrollCourseRes.body.course.title,
        createCourseRes.body.course.title
      );
      assert.equal(
        enrollCourseRes.body.course.description,
        createCourseRes.body.course.description
      );
      assert.equal(
        enrollCourseRes.body.course.price,
        createCourseRes.body.course.price
      );
      assert.equal(
        enrollCourseRes.body.course.instructor,
        createCourseRes.body.course.instructor
      );

      // 取得講師的authToken
      authToken = loginRes.body.token;

      // 以講師身分，取得學生已註冊的課程
      const getEnrolledCourseRes = await getStudentCourses(
        studentLoginRes.body.user._id,
        authToken
      );
      assert.equal(getEnrolledCourseRes.status, 403);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});

describe("Student drop courses", () => {
  it("drop course - success", async () => {
    try {
      // 註冊並登入講師且創建課程
      let { createCourseRes } = await registerAndLoginInstructorAndCreateCourse(
        instructorObj,
        courseObj
      );

      // 註冊並登入學生
      const studentLoginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = studentLoginRes.body.token;

      // 註冊課程
      const enrollCourseRes = await enrollCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(enrollCourseRes.status, 200);
      assert.equal(enrollCourseRes.body.msg, "註冊成功");
      assert.equal(
        enrollCourseRes.body.course.title,
        createCourseRes.body.course.title
      );
      assert.equal(
        enrollCourseRes.body.course.description,
        createCourseRes.body.course.description
      );
      assert.equal(
        enrollCourseRes.body.course.price,
        createCourseRes.body.course.price
      );
      assert.equal(
        enrollCourseRes.body.course.instructor,
        createCourseRes.body.course.instructor
      );

      // 取得學生已註冊的課程
      const getEnrolledCourseRes = await getStudentCourses(
        studentLoginRes.body.user._id,
        authToken
      );
      assert.equal(getEnrolledCourseRes.status, 200);

      // 退選課程
      const dropCourseRes = await dropCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(dropCourseRes.status, 200);
      assert.equal(dropCourseRes.body.msg, "退選成功");

      // 再次取得學生已註冊的課程
      const getEnrolledCourseRes2 = await getStudentCourses(
        studentLoginRes.body.user._id,
        authToken
      );
      assert.equal(getEnrolledCourseRes2.status, 200);
      assert.equal(getEnrolledCourseRes2.body.length, 0);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("drop course - course id not found", async () => {
    try {
      // 註冊並登入講師且創建課程
      let { createCourseRes } = await registerAndLoginInstructorAndCreateCourse(
        instructorObj,
        courseObj
      );

      // 註冊並登入學生
      const studentLoginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = studentLoginRes.body.token;

      // 註冊課程
      const enrollCourseRes = await enrollCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(enrollCourseRes.status, 200);
      assert.equal(enrollCourseRes.body.msg, "註冊成功");
      assert.equal(
        enrollCourseRes.body.course.title,
        createCourseRes.body.course.title
      );
      assert.equal(
        enrollCourseRes.body.course.description,
        createCourseRes.body.course.description
      );
      assert.equal(
        enrollCourseRes.body.course.price,
        createCourseRes.body.course.price
      );
      assert.equal(
        enrollCourseRes.body.course.instructor,
        createCourseRes.body.course.instructor
      );

      // 取得學生已註冊的課程
      const getEnrolledCourseRes = await getStudentCourses(
        studentLoginRes.body.user._id,
        authToken
      );
      assert.equal(getEnrolledCourseRes.status, 200);

      // 退選課程-錯誤的課程id
      const wrongCourseId = "123456789012345678901234";

      // 退選課程
      const dropCourseRes = await dropCourse(wrongCourseId, authToken);
      assert.equal(dropCourseRes.status, 400);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("drop course - not this course's student", async () => {
    try {
      // 註冊並登入講師且創建課程
      let { createCourseRes } = await registerAndLoginInstructorAndCreateCourse(
        instructorObj,
        courseObj
      );

      // 註冊並登入學生
      const studentLoginRes = await registerAndLoginUser(studentObj);

      // 取得登入後的authToken
      let authToken = studentLoginRes.body.token;

      // 註冊課程
      const enrollCourseRes = await enrollCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(enrollCourseRes.status, 200);
      assert.equal(enrollCourseRes.body.msg, "註冊成功");

      // 取得學生已註冊的課程
      const getEnrolledCourseRes = await getStudentCourses(
        studentLoginRes.body.user._id,
        authToken
      );
      assert.equal(getEnrolledCourseRes.status, 200);

      // 註冊並登入另一位學生
      const studentLoginRes2 = await registerAndLoginUser(anotherStudentObj);

      // 取得另一位學生的authToken
      authToken = studentLoginRes2.body.token;

      // 退選課程
      const dropCourseRes = await dropCourse(
        createCourseRes.body.course._id,
        authToken
      );
      assert.equal(dropCourseRes.status, 403);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});

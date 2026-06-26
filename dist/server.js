

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/DB/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connect_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET,
  refresh_secret: process.env.JWT_REFRESH_TOKEN
};
var config_default = config;

// src/DB/index.ts
var pool = new Pool({
  connectionString: config_default.connect_string
});
var initDB = async () => {
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30),
    email VARCHAR(30),
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            reporter_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(150),
            description TEXT NOT NULL CHECK  (char_length(description) >= 20),
            type TEXT,
            status TEXT,

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
           )
            `);
  } catch (error) {
    console.log(error);
  }
};

// src/modules/user/user.service.ts
import bcrypt from "bcryptjs";
var createUserIntoDb = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
        INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,$4) RETURNING *
        `, [name, email, hashPassword, role]);
  console.log(result);
  delete result.rows[0].password;
  return result;
};
var getAllUsersFromDb = async (id) => {
  const result = await pool.query(`
    SELECT * FROM users
    `, [id]);
  return result;
};
var getSingleUserDb = async (id) => {
  const result = await pool.query(
    `
    SELECT * FROM users WHERE id =$1
    `,
    [id]
  );
  return result;
};
var getUsersByIds = async (ids) => {
  const result = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id = ANY($1)
    `,
    [ids]
  );
  return result;
};
var updateUserFromDb = async (payload, id) => {
  const { name, password, is_active, role } = payload;
  const result = await pool.query(`
    UPDATE users
    SET name = COALESCE($1, name),
    password = COALESCE($2, password),
    role= COALESCE($3, role),
    is_active=COALESCE($4, is_active)
        WHERE id = $5 

        RETURNING *
    `, [name, password, role, is_active, id]);
  return result;
};
var deleteUserFromDb = async (id) => {
  const result = await pool.query(`
    DELETE FROM users WHERE id = $1
    RETURNING *
    `, [id]);
  return result;
};
var userService = {
  createUserIntoDb,
  getAllUsersFromDb,
  getSingleUserDb,
  getUsersByIds,
  updateUserFromDb,
  deleteUserFromDb
};

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDb(req.body);
    res.status(201).json({
      success: true,
      massage: "User created Successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      //   message: error.message,
      error
    });
  }
};
var getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsersFromDb();
    res.status(200).json({
      success: true,
      massage: "users retrived Successfully",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.getSingleUserDb(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User Not found!",
        data: {}
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.updateUserFromDb(req.body, id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User Not found!"
      });
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUserFromDb(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User Not found!"
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully!",
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser
};

// src/modules/user/user.route.ts
var router = Router();
router.post("/signup", userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
var userRouter = router;

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issue.service.ts
var createIssueIntoDb = async (payload) => {
  const { title, description, type, reporter_id } = payload;
  const status = payload.status || "open";
  const result = await pool.query(`
        INSERT INTO issues( title, description, type, status, reporter_id) VALUES ($1, $2, $3, $4, $5) RETURNING *
        `, [title, description, type, status, reporter_id]);
  return result;
};
var getAllIssueIntoDb = async (filters) => {
  let query = `SELECT * FROM issues`;
  const conditions = [];
  const values = [];
  if (filters?.type) {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }
  if (filters?.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  const order = filters?.sort === "oldest" ? "ASC" : "DESC";
  query += ` ORDER BY created_at ${order}`;
  const result = await pool.query(query, values);
  return result;
};
var getSingleIssueIntoDB = async (id) => {
  const result = await pool.query(`
        SELECT 
            issues.id,
            issues.title,
            issues.description,
            issues.type,
            issues.status,
            issues.created_at,
            issues.updated_at,
            users.id as reporter_id,
            users.name as reporter_name,
            users.role as reporter_role
        FROM issues
        LEFT JOIN users ON issues.reporter_id = users.id
        WHERE issues.id = $1
        `, [id]);
  return result;
};
var updateIssueIntoDB = async (payload) => {
  const { title, description, type, status, id } = payload;
  const result = await pool.query(`
        UPDATE issues
        SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status = COALESCE($4, status),
        updated_at = NOW()
        WHERE id = $5
        RETURNING *
        `, [title, description, type, status, id]);
  return result;
};
var deleteIssueIntoDB = async (id) => {
  const result = await pool.query(`
        DELETE FROM issues WHERE $1

        RETURNING *
        `, [id]);
  return result;
};
var issueService = {
  createIssueIntoDb,
  getAllIssueIntoDb,
  getSingleIssueIntoDB,
  updateIssueIntoDB,
  deleteIssueIntoDB
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    if (req.user?.role !== "contributor" && req.user?.role !== "maintainer") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        data: {}
      });
    }
    const reporter_id = req.user.id;
    const result = await issueService.createIssueIntoDb({
      title,
      description,
      type,
      status: "open",
      reporter_id
    });
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error
    });
  }
};
var getAllIssue = async (req, res) => {
  try {
    const { sort = "newest", type, status } = req.query;
    const filters = {
      sort: sort === "oldest" ? "oldest" : "newest"
    };
    if (type) filters.type = type;
    if (status) filters.status = status;
    const result = await issueService.getAllIssueIntoDb(filters);
    const issues = result.rows;
    const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id).filter(Boolean))];
    let reporters = [];
    if (reporterIds.length > 0) {
      const usersResult = await userService.getUsersByIds(reporterIds);
      reporters = usersResult.rows;
    }
    const formattedIssues = issues.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      status: row.status,
      reporter: reporters.find((reporter) => reporter.id === row.reporter_id) ?? {
        id: row.reporter_id,
        name: "Unknown",
        role: "user"
      },
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: formattedIssues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueIntoDB(id);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        data: {}
      });
    }
    const row = result.rows[0];
    const issueResponse = {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      status: row.status,
      reporter: {
        id: row.reporter_id,
        name: row.reporter_name,
        role: row.reporter_role
      },
      created_at: row.created_at,
      updated_at: row.updated_at
    };
    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: issueResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  const { title, description, type, status } = req.body;
  try {
    const existingIssue = await issueService.getSingleIssueIntoDB(id);
    if (existingIssue.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue Not Found"
      });
    }
    const issue = existingIssue.rows[0];
    const userId = req.user?.id;
    if (req.user?.role === "contributor" && (issue.reporter_id !== userId || issue.status !== "open")) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own open issues"
      });
    }
    const result = await issueService.updateIssueIntoDB({ title, description, type, status, id });
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueIntoDB(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        massage: "User Not Found"
      });
    }
    res.status(201).json({
      success: true,
      massage: "User Deleted successfully",
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      massage: error.massage,
      error
    });
  }
};
var issueController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No token provided!",
          data: {}
        });
      }
      const decoded = jwt.verify(
        token,
        config_default.secret
      );
      const userData = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [decoded.email]
      );
      const user = userData.rows[0];
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found!",
          data: {}
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized!",
          data: {}
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post("/", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.createIssue);
router2.get("/", issueController.getAllIssue);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.updateIssue);
router2.delete("/:id", issueController.deleteIssue);
var issueRouter = router2;

// src/modules/auth/auth.route.ts
import { Router as Router3 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var signupUserFromDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt2.hash(password, 10);
  const result = await pool.query(`
        INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,$4) RETURNING *
        `, [name, email, hashPassword, role]);
  console.log(result);
  delete result.rows[0].password;
  return result;
};
var loginUserFromDb = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`
        SELECT * FROM users WHERE EMAIL =$1
        `, [email]);
  if (userData.rows.length === 0) {
    throw new Error("Error credentials");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.secret, { expiresIn: "1d" });
  const refreshToken2 = jwt2.sign(jwtPayload, config_default.refresh_secret, { expiresIn: "7d" });
  delete user.password;
  return {
    token: accessToken,
    refreshToken: refreshToken2,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};
var generateRefreshToken = async (token) => {
  if (!token) {
    throw new Error("unathorized");
  }
  const decoded = jwt2.verify(token, config_default.secret);
  console.log(decoded);
  const userData = await pool.query(`
        SELECT * FROM users WHERE EMAIL =$1
        `, [decoded.email]);
  const user = userData.rows[0];
  if (userData.rows.length === 0) {
    throw new Error("user not found");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.secret, { expiresIn: "1d" });
  return accessToken;
};
var authService = {
  loginUserFromDb,
  generateRefreshToken,
  signupUserFromDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.controller.ts
var signUpUser = async (req, res) => {
  try {
    const result = await authService.signupUserFromDB(req.body);
    res.status(201).json({
      success: true,
      massage: "User created Successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      //   message: error.message,
      error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserFromDb(req.body);
    const { refreshToken: refreshToken2 } = result;
    res.cookie("refreshToken", refreshToken2, {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    });
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Profile created successfully!",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.generateRefreshToken(req.cookies.refreshToken);
    res.cookie("refreshToken", refreshToken, {
      secure: false,
      // in prod true
      httpOnly: true,
      sameSite: "lax"
    });
    res.status(201).json({
      success: true,
      message: "Profile created successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser,
  refreshToken,
  signUpUser
};

// src/modules/auth/auth.route.ts
var router3 = Router3();
router3.post("/login", authController.loginUser);
router3.post("/signup", authController.signUpUser);
router3.post("/refreshToken", authController.refreshToken);
var authRouter = router3;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.status(200).json({
    "massage": "Express Server",
    "author": "Devpulse"
  });
});
app.use("/api/users", userRouter);
app.use("/api/issues", issueRouter);
app.use("/api/auth", authRouter);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map
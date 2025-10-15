require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// CORS 設定
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const USERS_FILE = path.join(__dirname, "users.json");

// --- 工具函式 ---
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

// --- JWT 驗證 ---
function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "未授權" });
  const token = auth.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ message: "Token 無效" });
  }
}

// --- 註冊 ---
app.post("/api/register", async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "請輸入帳號與密碼" });

  const users = readUsers();
  if (users.some(u => u.username === username))
    return res.status(400).json({ message: "帳號已存在" });

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed, email: email || "", role: "user" });
  writeUsers(users);
  res.json({ message: "註冊成功" });
});

// --- 登入 ---
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: "帳號不存在" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "密碼錯誤" });

  const token = jwt.sign(
    { username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
  res.json({ message: "登入成功", token, role: user.role });
});

// --- 取得所有使用者（管理員限定） ---
app.get("/api/users", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "無權限" });
  const users = readUsers().map(u => ({ username: u.username, role: u.role, email: u.email }));
  res.json(users);
});

// --- 刪除使用者（管理員限定） ---
app.delete("/api/users/:username", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "無權限" });

  let users = readUsers();
  users = users.filter(u => u.username !== req.params.username);
  writeUsers(users);
  res.json({ message: `已刪除 ${req.params.username}` });
});

// --- 啟動伺服器 ---
app.listen(PORT, () => {
  console.log(`🚀 伺服器運行於 http://localhost:${PORT}`);
});

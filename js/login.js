// ✅ 根據環境自動設定 API 網址
const API_BASE = location.hostname.includes("github.io")
  ? "https://custos-backend.onrender.com"
  : "http://localhost:3000";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // 取得使用者輸入
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // === 驗證欄位 ===
  if (!username || !email || !password) {
    alert("⚠ 請輸入完整資訊！");
    return;
  }

  if (password.length < 6) {
    alert("⚠ 密碼至少需要 6 個字元！");
    return;
  }

  try {
    // === 呼叫後端登入 API ===
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ 登入成功 → 存入 localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);

      alert("✅ 登入成功！");
      window.location.href = "dashboard.html"; // 跳轉到主頁面
    } else {
      alert("❌ " + data.message);
    }
  } catch (err) {
    console.error("⚠ 後端連線錯誤：", err);
    alert("⚠ 系統錯誤，請稍後再試。");
  }
});

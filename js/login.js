// ✅ 自動偵測環境：如果是在 GitHub Pages，就使用 Render 的雲端後端
const API_BASE = window.location.hostname.includes("github.io")
  ? "https://custos-backend.onrender.com"  // ← 換成你的 Render 實際網址（確保正確）
  : "http://localhost:3000";

console.log("🌍 使用的 API 來源：", API_BASE);

// ✅ 綁定登入表單事件
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

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

  /**
   * 原始版本（呼叫後端登入 API）
   * 已註解保留，方便日後要改回真實登入時使用。
   *
   * try {
   *   const res = await fetch(`${API_BASE}/api/login`, {
   *     method: "POST",
   *     headers: { "Content-Type": "application/json" },
   *     body: JSON.stringify({ username, password }),
   *   });
   *   const data = await res.json().catch(() => ({}));
   *   if (res.ok) {
   *     localStorage.setItem("isLoggedIn", "true");
   *     localStorage.setItem("token", data.token);
   *     localStorage.setItem("username", username);
   *     alert("✅ 登入成功！");
   *     window.location.href = "dashboard.html";
   *   } else {
   *     alert("❌ " + (data.message || "登入失敗，請檢查帳號密碼"));
   *   }
   * } catch (err) {
   *   console.error("🚨 連線錯誤：", err);
   *   alert("⚠ 系統錯誤，請稍後再試。");
   * }
   */

  // ✅ 模擬登入成功（略過後端驗證）
  try {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username || "guest");
    alert("✅ 登入成功！（測試模式）");
    window.location.href = "dashboard.html"; // 跳轉到主頁面
  } catch (err) {
    console.error("🚨 模擬登入錯誤：", err);
    alert("⚠ 系統錯誤，請稍後再試。");
  }
});

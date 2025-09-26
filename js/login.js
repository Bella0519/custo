// js/login.js
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("⚠️ 請輸入完整資訊！");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert("⚠️ Email 格式錯誤！");
    return;
  }

  if (password.length < 6) {
    alert("⚠️ 密碼至少 6 個字元！");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      alert("❌ 登入失敗：" + data.message);
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", email);

    alert("✅ 登入成功！即將進入會員中心");
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("⚠ 無法連線伺服器，請稍後再試。");
  }
});

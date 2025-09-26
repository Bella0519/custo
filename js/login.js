document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !email || !password) {
    alert("⚠ 請輸入完整資訊！");
    return;
  }

  try {
    // 呼叫後端登入 API
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      alert("✅ 登入成功！");
      window.location.href = "dashboard.html";
    } else {
      alert("❌ " + data.message);
    }
  } catch (err) {
    alert("⚠ 系統錯誤，請稍後再試。");
  }
});

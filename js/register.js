// js/register.js
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("newUsername").value.trim();
  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value.trim();

  if (!username || !email || !password) {
    alert("⚠ 請輸入完整資訊！");
    return;
  }

  if (password.length < 6) {
    alert("⚠ 密碼至少 6 個字元！");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ 註冊成功，請重新登入！");
      window.location.href = "login.html";
    } else {
      alert("❌ " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("⚠ 註冊失敗，請稍後再試");
  }
});

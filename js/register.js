// js/register.js
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const password2 = document.getElementById("regPassword2").value.trim();

  if (!email || !password || !password2) {
    alert("⚠️ 請填寫完整資訊！");
    return;
  }
  if (password.length < 6) {
    alert("⚠️ 密碼至少 6 個字元！");
    return;
  }
  if (password !== password2) {
    alert("⚠️ 兩次密碼不一致！");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      alert("❌

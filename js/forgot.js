// js/forgot.js
document.getElementById("forgotForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("resetEmail").value.trim();

  if (!email) {
    alert("⚠ 請輸入 Email");
    return;
  }

  try {
    // 模擬請求，實際上可以呼叫後端 API 發送重設信
    alert(`📩 重設連結已寄送到 ${email}，請到信箱查看！`);
    window.location.href = "login.html";
  } catch (err) {
    console.error(err);
    alert("⚠ 發送失敗，請稍後再試");
  }
});

// js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  /**
   * 🧩 登入狀態檢查（原版本可能在 HTML 中）
   * 以下模擬自動登入狀態，方便無需帳號即可使用。
   * 若日後要恢復驗證，可改回 localStorage 驗證或 API 呼叫。
   */
  if (!localStorage.getItem("isLoggedIn")) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", "guest");
    console.log("🔓 自動登入 guest 模式（測試用）");
  }

  // 假資料：之後可以改成 fetch("/api/users")
  const users = [
    { username: "admin", role: "admin" },
    { username: "bella", role: "user" },
    { username: "testuser", role: "user" }
  ];

  const tableBody = document.getElementById("userTable");
  tableBody.innerHTML = "";

  users.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.role}</td>
      <td>
        <button onclick="deleteUser('${user.username}')">刪除</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
});

/**
 * 🧩 刪除使用者
 * 目前為前端模擬操作，未連接後端 API。
 * 若日後需接資料庫，可改為：
 * fetch(`/api/users/${username}`, { method: "DELETE" });
 */
function deleteUser(username) {
  if (confirm(`確定要刪除 ${username} 嗎？`)) {
    alert(`✅ 已刪除 ${username}`);
  }
}

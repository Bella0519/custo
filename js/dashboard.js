// js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
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

function deleteUser(username) {
  if (confirm(`確定要刪除 ${username} 嗎？`)) {
    alert(`✅ 已刪除 ${username}`);
    // 之後可以改成呼叫後端 DELETE API
    // fetch(`/api/users/${username}`, { method: "DELETE" });
  }
}

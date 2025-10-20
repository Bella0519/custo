// calculator.js
// ====================================
// 🌍 Custos Carbon 主邏輯整合版
// 包含：自動登入、政府資料、交通資料、快速新增、推薦系統、PDF輸出
// ====================================

let emissionFactors = [];
let chartInstance = null;
let lastLabels = [];
let lastValues = [];
let lastTotal = 0;

// ✅ 模擬自動登入
if (!localStorage.getItem("isLoggedIn")) {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("username", "guest");
  console.log("🔓 自動登入 guest 模式");
}

// ✅ 載入環境部資料
async function loadFactors() {
  const apiURL = "https://data.moenv.gov.tw/api/v2/CFP_P_02?format=json";
  try {
    const res = await fetch(apiURL);
    const data = await res.json();
    emissionFactors = data.records.map(r => ({
      name: r.name,
      unit: r.unit,
      factor: parseFloat(r.coe)
    }));
    console.log(`✅ 已載入政府資料，共 ${emissionFactors.length} 筆`);
  } catch (err) {
    console.warn("⚠ 無法載入 API，使用預設資料");
    emissionFactors = [
      { name: "電力", unit: "kWh", factor: 0.509 },
      { name: "汽油", unit: "L", factor: 2.34 },
      { name: "柴油", unit: "L", factor: 2.68 }
    ];
  }

  // 加入交通資料與推薦
  mergeTransportData();
  recommendItems();
  addCustom();
}

// ✅ 合併交通建議資料
function mergeTransportData() {
  if (typeof customTransportFactors !== "undefined") {
    emissionFactors = emissionFactors.concat(customTransportFactors);
    console.log("🚗 已合併交通運輸資料");
  }
}

// ✅ 推薦項目清單
function recommendItems() {
  const categories = {
    "交通": ["公車", "捷運", "高鐵", "汽車", "機車", "飛機"],
    "能源燃料": ["汽油", "柴油", "電力"],
    "綠色出行": ["自行車", "步行"]
  };

  const recommendations = [];
  for (const [cat, keywords] of Object.entries(categories)) {
    const match = emissionFactors.find(f => keywords.some(k => f.name.includes(k)));
    if (match) recommendations.push({ category: cat, ...match });
  }

  const section = document.getElementById("recommendations");
  section.innerHTML = `
    <h3>🌿 系統推薦排放項目（交通與能源）</h3>
    <ul>
      ${recommendations.map(
        r => `<li><b>${r.category}</b>：${r.name}（${r.unit}，係數 ${r.factor} kg CO₂e）
        <br><small>資料來源：${r.source || "政府開放資料"}</small></li>`
      ).join("")}
    </ul>
  `;
}

// ✅ 建立輸入欄
function addCustom(selectedFactor = null) {
  const container = document.getElementById("customItems");
  const div = document.createElement("div");
  div.classList.add("custom-row");
  div.style.position = "relative";

  div.innerHTML = `
    <input type="text" class="custom-keyword" placeholder="輸入關鍵字，例如 電力"
           value="${selectedFactor ? selectedFactor.name : ''}"
           data-factor="${selectedFactor ? selectedFactor.factor : ''}">
    <div class="suggestions"></div>
    <input type="number" class="custom-value" min="0" value="0" placeholder="使用量">
    <span class="custom-unit">${selectedFactor ? selectedFactor.unit : ''}</span>
    <button type="button" onclick="this.parentElement.remove(); calculate()">刪除</button>
  `;

  container.appendChild(div);
  setupSearch(div);
  div.querySelector(".custom-value").addEventListener("input", calculate);
}

// ✅ 搜尋建議
function setupSearch(row) {
  const input = row.querySelector(".custom-keyword");
  const suggestions = row.querySelector(".suggestions");

  input.addEventListener("input", () => {
    const keyword = input.value.trim();
    suggestions.innerHTML = "";
    const results = emissionFactors.filter(f => f.name.includes(keyword));
    if (results.length === 0) {
      suggestions.style.display = "none";
      return;
    }
    results.forEach(f => {
      const option = document.createElement("div");
      option.textContent = `${f.name} (${f.unit})`;
      option.addEventListener("click", () => {
        input.value = f.name;
        row.querySelector(".custom-unit").textContent = f.unit;
        input.dataset.factor = f.factor;
        suggestions.style.display = "none";
        calculate();
      });
      suggestions.appendChild(option);
    });
    suggestions.style.display = "block";
  });
}

// ✅ 計算碳排
function calculate() {
  lastLabels = [];
  lastValues = [];
  lastTotal = 0;

  document.querySelectorAll(".custom-row").forEach(row => {
    const val = Number(row.querySelector(".custom-value").value);
    const factor = Number(row.querySelector(".custom-keyword").dataset.factor || 0);
    const name = row.querySelector(".custom-keyword").value || "未命名";

    if (!isNaN(factor) && val > 0) {
      const emission = val * factor;
      lastTotal += emission;
      lastLabels.push(name);
      lastValues.push(emission);
    }
  });

  document.getElementById("result").innerText =
    lastTotal > 0 ? `總碳排放量：約 ${lastTotal.toFixed(2)} kg CO₂e` : "";

  drawChart(lastLabels, lastValues);
}

// ✅ 畫圖表
function drawChart(labels, values) {
  const ctx = document.getElementById("carbonChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();
  if (values.length === 0) return;

  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ['#ffb3c1','#ff8fab','#ff6b9c','#ff4d6d','#c9184a','#800f2f']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
}

// ✅ 快速新增功能
function quickAdd(category) {
  let items = [];
  if (category === "交通") {
    items = ["捷運／地鐵", "公車（大眾運輸）", "自用小客車（汽油）", "機車", "高鐵", "飛機（客運）"];
  } else if (category === "飲食") {
    items = ["牛肉", "豬肉", "白飯", "飲料"];
  } else if (category === "用電") {
    items = ["電力"];
  }
  items.forEach(name => {
    const factorData = emissionFactors.find(f => f.name.includes(name));
    if (factorData) addCustom(factorData);
  });
  alert(`✅ 已新增「${category}」類別常見項目！`);
}

// ✅ 清空所有
function clearAll() {
  document.getElementById("customItems").innerHTML = "";
  document.getElementById("result").innerText = "";
  if (chartInstance) chartInstance.destroy();
  addCustom();
}

// ✅ 匯出 PDF
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.text("Custos Carbon 碳足跡分析報告", 105, 20, { align: "center" });
  pdf.text(`總碳排放量：約 ${lastTotal.toFixed(2)} kg CO₂e`, 20, 40);
  pdf.save("碳足跡報告.pdf");
}

// ✅ 啟動
loadFactors();

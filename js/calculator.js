// ====================================
// 🌍 Custos Carbon 碳足跡計算器進階版
// 功能：政府資料載入 + 智能提示 + 一鍵新增分類 + 綠色出行
// ====================================

let emissionFactors = [];
let chartInstance = null;
let lastLabels = [];
let lastValues = [];
let lastTotal = 0;

// ✅ 模擬自動登入（guest 模式）
if (!localStorage.getItem("isLoggedIn")) {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("username", "guest");
  console.log("🔓 自動登入 guest 模式");
}

// ✅ 載入政府開放資料（或本地 JSON）
async function loadFactors() {
  const apiURL = "data/moenv_factors_full.json"; // ← 你的完整資料檔

  try {
    const res = await fetch(apiURL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    emissionFactors = await res.json();
    console.log(`✅ 已載入完整資料，共 ${emissionFactors.length} 筆`);
  } catch (err) {
    console.warn("⚠ 無法載入 API，使用預設資料");
    emissionFactors = [
      { name: "電力", unit: "kWh", factor: 0.509 },
      { name: "汽油", unit: "L", factor: 2.34 },
      { name: "柴油", unit: "L", factor: 2.68 },
      { name: "公車", unit: "km", factor: 0.089 },
      { name: "捷運", unit: "km", factor: 0.05 }
    ];
  }

  // 整合交通資料（若有 transport_factors.js）
  if (typeof customTransportFactors !== "undefined") {
    emissionFactors = emissionFactors.concat(customTransportFactors);
    console.log("🚗 已整合交通運輸資料");
  }

  recommendItems();
  addCustom();
}

// ✅ 系統推薦項目（交通、能源、出行）
function recommendItems() {
  const categories = {
    "交通": ["公車", "捷運", "高鐵", "汽車", "機車", "飛機"],
    "能源": ["電力", "天然氣", "柴油", "汽油"],
    "綠色出行": ["自行車", "步行"]
  };

  const recommendations = [];
  for (const [cat, keywords] of Object.entries(categories)) {
    const matches = emissionFactors.filter(f =>
      keywords.some(k => f.name.includes(k))
    );
    matches.forEach(m => recommendations.push({ category: cat, ...m }));
  }

  const section = document.getElementById("recommendations");
  section.innerHTML = `
    <h3>🌿 系統推薦排放項目（交通與能源）</h3>
    <ul>
      ${recommendations
        .map(
          r =>
            `<li><b>${r.category}</b>：${r.name}（${r.unit}，係數 ${r.factor} kg CO₂e）</li>`
        )
        .join("")}
    </ul>
  `;
}

// ✅ 新增自訂項目列
function addCustom(selectedFactor = null) {
  const container = document.getElementById("customItems");
  const div = document.createElement("div");
  div.classList.add("custom-row");
  div.style.position = "relative";

  div.innerHTML = `
    <input type="text" class="custom-keyword" placeholder="輸入關鍵字，例如 電力 或 交通"
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

// ✅ 智能提示搜尋
function setupSearch(row) {
  const input = row.querySelector(".custom-keyword");
  const suggestions = row.querySelector(".suggestions");

  input.addEventListener("input", () => {
    const keyword = input.value.trim();
    if (keyword.length === 0) {
      suggestions.style.display = "none";
      return;
    }
    showSuggestions(row, keyword);
  });

  document.addEventListener("click", (e) => {
    if (!row.contains(e.target)) {
      suggestions.style.display = "none";
    }
  });
}

// ✅ 顯示建議字詞（含模糊匹配）
function showSuggestions(row, keyword) {
  const suggestions = row.querySelector(".suggestions");
  suggestions.innerHTML = "";

  const related = {
    "交通": ["公車", "捷運", "高鐵", "汽車", "機車", "飛機"],
    "能源": ["電力", "汽油", "柴油", "天然氣"],
    "出行": ["自行車", "步行"]
  };

  let expandedKeywords = [keyword];
  if (related[keyword]) expandedKeywords = related[keyword];

  const results = emissionFactors.filter(f =>
    expandedKeywords.some(k => f.name.includes(k))
  );

  if (results.length === 0) {
    suggestions.style.display = "none";
    return;
  }

  results.forEach(f => {
    const option = document.createElement("div");
    option.textContent = `${f.name} (${f.unit})`;
    option.addEventListener("click", () => {
      row.querySelector(".custom-keyword").value = f.name;
      row.querySelector(".custom-unit").textContent = f.unit;
      row.querySelector(".custom-keyword").dataset.factor = f.factor;
      suggestions.style.display = "none";
      calculate();
    });
    suggestions.appendChild(option);
  });

  suggestions.style.display = "block";
}

// ✅ 總碳排計算
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

// ✅ 繪製圓餅圖
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

// ✅ 一鍵新增分類
function quickAdd(category) {
  let items = [];

  if (category === "交通") {
    items = ["捷運", "公車", "自用汽車", "機車", "高鐵", "飛機"];
  } else if (category === "飲食") {
    items = ["牛肉", "豬肉", "白飯", "豆腐", "瓶裝水"];
  } else if (category === "用電") {
    items = ["電力", "天然氣", "柴油"];
  } else if (category === "綠色出行") {
    items = ["自行車", "步行"];
  }

  items.forEach(name => {
    const factorData = emissionFactors.find(f => f.name.includes(name));
    if (factorData) {
      addCustom(factorData);
    } else {
      // 若找不到項目但為綠色出行，顯示特別提示
      if (category === "綠色出行") {
        addCustom({ name, unit: "km", factor: 0 });
      }
    }
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
// ✅ 匯出 PDF（進階報告版）
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const username = localStorage.getItem("username") || "guest";
  const date = new Date().toLocaleString("zh-TW");

  // 🌿 標題
  pdf.setFontSize(18);
  pdf.text("Custos Carbon 碳足跡分析報告", 105, 20, { align: "center" });

  pdf.setFontSize(12);
  pdf.text(`使用者：${username}`, 20, 35);
  pdf.text(`產生日期：${date}`, 20, 43);
  pdf.text(`總碳排放量：約 ${lastTotal.toFixed(2)} kg CO₂e`, 20, 53);

  // 📋 表格標題
  pdf.setFontSize(14);
  pdf.text("各項排放明細：", 20, 65);
  pdf.setFontSize(11);

  let y = 72;
  pdf.text("來源", 20, y);
  pdf.text("使用量", 70, y);
  pdf.text("係數(kg CO₂e/單位)", 110, y);
  pdf.text("排放量(kg CO₂e)", 160, y);
  pdf.line(20, y + 2, 190, y + 2);

  // 📊 輸出每項紀錄
  y += 8;
  document.querySelectorAll(".custom-row").forEach(row => {
    const name = row.querySelector(".custom-keyword").value || "未命名";
    const val = Number(row.querySelector(".custom-value").value);
    const unit = row.querySelector(".custom-unit").textContent || "";
    const factor = Number(row.querySelector(".custom-keyword").dataset.factor || 0);
    const emission = val * factor;

    if (!isNaN(emission) && emission > 0) {
      pdf.text(name, 20, y);
      pdf.text(`${val} ${unit}`, 70, y);
      pdf.text(`${factor.toFixed(3)}`, 110, y);
      pdf.text(`${emission.toFixed(2)}`, 160, y);
      y += 8;
    }
  });

  // ⚙️ 插入 Chart.js 圖表
  const chartCanvas = document.getElementById("carbonChart");
  if (chartCanvas && chartCanvas.toDataURL) {
    const chartImg = chartCanvas.toDataURL("image/png", 1.0);
    pdf.addImage(chartImg, "PNG", 30, y + 5, 150, 90);
    y += 100;
  }

  // 📘 結尾簽章
  pdf.setFontSize(10);
  pdf.text("本報告由 Custos Carbon 系統自動生成，用於個人碳足跡估算。", 20, y + 15);
  pdf.text("© 2025 Custos Carbon | https://bella0519.github.io/custo", 20, y + 22);

  // ✅ 儲存
  pdf.save("CustosCarbon_碳足跡報告.pdf");
}


// ✅ 初始化
loadFactors();

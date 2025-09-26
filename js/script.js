function calculate() {
  const km = document.getElementById("km").value;
  const result = km * 0.12; // 假設每公里 0.12 kg CO2
  document.getElementById("output").innerText = 
    "你的碳排放: " + result.toFixed(2) + " kg CO2";
}

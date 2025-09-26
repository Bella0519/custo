function calculateCarbon() {
    const carKm = Number(document.getElementById("carKm").value) || 0;
    const meat = Number(document.getElementById("meat").value) || 0;

    // 簡單計算公式：開車 1 km 約 0.2 kg CO2, 1 克肉類約 0.01 kg CO2
    const carbon = carKm * 0.2 + meat * 0.01;

    document.getElementById("result").innerText = `你的每日碳排放約 ${carbon.toFixed(2)} kg CO₂`;
}

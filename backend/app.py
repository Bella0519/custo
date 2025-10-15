from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允許前端跨網域請求

@app.route("/")
def home():
    return "✅ Flask 後端運行成功！"

@app.route("/hello")
def hello():
    return "👋 哈囉！這是從後端回應的訊息"

@app.route("/calculate", methods=["POST"])
def calculate():
    # 從前端接收 JSON 資料
    data = request.get_json()
    number = data.get("number", 0)

    # 做一個簡單計算：例如把數字乘以 2
    result = number * 2

    # 回傳 JSON 給前端
    return jsonify({"input": number, "result": result})

if __name__ == "__main__":
    app.run(debug=True)

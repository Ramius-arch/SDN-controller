from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def hello_world():
    return "Hello, World!"

@app.route('/metrics')
def metrics():
    # Return some mock metrics for now
    metrics_data = {
        "cpu_usage": 35.5,
        "memory_usage": 60.2,
        "network_traffic_in_mbps": 120,
        "network_traffic_out_mbps": 80,
        "active_connections": 150
    }
    return jsonify(metrics_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)

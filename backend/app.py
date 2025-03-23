from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

DATABASE = 'database.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize the DB (Run once)
def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            billing_date TEXT NOT NULL,
            frequency TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/subscriptions', methods=['GET'])
def get_subscriptions():
    conn = get_db_connection()
    subscriptions = conn.execute('SELECT * FROM subscriptions').fetchall()
    conn.close()
    return jsonify([dict(sub) for sub in subscriptions])

@app.route('/subscriptions', methods=['POST'])
def add_subscription():
    data = request.get_json()
    name = data.get('name')
    price = data.get('price')
    billing_date = data.get('billing_date')  # Expecting 'YYYY-MM-DD'
    frequency = data.get('frequency')        # monthly/yearly

    conn = get_db_connection()
    conn.execute('''
        INSERT INTO subscriptions (name, price, billing_date, frequency)
        VALUES (?, ?, ?, ?)
    ''', (name, price, billing_date, frequency))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Subscription added successfully'}), 201

@app.route('/subscriptions/<int:id>', methods=['DELETE'])
def delete_subscription(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM subscriptions WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Subscription deleted successfully'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)

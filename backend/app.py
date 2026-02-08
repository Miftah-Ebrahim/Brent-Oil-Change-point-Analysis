
from flask import Flask, jsonify
import pandas as pd
import os

app = Flask(__name__)

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data'))

@app.route('/')
def home():
    return "Welcome to the Flask API!"

# API endpoint: Brent oil price time series
@app.route('/api/brent-oil-data')
def brent_oil_data():
    df = pd.read_csv(os.path.join(DATA_DIR, 'BrentOilPrices.csv'))
    df['Date'] = pd.to_datetime(df['Date'])
    return jsonify({
        'dates': df['Date'].dt.strftime('%Y-%m-%d').tolist(),
        'prices': df['Price'].tolist()
    })

# API endpoint: Change points (example: load from file or static for now)
@app.route('/api/change-points')
def change_points(): 
    df = pd.read_csv(os.path.join(DATA_DIR, 'processed_BrentOilPrices.csv'))
    df['Date'] = pd.to_datetime(df['Date'])
    return jsonify({
        'dates': df['Date'].dt.strftime('%Y-%m-%d').tolist(),
        'prices': df['Price'].tolist()
    })

# API endpoint: Events
@app.route('/api/events')
def events():
    events_df = pd.read_csv(os.path.join(DATA_DIR, 'oil_market_key_events.csv'))
    events_df['Date'] = pd.to_datetime(events_df['Date'])
    if 'Type' not in events_df.columns:
        events_df['Type'] = 'Event'
    return jsonify([
        {
            'date': row['Date'].strftime('%Y-%m-%d'),
            'description': row['Event'] if 'Event' in row else '',
            'type': row['Type']
        }
        for _, row in events_df.iterrows()
    ])

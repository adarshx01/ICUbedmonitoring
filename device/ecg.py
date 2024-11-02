from flask import Flask, jsonify, abort
import pandas as pd
import numpy as np

app = Flask(__name__)

# Load the CSV file into a pandas DataFrame and convert to a matrix of floats
try:
    df = pd.read_csv('ecg.csv')
    ecg_matrix = df.values.astype(float)
except Exception as e:
    raise Exception(f"Error loading CSV file: {e}")

# Create a generator function to yield ECG rows one by one
def ecg_row_generator():
    """Generator function to yield ECG rows one by one."""
    for row in ecg_matrix:
        yield row.tolist()

# Create a generator instance
generator = ecg_row_generator()

@app.route("/ecg", methods=['GET'])
def read_ecg():
    """
    Get the next row of ECG data as a matrix of floats.
    :return: A row of ECG data
    """
    try:
        row = next(generator)  # Get the next row from the generator
        return jsonify({"data": row})
    except StopIteration:
        abort(404, description="No more ECG rows available.")

@app.route('/')
def index():
    return "Welcome to the ECG Data API! Use the /ecg endpoint to get ECG rows."

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000, debug=True)

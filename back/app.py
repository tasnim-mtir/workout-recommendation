from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import pickle  # To load the saved model
import pandas as pd  # For reading the exercise plans CSV

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the pre-trained KNN model and scaler (adjust the path to your model file)
with open('knn_model_bmicase.pkl', 'rb') as model_file:
    knn_model = pickle.load(model_file)

with open('scaler.pkl', 'rb') as scaler_file:
    scaler = pickle.load(scaler_file)

# Load the exercise plans from CSV file
def load_exercise_plans(csv_file):
    return pd.read_csv(csv_file, encoding='ISO-8859-1')

@app.route('/get_recommendation', methods=['POST'])
def get_recommendation():
    if request.is_json:
        data = request.get_json()
        gender = data.get('gender')
        age = data.get('age')
        weight = data.get('weight')
        height = data.get('height')

        # BMI Calculation
        bmi = weight / (height ** 2)

        # Prepare the features for the KNN model
        features = [weight, height, bmi, age]  # Corrected feature order
        if gender.lower() == 'male':
            features.append(1)  # male = 1
        else:
            features.append(2)  # female = 2 (as per your preprocessing step)

        # Standardize the features
        features_scaled = scaler.transform([features])

        # Predict the BMI case using the KNN model
        bmi_case = knn_model.predict(features_scaled)[0]

        # Load exercise plans from CSV
        exercise_plans = load_exercise_plans('workout_plan.csv')

        # Find the row that matches the recommended BMI case
        plan_row = exercise_plans[exercise_plans['BMIcase'].str.lower() == bmi_case.lower()]

        if not plan_row.empty:
            # Prepare the workout plan based on the BMI case from the CSV
            workout_plan = {
                "Goal": plan_row['Goal'].values[0],
                "Warm-up": plan_row['Warm-up'].values[0],
                "Strength Training": plan_row['Strength Training'].values[0],
                "Cardio": plan_row['Cardio'].values[0],
                "Cool Down": plan_row['Cool Down'].values[0]
            }
        else:
            workout_plan = {
                "Goal": "No workout plan found for your BMI case.",
                "Warm-up": "",
                "Strength Training": "",
                "Cardio": "",
                "Cool Down": ""
            }

        # Prepare the response with BMI, BMI case, and recommended exercise plan
        recommendation = {
            "BMI": bmi,
            "BMIcase": bmi_case,
            "RecommendedExercisePlan": workout_plan
        }

        return jsonify(recommendation)
    
    else:
        return jsonify({"error": "Invalid content type, expected application/json"}), 415

if __name__ == '__main__':
    app.run(debug=True)

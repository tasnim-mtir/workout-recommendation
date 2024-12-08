import pandas as pd
import pickle
from sklearn.preprocessing import StandardScaler

# Load the model and scaler
def load_model_and_scaler(model_bmicase_path, model_exercise_path, scaler_path):
    with open(model_bmicase_path, 'rb') as model_file:
        knn_model_bmicase = pickle.load(model_file)
    
    with open(model_exercise_path, 'rb') as model_file:
        knn_model_exercise = pickle.load(model_file)
    
    with open(scaler_path, 'rb') as scaler_file:
        scaler = pickle.load(scaler_file)
    
    return knn_model_bmicase, knn_model_exercise, scaler

# Function to make a recommendation based on the input features
def recommend_workout(features, model_bmicase, model_exercise, scaler):
    # Convert the input features to a DataFrame with the correct column names
    feature_columns = ['Weight', 'Height', 'BMI', 'Gender', 'Age']
    features_df = pd.DataFrame([features], columns=feature_columns)
    
    # Standardize the features
    features_scaled = scaler.transform(features_df)
    
    # Make the predictions using the trained KNN models
    bmicase = model_bmicase.predict(features_scaled)[0]
    exercise_recommendation = model_exercise.predict(features_scaled)[0]
    
    # Return the BMI case and recommended exercise plan
    return bmicase, exercise_recommendation

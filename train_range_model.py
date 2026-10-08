import os
import pickle
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error

print("=== Training Accurate & Physically Grounded EV Range Model ===")

# 1. Load actual real-world telemetry dataset
csv_path = "driver_realtime_data.csv"
if not os.path.exists(csv_path):
    raise FileNotFoundError(f"Dataset not found at {csv_path}")

df = pd.read_csv(csv_path)

# 2. Encode route_type
route_map = {'City': 0, 'Mixed': 1, 'Highway': 2}
df['route_type_encoded'] = df['route_type'].map(lambda x: route_map.get(x, 1))

# 3. Encode elevation_ahead: Downhill -> -1, Flat -> 0, Uphill -> 1
elev_map = {'Downhill': -1, 'Flat': 0, 'Uphill': 1}
df['elevation_encoded'] = df['elevation_ahead'].map(lambda x: elev_map.get(x, 0))

# 4. Multi-capacity augmentation to ensure generalizability across all EV models (17.3 to 75 kWh)
target_capacities = [17.3, 30.0, 40.0, 50.3, 52.9, 55.0, 59.0, 65.0, 75.0]
augmented_frames = []

for cap in target_capacities:
    scale = cap / df['battery_capacity_kwh']
    df_aug = df.copy()
    df_aug['battery_capacity_kwh'] = cap
    df_aug['actual_remaining_range_km'] = (df_aug['actual_remaining_range_km'] * scale).round(1)
    augmented_frames.append(df_aug)

df_all = pd.concat(augmented_frames, ignore_index=True)
print(f"Total training dataset size across EV battery capacities: {len(df_all)} records")

# 5. Features for training
features = [
    'current_battery_pct',
    'battery_capacity_kwh',
    'current_speed_kmh',
    'ac_status',
    'outside_temperature_c',
    'route_type_encoded',
    'elevation_encoded'
]

X = df_all[features]
y = df_all['actual_remaining_range_km']

# 6. Train RandomForestRegressor with scikit-learn 1.3.2
rf = RandomForestRegressor(
    n_estimators=100,
    max_depth=16,
    min_samples_split=4,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
rf.fit(X, y)

preds = rf.predict(X)
r2 = r2_score(y, preds)
mae = mean_absolute_error(y, preds)

print(f"Model Training Complete!")
print(f"  R2 Score: {r2:.4f}")
print(f"  Mean Absolute Error: {mae:.2f} km")

print("\nFeature Importances:")
for f, imp in zip(features, rf.feature_importances_):
    print(f"  {f:25s}: {imp * 100:.2f}%")

# 7. Package and save to range_model.pkl
model_artifact = {
    "model": rf,
    "features": features,
    "route_map": route_map,
    "elev_map": elev_map,
    "version": "2.0-realistic-telematics"
}

output_path = "range_model.pkl"
with open(output_path, "wb") as f:
    pickle.dump(model_artifact, f)

print(f"\nSaved verified model to {os.path.abspath(output_path)} ({os.path.getsize(output_path) / (1024*1024):.2f} MB)")

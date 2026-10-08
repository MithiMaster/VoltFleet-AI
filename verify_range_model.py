import sys
import os

sys.path.insert(0, os.path.abspath('.'))
from backend.ml_model import predict_range, get_range_model

print("=== 1. Testing get_range_model ===")
m = get_range_model()
print("Model loaded successfully! Features:", m['features'])
print("Version:", m.get('version'))

print("\n=== 2. Testing Edge Case: 0% Battery ===")
p0 = predict_range(0.0, 50.0, 60.0, 0, 25.0, 'City', 0.0, 40.0)
print(f"Range at 0% SOC: {p0} km (Expected: 0.0)")
assert p0 == 0.0, "Range at 0% SOC must be 0.0"

print("\n=== 3. Testing Battery Capacities at 80% SOC ===")
cases = [
    ("MG Comet EV", 17.3),
    ("Tata Punch EV", 40.0),
    ("MG Windsor EV", 52.9),
    ("Tata Harrier EV", 75.0)
]
for name, cap in cases:
    p = predict_range(80.0, 100.0, 60.0, 1, 25.0, 'City', 0, cap)
    print(f"  {name} ({cap} kWh): {p:.1f} km")

print("\n=== 4. Testing Elevation Input Types (Numeric vs String) ===")
p_num_down = predict_range(75.0, 50.0, 60.0, 1, 25.0, 'City', -50.0, 40.0)
p_str_down = predict_range(75.0, 50.0, 60.0, 1, 25.0, 'City', 'Downhill', 40.0)
p_num_up = predict_range(75.0, 50.0, 60.0, 1, 25.0, 'City', 150.0, 40.0)
p_str_up = predict_range(75.0, 50.0, 60.0, 1, 25.0, 'City', 'Uphill', 40.0)
print(f"  Numeric -50m (Downhill): {p_num_down:.1f} km | String Downhill: {p_str_down:.1f} km")
print(f"  Numeric +150m (Uphill):   {p_num_up:.1f} km | String Uphill:   {p_str_up:.1f} km")
assert p_num_down == p_str_down, "Downhill numeric and string must match"
assert p_num_up == p_str_up, "Uphill numeric and string must match"
assert p_num_down > p_num_up, "Downhill range must be greater than uphill range"

print("\n=== 5. Testing AC Impact ===")
p_ac_off = predict_range(75.0, 50.0, 60.0, 0, 25.0, 'City', 0, 40.0)
p_ac_on = predict_range(75.0, 50.0, 60.0, 1, 25.0, 'City', 0, 40.0)
print(f"  AC OFF: {p_ac_off:.1f} km | AC ON: {p_ac_on:.1f} km (Savings: {p_ac_off - p_ac_on:.1f} km)")
assert p_ac_off > p_ac_on, "AC OFF must yield higher range than AC ON"

print("\n=== 6. Testing Speed Impact ===")
p_sp_low = predict_range(75.0, 50.0, 30.0, 1, 25.0, 'City', 0, 40.0)
p_sp_high = predict_range(75.0, 50.0, 100.0, 1, 25.0, 'Highway', 0, 40.0)
print(f"  City 30 km/h: {p_sp_low:.1f} km | Highway 100 km/h: {p_sp_high:.1f} km (Savings: {p_sp_low - p_sp_high:.1f} km)")
assert p_sp_low > p_sp_high, "City low speed must yield higher range than highway high speed"

print("\n*** All range prediction verification tests passed with 100% success! ***")

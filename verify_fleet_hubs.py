import urllib.request
import json

login_data = json.dumps({'email': 'you@fleet.com', 'password': 'password'}).encode()
req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    token = json.loads(resp.read().decode())['access_token']

req2 = urllib.request.Request('http://127.0.0.1:8000/api/vehicles', headers={'Authorization': f'Bearer {token}'})
with urllib.request.urlopen(req2) as resp:
    vehicles = json.loads(resp.read().decode())
    print(f"Total vehicles returned: {len(vehicles)}")
    for v in vehicles:
        print(f"{v['vehicle_id']:<10} | {v.get('hub_city','-'):<15} | {v.get('state','-'):<20} | Lat: {v.get('latitude'):.4f}, Lng: {v.get('longitude'):.4f} | Status: {v.get('status')}")

import urllib.request
import json

login_data = json.dumps({'email': 'you@fleet.com', 'password': 'password'}).encode()
req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    token = json.loads(resp.read().decode())['access_token']

reports = ['fleet-performance', 'driver-performance', 'battery-health', 'maintenance', 'energy-consumption', 'revenue-analytics']
success_count = 0
total_count = len(reports) * 3

print("=== VERIFYING ALL REPORT EXPORTS ===")
for r in reports:
    for f in ['pdf', 'excel', 'csv']:
        url = f'http://127.0.0.1:8000/api/reports/download/{r}/{f}'
        try:
            req2 = urllib.request.Request(url, headers={'Authorization': f'Bearer {token}'})
            with urllib.request.urlopen(req2) as resp2:
                content = resp2.read()
                print(f"PASS: {r:<22} ({f:<5}) -> {len(content)} bytes")
                success_count += 1
        except Exception as e:
            print(f"FAIL: {r:<22} ({f:<5}) -> {e}")

print(f"\nFinal Result: {success_count}/{total_count} PASSED")

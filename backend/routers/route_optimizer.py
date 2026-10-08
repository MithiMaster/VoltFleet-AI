import math
import random
import urllib.request
import urllib.parse
import json
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from backend.auth import get_current_admin_or_driver

router = APIRouter(prefix="/api/routes", tags=["Route Optimization"])

# Global Database of Countries and Cities with coordinates
GLOBAL_LOCATIONS: Dict[str, Dict[str, Any]] = {
    "India": {
        "code": "IN",
        "flag": "🇮🇳",
        "continent": "Asia",
        "cities": [
            {"name": "Mumbai", "lat": 19.0760, "lng": 72.8777},
            {"name": "Delhi", "lat": 28.6139, "lng": 77.2090},
            {"name": "Bengaluru", "lat": 12.9716, "lng": 77.5946},
            {"name": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
            {"name": "Chennai", "lat": 13.0827, "lng": 80.2707},
            {"name": "Kolkata", "lat": 22.5726, "lng": 88.3639},
            {"name": "Pune", "lat": 18.5204, "lng": 73.8567},
            {"name": "Ahmedabad", "lat": 23.0225, "lng": 72.5714},
            {"name": "Jaipur", "lat": 26.9124, "lng": 75.7873},
            {"name": "Surat", "lat": 21.1702, "lng": 72.8311},
            {"name": "Lucknow", "lat": 26.8467, "lng": 80.9462},
            {"name": "Chandigarh", "lat": 30.7333, "lng": 76.7794},
            {"name": "Kochi", "lat": 9.9312, "lng": 76.2673},
            {"name": "Indore", "lat": 22.7196, "lng": 75.8577},
            {"name": "Bhopal", "lat": 23.2599, "lng": 77.4126},
            {"name": "Nagpur", "lat": 21.1458, "lng": 79.0882},
            {"name": "Coimbatore", "lat": 11.0168, "lng": 76.9558},
            {"name": "Visakhapatnam", "lat": 17.6868, "lng": 83.2185},
            {"name": "Goa (Panaji)", "lat": 15.4909, "lng": 73.8278},
            {"name": "Patna", "lat": 25.5941, "lng": 85.1376}
        ]
    },
    "United States": {
        "code": "US",
        "flag": "🇺🇸",
        "continent": "North America",
        "cities": [
            {"name": "New York, NY", "lat": 40.7128, "lng": -74.0060},
            {"name": "Los Angeles, CA", "lat": 34.0522, "lng": -118.2437},
            {"name": "Chicago, IL", "lat": 41.8781, "lng": -87.6298},
            {"name": "Houston, TX", "lat": 29.7604, "lng": -95.3698},
            {"name": "Phoenix, AZ", "lat": 33.4484, "lng": -112.0740},
            {"name": "Philadelphia, PA", "lat": 39.9526, "lng": -75.1652},
            {"name": "San Antonio, TX", "lat": 29.4241, "lng": -98.4936},
            {"name": "San Diego, CA", "lat": 32.7157, "lng": -117.1611},
            {"name": "Dallas, TX", "lat": 32.7767, "lng": -96.7970},
            {"name": "San Jose, CA", "lat": 37.3382, "lng": -121.8863},
            {"name": "Austin, TX", "lat": 30.2672, "lng": -97.7431},
            {"name": "San Francisco, CA", "lat": 37.7749, "lng": -122.4194},
            {"name": "Seattle, WA", "lat": 47.6062, "lng": -122.3321},
            {"name": "Boston, MA", "lat": 42.3601, "lng": -71.0589},
            {"name": "Denver, CO", "lat": 39.7392, "lng": -104.9903},
            {"name": "Atlanta, GA", "lat": 33.7490, "lng": -84.3880},
            {"name": "Miami, FL", "lat": 25.7617, "lng": -80.1918},
            {"name": "Washington, DC", "lat": 38.9072, "lng": -77.0369},
            {"name": "Las Vegas, NV", "lat": 36.1699, "lng": -115.1398},
            {"name": "Detroit, MI", "lat": 42.3314, "lng": -83.0458}
        ]
    },
    "United Kingdom": {
        "code": "GB",
        "flag": "🇬🇧",
        "continent": "Europe",
        "cities": [
            {"name": "London", "lat": 51.5074, "lng": -0.1278},
            {"name": "Manchester", "lat": 53.4808, "lng": -2.2426},
            {"name": "Birmingham", "lat": 52.4862, "lng": -1.8904},
            {"name": "Edinburgh", "lat": 55.9533, "lng": -3.1883},
            {"name": "Glasgow", "lat": 55.8642, "lng": -4.2518},
            {"name": "Leeds", "lat": 53.8008, "lng": -1.5491},
            {"name": "Liverpool", "lat": 53.4084, "lng": -2.9916},
            {"name": "Bristol", "lat": 51.4545, "lng": -2.5879},
            {"name": "Newcastle", "lat": 54.9783, "lng": -1.6178},
            {"name": "Oxford", "lat": 51.7520, "lng": -1.2577},
            {"name": "Cambridge", "lat": 52.2053, "lng": 0.1218},
            {"name": "Cardiff", "lat": 51.4816, "lng": -3.1791},
            {"name": "Belfast", "lat": 54.5973, "lng": -5.9301}
        ]
    },
    "Germany": {
        "code": "DE",
        "flag": "🇩🇪",
        "continent": "Europe",
        "cities": [
            {"name": "Berlin", "lat": 52.5200, "lng": 13.4050},
            {"name": "Munich", "lat": 48.1351, "lng": 11.5820},
            {"name": "Frankfurt", "lat": 50.1109, "lng": 8.6821},
            {"name": "Hamburg", "lat": 53.5511, "lng": 9.9937},
            {"name": "Cologne", "lat": 50.9375, "lng": 6.9603},
            {"name": "Stuttgart", "lat": 48.7758, "lng": 9.1829},
            {"name": "Dusseldorf", "lat": 51.2277, "lng": 6.7735},
            {"name": "Leipzig", "lat": 51.3397, "lng": 12.3731},
            {"name": "Dresden", "lat": 51.0504, "lng": 13.7373},
            {"name": "Nuremberg", "lat": 49.4521, "lng": 11.0767},
            {"name": "Hanover", "lat": 52.3759, "lng": 9.7320}
        ]
    },
    "France": {
        "code": "FR",
        "flag": "🇫🇷",
        "continent": "Europe",
        "cities": [
            {"name": "Paris", "lat": 48.8566, "lng": 2.3522},
            {"name": "Marseille", "lat": 43.2965, "lng": 5.3698},
            {"name": "Lyon", "lat": 45.7640, "lng": 4.8357},
            {"name": "Toulouse", "lat": 43.6047, "lng": 1.4442},
            {"name": "Nice", "lat": 43.7102, "lng": 7.2620},
            {"name": "Nantes", "lat": 47.2184, "lng": -1.5536},
            {"name": "Strasbourg", "lat": 48.5734, "lng": 7.7521},
            {"name": "Montpellier", "lat": 43.6108, "lng": 3.8767},
            {"name": "Bordeaux", "lat": 44.8378, "lng": -0.5792},
            {"name": "Lille", "lat": 50.6292, "lng": 3.0573}
        ]
    },
    "Japan": {
        "code": "JP",
        "flag": "🇯🇵",
        "continent": "Asia",
        "cities": [
            {"name": "Tokyo", "lat": 35.6762, "lng": 139.6503},
            {"name": "Yokohama", "lat": 35.4437, "lng": 139.6380},
            {"name": "Osaka", "lat": 34.6937, "lng": 135.5023},
            {"name": "Kyoto", "lat": 35.0116, "lng": 135.7681},
            {"name": "Nagoya", "lat": 35.1815, "lng": 136.9066},
            {"name": "Sapporo", "lat": 43.0618, "lng": 141.3545},
            {"name": "Fukuoka", "lat": 33.5904, "lng": 130.4017},
            {"name": "Kobe", "lat": 34.6901, "lng": 135.1955},
            {"name": "Hiroshima", "lat": 34.3853, "lng": 132.4553},
            {"name": "Sendai", "lat": 38.2682, "lng": 140.8694}
        ]
    },
    "Canada": {
        "code": "CA",
        "flag": "🇨🇦",
        "continent": "North America",
        "cities": [
            {"name": "Toronto", "lat": 43.6532, "lng": -79.3832},
            {"name": "Montreal", "lat": 45.5017, "lng": -73.5673},
            {"name": "Vancouver", "lat": 49.2827, "lng": -123.1207},
            {"name": "Calgary", "lat": 51.0447, "lng": -114.0719},
            {"name": "Edmonton", "lat": 53.5461, "lng": -113.4938},
            {"name": "Ottawa", "lat": 45.4215, "lng": -75.6972},
            {"name": "Quebec City", "lat": 46.8139, "lng": -71.2080},
            {"name": "Winnipeg", "lat": 49.8951, "lng": -97.1384},
            {"name": "Halifax", "lat": 44.6488, "lng": -63.5752}
        ]
    },
    "Australia": {
        "code": "AU",
        "flag": "🇦🇺",
        "continent": "Oceania",
        "cities": [
            {"name": "Sydney", "lat": -33.8688, "lng": 151.2093},
            {"name": "Melbourne", "lat": -37.8136, "lng": 144.9631},
            {"name": "Brisbane", "lat": -27.4698, "lng": 153.0251},
            {"name": "Perth", "lat": -31.9505, "lng": 115.8605},
            {"name": "Adelaide", "lat": -34.9285, "lng": 138.6007},
            {"name": "Canberra", "lat": -35.2809, "lng": 149.1300},
            {"name": "Gold Coast", "lat": -28.0167, "lng": 153.4000},
            {"name": "Newcastle", "lat": -32.9283, "lng": 151.7817},
            {"name": "Hobart", "lat": -42.8821, "lng": 147.3272}
        ]
    },
    "United Arab Emirates": {
        "code": "AE",
        "flag": "🇦🇪",
        "continent": "Middle East",
        "cities": [
            {"name": "Dubai", "lat": 25.2048, "lng": 55.2708},
            {"name": "Abu Dhabi", "lat": 24.4539, "lng": 54.3773},
            {"name": "Sharjah", "lat": 25.3463, "lng": 55.4209},
            {"name": "Ajman", "lat": 25.4052, "lng": 55.5136},
            {"name": "Ras Al Khaimah", "lat": 25.7895, "lng": 55.9432},
            {"name": "Al Ain", "lat": 24.2075, "lng": 55.7447}
        ]
    },
    "Singapore": {
        "code": "SG",
        "flag": "🇸🇬",
        "continent": "Asia",
        "cities": [
            {"name": "Singapore (Central)", "lat": 1.3521, "lng": 103.8198},
            {"name": "Jurong West", "lat": 1.3404, "lng": 103.7090},
            {"name": "Woodlands", "lat": 1.4382, "lng": 103.7891},
            {"name": "Tampines", "lat": 1.3533, "lng": 103.9452},
            {"name": "Changi Port", "lat": 1.3644, "lng": 103.9915}
        ]
    },
    "China": {
        "code": "CN",
        "flag": "🇨🇳",
        "continent": "Asia",
        "cities": [
            {"name": "Beijing", "lat": 39.9042, "lng": 116.4074},
            {"name": "Shanghai", "lat": 31.2304, "lng": 121.4737},
            {"name": "Shenzhen", "lat": 22.5431, "lng": 114.0579},
            {"name": "Guangzhou", "lat": 23.1291, "lng": 113.2644},
            {"name": "Chengdu", "lat": 30.5728, "lng": 104.0668},
            {"name": "Hangzhou", "lat": 30.2741, "lng": 120.1551},
            {"name": "Wuhan", "lat": 30.5928, "lng": 114.3055},
            {"name": "Xi'an", "lat": 34.3416, "lng": 108.9398}
        ]
    },
    "South Korea": {
        "code": "KR",
        "flag": "🇰🇷",
        "continent": "Asia",
        "cities": [
            {"name": "Seoul", "lat": 37.5665, "lng": 126.9780},
            {"name": "Busan", "lat": 35.1796, "lng": 129.0756},
            {"name": "Incheon", "lat": 37.4563, "lng": 126.7052},
            {"name": "Daegu", "lat": 35.8714, "lng": 128.6014},
            {"name": "Daejeon", "lat": 36.3504, "lng": 127.3845},
            {"name": "Gwangju", "lat": 35.1595, "lng": 126.8526}
        ]
    },
    "Italy": {
        "code": "IT",
        "flag": "🇮🇹",
        "continent": "Europe",
        "cities": [
            {"name": "Rome", "lat": 41.9028, "lng": 12.4964},
            {"name": "Milan", "lat": 45.4642, "lng": 9.1900},
            {"name": "Naples", "lat": 40.8518, "lng": 14.2681},
            {"name": "Turin", "lat": 45.0703, "lng": 7.6869},
            {"name": "Florence", "lat": 43.7696, "lng": 11.2558},
            {"name": "Venice", "lat": 45.4408, "lng": 12.3155},
            {"name": "Bologna", "lat": 44.4949, "lng": 11.3426}
        ]
    },
    "Spain": {
        "code": "ES",
        "flag": "🇪🇸",
        "continent": "Europe",
        "cities": [
            {"name": "Madrid", "lat": 40.4168, "lng": -3.7038},
            {"name": "Barcelona", "lat": 41.3851, "lng": 2.1734},
            {"name": "Valencia", "lat": 39.4699, "lng": -0.3763},
            {"name": "Seville", "lat": 37.3891, "lng": -5.9845},
            {"name": "Zaragoza", "lat": 41.6488, "lng": -0.8891},
            {"name": "Malaga", "lat": 36.7213, "lng": -4.4214},
            {"name": "Bilbao", "lat": 43.2630, "lng": -2.9350}
        ]
    },
    "Netherlands": {
        "code": "NL",
        "flag": "🇳🇱",
        "continent": "Europe",
        "cities": [
            {"name": "Amsterdam", "lat": 52.3676, "lng": 4.9041},
            {"name": "Rotterdam", "lat": 51.9244, "lng": 4.4777},
            {"name": "The Hague", "lat": 52.0705, "lng": 4.3007},
            {"name": "Utrecht", "lat": 52.0907, "lng": 5.1214},
            {"name": "Eindhoven", "lat": 51.4416, "lng": 5.4697}
        ]
    },
    "Switzerland": {
        "code": "CH",
        "flag": "🇨🇭",
        "continent": "Europe",
        "cities": [
            {"name": "Zurich", "lat": 47.3769, "lng": 8.5417},
            {"name": "Geneva", "lat": 46.2044, "lng": 6.1432},
            {"name": "Basel", "lat": 47.5596, "lng": 7.5886},
            {"name": "Bern", "lat": 46.9480, "lng": 7.4474},
            {"name": "Lausanne", "lat": 46.5197, "lng": 6.6323},
            {"name": "Lucerne", "lat": 47.0502, "lng": 8.3093}
        ]
    },
    "Sweden": {
        "code": "SE",
        "flag": "🇸🇪",
        "continent": "Europe",
        "cities": [
            {"name": "Stockholm", "lat": 59.3293, "lng": 18.0686},
            {"name": "Gothenburg", "lat": 57.7089, "lng": 11.9746},
            {"name": "Malmo", "lat": 55.6050, "lng": 13.0038},
            {"name": "Uppsala", "lat": 59.8586, "lng": 17.6389}
        ]
    },
    "Norway": {
        "code": "NO",
        "flag": "🇳🇴",
        "continent": "Europe",
        "cities": [
            {"name": "Oslo", "lat": 59.9139, "lng": 10.7522},
            {"name": "Bergen", "lat": 60.3913, "lng": 5.3221},
            {"name": "Trondheim", "lat": 63.4305, "lng": 10.3951},
            {"name": "Stavanger", "lat": 58.9700, "lng": 5.7331}
        ]
    },
    "Brazil": {
        "code": "BR",
        "flag": "🇧🇷",
        "continent": "South America",
        "cities": [
            {"name": "Sao Paulo", "lat": -23.5505, "lng": -46.6333},
            {"name": "Rio de Janeiro", "lat": -22.9068, "lng": -43.1729},
            {"name": "Brasilia", "lat": -15.8267, "lng": -47.9218},
            {"name": "Salvador", "lat": -12.9777, "lng": -38.5016},
            {"name": "Belo Horizonte", "lat": -19.9167, "lng": -43.9345},
            {"name": "Curitiba", "lat": -25.4284, "lng": -49.2733}
        ]
    },
    "Mexico": {
        "code": "MX",
        "flag": "🇲🇽",
        "continent": "North America",
        "cities": [
            {"name": "Mexico City", "lat": 19.4326, "lng": -99.1332},
            {"name": "Guadalajara", "lat": 20.6597, "lng": -103.3496},
            {"name": "Monterrey", "lat": 25.6866, "lng": -100.3161},
            {"name": "Puebla", "lat": 19.0414, "lng": -98.2063},
            {"name": "Tijuana", "lat": 32.5149, "lng": -117.0382},
            {"name": "Cancun", "lat": 21.1619, "lng": -86.8515}
        ]
    },
    "South Africa": {
        "code": "ZA",
        "flag": "🇿🇦",
        "continent": "Africa",
        "cities": [
            {"name": "Johannesburg", "lat": -26.2041, "lng": 28.0473},
            {"name": "Cape Town", "lat": -33.9249, "lng": 18.4241},
            {"name": "Durban", "lat": -29.8587, "lng": 31.0218},
            {"name": "Pretoria", "lat": -25.7479, "lng": 28.2293}
        ]
    },
    "Saudi Arabia": {
        "code": "SA",
        "flag": "🇸🇦",
        "continent": "Middle East",
        "cities": [
            {"name": "Riyadh", "lat": 24.7136, "lng": 46.6753},
            {"name": "Jeddah", "lat": 21.5433, "lng": 39.1728},
            {"name": "Mecca", "lat": 21.3891, "lng": 39.8579},
            {"name": "Medina", "lat": 24.5247, "lng": 39.5692},
            {"name": "Dammam", "lat": 26.4207, "lng": 50.0888}
        ]
    },
    "Turkey": {
        "code": "TR",
        "flag": "🇹🇷",
        "continent": "Europe/Asia",
        "cities": [
            {"name": "Istanbul", "lat": 41.0082, "lng": 28.9784},
            {"name": "Ankara", "lat": 39.9334, "lng": 32.8597},
            {"name": "Izmir", "lat": 38.4237, "lng": 27.1428},
            {"name": "Antalya", "lat": 36.8969, "lng": 30.7133}
        ]
    },
    "New Zealand": {
        "code": "NZ",
        "flag": "🇳🇿",
        "continent": "Oceania",
        "cities": [
            {"name": "Auckland", "lat": -36.8485, "lng": 174.7633},
            {"name": "Wellington", "lat": -41.2865, "lng": 174.7762},
            {"name": "Christchurch", "lat": -43.5321, "lng": 172.6362},
            {"name": "Hamilton", "lat": -37.7870, "lng": 175.2793}
        ]
    },
    "Malaysia": {
        "code": "MY",
        "flag": "🇲🇾",
        "continent": "Asia",
        "cities": [
            {"name": "Kuala Lumpur", "lat": 3.1390, "lng": 101.6869},
            {"name": "George Town (Penang)", "lat": 5.4141, "lng": 100.3288},
            {"name": "Johor Bahru", "lat": 1.4927, "lng": 103.7414},
            {"name": "Malacca City", "lat": 2.1896, "lng": 102.2501}
        ]
    },
    "Thailand": {
        "code": "TH",
        "flag": "🇹🇭",
        "continent": "Asia",
        "cities": [
            {"name": "Bangkok", "lat": 13.7563, "lng": 100.5018},
            {"name": "Chiang Mai", "lat": 18.7883, "lng": 98.9853},
            {"name": "Phuket", "lat": 7.8804, "lng": 98.3923},
            {"name": "Pattaya", "lat": 12.9236, "lng": 100.8825}
        ]
    },
    "Indonesia": {
        "code": "ID",
        "flag": "🇮🇩",
        "continent": "Asia",
        "cities": [
            {"name": "Jakarta", "lat": -6.2088, "lng": 106.8456},
            {"name": "Surabaya", "lat": -7.2575, "lng": 112.7521},
            {"name": "Bandung", "lat": -6.9175, "lng": 107.6191},
            {"name": "Denpasar (Bali)", "lat": -8.6705, "lng": 115.2126}
        ]
    },
    "Egypt": {
        "code": "EG",
        "flag": "🇪🇬",
        "continent": "Africa",
        "cities": [
            {"name": "Cairo", "lat": 30.0444, "lng": 31.2357},
            {"name": "Alexandria", "lat": 31.2001, "lng": 29.9187},
            {"name": "Giza", "lat": 30.0131, "lng": 31.2089}
        ]
    },
    "Argentina": {
        "code": "AR",
        "flag": "🇦🇷",
        "continent": "South America",
        "cities": [
            {"name": "Buenos Aires", "lat": -34.6037, "lng": -58.3816},
            {"name": "Cordoba", "lat": -31.4201, "lng": -64.1888},
            {"name": "Rosario", "lat": -32.9442, "lng": -60.6505},
            {"name": "Mendoza", "lat": -32.8895, "lng": -68.8458}
        ]
    }
}

class RouteOptimizeRequest(BaseModel):
    start: str
    destination: str
    charger_preference: Optional[str] = "150 kW DCFC"
    start_coords: Optional[List[float]] = None
    dest_coords: Optional[List[float]] = None

@router.get("/locations")
def get_global_locations():
    """Return all available countries and major cities."""
    countries_list = []
    for country_name, details in GLOBAL_LOCATIONS.items():
        countries_list.append({
            "name": country_name,
            "code": details["code"],
            "flag": details["flag"],
            "continent": details["continent"],
            "cities": details["cities"]
        })
    return {"countries": countries_list}

def geocode_location(query: str, explicit_coords: Optional[List[float]] = None) -> List[float]:
    """Geocode any location string or city name worldwide."""
    if explicit_coords and len(explicit_coords) == 2:
        return [float(explicit_coords[0]), float(explicit_coords[1])]

    query_clean = query.lower().strip()

    # 1. Check if raw coordinates like "19.07, 72.87"
    if "," in query_clean:
        parts = [p.strip() for p in query_clean.split(",")]
        try:
            if len(parts) == 2 and all(p.replace(".", "", 1).replace("-", "", 1).isdigit() for p in parts):
                return [float(parts[0]), float(parts[1])]
        except Exception:
            pass

    # 2. Match in local global database
    for country_name, country_data in GLOBAL_LOCATIONS.items():
        if query_clean == country_name.lower():
            # Return capital/first city
            return [country_data["cities"][0]["lat"], country_data["cities"][0]["lng"]]
        for city in country_data["cities"]:
            c_name = city["name"].lower()
            if c_name in query_clean or query_clean in c_name:
                return [city["lat"], city["lng"]]

    # 3. Query OpenStreetMap Nominatim for any global place/address
    try:
        encoded = urllib.parse.quote(query.strip())
        url = f"https://nominatim.openstreetmap.org/search?q={encoded}&format=json&limit=1"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "VoltFleet-AI-Optimizer/2.0 (EV Fleet Global Router)"}
        )
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            if data and len(data) > 0:
                return [float(data[0]["lat"]), float(data[0]["lon"])]
    except Exception as err:
        print(f"[GEOCODE] OSM query failed for '{query}': {err}")

    # 4. Safe worldwide fallback: pick central coordinates of query hash
    # (Consistent pseudo-random worldwide location instead of SF Bay Area)
    q_hash = sum(ord(c) for c in query_clean)
    lat = ((q_hash % 900) / 10.0) - 20.0  # -20 to +70 deg lat
    lng = ((q_hash % 3600) / 10.0) - 180.0  # -180 to +180 deg lng
    return [round(lat, 4), round(lng, 4)]

def calculate_haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> Dict[str, float]:
    """Calculate distance on Earth in km and miles."""
    R_KM = 6371.0
    R_MILES = 3958.8
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return {
        "km": R_KM * c,
        "miles": R_MILES * c
    }

def fetch_osrm_route(lat1: float, lng1: float, lat2: float, lng2: float) -> Optional[Dict[str, Any]]:
    """Try to fetch real driving road route from OSRM demo server."""
    try:
        url = f"http://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "VoltFleet-AI-Global-Optimizer/2.0"}
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                distance_meters = route["distance"]
                duration_seconds = route["duration"]
                # Convert geojson [lng, lat] to Leaflet [lat, lng]
                coordinates = [[pt[1], pt[0]] for pt in route["geometry"]["coordinates"]]
                return {
                    "distance_km": distance_meters / 1000.0,
                    "distance_miles": distance_meters / 1609.344,
                    "duration_mins": int(duration_seconds / 60),
                    "path_coordinates": coordinates
                }
    except Exception as err:
        print(f"[OSRM] Notice: OSRM route fetch skipped/failed: {err}")
    return None

def generate_geodesic_curved_path(lat1: float, lng1: float, lat2: float, lng2: float, num_points: int = 50) -> List[List[float]]:
    """Generate realistic road-like curved coordinates between any two points globally."""
    coords = []
    d_lat = lat2 - lat1
    d_lng = lng2 - lng1

    # Perpendicular vector in geographic space
    perp_lat = -d_lng
    perp_lng = d_lat
    length = math.hypot(perp_lat, perp_lng)
    if length > 0:
        perp_lat /= length
        perp_lng /= length
    else:
        perp_lat, perp_lng = 0.0, 0.0

    # Curve magnitude relative to distance
    curve_scale = min(max(length * 0.04, 0.01), 0.3)

    for i in range(num_points):
        t = i / (num_points - 1)
        lat = lat1 + d_lat * t
        lng = lng1 + d_lng * t

        # Realistic undulating highway curvature
        curve_offset = (
            math.sin(t * math.pi) * curve_scale +
            math.sin(t * math.pi * 3) * (curve_scale * 0.35)
        )
        lat += perp_lat * curve_offset
        lng += perp_lng * curve_offset
        coords.append([round(lat, 5), round(lng, 5)])

    return coords

@router.post("/optimize")
def optimize_route(
    req: RouteOptimizeRequest,
    current_user = Depends(get_current_admin_or_driver)
):
    """
    Optimizes EV route for any selected locations worldwide.
    Calculates distance, duration, energy (kWh), battery usage %, traffic, and charging stops.
    """
    start_coords = geocode_location(req.start, req.start_coords)
    dest_coords = geocode_location(req.destination, req.dest_coords)

    # Prevent identical coordinates
    if abs(start_coords[0] - dest_coords[0]) < 0.001 and abs(start_coords[1] - dest_coords[1]) < 0.001:
        dest_coords[0] += 0.05
        dest_coords[1] += 0.05

    # 1. Try real road routing via OSRM
    osrm_data = fetch_osrm_route(start_coords[0], start_coords[1], dest_coords[0], dest_coords[1])

    if osrm_data and len(osrm_data.get("path_coordinates", [])) > 5:
        distance_km = osrm_data["distance_km"]
        distance_miles = osrm_data["distance_miles"]
        base_duration_mins = osrm_data["duration_mins"]
        path_coords = osrm_data["path_coordinates"]
    else:
        # Fallback to geodesic curved path
        dist_dict = calculate_haversine_distance(start_coords[0], start_coords[1], dest_coords[0], dest_coords[1])
        # Driving roads are typically ~1.25x the straight-line Haversine distance
        distance_km = max(dist_dict["km"] * 1.25, 5.0)
        distance_miles = distance_km * 0.621371
        # Avg highway speed ~80 km/h
        base_duration_mins = int((distance_km / 80.0) * 60)
        path_coords = generate_geodesic_curved_path(start_coords[0], start_coords[1], dest_coords[0], dest_coords[1], num_points=60)

    # 2. EV Fleet Energy Model (Efficiency: ~0.19 kWh/km or ~0.30 kWh/mi)
    ev_efficiency_kwh_per_km = 0.195
    energy_kwh = distance_km * ev_efficiency_kwh_per_km

    # 75 kWh battery pack standard
    battery_capacity_kwh = 75.0
    battery_usage_pct = min(round((energy_kwh / battery_capacity_kwh) * 100.0, 1), 999.0)

    # Traffic estimation
    traffic_options = ["Optimal Flow", "Moderate Traffic", "Heavy Congestion"]
    traffic = random.choice(traffic_options)
    traffic_delay_factor = 1.0 if traffic == "Optimal Flow" else 1.18 if traffic == "Moderate Traffic" else 1.35
    total_duration_mins = int(base_duration_mins * traffic_delay_factor)

    # Elevation impact
    elevation_impact = round(1.2 + random.random() * 3.5, 1)

    # 3. Dynamic EV Charging Stop Planner
    # If the trip requires more than 65% of battery (approx > 250 km), schedule stops
    charging_stops = []
    
    # Parse charger power preference
    charger_kw = 150
    if req.charger_preference:
        pref_kw = req.charger_preference.split()[0]
        if pref_kw.isdigit():
            charger_kw = int(pref_kw)

    if distance_km > 200.0:
        # Number of stops needed based on 250km usable range per charge
        num_stops = min(int(distance_km // 220), 4)
        if num_stops == 0:
            num_stops = 1

        for s in range(1, num_stops + 1):
            ratio = s / (num_stops + 1)
            stop_idx = int(len(path_coords) * ratio)
            stop_idx = max(0, min(stop_idx, len(path_coords) - 1))
            stop_point = [path_coords[stop_idx][0], path_coords[stop_idx][1]]

            # Slight realistic offset off the main highway
            stop_point[0] += 0.001 * (random.random() - 0.5)
            stop_point[1] += 0.001 * (random.random() - 0.5)

            stop_name = f"VoltGrid HyperCharge #{s} ({charger_kw} kW)"
            # Charge duration in minutes to add ~50 kWh
            charge_duration = int((45.0 / charger_kw) * 60) + 5
            charge_duration = max(charge_duration, 12)

            charging_stops.append({
                "name": stop_name,
                "coords": stop_point,
                "wait_mins": charge_duration,
                "speed_kw": charger_kw,
                "station_status": "Available",
                "available_plugs": random.randint(4, 12)
            })

    # Format duration for friendly display
    hours = total_duration_mins // 60
    mins = total_duration_mins % 60
    duration_formatted = f"{hours}h {mins}m" if hours > 0 else f"{mins} mins"

    return {
        "status": "success",
        "start_name": req.start,
        "destination_name": req.destination,
        "start_coords": start_coords,
        "dest_coords": dest_coords,
        "distance_km": round(distance_km, 1),
        "distance_miles": round(distance_miles, 1),
        "duration_mins": total_duration_mins,
        "duration_formatted": duration_formatted,
        "energy_kwh": round(energy_kwh, 1),
        "battery_usage_pct": battery_usage_pct,
        "traffic": traffic,
        "elevation_impact_pct": elevation_impact,
        "path_coordinates": path_coords,
        "charging_stops": charging_stops,
        "charger_preference": req.charger_preference
    }

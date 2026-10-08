export interface CityOption {
    name: string;
    lat: number;
    lng: number;
}

export interface CountryOption {
    name: string;
    code: string;
    flag: string;
    continent: string;
    cities: CityOption[];
}

export const WORLD_COUNTRIES: CountryOption[] = [
    {
        name: "India",
        code: "IN",
        flag: "🇮🇳",
        continent: "Asia",
        cities: [
            { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
            { name: "Delhi", lat: 28.6139, lng: 77.2090 },
            { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
            { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
            { name: "Chennai", lat: 13.0827, lng: 80.2707 },
            { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
            { name: "Pune", lat: 18.5204, lng: 73.8567 },
            { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
            { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
            { name: "Surat", lat: 21.1702, lng: 72.8311 },
            { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
            { name: "Chandigarh", lat: 30.7333, lng: 76.7794 },
            { name: "Kochi", lat: 9.9312, lng: 76.2673 },
            { name: "Indore", lat: 22.7196, lng: 75.8577 },
            { name: "Bhopal", lat: 23.2599, lng: 77.4126 },
            { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
            { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
            { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
            { name: "Goa (Panaji)", lat: 15.4909, lng: 73.8278 },
            { name: "Patna", lat: 25.5941, lng: 85.1376 }
        ]
    },
    {
        name: "United States",
        code: "US",
        flag: "🇺🇸",
        continent: "North America",
        cities: [
            { name: "San Francisco, CA", lat: 37.7749, lng: -122.4194 },
            { name: "San Jose, CA", lat: 37.3382, lng: -121.8863 },
            { name: "Los Angeles, CA", lat: 34.0522, lng: -118.2437 },
            { name: "San Diego, CA", lat: 32.7157, lng: -117.1611 },
            { name: "New York, NY", lat: 40.7128, lng: -74.0060 },
            { name: "Boston, MA", lat: 42.3601, lng: -71.0589 },
            { name: "Chicago, IL", lat: 41.8781, lng: -87.6298 },
            { name: "Seattle, WA", lat: 47.6062, lng: -122.3321 },
            { name: "Austin, TX", lat: 30.2672, lng: -97.7431 },
            { name: "Dallas, TX", lat: 32.7767, lng: -96.7970 },
            { name: "Houston, TX", lat: 29.7604, lng: -95.3698 },
            { name: "Phoenix, AZ", lat: 33.4484, lng: -112.0740 },
            { name: "Philadelphia, PA", lat: 39.9526, lng: -75.1652 },
            { name: "Denver, CO", lat: 39.7392, lng: -104.9903 },
            { name: "Atlanta, GA", lat: 33.7490, lng: -84.3880 },
            { name: "Miami, FL", lat: 25.7617, lng: -80.1918 },
            { name: "Washington, DC", lat: 38.9072, lng: -77.0369 },
            { name: "Las Vegas, NV", lat: 36.1699, lng: -115.1398 },
            { name: "Detroit, MI", lat: 42.3314, lng: -83.0458 }
        ]
    },
    {
        name: "United Kingdom",
        code: "GB",
        flag: "🇬🇧",
        continent: "Europe",
        cities: [
            { name: "London", lat: 51.5074, lng: -0.1278 },
            { name: "Manchester", lat: 53.4808, lng: -2.2426 },
            { name: "Birmingham", lat: 52.4862, lng: -1.8904 },
            { name: "Edinburgh", lat: 55.9533, lng: -3.1883 },
            { name: "Glasgow", lat: 55.8642, lng: -4.2518 },
            { name: "Leeds", lat: 53.8008, lng: -1.5491 },
            { name: "Liverpool", lat: 53.4084, lng: -2.9916 },
            { name: "Bristol", lat: 51.4545, lng: -2.5879 },
            { name: "Newcastle", lat: 54.9783, lng: -1.6178 },
            { name: "Oxford", lat: 51.7520, lng: -1.2577 },
            { name: "Cambridge", lat: 52.2053, lng: 0.1218 },
            { name: "Cardiff", lat: 51.4816, lng: -3.1791 },
            { name: "Belfast", lat: 54.5973, lng: -5.9301 }
        ]
    },
    {
        name: "Germany",
        code: "DE",
        flag: "🇩🇪",
        continent: "Europe",
        cities: [
            { name: "Berlin", lat: 52.5200, lng: 13.4050 },
            { name: "Munich", lat: 48.1351, lng: 11.5820 },
            { name: "Frankfurt", lat: 50.1109, lng: 8.6821 },
            { name: "Hamburg", lat: 53.5511, lng: 9.9937 },
            { name: "Cologne", lat: 50.9375, lng: 6.9603 },
            { name: "Stuttgart", lat: 48.7758, lng: 9.1829 },
            { name: "Dusseldorf", lat: 51.2277, lng: 6.7735 },
            { name: "Leipzig", lat: 51.3397, lng: 12.3731 },
            { name: "Dresden", lat: 51.0504, lng: 13.7373 },
            { name: "Nuremberg", lat: 49.4521, lng: 11.0767 }
        ]
    },
    {
        name: "France",
        code: "FR",
        flag: "🇫🇷",
        continent: "Europe",
        cities: [
            { name: "Paris", lat: 48.8566, lng: 2.3522 },
            { name: "Marseille", lat: 43.2965, lng: 5.3698 },
            { name: "Lyon", lat: 45.7640, lng: 4.8357 },
            { name: "Toulouse", lat: 43.6047, lng: 1.4442 },
            { name: "Nice", lat: 43.7102, lng: 7.2620 },
            { name: "Nantes", lat: 47.2184, lng: -1.5536 },
            { name: "Strasbourg", lat: 48.5734, lng: 7.7521 },
            { name: "Bordeaux", lat: 44.8378, lng: -0.5792 },
            { name: "Lille", lat: 50.6292, lng: 3.0573 }
        ]
    },
    {
        name: "Japan",
        code: "JP",
        flag: "🇯🇵",
        continent: "Asia",
        cities: [
            { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
            { name: "Yokohama", lat: 35.4437, lng: 139.6380 },
            { name: "Osaka", lat: 34.6937, lng: 135.5023 },
            { name: "Kyoto", lat: 35.0116, lng: 135.7681 },
            { name: "Nagoya", lat: 35.1815, lng: 136.9066 },
            { name: "Sapporo", lat: 43.0618, lng: 141.3545 },
            { name: "Fukuoka", lat: 33.5904, lng: 130.4017 },
            { name: "Kobe", lat: 34.6901, lng: 135.1955 },
            { name: "Hiroshima", lat: 34.3853, lng: 132.4553 }
        ]
    },
    {
        name: "Canada",
        code: "CA",
        flag: "🇨🇦",
        continent: "North America",
        cities: [
            { name: "Toronto", lat: 43.6532, lng: -79.3832 },
            { name: "Montreal", lat: 45.5017, lng: -73.5673 },
            { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
            { name: "Calgary", lat: 51.0447, lng: -114.0719 },
            { name: "Edmonton", lat: 53.5461, lng: -113.4938 },
            { name: "Ottawa", lat: 45.4215, lng: -75.6972 },
            { name: "Quebec City", lat: 46.8139, lng: -71.2080 },
            { name: "Winnipeg", lat: 49.8951, lng: -97.1384 }
        ]
    },
    {
        name: "Australia",
        code: "AU",
        flag: "🇦🇺",
        continent: "Oceania",
        cities: [
            { name: "Sydney", lat: -33.8688, lng: 151.2093 },
            { name: "Melbourne", lat: -37.8136, lng: 144.9631 },
            { name: "Brisbane", lat: -27.4698, lng: 153.0251 },
            { name: "Perth", lat: -31.9505, lng: 115.8605 },
            { name: "Adelaide", lat: -34.9285, lng: 138.6007 },
            { name: "Canberra", lat: -35.2809, lng: 149.1300 },
            { name: "Gold Coast", lat: -28.0167, lng: 153.4000 }
        ]
    },
    {
        name: "United Arab Emirates",
        code: "AE",
        flag: "🇦🇪",
        continent: "Middle East",
        cities: [
            { name: "Dubai", lat: 25.2048, lng: 55.2708 },
            { name: "Abu Dhabi", lat: 24.4539, lng: 54.3773 },
            { name: "Sharjah", lat: 25.3463, lng: 55.4209 },
            { name: "Ajman", lat: 25.4052, lng: 55.5136 },
            { name: "Ras Al Khaimah", lat: 25.7895, lng: 55.9432 },
            { name: "Al Ain", lat: 24.2075, lng: 55.7447 }
        ]
    },
    {
        name: "Singapore",
        code: "SG",
        flag: "🇸🇬",
        continent: "Asia",
        cities: [
            { name: "Singapore (Central)", lat: 1.3521, lng: 103.8198 },
            { name: "Jurong West", lat: 1.3404, lng: 103.7090 },
            { name: "Woodlands", lat: 1.4382, lng: 103.7891 },
            { name: "Tampines", lat: 1.3533, lng: 103.9452 },
            { name: "Changi Port", lat: 1.3644, lng: 103.9915 }
        ]
    },
    {
        name: "China",
        code: "CN",
        flag: "🇨🇳",
        continent: "Asia",
        cities: [
            { name: "Beijing", lat: 39.9042, lng: 116.4074 },
            { name: "Shanghai", lat: 31.2304, lng: 121.4737 },
            { name: "Shenzhen", lat: 22.5431, lng: 114.0579 },
            { name: "Guangzhou", lat: 23.1291, lng: 113.2644 },
            { name: "Chengdu", lat: 30.5728, lng: 104.0668 },
            { name: "Hangzhou", lat: 30.2741, lng: 120.1551 },
            { name: "Wuhan", lat: 30.5928, lng: 114.3055 },
            { name: "Xi'an", lat: 34.3416, lng: 108.9398 }
        ]
    },
    {
        name: "South Korea",
        code: "KR",
        flag: "🇰🇷",
        continent: "Asia",
        cities: [
            { name: "Seoul", lat: 37.5665, lng: 126.9780 },
            { name: "Busan", lat: 35.1796, lng: 129.0756 },
            { name: "Incheon", lat: 37.4563, lng: 126.7052 },
            { name: "Daegu", lat: 35.8714, lng: 128.6014 },
            { name: "Daejeon", lat: 36.3504, lng: 127.3845 }
        ]
    },
    {
        name: "Italy",
        code: "IT",
        flag: "🇮🇹",
        continent: "Europe",
        cities: [
            { name: "Rome", lat: 41.9028, lng: 12.4964 },
            { name: "Milan", lat: 45.4642, lng: 9.1900 },
            { name: "Naples", lat: 40.8518, lng: 14.2681 },
            { name: "Turin", lat: 45.0703, lng: 7.6869 },
            { name: "Florence", lat: 43.7696, lng: 11.2558 },
            { name: "Venice", lat: 45.4408, lng: 12.3155 },
            { name: "Bologna", lat: 44.4949, lng: 11.3426 }
        ]
    },
    {
        name: "Spain",
        code: "ES",
        flag: "🇪🇸",
        continent: "Europe",
        cities: [
            { name: "Madrid", lat: 40.4168, lng: -3.7038 },
            { name: "Barcelona", lat: 41.3851, lng: 2.1734 },
            { name: "Valencia", lat: 39.4699, lng: -0.3763 },
            { name: "Seville", lat: 37.3891, lng: -5.9845 },
            { name: "Zaragoza", lat: 41.6488, lng: -0.8891 },
            { name: "Malaga", lat: 36.7213, lng: -4.4214 }
        ]
    },
    {
        name: "Netherlands",
        code: "NL",
        flag: "🇳🇱",
        continent: "Europe",
        cities: [
            { name: "Amsterdam", lat: 52.3676, lng: 4.9041 },
            { name: "Rotterdam", lat: 51.9244, lng: 4.4777 },
            { name: "The Hague", lat: 52.0705, lng: 4.3007 },
            { name: "Utrecht", lat: 52.0907, lng: 5.1214 },
            { name: "Eindhoven", lat: 51.4416, lng: 5.4697 }
        ]
    },
    {
        name: "Switzerland",
        code: "CH",
        flag: "🇨🇭",
        continent: "Europe",
        cities: [
            { name: "Zurich", lat: 47.3769, lng: 8.5417 },
            { name: "Geneva", lat: 46.2044, lng: 6.1432 },
            { name: "Basel", lat: 47.5596, lng: 7.5886 },
            { name: "Bern", lat: 46.9480, lng: 7.4474 },
            { name: "Lausanne", lat: 46.5197, lng: 6.6323 }
        ]
    },
    {
        name: "Sweden",
        code: "SE",
        flag: "🇸🇪",
        continent: "Europe",
        cities: [
            { name: "Stockholm", lat: 59.3293, lng: 18.0686 },
            { name: "Gothenburg", lat: 57.7089, lng: 11.9746 },
            { name: "Malmo", lat: 55.6050, lng: 13.0038 },
            { name: "Uppsala", lat: 59.8586, lng: 17.6389 }
        ]
    },
    {
        name: "Norway",
        code: "NO",
        flag: "🇳🇴",
        continent: "Europe",
        cities: [
            { name: "Oslo", lat: 59.9139, lng: 10.7522 },
            { name: "Bergen", lat: 60.3913, lng: 5.3221 },
            { name: "Trondheim", lat: 63.4305, lng: 10.3951 }
        ]
    },
    {
        name: "Brazil",
        code: "BR",
        flag: "🇧🇷",
        continent: "South America",
        cities: [
            { name: "Sao Paulo", lat: -23.5505, lng: -46.6333 },
            { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
            { name: "Brasilia", lat: -15.8267, lng: -47.9218 },
            { name: "Salvador", lat: -12.9777, lng: -38.5016 },
            { name: "Belo Horizonte", lat: -19.9167, lng: -43.9345 }
        ]
    },
    {
        name: "Mexico",
        code: "MX",
        flag: "🇲🇽",
        continent: "North America",
        cities: [
            { name: "Mexico City", lat: 19.4326, lng: -99.1332 },
            { name: "Guadalajara", lat: 20.6597, lng: -103.3496 },
            { name: "Monterrey", lat: 25.6866, lng: -100.3161 },
            { name: "Cancun", lat: 21.1619, lng: -86.8515 }
        ]
    },
    {
        name: "South Africa",
        code: "ZA",
        flag: "🇿🇦",
        continent: "Africa",
        cities: [
            { name: "Johannesburg", lat: -26.2041, lng: 28.0473 },
            { name: "Cape Town", lat: -33.9249, lng: 18.4241 },
            { name: "Durban", lat: -29.8587, lng: 31.0218 },
            { name: "Pretoria", lat: -25.7479, lng: 28.2293 }
        ]
    },
    {
        name: "Saudi Arabia",
        code: "SA",
        flag: "🇸🇦",
        continent: "Middle East",
        cities: [
            { name: "Riyadh", lat: 24.7136, lng: 46.6753 },
            { name: "Jeddah", lat: 21.5433, lng: 39.1728 },
            { name: "Mecca", lat: 21.3891, lng: 39.8579 },
            { name: "Medina", lat: 24.5247, lng: 39.5692 }
        ]
    },
    {
        name: "Turkey",
        code: "TR",
        flag: "🇹🇷",
        continent: "Europe/Asia",
        cities: [
            { name: "Istanbul", lat: 41.0082, lng: 28.9784 },
            { name: "Ankara", lat: 39.9334, lng: 32.8597 },
            { name: "Izmir", lat: 38.4237, lng: 27.1428 },
            { name: "Antalya", lat: 36.8969, lng: 30.7133 }
        ]
    },
    {
        name: "New Zealand",
        code: "NZ",
        flag: "🇳🇿",
        continent: "Oceania",
        cities: [
            { name: "Auckland", lat: -36.8485, lng: 174.7633 },
            { name: "Wellington", lat: -41.2865, lng: 174.7762 },
            { name: "Christchurch", lat: -43.5321, lng: 172.6362 }
        ]
    },
    {
        name: "Malaysia",
        code: "MY",
        flag: "🇲🇾",
        continent: "Asia",
        cities: [
            { name: "Kuala Lumpur", lat: 3.1390, lng: 101.6869 },
            { name: "George Town (Penang)", lat: 5.4141, lng: 100.3288 },
            { name: "Johor Bahru", lat: 1.4927, lng: 103.7414 }
        ]
    },
    {
        name: "Thailand",
        code: "TH",
        flag: "🇹🇭",
        continent: "Asia",
        cities: [
            { name: "Bangkok", lat: 13.7563, lng: 100.5018 },
            { name: "Chiang Mai", lat: 18.7883, lng: 98.9853 },
            { name: "Phuket", lat: 7.8804, lng: 98.3923 }
        ]
    },
    {
        name: "Indonesia",
        code: "ID",
        flag: "🇮🇩",
        continent: "Asia",
        cities: [
            { name: "Jakarta", lat: -6.2088, lng: 106.8456 },
            { name: "Surabaya", lat: -7.2575, lng: 112.7521 },
            { name: "Bandung", lat: -6.9175, lng: 107.6191 },
            { name: "Denpasar (Bali)", lat: -8.6705, lng: 115.2126 }
        ]
    },
    {
        name: "Egypt",
        code: "EG",
        flag: "🇪🇬",
        continent: "Africa",
        cities: [
            { name: "Cairo", lat: 30.0444, lng: 31.2357 },
            { name: "Alexandria", lat: 31.2001, lng: 29.9187 },
            { name: "Giza", lat: 30.0131, lng: 31.2089 }
        ]
    },
    {
        name: "Argentina",
        code: "AR",
        flag: "🇦🇷",
        continent: "South America",
        cities: [
            { name: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
            { name: "Cordoba", lat: -31.4201, lng: -64.1888 },
            { name: "Rosario", lat: -32.9442, lng: -60.6505 },
            { name: "Mendoza", lat: -32.8895, lng: -68.8458 }
        ]
    }
];

export interface EVCorridorPreset {
    title: string;
    flag: string;
    country: string;
    startCity: string;
    destCity: string;
    description: string;
}

export const POPULAR_EV_CORRIDORS: EVCorridorPreset[] = [
    {
        title: "Mumbai ⇄ Pune",
        flag: "🇮🇳",
        country: "India",
        startCity: "Mumbai",
        destCity: "Pune",
        description: "Expressway EV Corridor (148 km)"
    },
    {
        title: "Delhi ⇄ Chandigarh",
        flag: "🇮🇳",
        country: "India",
        startCity: "Delhi",
        destCity: "Chandigarh",
        description: "Northern Highway (240 km)"
    },
    {
        title: "San Francisco ⇄ San Jose",
        flag: "🇺🇸",
        country: "United States",
        startCity: "San Francisco, CA",
        destCity: "San Jose, CA",
        description: "Silicon Valley Corridor (80 km)"
    },
    {
        title: "New York ⇄ Boston",
        flag: "🇺🇸",
        country: "United States",
        startCity: "New York, NY",
        destCity: "Boston, MA",
        description: "Northeast I-95 EV Spine (350 km)"
    },
    {
        title: "London ⇄ Manchester",
        flag: "🇬🇧",
        country: "United Kingdom",
        startCity: "London",
        destCity: "Manchester",
        description: "M1 / M6 EV Highway (330 km)"
    },
    {
        title: "Berlin ⇄ Munich",
        flag: "🇩🇪",
        country: "Germany",
        startCity: "Berlin",
        destCity: "Munich",
        description: "Autobahn EV Corridor (585 km)"
    },
    {
        title: "Paris ⇄ Lyon",
        flag: "🇫🇷",
        country: "France",
        startCity: "Paris",
        destCity: "Lyon",
        description: "Autoroute du Soleil (460 km)"
    },
    {
        title: "Tokyo ⇄ Kyoto",
        flag: "🇯🇵",
        country: "Japan",
        startCity: "Tokyo",
        destCity: "Kyoto",
        description: "Tokaido Expressway (450 km)"
    },
    {
        title: "Sydney ⇄ Canberra",
        flag: "🇦🇺",
        country: "Australia",
        startCity: "Sydney",
        destCity: "Canberra",
        description: "Hume Highway Corridor (285 km)"
    },
    {
        title: "Dubai ⇄ Abu Dhabi",
        flag: "🇦🇪",
        country: "United Arab Emirates",
        startCity: "Dubai",
        destCity: "Abu Dhabi",
        description: "Sheikh Zayed EV Superhighway (140 km)"
    }
];

import axios from 'axios';

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchNearby';
const CACHE_KEY = '@web_places_amenities_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const fetchCategory = async (latitude, longitude, types, categoryLabel, limit = 5, radius = 2000) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.warn(`PlacesService Error: VITE_GOOGLE_MAPS_API_KEY is missing.`);
        return [];
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
        return [];
    }

    const requestBody = {
        includedTypes: types,
        maxResultCount: limit,
        locationRestriction: {
            circle: {
                center: { latitude: lat, longitude: lng },
                radius: radius
            }
        }
    };

    try {
        const response = await axios.post(
            PLACES_API_URL,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': 'places.displayName,places.id,places.location,places.businessStatus,places.rating,places.types,places.photos',
                    'X-Android-Package': 'com.bentork.application',
                    'X-Android-Cert': '5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25',
                }
            }
        );

        if (response.data && response.data.places) {
            return response.data.places.map((place) => {
                let photoUrl = null;
                if (place.photos && place.photos.length > 0) {
                    const photoName = place.photos[0].name;
                    photoUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxWidthPx=400`;
                }

                return {
                    id: place.id,
                    name: place.displayName?.text || 'Unknown Place',
                    rating: place.rating || 0,
                    geometry: {
                        location: {
                            lat: place.location?.latitude,
                            lng: place.location?.longitude,
                        }
                    },
                    type: categoryLabel,
                    isOpen: place.businessStatus === 'OPERATIONAL',
                    photoUrl: photoUrl
                };
            });
        }
        return [];
    } catch (error) {
        console.error(`PlacesService Error (${categoryLabel}):`, error.message);
        return [];
    }
};

const PlacesService = {
    fetchNearbyAmenities: async (latitude, longitude) => {
        try {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                console.warn('PlacesService: Google Maps API Key missing.');
                return [];
            }

            try {
                const cachedDataStr = localStorage.getItem(CACHE_KEY);
                if (cachedDataStr) {
                    const cachedData = JSON.parse(cachedDataStr);
                    const now = Date.now();
                    if (now - cachedData.timestamp < CACHE_EXPIRY_MS) {
                        const distance = calculateDistance(latitude, longitude, cachedData.latitude, cachedData.longitude);
                        if (distance <= 2) {
                            return cachedData.amenities;
                        }
                    }
                }
            } catch (err) {}

            const [cafes, restaurants, malls] = await Promise.all([
                fetchCategory(latitude, longitude, ['cafe', 'coffee_shop'], 'Cafe'),
                fetchCategory(latitude, longitude, ['restaurant'], 'Restaurant'),
                fetchCategory(latitude, longitude, ['shopping_mall'], 'Shopping mall'),
            ]);

            const allAmenities = [...cafes, ...restaurants, ...malls];
            let uniqueAmenities = Array.from(new Map(allAmenities.map(item => [item.id, item])).values());

            // Sort by highest rating descending
            uniqueAmenities.sort((a, b) => (b.rating || 0) - (a.rating || 0));

            try {
                const cacheObject = {
                    timestamp: Date.now(),
                    latitude,
                    longitude,
                    amenities: uniqueAmenities
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
            } catch (err) {}

            return uniqueAmenities;

        } catch (error) {
            return [];
        }
    },
};

export default PlacesService;

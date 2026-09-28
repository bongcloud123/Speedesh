import Constants from 'expo-constants';

const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey || '';
const NEARBY_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

export interface PlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  business_status?: string;
}

export interface NearbySearchResponse {
  results: PlaceResult[];
  status: string;
  error_message?: string;
}

export const nearbySearch = async (
  latitude: number,
  longitude: number,
  radiusMeters: number,
  type: string
): Promise<PlaceResult[]> => {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('Google Places API key not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      location: `${latitude},${longitude}`,
      radius: radiusMeters.toString(),
      type: type,
      key: GOOGLE_PLACES_API_KEY,
    });

    const url = `${NEARBY_SEARCH_URL}?${params.toString()}`;

    const response = await fetch(url);
    const data: NearbySearchResponse = await response.json();

    if (data.status !== 'OK') {
      console.warn(`Places API error: ${data.status}`, data.error_message);
      return [];
    }

    return data.results || [];
  } catch (error) {
    console.error('Error calling Google Places API:', error);
    return [];
  }
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceResult | null> => {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('Google Places API key not configured');
    return null;
  }

  try {
    const params = new URLSearchParams({
      place_id: placeId,
      key: GOOGLE_PLACES_API_KEY,
    });

    const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.warn(`Places API error: ${data.status}`);
      return null;
    }

    return data.result || null;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};

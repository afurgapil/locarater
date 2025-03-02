import axios from "axios";

interface GeocodeResult {
  coordinates: [number, number] | null;
  error?: string;
}

export async function getCoordinates(
  city: string,
  district: string
): Promise<GeocodeResult> {
  try {
    // Şimdilik mock data dönelim, daha sonra gerçek API'ye bağlanacağız
    // Bu koordinatlar İstanbul için örnek koordinatlar
    const mockCoordinates: Record<string, [number, number]> = {
      kadikoy: [29.0633, 40.9909],
      besiktas: [29.0097, 41.0421],
      sisli: [28.9876, 41.0566],
      uskudar: [29.0158, 41.0235],
      // Daha fazla ilçe eklenebilir
    };

    const normalizedDistrict = district
      .toLowerCase()
      .replace(/[ğ]/g, "g")
      .replace(/[ü]/g, "u")
      .replace(/[ş]/g, "s")
      .replace(/[ı]/g, "i")
      .replace(/[ö]/g, "o")
      .replace(/[ç]/g, "c");

    return {
      coordinates: mockCoordinates[normalizedDistrict] || [29.0, 41.0], // Default İstanbul koordinatları
    };

    /* Gerçek API implementasyonu için:
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${district},${city},Turkey&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        coordinates: [location.lng, location.lat]
      };
    }
    */
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      coordinates: null,
      error: "Koordinatlar alınamadı",
    };
  }
}

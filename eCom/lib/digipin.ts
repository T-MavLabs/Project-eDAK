// eCom/lib/digipin.ts
// DIGIPIN fetching utility using the provided API

const DIGIPIN_API_BASE = "https://my-digipin.onrender.com";

export interface DigipinEncodeRequest {
  latitude: number;
  longitude: number;
}

export interface DigipinEncodeResponse {
  digipin: string;
  error?: string;
  message?: string;
}

export interface DigipinDecodeRequest {
  digipin: string;
}

export interface DigipinDecodeResponse {
  latitude: number;
  longitude: number;
  error?: string;
  message?: string;
}

/**
 * Fetch DIGIPIN by coordinates (internal function)
 * Uses /digipin/encode endpoint
 */
async function fetchDigipinByCoordinates(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const payload = {
    latitude,
    longitude,
  };
  
  // Try different endpoint variations
  const endpoints = [
    `${DIGIPIN_API_BASE}/digipin/encode`,
    `${DIGIPIN_API_BASE}/encode`,
    `${DIGIPIN_API_BASE}/api/digipin/encode`,
  ];
  
  let lastError: Error | null = null;
  
  for (let i = 0; i < endpoints.length; i++) {
    const url = endpoints[i];
    const isLastEndpoint = i === endpoints.length - 1;
    
    try {
      console.log("Trying DIGIPIN encode endpoint:", url, "with payload:", payload);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data: DigipinEncodeResponse = await response.json();
        console.log("DIGIPIN API response:", data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (!data.digipin) {
          throw new Error("DIGIPIN not returned from API");
        }
        
        return data.digipin;
      } else {
        // If 404 and not last endpoint, try next; otherwise throw
        if (response.status === 404 && !isLastEndpoint) {
          console.warn(`Endpoint ${url} returned 404, trying next...`);
          let errorText = "Unknown error";
          try {
            errorText = await response.text();
          } catch {
            // Ignore if we can't read error text
          }
          lastError = new Error(`API error: ${response.status} ${response.statusText}. ${errorText}`);
          continue;
        }
        
        // For non-404 errors or last endpoint, throw immediately
        let errorText = "Unknown error";
        try {
          errorText = await response.text();
        } catch {
          // Ignore if we can't read error text
        }
        throw new Error(`API error: ${response.status} ${response.statusText}. ${errorText}`);
      }
    } catch (error) {
      // If it's the last endpoint or not a 404, throw
      const is404Error = error instanceof Error && error.message.includes("404");
      if (isLastEndpoint || !is404Error) {
        console.error("Error encoding DIGIPIN:", error);
        throw error;
      }
      // Store error and try next endpoint
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  
  // If all endpoints failed
  throw lastError || new Error("All DIGIPIN encode endpoints failed. Please check the API endpoint configuration.");
}

/**
 * Geocode address to get latitude/longitude using a free geocoding service
 * Tries multiple query formats for better results
 */
async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  pincode: string
): Promise<{ latitude: number; longitude: number }> {
  // Try multiple query formats for better geocoding results
  const queries = [
    `${address}, ${city}, ${state} ${pincode}, India`, // Full address
    `${city}, ${state} ${pincode}, India`, // City + state + pincode
    `${pincode}, ${state}, India`, // Pincode + state
    `${city}, ${state}, India`, // City + state
  ];
  
  let lastError: Error | null = null;
  
  for (const query of queries) {
    try {
      const encodedQuery = encodeURIComponent(query);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&countrycodes=in`,
        {
          headers: {
            "User-Agent": "VYAPAR-DIGIPIN-Service", // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        if (queries.indexOf(query) < queries.length - 1) {
          continue; // Try next query format
        }
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        console.log(`Geocoding successful for query: "${query}"`);
        return {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        };
      }
      
      // If no results and not last query, try next
      if (queries.indexOf(query) < queries.length - 1) {
        console.warn(`No geocoding results for: "${query}", trying next format...`);
        continue;
      }
      
      throw new Error("Could not find location for the provided address");
    } catch (error) {
      // If it's the last query, throw; otherwise continue
      if (queries.indexOf(query) === queries.length - 1) {
        lastError = error instanceof Error ? error : new Error(String(error));
        break;
      }
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  
  // If all queries failed, throw with helpful message
  throw new Error(
    `Could not geocode the address "${address}, ${city}, ${state} ${pincode}". ` +
    `Please verify the address details are correct, or use the location-based fetch instead.`
  );
}

/**
 * Fetch DIGIPIN by address details (geocodes address first, then encodes)
 */
export async function fetchDigipinByAddress(
  address: string,
  city: string,
  state: string,
  pincode: string
): Promise<string | null> {
  try {
    // First, geocode the address to get coordinates
    const { latitude, longitude } = await geocodeAddress(address, city, state, pincode);
    
    console.log(`Geocoded address to coordinates: ${latitude}, ${longitude}`);
    
    // Then encode the coordinates to DIGIPIN using the encode endpoint
    return await fetchDigipinByCoordinates(latitude, longitude);
  } catch (error) {
    console.error("Error fetching DIGIPIN by address:", error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes("Could not geocode")) {
        throw new Error(
          `Unable to find the location for "${address}, ${city}, ${state} ${pincode}". ` +
          `Please verify:\n` +
          `• Address is correct and complete\n` +
          `• City and state names are spelled correctly\n` +
          `• PIN code is valid (6 digits)\n\n` +
          `Alternatively, use the location-based fetch button.`
        );
      }
      throw error;
    }
    throw new Error("Failed to fetch DIGIPIN from address. Please try again or use location-based fetch.");
  }
}

/**
 * Fetch DIGIPIN by device location (geolocation)
 */
export async function fetchDigipinByLocation(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser. Please use the address-based fetch instead."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const digipin = await fetchDigipinByCoordinates(latitude, longitude);
          resolve(digipin);
        } catch (error) {
          console.error("Error fetching DIGIPIN by location:", error);
          reject(error);
        }
      },
      (error: GeolocationPositionError) => {
        // Log error details for debugging (safely handle empty objects)
        const errorDetails = {
          code: error?.code,
          message: error?.message || "Unknown geolocation error",
          PERMISSION_DENIED: error?.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error?.POSITION_UNAVAILABLE,
          TIMEOUT: error?.TIMEOUT,
        };
        console.warn("Geolocation error:", errorDetails);
        
        let errorMessage = "Unable to get your location";
        
        // Handle error codes (using numeric values as fallback)
        const errorCode = error?.code;
        
        if (errorCode === 1 || errorCode === error?.PERMISSION_DENIED) {
          errorMessage = "Location access denied. Please allow location access in your browser settings, or use the address-based fetch instead.";
        } else if (errorCode === 2 || errorCode === error?.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable. This may be due to:\n" +
            "• Location services disabled on your device\n" +
            "• Poor GPS signal\n" +
            "• Network issues\n\n" +
            "Please try the address-based fetch instead, or enable location services and try again.";
        } else if (errorCode === 3 || errorCode === error?.TIMEOUT) {
          errorMessage = "Location request timed out. Please try again or use the address-based fetch instead.";
        } else {
          // Fallback to message if available, otherwise generic message
          const errorMsg = error?.message;
          errorMessage = errorMsg && errorMsg.trim() 
            ? `Location error: ${errorMsg}. Please use the address-based fetch instead.`
            : "Unable to get your location. Please use the address-based fetch instead.";
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 60000, // Accept cached position up to 1 minute old
      }
    );
  });
}

/**
 * Decode DIGIPIN to get latitude/longitude
 */
export async function decodeDigipin(digipin: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const url = `${DIGIPIN_API_BASE}/digipin/decode`;
    const payload = { digipin };
    
    console.log("Decoding DIGIPIN from:", url, "with payload:", payload);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorText = "Unknown error";
      try {
        errorText = await response.text();
      } catch {
        // Ignore if we can't read error text
      }
      console.error(`DIGIPIN decode API error (${response.status}):`, {
        status: response.status,
        statusText: response.statusText,
        url,
        errorText,
      });
      throw new Error(`API error: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data: DigipinDecodeResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (data.latitude === undefined || data.longitude === undefined) {
      throw new Error("Coordinates not returned from API");
    }
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.error("Error decoding DIGIPIN:", error);
    throw error;
  }
}

/**
 * Auto-fetch DIGIPIN using available address information
 * Falls back to location if address is incomplete
 */
export async function autoFetchDigipin(
  address?: string,
  city?: string,
  state?: string,
  pincode?: string,
  useLocation: boolean = false
): Promise<string | null> {
  // If useLocation is true, try location first
  if (useLocation) {
    try {
      return await fetchDigipinByLocation();
    } catch (error) {
      console.warn("Location-based DIGIPIN fetch failed, trying address:", error);
    }
  }

  // Try address-based fetch if we have enough info
  if (address && city && state && pincode) {
    try {
      return await fetchDigipinByAddress(address, city, state, pincode);
    } catch (error) {
      console.warn("Address-based DIGIPIN fetch failed:", error);
    }
  }

  // If address is incomplete but we have pincode, try with minimal info
  if (pincode && city && state) {
    try {
      return await fetchDigipinByAddress(
        address || `${city}, ${state}`,
        city,
        state,
        pincode
      );
    } catch (error) {
      console.warn("Minimal address DIGIPIN fetch failed:", error);
    }
  }

  // Last resort: try location if not already tried
  if (!useLocation) {
    try {
      return await fetchDigipinByLocation();
    } catch (error) {
      console.warn("Location fallback failed:", error);
    }
  }

  return null;
}

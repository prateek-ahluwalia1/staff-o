/**
 * Australian Metro vs Regional Location Classifier for Staffoo
 * 
 * Determines whether an Australian job location is 'metro' or 'regional'
 * based on official Australian Capital City Metropolitan (GCCSA) and
 * Australia Post / Service Industry standard classification datasets.
 */

// Bounding box for Australia (Mainland, Tasmania, and internal territories)
export const AUSTRALIA_BOUNDS = {
  minLat: -44.0,
  maxLat: -9.0,
  minLng: 112.0,
  maxLng: 154.5,
};

/**
 * Validates whether coordinates are valid numbers and inside Australia.
 * 
 * @param {string|{lat: number, lng: number}} coordinates - e.g. "-27.415003,153.0121998"
 * @returns {{ isValid: boolean, lat?: number, lng?: number, error?: string }}
 */
export function validateCoordinates(coordinates) {
  if (!coordinates) {
    return { isValid: false, error: "Missing location coordinates." };
  }

  let lat, lng;
  if (typeof coordinates === "string") {
    const parts = coordinates.split(",").map((p) => p.trim());
    if (parts.length !== 2) {
      return { isValid: false, error: "Invalid coordinates format. Expected 'lat,lng'." };
    }
    lat = Number(parts[0]);
    lng = Number(parts[1]);
  } else if (typeof coordinates === "object" && coordinates !== null) {
    lat = Number(coordinates.lat ?? coordinates.latitude);
    lng = Number(coordinates.lng ?? coordinates.longitude);
  }

  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
    return { isValid: false, error: "Coordinates must be valid numeric values." };
  }

  if (
    lat < AUSTRALIA_BOUNDS.minLat ||
    lat > AUSTRALIA_BOUNDS.maxLat ||
    lng < AUSTRALIA_BOUNDS.minLng ||
    lng > AUSTRALIA_BOUNDS.maxLng
  ) {
    return {
      isValid: false,
      error: `Coordinates (${lat}, ${lng}) are outside Australia. Only Australian job locations are supported.`,
      lat,
      lng,
      outsideAustralia: true,
    };
  }

  return { isValid: true, lat, lng };
}

/**
 * Classifies an Australian postcode as 'metro' or 'regional'.
 * 
 * @param {string|number} rawPostcode
 * @returns {{ isValid: boolean, region?: 'metro'|'regional', state?: string, postcode?: string, error?: string }}
 */
export function classifyPostcode(rawPostcode) {
  if (!rawPostcode) {
    return { isValid: false, error: "Missing Australian postcode." };
  }

  const clean = String(rawPostcode).replace(/\D/g, "");
  if (!clean || clean.length < 3 || clean.length > 4) {
    return { isValid: false, error: `Invalid Australian postcode format: '${rawPostcode}'.` };
  }

  // Australian postcodes are 4 digits (e.g. 0800 for NT, 2000 for NSW, 4053 for QLD)
  const postcode = clean.padStart(4, "0");
  const num = parseInt(postcode, 10);

  // 1. ACT (0200-0299, 2600-2618, 2900-2920)
  if ((num >= 200 && num <= 299) || (num >= 2600 && num <= 2618) || (num >= 2900 && num <= 2920)) {
    return { isValid: true, region: "metro", state: "act", postcode };
  }

  // 2. NT (0800-0999)
  if (num >= 800 && num <= 999) {
    // Greater Darwin: 0800-0832, 0900-0999
    if ((num >= 800 && num <= 832) || (num >= 900 && num <= 999)) {
      return { isValid: true, region: "metro", state: "nt", postcode };
    }
    // Regional NT (Alice Springs 0870, Katherine 0850, etc.)
    return { isValid: true, region: "regional", state: "nt", postcode };
  }

  // 3. NSW (1000-2599, 2620-2899, 2921-2999)
  if (
    (num >= 1000 && num <= 2599) ||
    (num >= 2620 && num <= 2899) ||
    (num >= 2921 && num <= 2999)
  ) {
    // Sydney Metro ranges:
    // 1000-1999: Sydney CBD / PO Boxes / Delivery centers
    // 2000-2234: Sydney Metropolitan core, Eastern, Inner West, Northern Beaches, Hills, St George, Sutherland
    // 2555-2567: Campbelltown / Camden / Macarthur (Outer Sydney Metro)
    // 2740-2774: Western Sydney, Penrith, Blacktown, Windsor, Richmond, Blue Mountains lower
    // 2776-2777: Faulconbridge, Winmalee / Springwood lower
    // 2890-2897: Sydney special
    const isSydneyMetro =
      (num >= 1000 && num <= 2234) ||
      (num >= 2555 && num <= 2567) ||
      (num >= 2740 && num <= 2774) ||
      (num >= 2776 && num <= 2777) ||
      (num >= 2890 && num <= 2897);

    return {
      isValid: true,
      region: isSydneyMetro ? "metro" : "regional",
      state: "nsw",
      postcode,
    };
  }

  // 4. VIC (3000-3999, 8000-8999)
  if ((num >= 3000 && num <= 3999) || (num >= 8000 && num <= 8999)) {
    // Greater Melbourne Metro ranges:
    // 3000-3210: Melbourne CBD, Inner, North, West, East, South East, Frankston
    // 3335-3338: Melton, Rockbank (Melbourne West growth corridor)
    // 3750-3777: South Morang, Mernda, Whittlesea, Lilydale
    // 3800-3810: Monash University, Clayton, Dandenong, Berwick, Pakenham
    // 3910-3920: Mornington inner
    // 3975-3978: Cranbourne, Clyde
    // 8000-8999: Melbourne GPO / Business delivery
    const isMelbourneMetro =
      (num >= 3000 && num <= 3210) ||
      (num >= 3335 && num <= 3338) ||
      (num >= 3750 && num <= 3777) ||
      (num >= 3800 && num <= 3810) ||
      (num >= 3910 && num <= 3920) ||
      (num >= 3975 && num <= 3978) ||
      (num >= 8000 && num <= 8999);

    return {
      isValid: true,
      region: isMelbourneMetro ? "metro" : "regional",
      state: "vic",
      postcode,
    };
  }

  // 5. QLD (4000-4999, 9000-9999)
  if ((num >= 4000 && num <= 4999) || (num >= 9000 && num <= 9999)) {
    // Greater Brisbane / South East QLD Metro ranges:
    // 4000-4209: Brisbane City, North, South, East, West (e.g. Stafford 4053), Logan, Redland
    // 4300-4305: Ipswich Metro area (Springfield, Goodna, Ipswich)
    // 4500-4511: Moreton Bay North (Strathpine, Caboolture)
    // 9000-9299, 9999: Brisbane GPO / Special
    const isBrisbaneMetro =
      (num >= 4000 && num <= 4209) ||
      (num >= 4300 && num <= 4305) ||
      (num >= 4500 && num <= 4511) ||
      (num >= 9000 && num <= 9299) ||
      num === 9999;

    return {
      isValid: true,
      region: isBrisbaneMetro ? "metro" : "regional",
      state: "qld",
      postcode,
    };
  }

  // 6. SA (5000-5999)
  if (num >= 5000 && num <= 5999) {
    // Greater Adelaide Metro:
    // 5000-5199: Adelaide CBD, North, South, East, West, Gawler, Salisbury, Noarlunga
    // 5800-5999: Adelaide GPO / Special
    const isAdelaideMetro = (num >= 5000 && num <= 5199) || (num >= 5800 && num <= 5999);

    return {
      isValid: true,
      region: isAdelaideMetro ? "metro" : "regional",
      state: "sa",
      postcode,
    };
  }

  // 7. WA (6000-6999)
  if (num >= 6000 && num <= 6999) {
    // Greater Perth Metro:
    // 6000-6038: Perth CBD, North, Joondalup
    // 6050-6084: Perth East, Midland
    // 6090-6182: Perth South, Fremantle, Rockingham, Armadale
    // 6208-6214: Mandurah / Peel Metro extension
    // 6800-6999: Perth GPO / Special
    const isPerthMetro =
      (num >= 6000 && num <= 6038) ||
      (num >= 6050 && num <= 6084) ||
      (num >= 6090 && num <= 6182) ||
      (num >= 6208 && num <= 6214) ||
      (num >= 6800 && num <= 6999);

    return {
      isValid: true,
      region: isPerthMetro ? "metro" : "regional",
      state: "wa",
      postcode,
    };
  }

  // 8. TAS (7000-7999)
  if (num >= 7000 && num <= 7999) {
    // Greater Hobart Metro: 7000-7099
    // Regional TAS: 7100-7999 (Launceston 7250, Devonport 7310, etc.)
    const isHobartMetro = num >= 7000 && num <= 7099;

    return {
      isValid: true,
      region: isHobartMetro ? "metro" : "regional",
      state: "tas",
      postcode,
    };
  }

  return {
    isValid: false,
    error: `Postcode '${postcode}' is not recognized as a valid Australian postcode.`,
  };
}

/**
 * Extracts a 4-digit Australian postcode from an address string.
 * 
 * @param {string} address - e.g. "Qld National Ballet School, 57 Hayward St, Stafford QLD 4053, Australia"
 * @returns {string|null}
 */
export function extractPostcodeFromAddress(address) {
  if (!address || typeof address !== "string") return null;

  // 1. Matches Australian state abbreviation followed by 4 digits, e.g. "QLD 4053", "NSW 2000"
  const stateMatch = address.match(/\b(?:NSW|VIC|QLD|SA|WA|TAS|ACT|NT)\s*([0-9]{4})\b/i);
  if (stateMatch && stateMatch[1]) {
    return stateMatch[1];
  }

  // 2. Matches "4053, Australia" or "4053 Australia"
  const ausMatch = address.match(/\b([0-9]{4})\s*,?\s*Australia\b/i);
  if (ausMatch && ausMatch[1]) {
    return ausMatch[1];
  }

  // 3. Scan for any 4-digit number that corresponds to a valid Australian postcode
  const allFourDigits = address.match(/\b([0-9]{4})\b/g);
  if (allFourDigits && allFourDigits.length > 0) {
    // Check backwards from the end of the address
    for (let i = allFourDigits.length - 1; i >= 0; i--) {
      const candidate = allFourDigits[i];
      const classification = classifyPostcode(candidate);
      if (classification.isValid) {
        return candidate;
      }
    }
  }

  return null;
}

export async function reverseGeocodeLocation(lat, lng) {
  if (typeof window !== "undefined" && window.google?.maps?.Geocoder) {
    return new Promise((resolve) => {
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && Array.isArray(results) && results.length > 0) {
            let postcode = null;
            let state = null;
            for (const result of results) {
              const components = result.address_components || [];
              for (const comp of components) {
                if (!postcode && comp.types && comp.types.includes("postal_code")) {
                  postcode = comp.long_name;
                }
                if (!state && comp.types && comp.types.includes("administrative_area_level_1")) {
                  state = comp.short_name ? comp.short_name.toLowerCase() : null;
                }
              }
            }
            resolve({ postcode, state });
          } else {
            resolve({ postcode: null, state: null });
          }
        });
      } catch (err) {
        console.warn("Google Maps reverse geocoding error:", err);
        resolve({ postcode: null, state: null });
      }
    });
  }

  return { postcode: null, state: null };
}

/**
 * Reverse geocodes coordinates to retrieve the Australian postal code.
 * Reuses window.google.maps.Geocoder if present in the browser.
 * 
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string|null>}
 */
export async function reverseGeocodePostcode(lat, lng) {
  const geo = await reverseGeocodeLocation(lat, lng);
  return geo?.postcode || null;
}

/**
 * Main coordinator: Automatically determines whether an Australian job location is 'metro' or 'regional'.
 * 
 * @param {Object} locationData
 * @param {string|{lat: number, lng: number}} locationData.coordinates - e.g. "-27.415003,153.0121998"
 * @param {string} [locationData.postcode] - e.g. "4053"
 * @param {string} [locationData.address] - e.g. "57 Hayward St, Stafford QLD 4053, Australia"
 * 
 * @returns {Promise<{ success: boolean, region: 'metro'|'regional'|null, postcode: string|null, state: string|null, error?: string }>}
 */
export async function determineJobRegion({ coordinates, postcode, address } = {}) {
  // 1. Validate coordinates
  const coordRes = validateCoordinates(coordinates);
  if (!coordRes.isValid) {
    return {
      success: false,
      region: null,
      error: coordRes.error || "Please select a valid location in Australia.",
    };
  }

  // 2. Identify postcode: check address string first if present, then passed postcode
  let targetPostcode = null;
  if (address) {
    targetPostcode = extractPostcodeFromAddress(address);
  }
  if (!targetPostcode && postcode) {
    targetPostcode = String(postcode).trim();
  }

  // 3. If postcode not found, attempt reverse-geocoding via coordinates
  let geoState = null;
  if (!targetPostcode && coordRes.lat !== undefined && coordRes.lng !== undefined) {
    try {
      const geo = await reverseGeocodeLocation(coordRes.lat, coordRes.lng);
      if (geo?.postcode) {
        targetPostcode = geo.postcode;
      }
      if (geo?.state) {
        geoState = geo.state;
      }
    } catch (e) {
      console.warn("Reverse geocode attempt failed:", e);
    }
  }

  // 4. Classify postcode
  if (targetPostcode) {
    const classification = classifyPostcode(targetPostcode);
    if (classification.isValid && classification.region) {
      return {
        success: true,
        region: classification.region,
        postcode: classification.postcode,
        state: classification.state || geoState,
      };
    }
    return {
      success: false,
      region: null,
      error: classification.error || `Unable to classify Australian postcode '${targetPostcode}'.`,
    };
  }

  // 5. Fallback: classify based on coordinates proximity to Australian capital cities
  if (coordRes.lat !== undefined && coordRes.lng !== undefined) {
    const metroCapitals = [
      { name: "Sydney", lat: -33.8688, lng: 151.2093, radiusKm: 60, state: "nsw" },
      { name: "Melbourne", lat: -37.8136, lng: 144.9631, radiusKm: 60, state: "vic" },
      { name: "Brisbane", lat: -27.4698, lng: 153.0251, radiusKm: 55, state: "qld" },
      { name: "Perth", lat: -31.9505, lng: 115.8605, radiusKm: 55, state: "wa" },
      { name: "Adelaide", lat: -34.9285, lng: 138.6007, radiusKm: 50, state: "sa" },
      { name: "Canberra", lat: -35.2809, lng: 149.1300, radiusKm: 40, state: "act" },
      { name: "Hobart", lat: -42.8821, lng: 147.3272, radiusKm: 30, state: "tas" },
      { name: "Darwin", lat: -12.4634, lng: 130.8456, radiusKm: 30, state: "nt" },
    ];

    const haversineKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let nearest = null;
    let minDistance = Infinity;
    for (const cap of metroCapitals) {
      const d = haversineKm(coordRes.lat, coordRes.lng, cap.lat, cap.lng);
      if (d < minDistance) {
        minDistance = d;
        nearest = cap;
      }
    }

    if (nearest && minDistance <= nearest.radiusKm) {
      return {
        success: true,
        region: "metro",
        postcode: null,
        state: nearest.state,
      };
    } else {
      return {
        success: true,
        region: "regional",
        postcode: null,
        state: nearest ? nearest.state : null,
      };
    }
  }

  // 6. If postcode could not be found or classified:
  return {
    success: false,
    region: null,
    error: "Unable to determine the Australian postcode for this location. Please ensure the location has a valid Australian address and coordinates.",
  };
}

export default determineJobRegion;

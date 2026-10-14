import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  classifyPostcode,
  extractPostcodeFromAddress,
  determineJobRegion,
} from "../../utils/australianRegionClassifier";

const STATE_MAP = {
  'Victoria': 'vic',
  'New South Wales': 'nsw',
  'Queensland': 'qld',
  'Tasmania': 'tas',
  'Western Australia': 'wa',
  'South Australia': 'sa',
  'Australian Capital Territory': 'act',
  'ACT': 'act',
  'Northern Territory': 'nt'
};

export default function LocationStep({
  form = {},
  setField,
  resolvingLocation,
  setResolvingLocation,
  locationError,
  setLocationError
}) {
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const selectingPlaceRef = useRef(false);
  const autocompleteRef = useRef(null);
  const [map, setMap] = useState(null);
  const [googleReady, setGoogleReady] = useState(false);

  const fillAddress = useCallback(
    async (place, options = {}) => {
      let block = "", area = "", city = "", state = "", postcode = "";

      place.address_components?.forEach((component) => {
        const types = component.types || [];
        if (types.includes("sublocality_level_1")) block = component.long_name;
        if (types.includes("sublocality")) area = component.long_name;
        if (types.includes("locality")) city = component.long_name;

        // Intercept the state and map it to the short form
        if (types.includes("administrative_area_level_1")) {
          state = STATE_MAP[component.long_name] || component.short_name.toLowerCase();
        }

        if (types.includes("postal_code")) postcode = component.long_name;
      });

      if (!postcode && options.fallbackPostcode) {
        postcode = options.fallbackPostcode;
      }
      if (!state && options.fallbackState) {
        state = options.fallbackState;
      }

      const finalAddress = [block, area, city, state, postcode].filter(Boolean).join(", ");
      const canonicalAddress = finalAddress || place.formatted_address || "";
      const placeLabel = place.name ? `${place.name}${place.formatted_address ? `, ${place.formatted_address}` : ""}` : canonicalAddress;

      // Extract postcode from address strings if still missing
      if (!postcode) {
        postcode = extractPostcodeFromAddress(canonicalAddress) ||
                   extractPostcodeFromAddress(place.formatted_address || "") ||
                   extractPostcodeFromAddress(place.name || "") || "";
      }

      // Extract state if still missing
      if (!state && canonicalAddress) {
        const match = canonicalAddress.match(/\b(vic|nsw|qld|tas|wa|sa|act|nt)\b/i);
        if (match) state = match[1].toLowerCase();
      }

      const coords = options.coordinates || (place.geometry?.location ? `${place.geometry.location.lat()},${place.geometry.location.lng()}` : "");

      // Determine region
      let region = "";
      if (postcode) {
        const classification = classifyPostcode(postcode);
        if (classification.isValid && classification.region) {
          region = classification.region;
          if (!state && classification.state) state = classification.state;
        }
      }

      // If region still not determined and coords available, resolve via determineJobRegion
      if (!region && coords) {
        try {
          const detRes = await determineJobRegion({
            coordinates: coords,
            postcode,
            address: canonicalAddress,
          });
          if (detRes.success && detRes.region) {
            region = detRes.region;
            if (!postcode && detRes.postcode) postcode = detRes.postcode;
            if (!state && detRes.state) state = detRes.state;
          }
        } catch {
          // ignore
        }
      }

      setField({
        location: options.preferPlaceLabel ? placeLabel : canonicalAddress,
        address: canonicalAddress,
        city: city || "",
        state: state || "",
        postcode: postcode || "",
        region: region || "",
        ...(coords ? { coordinates: coords } : {}),
      });

      if (setLocationError) setLocationError("");
    },
    [setField, setLocationError]
  );

  const reverseGeocode = useCallback(
    (lat, lng) => {
      if (!window.google?.maps?.Geocoder) return;
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          let foundPostcode = "";
          let foundState = "";

          for (const res of results) {
            for (const comp of res.address_components || []) {
              if (comp.types.includes("postal_code") && !foundPostcode) {
                foundPostcode = comp.long_name;
              }
              if (comp.types.includes("administrative_area_level_1") && !foundState) {
                foundState = STATE_MAP[comp.long_name] || comp.short_name.toLowerCase();
              }
            }
          }

          fillAddress(results[0], {
            preferPlaceLabel: false,
            fallbackPostcode: foundPostcode,
            fallbackState: foundState,
            coordinates: `${lat},${lng}`,
          });
        }
      });
    },
    [fillAddress]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.maps) {
        clearInterval(interval);
        setGoogleReady(true);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!googleReady || !mapRef.current || map) return;

    const initialLatLng = form?.coordinates ? form.coordinates.split(",").map(Number) : [51.4924955, -0.1486599];

    const gmap = new window.google.maps.Map(mapRef.current, {
      center: { lat: initialLatLng[0], lng: initialLatLng[1] },
      zoom: 15,
      disableDefaultUI: window.innerWidth < 768,
      zoomControl: true,
    });

    const marker = new window.google.maps.Marker({
      position: { lat: initialLatLng[0], lng: initialLatLng[1] },
      map: gmap,
      draggable: true,
    });

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      const lat = pos.lat();
      const lng = pos.lng();
      reverseGeocode(lat, lng);
    });

    setMap(gmap);
    markerRef.current = marker;
  }, [googleReady, map, form?.coordinates, reverseGeocode]);

  useEffect(() => {
    if (!map || !markerRef.current || !form?.coordinates) return;
    try {
      const parts = form.coordinates.split(",");
      if (parts.length === 2) {
        const lat = Number(parts[0].trim());
        const lng = Number(parts[1].trim());

        if (!isNaN(lat) && !isNaN(lng)) {
          const newPos = { lat, lng };
          markerRef.current.setPosition(newPos);
          map.setCenter(newPos);
          map.setZoom(15);
        }
      }
    } catch (err) {
      console.warn("Could not sync map to coordinates:", err);
    }
  }, [form?.coordinates, map]);

  useEffect(() => {
    if (!googleReady || !inputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "au" },
      fields: ["name", "address_components", "geometry", "formatted_address"],
    });

    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();
      if (!place.geometry) return;

      selectingPlaceRef.current = true;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      fillAddress(place, { preferPlaceLabel: true, coordinates: `${lat},${lng}` });

      if (markerRef.current) markerRef.current.setPosition({ lat, lng });
      if (map) map.setCenter({ lat, lng });

      setTimeout(() => { selectingPlaceRef.current = false; }, 0);
    });

    return () => {
      if (listener && typeof listener.remove === "function") listener.remove();
      autocompleteRef.current = null;
    };
  }, [googleReady, map, fillAddress]);

  const handleUseCurrent = () => {
    if (!navigator.geolocation) return toast.error("Geolocation is not supported by your browser.");
    setResolvingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        reverseGeocode(lat, lng);
        if (markerRef.current) markerRef.current.setPosition({ lat, lng });
        if (map) map.setCenter({ lat, lng });
        setResolvingLocation(false);
      },
      (err) => {
        setResolvingLocation(false);
        toast.error("Location error: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const isConfirmed = Boolean(form?.coordinates) && !locationError;

  return (
    <div className="mb-2">
      <style>{`
        .jw-loc-search {
          border-radius: 999px !important;
          border: 1.5px solid var(--jw-line, #e2e8f0) !important;
          overflow: hidden;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .jw-loc-search:focus-within {
          border-color: var(--jw-teal, #0A7C6E) !important;
          box-shadow: 0 0 0 4px rgba(10,124,110,0.1) !important;
        }
        .jw-loc-search.has-error { border-color: #dc2626 !important; }
        .jw-gps-btn {
          background: var(--jw-navy-950, #0a1930) !important;
          border-color: var(--jw-navy-950, #0a1930) !important;
          box-shadow: 0 6px 14px -4px rgba(10,25,48,0.4);
        }
        .jw-gps-btn:hover { background: var(--jw-navy-900, #0e2340) !important; }
        .jw-map-wrap { position: relative; border-radius: 20px; overflow: hidden; border: 1px solid var(--jw-line, #e2e8f0); }
        .jw-map-wrap.has-error { border-color: #dc2626 !important; }
        .jw-map-overlay {
          position: absolute; left: 14px; right: 14px; bottom: 14px; z-index: 2;
          background: rgba(10, 25, 48, 0.88); backdrop-filter: blur(6px);
          border-radius: 14px; padding: 12px 16px; color: #fff;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 10px 24px -8px rgba(0,0,0,0.4);
        }
        .jw-map-overlay .pin { color: #34d399; font-size: 16px; flex-shrink: 0; }
        .jw-map-overlay .addr { font-size: 12.5px; font-weight: 600; line-height: 1.3; }
        .jw-map-overlay .hint { position: absolute; top: 14px; left: 14px; right: 14px; z-index: 2;
          background: rgba(255,255,255,0.92); border-radius: 12px; padding: 8px 14px; font-size: 12px; font-weight: 600;
          color: var(--jw-muted, #64748b); box-shadow: 0 4px 12px rgba(15,23,42,0.1); text-align: center; }
      `}</style>

      <div className="jw-section-head">
        <div className="jw-section-head-left">
          <span className="jw-icon-badge"><i className="fa-solid fa-map-location-dot"></i></span>
          <div>
            <h5>Interactive Map <span className="text-danger fw-bold">*</span></h5>
            <p>Search below, move the pin, or use current location.</p>
          </div>
        </div>
        {isConfirmed && (
          <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
            <span className="jw-chip flex-shrink-0">
              <i className="fa-solid fa-circle-check"></i> Location set
            </span>
            {form?.region && (
              <span
                className="badge text-uppercase fw-bold px-2 py-1 flex-shrink-0 shadow-sm"
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.5px",
                  backgroundColor: form.region === "regional" ? "#4a6fa5" : "#0A7C6E",
                  color: "#fff",
                  borderRadius: "999px",
                }}
              >
                <i className={`fa-solid ${form.region === "regional" ? "fa-mountain-sun" : "fa-city"} me-1`}></i>
                {form.region === "regional" ? "Regional Rate" : "Metro Rate"}
                {form.state ? ` (${form.state.toUpperCase()})` : ""}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-md-8 col-lg-9">
          <div className={`input-group shadow-sm jw-loc-search ${locationError ? "has-error" : ""}`}>
            <span className="input-group-text bg-white border-0 text-muted ps-4">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              ref={inputRef}
              value={form?.location || ""}
              autoComplete="off"
              onChange={(e) => {
                const val = e.target.value;
                if (selectingPlaceRef.current) {
                  if (setLocationError) setLocationError("");
                  return;
                }
                setField({
                  location: val,
                  address: "",
                  coordinates: "",
                  city: "",
                  state: "",
                  postcode: "",
                  region: "",
                });
                if (setLocationError) setLocationError("");
              }}
              className="form-control form-control-lg border-0 ps-2"
              placeholder="Search address or enter manually"
              style={{ boxShadow: "none", fontSize: "1rem" }}
              onFocus={() => {
                if (setLocationError) setLocationError("");
              }}
            />
            {form?.location && (
              <button
                type="button"
                className="btn btn-white border-0 text-muted hover-bg-light pe-4"
                onClick={() => {
                  setField({
                    location: "",
                    address: "",
                    coordinates: "",
                    city: "",
                    state: "",
                    postcode: "",
                    region: "",
                  });
                  if (setLocationError) setLocationError("");
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        <div className="col-12 col-md-4 col-lg-3 d-grid">
          <button
            type="button"
            className="btn btn-lg shadow-sm fw-medium d-flex align-items-center justify-content-center gap-2 rounded-pill w-100 jw-gps-btn text-white"
            onClick={handleUseCurrent}
            disabled={resolvingLocation}
          >
            {resolvingLocation ? (
              <><span className="spinner-border spinner-border-sm"></span> Locating...</>
            ) : (
              <><i className="fa-solid fa-location-crosshairs"></i> Use GPS</>
            )}
          </button>
        </div>
      </div>

      {locationError && (
        <div className="jw-alert-error mb-3">
          <i className="fa-solid fa-triangle-exclamation" />
          {locationError}
        </div>
      )}

      {/* Responsive Map Container */}
      <div className={`jw-map-wrap shadow-sm ${locationError ? "has-error" : ""}`}>
        {!form?.coordinates && (
          <div className="jw-map-overlay hint">
            <i className="fa-solid fa-hand-pointer me-1"></i> Drag the pin or search above to set the exact location
          </div>
        )}
        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "50vh",
            minHeight: "250px",
            maxHeight: "350px",
            backgroundColor: "#e9ecef"
          }}
        />
        {form?.address && (
          <div className="jw-map-overlay">
            <i className="fa-solid fa-location-dot pin"></i>
            <span className="addr">{form.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
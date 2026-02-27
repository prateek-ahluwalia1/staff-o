import React, { useEffect, useRef, useState } from "react";

export default function LocationStep({
  form,
  setField,
  resolvingLocation,
  setResolvingLocation,
}) {
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.maps) {
        clearInterval(interval);
        setGoogleReady(true);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!googleReady || !mapRef.current) return;

    const initialLatLng = form.coordinates
      ? form.coordinates.split(",").map(Number)
      : [31.526042, 74.271675];

    const gmap = new window.google.maps.Map(mapRef.current, {
      center: { lat: initialLatLng[0], lng: initialLatLng[1] },
      zoom: 15,
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
      setField("coordinates", `${lat},${lng}`);
      reverseGeocode(lat, lng);
    });

    setMap(gmap);
    markerRef.current = marker;
  }, [googleReady]);

  useEffect(() => {
    if (!googleReady || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ["address_components", "geometry", "formatted_address"],
        types: ["address"],
        componentRestrictions: { country: "pk" },
      },
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setField("coordinates", `${lat},${lng}`);
      fillAddress(place);

      if (markerRef.current) markerRef.current.setPosition({ lat, lng });
      if (map) map.setCenter({ lat, lng });
    });
  }, [googleReady, map]);

  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results.length > 0)
        fillAddress(results[0]);
    });
  };

  const fillAddress = (place) => {
    let block = "",
      area = "",
      city = "",
      state = "",
      postcode = "";
    place.address_components?.forEach((component) => {
      const types = component.types;
      if (types.includes("sublocality_level_1")) block = component.long_name;
      if (types.includes("sublocality")) area = component.long_name;
      if (types.includes("locality")) city = component.long_name;
      if (types.includes("administrative_area_level_1"))
        state = component.long_name;
      if (types.includes("postal_code")) postcode = component.long_name;
    });
    const finalAddress = [block, area, city, state, postcode]
      .filter(Boolean)
      .join(", ");
    setField("location", finalAddress || place.formatted_address);
    setField("address", finalAddress || place.formatted_address);
    if (city) setField("city", city);
    if (state) setField("state", state);
    if (postcode) setField("postcode", postcode);
  };

  const handleUseCurrent = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    setResolvingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setField("coordinates", `${lat},${lng}`);
        reverseGeocode(lat, lng);

        if (markerRef.current) markerRef.current.setPosition({ lat, lng });
        if (map) map.setCenter({ lat, lng });

        setResolvingLocation(false);
      },
      (err) => {
        setResolvingLocation(false);
        alert("Location error: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  };

  return (
    <div className="mb-4">
      <h5 className="mb-2">Job Location</h5>
      <p className="text-muted small">
        Pick a location or use your current GPS position.
      </p>

      <div
        ref={mapRef}
        className="rounded mb-3"
        style={{ height: 300, backgroundColor: "#f8f9fa" }}
      />

      <div className="row g-2">
        <div className="col-md-9">
          <div className="input-group">
            <input
              ref={inputRef}
              value={form.location || ""}
              onChange={(e) => setField("location", e.target.value)}
              className="form-control form-control-lg"
              placeholder="Search address"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setField("location", "");
                setField("address", "");
                setField("coordinates", "");
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="col-md-3 d-grid">
          <button
            type="button"
            className="btn btn-outline-primary btn-lg"
            onClick={handleUseCurrent}
            disabled={resolvingLocation}
          >
            {resolvingLocation ? "Resolving..." : "Use Current"}
          </button>
        </div>
      </div>
    </div>
  );
}

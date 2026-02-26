import React, { useEffect } from "react";

export default function LocationStep({
  form,
  setField,
  mapSrc,
  handleUseCurrent,
  resolvingLocation,
}) {
  // Attach Google Maps Autocomplete
  useEffect(() => {
    let autocomplete;
    let listener;

    const initMap = () => {
      const input = document.getElementById("job-location-autocomplete");

      if (!input || !window.google || !window.google.maps) return;
      if (input.getAttribute("data-gmaps-initialized")) return;

      autocomplete = new window.google.maps.places.Autocomplete(input, {
        fields: ["address_components", "geometry", "formatted_address"],
        types: ["address"],
      });

      input.setAttribute("data-gmaps-initialized", "true");

      listener = autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        let newCity = "";
        let newState = "";
        let newPostcode = "";

        // Extract detailed address components
        place.address_components?.forEach((component) => {
          const types = component.types;
          if (types.includes("locality")) newCity = component.long_name;
          if (types.includes("administrative_area_level_1"))
            newState = component.long_name;
          if (types.includes("postal_code")) newPostcode = component.long_name;
        });

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Update the form fields via the passed setField function
        setField("location", place.formatted_address);
        setField("address", place.formatted_address);
        if (newCity) setField("city", newCity);
        if (newState) setField("state", newState);
        if (newPostcode) setField("postcode", newPostcode);
        setField("coordinates", `${lat},${lng}`);
      });
    };

    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkGoogleMaps);
        initMap();
      }
    }, 500);

    return () => {
      clearInterval(checkGoogleMaps);
      if (listener && window.google) {
        window.google.maps.event.removeListener(listener);
      }
      const input = document.getElementById("job-location-autocomplete");
      if (input) {
        input.removeAttribute("data-gmaps-initialized");
      }
    };
  }, [setField]);

  return (
    <div className="mb-4">
      <h5 className="mb-2">Job Location</h5>
      <p className="text-muted small">
        Pick a location or enter an address. Map previews the address below.
      </p>

      <div
        className="rounded overflow-hidden mb-3"
        style={{ height: 220, backgroundColor: "#f8f9fa" }}
      >
        <iframe
          title="location-map"
          src={mapSrc}
          width="100%"
          height="220"
          style={{ border: 0 }}
          loading="lazy"
        />
      </div>

      <div className="row g-2">
        <div className="col-md-9">
          <div className="input-group">
            <input
              id="job-location-autocomplete" // Required for Google Maps
              name="location"
              value={form.location || ""}
              onChange={(e) => setField("location", e.target.value)}
              className="form-control form-control-lg"
              placeholder="Search address or paste location"
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
            {resolvingLocation ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Resolving...
              </>
            ) : (
              "Use current"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

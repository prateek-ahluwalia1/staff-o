import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import useFetch from "../../hooks/useFetch";
import useSubmit from "../../hooks/useSubmit";

export default function LocationStep({
  form,
  setField,
  resolvingLocation,
  setResolvingLocation,
  locationError,
  setLocationError,
  isAdmin,
}) {
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const selectingPlaceRef = useRef(false);
  const autocompleteRef = useRef(null);
  const [map, setMap] = useState(null);
  const [googleReady, setGoogleReady] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [inputMode, setInputMode] = useState("autocomplete");
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", company_name: "" });

  const { data: customersRes, loading: loadingCustomers, refetch: refetchCustomers } = useFetch(
    isAdmin ? "api/admin/get-customers?limit=1000" : null,
    { isAuth: true }
  );
  const activeCustomers = customersRes?.data?.data?.filter((c) => c.is_active) || [];

  const { data: detailRes, loading: loadingSites } = useFetch(
    selectedCustomerId && selectedCustomerId !== "new" ? `api/admin/customers-detail/${selectedCustomerId}` : null,
    { isAuth: true }
  );
  const customerSites = detailRes?.data?.customer?.sites || [];

  const { submit: submitCustomer, loading: submittingCustomer } = useSubmit({ isAuth: true });

  const fillAddress = useCallback(
    (place, options = {}) => {
      let block = "", area = "", city = "", state = "", postcode = "";
      place.address_components?.forEach((component) => {
        const types = component.types;
        if (types.includes("sublocality_level_1")) block = component.long_name;
        if (types.includes("sublocality")) area = component.long_name;
        if (types.includes("locality")) city = component.long_name;
        if (types.includes("administrative_area_level_1")) state = component.long_name;
        if (types.includes("postal_code")) postcode = component.long_name;
      });
      const finalAddress = [block, area, city, state, postcode].filter(Boolean).join(", ");
      const canonicalAddress = finalAddress || place.formatted_address || "";
      const placeLabel = place.name ? `${place.name}${place.formatted_address ? `, ${place.formatted_address}` : ""}` : canonicalAddress;

      setField("location", options.preferPlaceLabel ? placeLabel : canonicalAddress);
      setField("address", canonicalAddress);
      if (city) setField("city", city);
      if (state) setField("state", state);
      if (postcode) setField("postcode", postcode);
      if (setLocationError) setLocationError("");
    },
    [setField, setLocationError]
  );

  const reverseGeocode = useCallback(
    (lat, lng) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          fillAddress(results[0]);
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

  useEffect(() => {
    if (!googleReady || !mapRef.current || map) return;

    const initialLatLng = form.coordinates ? form.coordinates.split(",").map(Number) : [31.526042, 74.271675];

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
      setInputMode("autocomplete");
    });

    setMap(gmap);
    markerRef.current = marker;
  }, [googleReady, map, form.coordinates, setField, reverseGeocode]);

  useEffect(() => {
    if (!googleReady || !inputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["name", "address_components", "geometry", "formatted_address"],
    });

    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();
      if (!place.geometry) return;

      selectingPlaceRef.current = true;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setField("coordinates", `${lat},${lng}`);
      fillAddress(place, { preferPlaceLabel: true });

      if (markerRef.current) markerRef.current.setPosition({ lat, lng });
      if (map) map.setCenter({ lat, lng });

      setTimeout(() => { selectingPlaceRef.current = false; }, 0);
    });

    return () => {
      if (listener && typeof listener.remove === "function") listener.remove();
      autocompleteRef.current = null;
    };
  }, [googleReady, map, setField, fillAddress]);

  const handleUseCurrent = () => {
    if (!navigator.geolocation) return toast.error("Geolocation is not supported by your browser.");
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
        toast.error("Location error: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const handleCustomerChange = (e) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);

    if (custId && custId !== "new") {
      setInputMode("dropdown");
    } else {
      setInputMode("autocomplete");
    }

    setField("location", "");
    setField("address", "");
    setField("coordinates", "");
  };

  const handleSiteSelect = (e) => {
    const siteId = e.target.value;

    if (siteId === "manual_entry") {
      setInputMode("autocomplete");
      setField("location", "");
      setField("address", "");
      setField("coordinates", "");
      return;
    }

    const site = customerSites.find((s) => s.id.toString() === siteId);
    if (site) {
      setField("location", site.address || "");
      setField("address", site.address || "");
      setField("coordinates", site.coordinates || "");

      if (setLocationError) setLocationError("");

      if (site.coordinates && map && markerRef.current) {
        const [lat, lng] = site.coordinates.split(",").map(Number);
        markerRef.current.setPosition({ lat, lng });
        map.setCenter({ lat, lng });
      }
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      toast.error("Name and Email are required");
      return;
    }
    try {
      const res = await submitCustomer("api/admin/customers-store", {
        ...newCustomer,
        is_active: 1
      }, { method: "POST" });

      if (res && res.success !== false) {
        toast.success("Client created successfully!");
        if (refetchCustomers) await refetchCustomers();

        const createdId = res.data?.id || res.id;
        if (createdId) {
          setSelectedCustomerId(createdId.toString());
          setInputMode("dropdown");
        } else {
          setSelectedCustomerId("");
        }
        setNewCustomer({ name: "", email: "", phone: "", company_name: "" });
      }
    } catch (err) {
      toast.error(err.message || "Failed to create client");
    }
  };

  return (
    <div className="mb-4">
      {isAdmin && (
        <div className="d-flex justify-content-between align-items-center bg-white p-2 px-3 rounded-pill border mb-3 shadow-sm">
          <span className="badge bg-dark rounded-pill px-3 py-2">Admin Mode</span>
          <div className="d-flex align-items-center gap-2 flex-grow-1 ms-3 justify-content-end">
            <span className="small fw-bold text-muted mb-0 text-nowrap">Client:</span>
            <select
              className="form-select form-select-sm border-secondary-subtle rounded-pill shadow-sm"
              style={{ maxWidth: "300px" }}
              value={selectedCustomerId}
              onChange={handleCustomerChange}
              disabled={loadingCustomers}
            >
              <option value="">None (Standard Flow)</option>
              <option value="new" className="text-primary fw-bold">+ Add New Client</option>
              {activeCustomers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name} ({cust.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {isAdmin && selectedCustomerId === "new" && (
        <div className="p-3 bg-white border border-primary-subtle rounded-3 mb-4 shadow-sm">
          <h6 className="fw-bold text-primary mb-3">Create New Client</h6>
          <div className="row g-2">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Full Name *"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <input
                type="email"
                className="form-control form-control-sm"
                placeholder="Email Address *"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Phone Number"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Company Name"
                value={newCustomer.company_name}
                onChange={(e) => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
              />
            </div>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <button
              type="button"
              className="btn btn-sm btn-primary px-4"
              onClick={handleCreateCustomer}
              disabled={submittingCustomer}
            >
              {submittingCustomer ? "Saving..." : "Save Client"}
            </button>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h5 className="mb-1">Job Location</h5>
          <p className="text-muted small mb-0">
            {inputMode === "dropdown" ? "Location is linked to the selected site." : "Search for an address or use your GPS."}
          </p>
        </div>
      </div>

      <div ref={mapRef} className="rounded mb-3 border shadow-sm" style={{ height: 300, backgroundColor: "#f8f9fa" }} />

      <div className="row g-2">
        <div className="col-md-9">
          {isAdmin && selectedCustomerId && selectedCustomerId !== "new" && inputMode === "dropdown" ? (
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-lg border-primary shadow-sm"
                onChange={handleSiteSelect}
                defaultValue=""
              >
                <option value="" disabled>
                  {loadingSites ? "Loading sites..." : "Select a response site..."}
                </option>
                {!loadingSites && customerSites.length === 0 && (
                  <option disabled>No previous sites found</option>
                )}
                {customerSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.site_name ? `${site.site_name} - ` : ""}{site.address}
                  </option>
                ))}
                <option value="manual_entry" className="fw-bold text-primary">
                  + Enter new location manually
                </option>
              </select>
            </div>
          ) : (
            <div className="input-group">
              <input
                ref={inputRef}
                value={form.location || ""}
                autoComplete="off"
                onChange={(e) => {
                  setField("location", e.target.value);
                  if (selectingPlaceRef.current) {
                    if (setLocationError) setLocationError("");
                    return;
                  }
                  setField("coordinates", "");
                  setField("address", "");
                  if (setLocationError) setLocationError("");
                }}
                className={`form-control form-control-lg${locationError ? " is-invalid" : ""}`}
                placeholder="Search address"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setField("location", "");
                  setField("address", "");
                  setField("coordinates", "");
                  if (setLocationError) setLocationError("");
                }}
              >
                Clear
              </button>
              {isAdmin && selectedCustomerId && selectedCustomerId !== "new" && (
                <button
                  type="button"
                  className="btn btn-primary px-3"
                  onClick={() => setInputMode("dropdown")}
                  title="Back to response sites"
                >
                  <i className="fa-solid fa-list-ul"></i>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="col-md-3 d-grid">
          <button
            type="button"
            className="btn btn-outline-primary btn-lg"
            onClick={handleUseCurrent}
            disabled={resolvingLocation || inputMode === "dropdown"}
          >
            {resolvingLocation ? "Resolving..." : "Use Current"}
          </button>
        </div>
      </div>

      {locationError && (
        <div className="alert alert-warning py-2 mt-3 mb-0 small d-flex align-items-center gap-2">
          <i className="fa fa-map-marker" />
          {locationError}
        </div>
      )}
    </div>
  );
}
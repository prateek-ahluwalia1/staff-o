import React from "react";

export default function LocationStep({
  form,
  setField,
  mapSrc,
  handleUseCurrent,
  resolvingLocation,
}) {
  return (
    <div className="mb-4">
      <h5 className="mb-2">Job Location</h5>
      <p className="text-muted small">
        Pick a location or enter an address. Map previews the address below.
      </p>

      <div className="rounded overflow-hidden mb-3" style={{ height: 220 }}>
        <iframe
          title="location-map"
          src={mapSrc}
          width="100%"
          height="220"
          style={{ border: 0 }}
        />
      </div>

      <div className="row g-2">
        <div className="col-md-9">
          <div className="input-group">
            <input
              name="location"
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
              className="form-control form-control-lg"
              placeholder="Search address or paste location"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setField("location", "")}
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

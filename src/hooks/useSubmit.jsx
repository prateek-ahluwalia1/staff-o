import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { apiURL } from "../utils/exports";
import { toast } from "react-toastify";
import { logOut } from "../store/slices/authSlice";

const useSubmit = ({ isAuth = false } = {}) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const submit = useCallback(
    async (endpoint, body, options = {}) => {
      const { method = "POST", silentErrorToast = false, responseType = "json" } = options;
      const isFormData = body instanceof FormData;

      setLoading(true);
      setData(null);

      try {
        const headers = {
          Accept: responseType === "blob" ? "application/pdf, application/json" : "application/json",
        };

        if (!isFormData) {
          headers["Content-Type"] = "application/json";
        }

        if (isAuth && token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const fetchOptions = {
          method,
          headers,
          credentials: "include",
        };

        if (method !== "GET" && method !== "HEAD") {
          fetchOptions.body = isFormData ? body : JSON.stringify(body);
        }

        const res = await fetch(`${apiURL}${endpoint}`, fetchOptions);

        if (res.status === 401) {
          // For blob responses, we can't parse JSON, so treat as auth error
          if (responseType === "blob") {
            dispatch(logOut());
            return { success: false, error: "Unauthorized", status: 401 };
          }

          const errorJson = await res.json();
          if (errorJson.message === "Unauthenticated.") {
            dispatch(logOut());
          }
          if (!silentErrorToast) toast.error(errorJson.message || "Unauthorized");
          return { success: false, error: errorJson.message, status: 401, data: errorJson };
        }

        // --- BLOB HANDLING ---
        if (responseType === "blob") {
          const contentType = res.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            const errorJson = await res.json();
            throw new Error(errorJson.message || errorJson.error || "Server returned JSON instead of PDF");
          }

          if (!res.ok) throw new Error("Failed to generate document");

          const rawBlob = await res.blob();
          return new Blob([rawBlob], { type: "application/pdf" });
        }

        // --- STANDARD JSON HANDLING ---
        const json = await res.json();

        if (!res.ok) {
          let errorMsg = json?.error || json?.message;
          if (!errorMsg && json?.errors && typeof json.errors === "object") {
            const firstErrorKey = Object.keys(json.errors)[0];
            if (firstErrorKey && Array.isArray(json.errors[firstErrorKey])) {
              errorMsg = json.errors[firstErrorKey][0];
            }
          }
          console.error("Submit API error:", errorMsg);
          if (!silentErrorToast) toast.error(errorMsg || "An error occurred");
          return { success: false, error: errorMsg, status: res.status, data: json };
        }

        setData(json);
        return json;
      } catch (err) {
        const message = err.message || "Network error";
        if (!silentErrorToast) toast.error(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [isAuth, token, dispatch],
  );

  return { submit, loading, data };
};

export default useSubmit;
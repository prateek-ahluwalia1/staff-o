import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { apiURL } from "../utils/exports";
import { toast } from "react-toastify";
import { logOut } from "../store/slices/authSlice";

export const extractErrorMessage = (json, fallback = "An error occurred") => {
  if (!json) return fallback;
  if (typeof json === "string") {
    if (/email.*(already|taken|exist)|(already|taken|exist).*email/i.test(json)) {
      return "Email already exists.";
    }
    return json;
  }

  // 1. Locate errors container if present
  let errorsContainer = null;
  if (json.errors && typeof json.errors === "object") {
    errorsContainer = json.errors;
  } else if (json.data?.errors && typeof json.data.errors === "object") {
    errorsContainer = json.data.errors;
  } else if (
    json.data &&
    typeof json.data === "object" &&
    !Array.isArray(json.data) &&
    (json.data.email || json.data.phone || json.data.password || json.data.name)
  ) {
    errorsContainer = json.data;
  } else if (json.error && typeof json.error === "object") {
    errorsContainer = json.error;
  }

  if (errorsContainer) {
    if (Array.isArray(errorsContainer) && errorsContainer.length > 0) {
      const first = errorsContainer[0];
      const msg = typeof first === "string" ? first : first?.message || first?.msg;
      if (msg) {
        if (/email.*(already|taken|exist)|(already|taken|exist).*email/i.test(msg)) {
          return "Email already exists.";
        }
        return msg;
      }
    } else if (typeof errorsContainer === "object") {
      // Prioritize email error if present
      const emailKey = Object.keys(errorsContainer).find((k) => /email/i.test(k));
      if (emailKey) {
        const val = errorsContainer[emailKey];
        const msg = Array.isArray(val) ? val[0] : typeof val === "string" ? val : null;
        if (msg) {
          if (/already|taken|exist/i.test(msg)) {
            return "Email already exists.";
          }
          return msg;
        }
      }

      // Check all other keys in errorsContainer
      for (const key of Object.keys(errorsContainer)) {
        const val = errorsContainer[key];
        const msg = Array.isArray(val) ? val[0] : typeof val === "string" ? val : null;
        if (msg) {
          if (/email/i.test(key) && /already|taken|exist/i.test(msg)) {
            return "Email already exists.";
          }
          return msg;
        }
      }
    }
  }

  // 2. Check main message or error string
  const mainMsg =
    typeof json.error === "string"
      ? json.error
      : typeof json.message === "string"
      ? json.message
      : null;

  if (mainMsg) {
    if (/email.*(already|taken|exist)|(already|taken|exist).*email/i.test(mainMsg)) {
      return "Email already exists.";
    }
    return mainMsg;
  }

  return fallback;
};

const useSubmit = ({ isAuth = false, BaseURL = apiURL } = {}) => {
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
          credentials: 'include',
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

        const res = await fetch(`${BaseURL}${endpoint}`, fetchOptions);

        // 401 handling...
        if (res.status === 401) {
          if (responseType === "blob") {
            sessionStorage.clear();
            dispatch(logOut());
            return { success: false, error: "Unauthorized", status: 401 };
          }
          const errorJson = await res.json();
          if (errorJson.message === "Unauthenticated.") {
            sessionStorage.clear();
            dispatch(logOut());
          }
          if (!silentErrorToast) toast.error(errorJson.message || "Unauthorized");
          return { success: false, error: errorJson.message, status: 401, data: errorJson };
        }

        // BLOB HANDLING...
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

        // STANDARD JSON HANDLING...
        const json = await res.json();

        if (!res.ok) {
          const errorMsg = extractErrorMessage(json, "An error occurred");
          console.error("Submit API error:", errorMsg);
          if (!silentErrorToast) toast.error(errorMsg);
          return { success: false, error: errorMsg, status: res.status, data: json };
        }

        // 👇 NEW: Check for logical success:false even with HTTP 200
        if (json && json.success === false) {
          const errorMsg = extractErrorMessage(json, "An error occurred");
          if (!silentErrorToast) toast.error(errorMsg);
          setData(json); // still expose the full response to the caller
          return { success: false, error: errorMsg, data: json };
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
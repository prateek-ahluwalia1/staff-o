import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { apiURL } from "../utils/exports";
import { toast } from "react-toastify";

const useSubmit = ({ isAuth = false } = {}) => {
  const token = useSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const submit = useCallback(
    async (endpoint, body, options = {}) => {
      const { method = "POST", silentErrorToast = false } = options;

      const isFormData = body instanceof FormData;

      setLoading(true);
      setData(null);

      try {
        const headers = {
          Accept: "application/json",
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

        const json = await res.json();

        if (!res.ok) {
          let errorMsg;

          if (json?.error) {
            errorMsg = json.error;
          } else if (json?.message) {
            errorMsg = json.message;
          } else if (json?.errors && typeof json.errors === "object") {
            const firstErrorKey = Object.keys(json.errors)[0];
            if (firstErrorKey && Array.isArray(json.errors[firstErrorKey])) {
              errorMsg = json.errors[firstErrorKey][0];
            }
          }

          console.error("Submit API error:", errorMsg);
          if (!silentErrorToast) {
            toast.error(errorMsg);
          }
          return {
            success: false,
            error: errorMsg,
            status: res.status,
            data: json,
          };
        }

        setData(json);
        return json;
      } catch (err) {
        const message = err.message || "Network error";
        if (!silentErrorToast) {
          toast.error(message);
        }
        return {
          success: false,
          error: message,
        };
      } finally {
        setLoading(false);
      }
    },
    [isAuth, token],
  );

  return { submit, loading, data };
};

export default useSubmit;

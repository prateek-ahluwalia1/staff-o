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
      const { method = "POST" } = options;

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

        const res = await fetch(`${apiURL}${endpoint}`, {
          method,
          headers,
          credentials: "include",
          body: isFormData ? body : JSON.stringify(body),
        });

        const json = await res.json();

        if (!res.ok) {
          let errorMsg = "Something went wrong";

          if (json.message) {
            errorMsg = json.message;
          } else if (json.errors && typeof json.errors === "object") {
            const firstErrorKey = Object.keys(json.errors)[0];
            if (firstErrorKey && Array.isArray(json.errors[firstErrorKey])) {
              errorMsg = json.errors[firstErrorKey][0];
            }
          }

          console.error("Submit API error:", errorMsg);
          toast.error(errorMsg);
          return;
        }

        setData(json);
        return json;
      } catch (err) {
        const message = err.message || "Network error";
        console.error("Submit request failed:", message);
        toast.error(message);
        return;
      } finally {
        setLoading(false);
      }
    },
    [isAuth, token],
  );

  return { submit, loading, data };
};

export default useSubmit;

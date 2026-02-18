import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { apiURL } from "../utils/exports";

const useSubmit = ({ isAuth = false } = {}) => {
  const token = useSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const submit = useCallback(
    async (endpoint, body, options = {}) => {
      const { method = "POST" } = options;

      const isFormData = body instanceof FormData;

      setLoading(true);
      setError(null);
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
          setError(json.errors || json.message || "Something went wrong");
          return { success: false, errors: json.errors, message: json.message };
        }

        setData(json);
        return { success: true, data: json };
      } catch (err) {
        const message = err.message || "Network error";
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [isAuth, token],
  );

  return { submit, loading, error, data };
};

export default useSubmit;

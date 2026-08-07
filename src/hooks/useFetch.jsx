import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { apiURL } from "../utils/exports";
import { logOut } from "../store/slices/authSlice";

const useFetch = (endpoint, { isAuth = false, immediate = true, method = "GET", body = null } = {}) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (overrideEndpoint, requestOptions = {}) => {
      const url = overrideEndpoint || endpoint;
      if (!url) return;

      const requestMethod = requestOptions.method || method;
      const requestBody = requestOptions.body ?? body;

      setLoading(true);
      setError(null);

      try {
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
        };

        if (isAuth && token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${apiURL}${url}`, {
          method: requestMethod,
          headers,
          credentials: "include",
          body: requestBody ? requestBody : undefined,
        });

        const contentType = res.headers.get("content-type") || "";
        const isJsonResponse = contentType.includes("application/json");
        const json = isJsonResponse ? await res.json() : null;

        if (res.status === 401 && json?.message === "Unauthenticated.") {
          dispatch(logOut());
          setData(null);
          setError("Unauthenticated.");
          return;
        }

        if (!res.ok) {
          setData(null);
          setError(json?.message || "Request failed");
          return;
        }

        setData(json);
      } catch (err) {
        console.error("Fetch request failed:", err.message);
        setData(null);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, isAuth, token, dispatch, method, body],
  );

  useEffect(() => {
    if (immediate && endpoint) {
      fetchData();
    }
  }, [immediate, endpoint, fetchData]);

  return { data, loading, error, refetch: fetchData };   // 👈 expose error
};

export default useFetch;
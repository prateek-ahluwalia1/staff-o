import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { apiURL } from "../utils/exports";
import { logOut } from "../store/slices/authSlice";

const useFetch = (endpoint, { isAuth = false, immediate = true } = {}) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);   // 👈 add error state

  const fetchData = useCallback(
    async (overrideEndpoint) => {
      const url = overrideEndpoint || endpoint;
      if (!url) return;

      setLoading(true);
      setError(null);       // clear any previous error

      try {
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
        };

        if (isAuth && token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${apiURL}${url}`, {
          method: "GET",
          headers,
          credentials: "include",
        });

        const json = await res.json();

        // Handle unauthenticated
        if (res.status === 401 && json.message === "Unauthenticated.") {
          dispatch(logOut());
          setData(null);
          setError("Unauthenticated.");
          return;
        }

        if (!res.ok) {
          // 👇 reset data and store the error message
          setData(null);
          setError(json.message || "Request failed");
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
    [endpoint, isAuth, token, dispatch],
  );

  useEffect(() => {
    if (immediate && endpoint) {
      fetchData();
    }
  }, [immediate, endpoint, fetchData]);

  return { data, loading, error, refetch: fetchData };   // 👈 expose error
};

export default useFetch;
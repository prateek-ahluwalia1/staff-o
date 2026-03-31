import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { apiURL } from "../utils/exports";

const useFetch = (endpoint, { isAuth = false, immediate = true } = {}) => {
  const token = useSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = useCallback(
    async (overrideEndpoint) => {
      const url = overrideEndpoint || endpoint;
      if (!url) return;

      setLoading(true);

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

        if (!res.ok) {
          // thtoast.error(json.errors || json.message || "Something went wrong");
          return;
        }

        setData(json);
      } catch (err) {
        // const message = err.message || "Network error";
        // toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, isAuth, token],
  );

  useEffect(() => {
    if (immediate && endpoint) {
      fetchData();
    }
  }, [immediate, endpoint, fetchData]);

  return { data, loading, refetch: fetchData };
};

export default useFetch;

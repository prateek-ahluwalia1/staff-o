import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { apiURL } from "../utils/exports";
import { toast } from "react-toastify";
import { logOut } from "../store/slices/authSlice";

const useFetch = (endpoint, { isAuth = false, immediate = true } = {}) => {
  const dispatch = useDispatch();
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

        // --- 401 LOGOUT HANDLER ---
        if (res.status === 401) {
          dispatch(logOut());
          toast.error("Session expired. Please log in again.");
          return;
        }

        const json = await res.json();

        if (!res.ok) {
          console.error("Fetch error response:", json);
          // toast.error(json.errors || json.message || "Something went wrong");
          return;
        }

        setData(json);
      } catch (err) {
        const message = err.message || "Network error";
        console.error("Fetch request failed:", message);
        // toast.error(message);
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

  return { data, loading, refetch: fetchData };
};

export default useFetch;
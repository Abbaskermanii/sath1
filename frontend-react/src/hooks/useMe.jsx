// src/hooks/useMe.js
import { useEffect, useState } from "react";
import { api } from "../lib/axiosClient";
import { getAccessToken, clearTokens } from "../lib/tokens";

export default function useMe() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    api
      .get("/accounts/me/")
      .then((res) => {
        if (!mounted) return;
        setUser(res.data);
      })
      .catch(() => {
        if (!mounted) return;
        clearTokens();
        setUser(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading, setUser };
}

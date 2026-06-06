import { useEffect, useState } from "react";
import useDebounce from "./useDebounce";
import { api } from "../lib/axiosClient";

export default function useSearchPosts(searchTerm) {
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const query = debouncedSearchTerm.trim();

    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    let ignore = false;

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/news/posts/", {
          params: {
            search: query,
          },
        });

        if (ignore) return;

        const responseData = response.data;

        const posts = Array.isArray(responseData?.results)
          ? responseData.results
          : Array.isArray(responseData?.data)
            ? responseData.data
            : Array.isArray(responseData)
              ? responseData
              : [];

        setResults(posts.slice(0, 6));
      } catch (err) {
        console.error("SEARCH ERROR:", err?.response || err);

        if (!ignore) {
          setResults([]);
          setError("خطا در جستجو");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      ignore = true;
    };
  }, [debouncedSearchTerm]);

  return {
    results,
    loading,
    error,
  };
}

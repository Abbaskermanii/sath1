import { useEffect, useState } from "react";
import { newsApi } from "../lib/news/newsApi";
import { normalizeCategories } from "../lib/normalizers";

export default function useCategories(limit = null) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function fetchCategories() {
      try {
        setLoading(true);

        const data = await newsApi.getCategories({
          ordering: "title",
        });

        const normalized = normalizeCategories(data);

        if (alive) {
          setCategories(limit ? normalized.slice(0, limit) : normalized);
        }
      } catch (error) {
        console.error("Categories Error:", error);
        if (alive) setCategories([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchCategories();

    return () => {
      alive = false;
    };
  }, [limit]);

  return {
    categories,
    loading,
  };
}

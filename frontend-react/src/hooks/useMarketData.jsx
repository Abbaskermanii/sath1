import { useEffect, useState } from "react";
import { getMarketItems } from "../lib/market/marketApi";

export function useMarketData() {
  const [marketItems, setMarketItems] = useState([]);
  const [marketLoading, setMarketLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setMarketLoading(true);
        const items = await getMarketItems();
        if (mounted) {
          setMarketItems(items);
        }
      } finally {
        if (mounted) {
          setMarketLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    marketItems,
    marketLoading,
  };
}

import { api } from "../../lib/axiosClient";

export const FALLBACK_MARKET_ITEMS = [
  {
    id: 1,
    symbol: "BTC",
    title: "بیت‌کوین",
    subtitle: "BTC / IRR",
    value: "۵٬۴۲۰٬۰۰۰٬۰۰۰",
    active: true,
    type: "crypto",
  },
  {
    id: 2,
    symbol: "ETH",
    title: "اتریوم",
    subtitle: "ETH / IRR",
    value: "۱۹۸٬۰۰۰٬۰۰۰",
    active: true,
    type: "crypto",
  },
  {
    id: 3,
    symbol: "EUR",
    title: "یورو",
    subtitle: "EUR / IRR",
    value: "۹۲۰٬۰۰۰",
    active: true,
    type: "forex",
  },
  {
    id: 4,
    symbol: "BRENT",
    title: "نفت برنت",
    subtitle: "BRENT / IRR",
    value: "۶٬۸۵۰٬۰۰۰",
    active: true,
    type: "commodity",
  },
  {
    id: 5,
    symbol: "WTI",
    title: "نفت WTI",
    subtitle: "WTI / IRR",
    value: "۶٬۶۲۰٬۰۰۰",
    active: true,
    type: "commodity",
  },
];

function normalizeMarketItems(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return FALLBACK_MARKET_ITEMS;
}

export async function getMarketItems() {
  try {
    const { data } = await api.get("markets/");
    return normalizeMarketItems(data);
  } catch (error) {
    console.error("Failed to fetch market items from backend:", error);
    return FALLBACK_MARKET_ITEMS;
  }
}

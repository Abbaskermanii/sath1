import os
import time
from decimal import Decimal, InvalidOperation

import requests
from django.utils import timezone

from apps.markets.models import MarketSymbol

BASE_URL = "https://www.alphavantage.co/query"
REQUEST_TIMEOUT = 20
REQUEST_DELAY_SECONDS = 1.3
MAX_RETRIES = 2


def to_decimal(value):
    if value is None:
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return None


def to_persian_digits(value):
    if value is None:
        return ""

    english = "0123456789"
    persian = "۰۱۲۳۴۵۶۷۸۹"

    text = str(value)
    for e, p in zip(english, persian):
        text = text.replace(e, p)

    return text


def format_number(value, decimal_places=2):
    decimal_value = to_decimal(value)
    if decimal_value is None:
        return "-"

    formatted = f"{decimal_value:,.{decimal_places}f}"
    if decimal_places > 0:
        formatted = formatted.rstrip("0").rstrip(".")

    return to_persian_digits(formatted)


def get_api_key():
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("ALPHA_VANTAGE_API_KEY is missing")
    return api_key


def call_alpha_vantage(function_name, params=None, retries=MAX_RETRIES):
    request_params = {
        "function": function_name,
        "apikey": get_api_key(),
    }

    if params:
        request_params.update(params)

    last_error = None

    for attempt in range(retries + 1):
        try:
            response = requests.get(BASE_URL, params=request_params, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            data = response.json()

            if data.get("Information") or data.get("Note"):
                raise RuntimeError(data.get("Information") or data.get("Note"))

            if data.get("Error Message"):
                raise RuntimeError(data.get("Error Message"))

            return data
        except requests.RequestException as exc:
            last_error = exc
        except ValueError as exc:
            last_error = exc
        except RuntimeError as exc:
            message = str(exc)
            last_error = exc

            if "Please consider spreading out your free API requests" not in message:
                raise

        if attempt < retries:
            time.sleep(REQUEST_DELAY_SECONDS * (attempt + 1))

    raise RuntimeError(str(last_error))


def fetch_exchange_rate(from_currency, to_currency):
    data = call_alpha_vantage(
        "CURRENCY_EXCHANGE_RATE",
        {
            "from_currency": from_currency,
            "to_currency": to_currency,
        },
    )

    rate_data = data.get("Realtime Currency Exchange Rate") or {}
    rate = rate_data.get("5. Exchange Rate")

    if not rate:
        raise RuntimeError(f"Rate not found for {from_currency}/{to_currency}")

    return {
        "rate": to_decimal(rate),
        "quote_currency": to_currency,
        "raw_data": data,
    }


def fetch_commodity_rate(provider_function):
    data = call_alpha_vantage(provider_function)
    records = data.get("data") or []

    if not records:
        raise RuntimeError(f"No data returned for {provider_function}")

    latest = records[0]
    value = latest.get("value")

    if not value or value == ".":
        raise RuntimeError(f"Value not found for {provider_function}")

    return {
        "rate": to_decimal(value),
        "quote_currency": "USD",
        "raw_data": data,
    }


def fetch_usd_to_irr_rate():
    return fetch_exchange_rate("USD", "IRR")


def fetch_market_rate(market):
    provider_function = (market.provider_function or "CURRENCY_EXCHANGE_RATE").strip().upper()

    if provider_function == "CURRENCY_EXCHANGE_RATE":
        from_currency = (market.from_currency or "").strip().upper()
        to_currency = (market.to_currency or "").strip().upper()

        if not from_currency or not to_currency:
            raise RuntimeError(f"from_currency/to_currency missing for {market.symbol}")

        if from_currency == "XAU":
            raise RuntimeError("XAU is not supported via CURRENCY_EXCHANGE_RATE")

        return fetch_exchange_rate(from_currency, to_currency)

    if provider_function in {"WTI", "BRENT"}:
        return fetch_commodity_rate(provider_function)

    raise RuntimeError(f"Unsupported provider_function={provider_function} for {market.symbol}")


def resolve_market_rate(market, usd_to_irr_rate=None, usd_to_irr_raw=None):
    target_currency = (market.target_currency or "USD").strip().upper()
    result = fetch_market_rate(market)

    rate = result["rate"]
    quote_currency = (result["quote_currency"] or "").strip().upper()

    if rate is None:
        raise RuntimeError(f"Invalid rate for {market.symbol}")

    if target_currency == quote_currency:
        return {
            "value": rate,
            "raw_data": {
                "market_rate": result["raw_data"],
                "conversion": "direct",
                "quote_currency": quote_currency,
                "target_currency": target_currency,
            },
        }

    if target_currency == "IRR":
        if quote_currency != "USD":
            raise RuntimeError(
                f"IRR conversion only supports USD-based rates. symbol={market.symbol}, quote={quote_currency}"
            )

        if usd_to_irr_rate is None:
            usd_to_irr_result = fetch_usd_to_irr_rate()
            usd_to_irr_rate = usd_to_irr_result["rate"]
            usd_to_irr_raw = usd_to_irr_result["raw_data"]

        if usd_to_irr_rate is None:
            raise RuntimeError("USD/IRR rate is invalid")

        return {
            "value": rate * usd_to_irr_rate,
            "raw_data": {
                "market_rate": result["raw_data"],
                "usd_to_irr_rate": str(usd_to_irr_rate),
                "usd_to_irr_raw": usd_to_irr_raw,
                "conversion": "usd_to_irr",
                "quote_currency": quote_currency,
                "target_currency": "IRR",
            },
        }

    raise RuntimeError(
        f"Unsupported conversion for {market.symbol}: {quote_currency} to {target_currency}"
    )


def get_market_prices_from_alpha_vantage():
    symbols = list(
        MarketSymbol.objects.filter(enabled_for_sync=True, active=True).order_by("sort_order", "id")
    )

    items = []
    now = timezone.now()

    needs_irr_conversion = any(
        (symbol.target_currency or "").strip().upper() == "IRR" for symbol in symbols
    )

    usd_to_irr_rate = None
    usd_to_irr_raw = None

    if needs_irr_conversion:
        usd_to_irr_result = fetch_usd_to_irr_rate()
        usd_to_irr_rate = usd_to_irr_result["rate"]
        usd_to_irr_raw = usd_to_irr_result["raw_data"]
        time.sleep(REQUEST_DELAY_SECONDS)

    for index, market in enumerate(symbols):
        try:
            result = resolve_market_rate(
                market=market,
                usd_to_irr_rate=usd_to_irr_rate,
                usd_to_irr_raw=usd_to_irr_raw,
            )

            value = result["value"]
            target_currency = (market.target_currency or "USD").strip().upper()
            subtitle = market.subtitle or f"{market.symbol} / {target_currency}"

            items.append(
                {
                    "symbol": market.symbol,
                    "title": market.title,
                    "subtitle": subtitle,
                    "type": market.type,
                    "value": value,
                    "display_value": format_number(
                        value,
                        decimal_places=market.decimal_places,
                    ),
                    "active": True,
                    "sort_order": market.sort_order,
                    "source": "alpha_vantage",
                    "raw_data": {
                        **result["raw_data"],
                        "cached_usd_to_irr_raw": usd_to_irr_raw,
                    },
                    "fetched_at": now,
                }
            )
        except Exception as exc:
            items.append(
                {
                    "symbol": market.symbol,
                    "title": market.title,
                    "subtitle": market.subtitle or market.symbol,
                    "type": market.type,
                    "value": None,
                    "display_value": "-",
                    "active": False,
                    "sort_order": market.sort_order,
                    "source": "alpha_vantage",
                    "raw_data": {"error": str(exc)},
                    "fetched_at": now,
                }
            )

        if index < len(symbols) - 1:
            time.sleep(REQUEST_DELAY_SECONDS)

    return items

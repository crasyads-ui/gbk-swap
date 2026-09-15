// api/onramper-widget.js

export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        ok: false,
        error: "Method not allowed"
      });
    }

    const apiKey = process.env.ONRAMPER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: "ONRAMPER_API_KEY is missing"
      });
    }

    const type =
      String(req.query?.type || "buy").toLowerCase() === "sell"
        ? "sell"
        : "buy";

    const country = String(
      req.query?.country || "IN"
    ).toLowerCase();

    const fiat = String(
      req.query?.fiat || "INR"
    ).toUpperCase();

    const params = new URLSearchParams();

    params.set("apiKey", apiKey);
    params.set("mode", "buy,sell");
    params.set("country", country);
    params.set("defaultFiat", fiat);

    // BSC USDT
    params.set("defaultCrypto", "USDT");
    params.set("onlyCryptos", "USDT");
    params.set("onlyCryptoNetworks", "bsc");

    params.set("redirectAtCheckout", "true");

    if (type === "sell") {
      params.set("sell_defaultFiat", fiat);
      params.set("sell_defaultCrypto", "USDT");
      params.set("sell_onlyCryptos", "USDT");
      params.set("sell_onlyCryptoNetworks", "bsc");
    }

    // TEST KEY -> SANDBOX
    // PRODUCTION KEY -> change this to https://buy.onramper.com/
    const baseUrl = apiKey.startsWith("pk_test_")
      ? "https://buy.onramper.dev/"
      : "https://buy.onramper.com/";

    const url = baseUrl + "?" + params.toString();

    return res.status(200).json({
      ok: true,
      type,
      country,
      fiat,
      crypto: "USDT",
      network: "bsc",
      environment: apiKey.startsWith("pk_test_")
        ? "sandbox"
        : "production",
      url
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      error: "Unable to create Onramper URL"
    });
  }
}

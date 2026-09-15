// api/onramper-widget.js

export default function handler(req, res) {
  // Always return JSON
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
        error: "ONRAMPER_API_KEY is not configured"
      });
    }

    const q = req.query || {};

    const type = String(q.type || "buy").toLowerCase() === "sell"
      ? "sell"
      : "buy";

    const country = String(q.country || "IN").toUpperCase();
    const fiat = String(q.fiat || "INR").toUpperCase();

    const wallet = String(q.wallet || "").trim();

    const params = new URLSearchParams();

    // Onramper authentication
    params.set("apiKey", apiKey);

    // Buy + Sell
    params.set("mode", "buy,sell");

    // User's country / fiat
    params.set("country", country);
    params.set("defaultFiat", fiat);

    // We want USDT only
    params.set("defaultCrypto", "USDT");
    params.set("onlyCryptos", "USDT");

    // BNB Smart Chain only
    params.set("onlyCryptoNetworks", "bsc");

    // Redirect provider checkout
    params.set("redirectAtCheckout", "true");

    // If wallet address is supplied, pass it to Onramper.
    // Do NOT put a secret key in the browser.
    if (wallet) {
      params.set("wallets", `usdt:${wallet}`);
    }

    // Sell-specific settings
    if (type === "sell") {
      params.set("sell_defaultFiat", fiat);
      params.set("sell_defaultCrypto", "USDT");
      params.set("sell_onlyCryptos", "USDT");
      params.set("sell_onlyCryptoNetworks", "bsc");
    }

    const widgetUrl =
      "https://buy.onramper.com/?" + params.toString();

    return res.status(200).json({
      ok: true,
      type,
      country,
      fiat,
      crypto: "USDT",
      network: "bsc",
      url: widgetUrl
    });

  } catch (error) {
    console.error("Onramper widget error:", error);

    return res.status(500).json({
      ok: false,
      error: "Unable to create Onramper widget URL"
    });
  }
}

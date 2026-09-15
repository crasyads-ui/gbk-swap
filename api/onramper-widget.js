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
    ).toUpperCase();

    const fiat = String(
      req.query?.fiat || "INR"
    ).toUpperCase();

    const params = new URLSearchParams();

    params.set("apiKey", apiKey);
    params.set("mode", type);
    params.set("country", country);
    params.set("defaultFiat", fiat);

    /*
     * BUY
     * Do NOT force onlyCryptoNetworks/onlyCryptos here.
     *
     * The previous configuration could produce:
     * "Select Currency"
     * when the sandbox/provider did not expose the exact
     * USDT + BSC combination for the selected fiat.
     *
     * We keep USDT as the preferred destination, while
     * allowing Onramper to resolve the available network
     * and provider for the user's country.
     */
    if (type === "buy") {
      params.set("defaultCrypto", "USDT");
      params.set("redirectAtCheckout", "false");
    }

    /*
     * SELL
     * Keep the working USDT on BNB Smart Chain flow.
     */
    if (type === "sell") {
      params.set("sell_defaultFiat", fiat);
      params.set("sell_defaultCrypto", "USDT");
      params.set("sell_onlyCryptos", "USDT");
      params.set("sell_onlyCryptoNetworks", "bsc");
      params.set("redirectAtCheckout", "false");
    }

    /*
     * Sandbox:
     * pk_test_* -> .dev
     * Production:
     * pk_prod_* -> .com
     */
    const isSandbox = apiKey.startsWith("pk_test_");

    const baseUrl = isSandbox
      ? "https://buy.onramper.dev/"
      : "https://buy.onramper.com/";

    const url =
      baseUrl + "?" + params.toString();

    return res.status(200).json({
      ok: true,
      type,
      country,
      fiat,
      crypto: "USDT",
      network: type === "sell" ? "bsc" : "provider-selected",
      environment: isSandbox ? "sandbox" : "production",
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

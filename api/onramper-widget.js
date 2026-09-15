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

    if (type === "buy") {
      params.set("defaultFiat", fiat);
      params.set("defaultCrypto", "USDT");
      params.set("redirectAtCheckout", "false");
    } else {
      /*
       * Offramp: default to USDT and INR.
       *
       * IMPORTANT:
       * Do not force sell_onlyCryptos or
       * sell_onlyCryptoNetworks here.
       *
       * Those filters can remove the available
       * offramp route in the sandbox and result
       * in the "Select Currency" screen.
       *
       * Onramper's sell widget will select the
       * available network/provider while USDT
       * remains the default crypto.
       */
      params.set("sell_defaultFiat", fiat);
      params.set("sell_defaultCrypto", "USDT");
      params.set("redirectAtCheckout", "false");
    }

    const isSandbox = apiKey.startsWith("pk_test_");

    const baseUrl = isSandbox
      ? "https://buy.onramper.dev/"
      : "https://buy.onramper.com/";

    const url = baseUrl + "?" + params.toString();

    return res.status(200).json({
      ok: true,
      type,
      country,
      fiat,
      crypto: "USDT",
      network: type === "sell" ? "provider-selected" : "provider-selected",
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

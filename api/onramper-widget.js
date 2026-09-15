export default function handler(req, res) {
  const key = process.env.ONRAMPER_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "ONRAMPER_API_KEY is not configured in Vercel" });
  }

  const { type = "buy", fiat = "INR", country = "IN" } = req.query || {};
  if (!/^pk_test_/.test(key)) {
    return res.status(500).json({ error: "For this test build, ONRAMPER_API_KEY must be a pk_test key" });
  }

  const params = new URLSearchParams({
    apiKey: key,
    mode: "buy,sell",
    country: String(country).toLowerCase(),
    defaultFiat: String(fiat).toUpperCase(),
    redirectAtCheckout: "true"
  });

  if (type === "buy") {
  params.set("defaultCrypto", "USDT");
  params.set("onlyCryptos", "USDT");
  params.set("onlyCryptoNetworks", "bsc");
} else {
  params.set("sell_defaultFiat", String(fiat).toUpperCase());
  params.set("sell_defaultCrypto", "USDT");
  params.set("sell_onlyCryptos", "USDT");
}
    
    
    
  

    
    
    
  

  return res.status(200).json({
    url: "https://buy.onramper.dev/?" + params.toString()
  });
}

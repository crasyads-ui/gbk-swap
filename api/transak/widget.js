export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      TRANSAK_API_KEY,
      TRANSAK_ACCESS_TOKEN
    } = process.env;

    if (!TRANSAK_API_KEY || !TRANSAK_ACCESS_TOKEN) {
      return res.status(500).json({
        error: "Transak environment variables are missing"
      });
    }

    const {
      fiatCurrency = "INR",
      cryptoCurrencyCode = "USDT",
      network = "bsc",
      productsAvailed = "BUY",
      walletAddress = ""
    } = req.body || {};

    const response = await fetch(
      "https://api-gateway.transak.com/api/v2/auth/session",
      {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "access-token": TRANSAK_ACCESS_TOKEN
        },
        body: JSON.stringify({
          widgetParams: {
            apiKey: TRANSAK_API_KEY,
            referrerDomain: "swap.gbkai.com",
            productsAvailed,
            fiatCurrency,
            cryptoCurrencyCode,
            network,
            ...(walletAddress ? { walletAddress } : {})
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      widgetUrl: data?.data?.widgetUrl
    });

  } catch (error) {
    return res.status(500).json({
      error: "Unable to create Transak widget",
      message: error.message
    });
  }
}

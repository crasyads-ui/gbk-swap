export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      productsAvailed,
      fiatCurrency,
      countryCode,
      cryptoCurrencyCode,
      network,
      walletAddress,
      redirectURL
    } = req.body || {};

    if (!process.env.TRANSAK_API_KEY) {
      throw new Error("TRANSAK_API_KEY is not configured");
    }

    if (!process.env.TRANSAK_API_SECRET) {
      throw new Error("TRANSAK_API_SECRET is not configured");
    }

    const tokenResponse = await fetch(
      "https://api.transak.com/partners/api/v2/refresh-token",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-secret": process.env.TRANSAK_API_SECRET,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          apiKey: process.env.TRANSAK_API_KEY
        })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Transak token error:", tokenData);
      return res.status(tokenResponse.status).json({
        error: "Transak authentication failed"
      });
    }

    const accessToken = tokenData?.data?.accessToken;

    if (!accessToken) {
      throw new Error("Transak access token missing");
    }

    const widgetResponse = await fetch(
      "https://api-gateway.transak.com/api/v2/auth/session",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "access-token": accessToken,
          "x-api-key": process.env.TRANSAK_API_KEY,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          widgetParams: {
            apiKey: process.env.TRANSAK_API_KEY,
            referrerDomain: "swap.gbkai.com",
            productsAvailed: productsAvailed || "BUY",
            fiatCurrency: fiatCurrency || "INR",
            countryCode: countryCode || "IN",
            cryptoCurrencyCode: cryptoCurrencyCode || "USDT",
            network: network || "bsc",
            walletAddress: walletAddress || "",
            redirectURL:
              redirectURL || "https://swap.gbkai.com"
          }
        })
      }
    );

    const widgetData = await widgetResponse.json();

    if (!widgetResponse.ok) {
      console.error("Transak widget error:", widgetData);
      return res.status(widgetResponse.status).json({
        error: "Transak widget creation failed"
      });
    }

    const widgetUrl = widgetData?.data?.widgetUrl;

    if (!widgetUrl) {
      throw new Error("Transak widget URL missing");
    }

    return res.status(200).json({
      widgetUrl
    });

  } catch (error) {
    console.error("Transak backend error:", error);

    return res.status(500).json({
      error:
        error.message ||
        "On-ramp service unavailable"
    });
  }
}

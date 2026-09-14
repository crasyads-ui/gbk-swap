let cachedToken = null;
let cachedExpiry = 0;

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return String(req.headers["x-real-ip"] || req.socket?.remoteAddress || "").trim();
}

async function getPartnerToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedExpiry > now + 300) return cachedToken;

  const apiKey = process.env.TRANSAK_API_KEY;
  const apiSecret = process.env.TRANSAK_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("Transak credentials are not configured");
  }

  const response = await fetch("https://api.transak.com/partners/api/v2/refresh-token", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-secret": apiSecret,
      "x-api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({ apiKey })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body?.data?.accessToken) {
    throw new Error(body?.message || "Unable to authenticate with Transak");
  }

  cachedToken = body.data.accessToken;
  cachedExpiry = Number(body.data.expiresAt || now + 86400);
  return cachedToken;
}

export default async function handler(req, res) {
  const origin = "https://swap.gbkai.com";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "POST required" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const flow = String(body.flow || "buy").toLowerCase();
  const wallet = String(body.wallet || "");
  const fiat = String(body.fiat || "USD").toUpperCase();

  if (!["buy", "sell"].includes(flow)) {
    return res.status(400).json({ ok: false, error: "flow must be buy or sell" });
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return res.status(400).json({ ok: false, error: "Valid wallet address required" });
  }

  const apiKey = process.env.TRANSAK_API_KEY;
  const referrerDomain = process.env.TRANSAK_REFERRER_DOMAIN || "swap.gbkai.com";

  if (!apiKey || !process.env.TRANSAK_API_SECRET) {
    return res.status(503).json({
      ok: false,
      error: "Transak backend credentials are not configured"
    });
  }

  try {
    const accessToken = await getPartnerToken();

    const widgetParams = {
      apiKey,
      referrerDomain,
      productsAvailed: flow === "sell" ? "SELL" : "BUY",
      fiatCurrency: fiat,
      cryptoCurrencyCode: "USDT",
      network: "bsc",
      walletAddress: wallet,
      disableWalletAddressForm: true
    };

    const response = await fetch("https://api-gateway.transak.com/api/v2/auth/session", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "access-token": accessToken,
        "x-api-key": apiKey,
        "x-user-ip": getClientIp(req),
        "content-type": "application/json"
      },
      body: JSON.stringify({ widgetParams })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.data?.widgetUrl) {
      return res.status(response.status || 502).json({
        ok: false,
        error: data?.message || data?.error || "Transak session creation failed"
      });
    }

    return res.status(200).json({
      ok: true,
      provider: "Transak",
      flow,
      walletAddress: wallet,
      widgetUrl: data.data.widgetUrl
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || "Transak integration failed"
    });
  }
}

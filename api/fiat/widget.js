export default async function handler(req, res) {
  const flow = String(req.query?.flow || "buy").toLowerCase();
  const country = String(req.query?.country || "IN").toUpperCase();
  const fiat = String(req.query?.fiat || "INR").toUpperCase();
  const wallet = String(req.query?.wallet || "");

  if (!["buy", "sell"].includes(flow)) {
    return res.status(400).json({ ok: false, error: "flow must be buy or sell" });
  }

  if (wallet && !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return res.status(400).json({ ok: false, error: "Invalid wallet address" });
  }

  return res.status(200).json({
    ok: true,
    provider: "Onramp.Money",
    flow,
    country,
    fiat,
    walletAddress: wallet || null,
    appId: process.env.ONRAMP_APP_ID || null,
    widgetUrl: process.env.ONRAMP_WIDGET_URL || null,
    coinCode: "USDT",
    network: "bep20",
    chainId: 56
  });

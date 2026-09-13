export default async function handler(req, res) {
  const providers = [];

  if (process.env.ONRAMP_WIDGET_URL) {
    providers.push({
      type: "onramp",
      name:
        process.env.ONRAMP_PROVIDER_NAME ||
        "Configured On-Ramp",
      widgetUrl:
        process.env.ONRAMP_WIDGET_URL
    });
  }

  if (process.env.OFFRAMP_WIDGET_URL) {
    providers.push({
      type: "offramp",
      name:
        process.env.OFFRAMP_PROVIDER_NAME ||
        "Configured Off-Ramp",
      widgetUrl:
        process.env.OFFRAMP_WIDGET_URL
    });
  }

  return res.status(200).json({
    ok: true,
    chain: "BNB Smart Chain",
    asset: "USDT",
    providers
  });
}

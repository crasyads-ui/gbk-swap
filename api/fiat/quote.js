const ROUTER =
  "0x10ED43C718714eb63d5aA57B78B54704E256024E";

const WBNB =
  "0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const USDT =
  "0x55d398326f99059fF775485246999027B3197955";

const RPC =
  process.env.BSC_RPC_URL ||
  "https://bsc-dataseed.binance.org/";

const GBK = process.env.GBK_TOKEN_ADDRESS;

function cleanAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(value || "");
}

function pad64(hex) {
  return hex.replace(/^0x/, "").padStart(64, "0");
}

function encodeAddress(address) {
  return pad64(address.toLowerCase());
}

function encodeUint(value) {
  return pad64(BigInt(value).toString(16));
}

function selector(signature) {
  const selectors = {
    decimals: "313ce567",
    getAmountsOut: "d06ca61f"
  };

  return selectors[signature];
}

async function rpc(method, params) {
  const response = await fetch(RPC, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params
    })
  });

  if (!response.ok) {
    throw new Error("BNB Chain RPC request failed");
  }

  const json = await response.json();

  if (json.error) {
    throw new Error(json.error.message || "RPC error");
  }

  return json.result;
}

async function tokenDecimals(token) {
  const data = "0x" + selector("decimals");

  const result = await rpc("eth_call", [
    {
      to: token,
      data
    },
    "latest"
  ]);

  return Number(BigInt(result));
}

async function getAmountsOut(amountIn, path) {
  const selectorHex = selector("getAmountsOut");

  const offset = encodeUint(64);
  const length = encodeUint(path.length);

  const addresses = path.map(encodeAddress).join("");

  const data =
    "0x" +
    selectorHex +
    encodeUint(amountIn) +
    offset +
    length +
    addresses;

  const result = await rpc("eth_call", [
    {
      to: ROUTER,
      data
    },
    "latest"
  ]);

  const hex = result.replace(/^0x/, "");

  const count = Number(BigInt("0x" + hex.slice(64, 128)));

  const amounts = [];

  for (let i = 0; i < count; i++) {
    const start = 128 + i * 64;
    amounts.push(BigInt("0x" + hex.slice(start, start + 64)));
  }

  return amounts;
}

function formatUnits(value, decimals) {
  const negative = value < 0n;
  const absolute = negative ? -value : value;

  const text = absolute.toString().padStart(decimals + 1, "0");

  const whole =
    text.slice(0, -decimals) || "0";

  const fraction =
    text.slice(-decimals).replace(/0+$/, "");

  return (
    (negative ? "-" : "") +
    whole +
    (fraction ? "." + fraction : "")
  );
}

export default async function handler(req, res) {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "Method not allowed"
      });
    }

    if (!cleanAddress(GBK)) {
      return res.status(500).json({
        ok: false,
        error: "GBK_TOKEN_ADDRESS is not configured"
      });
    }

    const body =
      req.method === "POST"
        ? req.body || {}
        : req.query || {};

    const from =
      String(body.from || "").toUpperCase();

    const amount =
      String(body.amount || "").trim();

    if (!["GBK", "USDT"].includes(from)) {
      return res.status(400).json({
        ok: false,
        error: "from must be GBK or USDT"
      });
    }

    if (!amount || !/^\d+(\.\d+)?$/.test(amount)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid amount"
      });
    }

    const tokenIn =
      from === "GBK" ? GBK : USDT;

    const tokenOut =
      from === "GBK" ? USDT : GBK;

    const decimalsIn =
      await tokenDecimals(tokenIn);

    const decimalsOut =
      await tokenDecimals(tokenOut);

    const [whole, fraction = ""] =
      amount.split(".");

    const fractionPadded =
      fraction
        .slice(0, decimalsIn)
        .padEnd(decimalsIn, "0");

    const amountIn =
      BigInt(whole) *
        10n ** BigInt(decimalsIn) +
      BigInt(fractionPadded || "0");

    if (amountIn <= 0n) {
      return res.status(400).json({
        ok: false,
        error: "Amount must be greater than zero"
      });
    }

    const path = [
      tokenIn,
      WBNB,
      tokenOut
    ];

    let amounts;

    try {
      amounts = await getAmountsOut(
        amountIn,
        path
      );
    } catch {
      return res.status(400).json({
        ok: false,
        error: "No PancakeSwap route available for this amount"
      });
    }

    const received =
      amounts[amounts.length - 1];

    const output =
      formatUnits(
        received,
        decimalsOut
      );

    return res.status(200).json({
      ok: true,
      chain: "BNB Smart Chain",
      router: ROUTER,
      from,
      to: from === "GBK" ? "USDT" : "GBK",
      amountIn: amount,
      amountOut: output,
      path,
      slippageDefault: 0.5
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || "Quote service failed"
    });
  }
}

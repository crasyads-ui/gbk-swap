<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>GBK Buy & Sell</title>

  <style>
    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      background: #ffffff;
      font-family: Arial, sans-serif;
    }

    body {
      display: flex;
      justify-content: center;
    }

    .container {
      width: 100%;
      max-width: 480px;
      min-height: 100vh;
      padding: 12px;
      background: #ffffff;
    }

    .header {
      text-align: center;
      padding: 10px 0 14px;
    }

    .logo {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .subtitle {
      margin-top: 4px;
      font-size: 13px;
      color: #777;
    }

    .widget {
      width: 100%;
      height: 760px;
      border: 0;
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
    }

    .loading {
      text-align: center;
      color: #777;
      padding: 20px;
      font-size: 14px;
    }
  </style>
</head>

<body>

  <div class="container">

    <div class="header">
      <div class="logo">GBK</div>
      <div class="subtitle">
        Buy & Sell Crypto with Local Currency
      </div>
    </div>

    <div class="loading" id="loading">
      Loading secure payment widget...
    </div>

    <iframe
      id="onramper-widget"
      class="widget"
      title="GBK Buy and Sell"
      allow="accelerometer; autoplay; camera; gyroscope; payment"
      src=""
    ></iframe>

  </div>

  <script>
    /*
      ==========================================
      GBK ONRAMPER WIDGET
      ==========================================
    */

    // TEST KEY FOR NOW
    // Replace with pk_prod_... only after production approval.
    const ONRAMPER_API_KEY = "pk_test_YOUR_TEST_KEY";

    /*
      Onramper test widget
    */
    const baseUrl = "https://buy.onramper.dev/";

    const params = new URLSearchParams();

    // API key
    params.set("apiKey", ONRAMPER_API_KEY);

    // Show Buy + Sell
    params.set("mode", "buy,sell");

    // India
    params.set("country", "in");

    // INR
    params.set("defaultFiat", "INR");

    /*
      BUY
      INR -> USDT -> BNB Smart Chain
    */
    params.set("defaultCrypto", "USDT");
    params.set("onlyCryptos", "USDT");
    params.set("onlyCryptoNetworks", "bsc");

    /*
      Mobile checkout
    */
    params.set("redirectAtCheckout", "true");

    /*
      Build widget URL
    */
    const widgetUrl =
      baseUrl + "?" + params.toString();

    /*
      Load widget
    */
    const widget =
      document.getElementById("onramper-widget");

    const loading =
      document.getElementById("loading");

    widget.src = widgetUrl;

    widget.onload = function () {
      loading.style.display = "none";
    };

    /*
      Basic API-key protection against
      accidentally deploying without a key.
    */
    if (
      !ONRAMPER_API_KEY ||
      ONRAMPER_API_KEY.includes("YOUR_TEST_KEY")
    ) {
      loading.innerHTML =
        "Add your Onramper test public API key first.";
    }
  </script>

</body>
</html>

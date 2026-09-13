# GBK Swap — BNB Smart Chain

## Deploy
Upload this folder to the Vercel project used by `swap.gbkai.com`.

Set these Vercel Environment Variables:
- `TRANSAK_API_KEY`
- `TRANSAK_API_SECRET`

The Transak partner domain must have `swap.gbkai.com` whitelisted in the provider dashboard.

## WalletConnect
Edit `index.html` and replace:
`REPLACE_WITH_WALLETCONNECT_PROJECT_ID`
with the public WalletConnect/Reown project ID.

## Important
- Never put `TRANSAK_API_SECRET` in `index.html`.
- GBK/USDT balances are read directly from BNB Smart Chain.
- Swap quotes are read from PancakeSwap V2 Router.
- The user signs approvals/swaps in their wallet.
- Fiat is provider-controlled and availability depends on country, payment method, limits and KYC.
- Transak's current API-based widget URL flow requires a backend session; the frontend must not call sensitive partner endpoints directly.
- Transak off-ramp/SELL availability must be enabled for the partner account. If the provider account does not have SELL enabled, the UI will report the provider error rather than pretending it is available.

const GBK_WALLET_FIX_VERSION="2026-09-14-wallet-v5";

self.addEventListener("install",()=>self.skipWaiting());

self.addEventListener("activate",(event)=>{
 event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.map(key=>caches.delete(key))))
  .then(()=>self.clients.claim())
 );
});

async function transformGBKIndex(response){
 try{
  const html=await response.text();
  if(!html.includes("GBK SWAP — FINAL WALLET + PANCAKESWAP IMPLEMENTATION")) return response;

  let out=html;

  out=out.replace(
   '<script type="module">',
   '<script src="https://cdn.jsdelivr.net/npm/ethers@6.15.0/dist/ethers.umd.min.js"></script>\n<script type="module">'
  );

  out=out.replace(
   /import \* as ethers from "https:\/\/esm\.sh\/ethers@6\.13\.5";\s*import \{\s*createAppKit\s*\} from "https:\/\/esm\.sh\/@reown\/appkit\?bundle";\s*import \{\s*EthersAdapter\s*\} from "https:\/\/esm\.sh\/@reown\/appkit-adapter-ethers\?bundle";\s*import \{\s*bsc\s*\} from "https:\/\/esm\.sh\/@reown\/appkit\/networks\?bundle";/,
   'const ethers = window.ethers;\nif(!ethers) throw new Error("Ethers library failed to load");'
  );

  const blockStart=out.indexOf("/* =====================================================\n   BSC NETWORK");
  const blockEnd=out.indexOf("/* =====================================================\n   INJECTED WALLET",blockStart);

  if(blockStart>=0 && blockEnd>blockStart){
   const stable=[
    "/* =====================================================",
    "   WALLETCONNECT",
    "   ===================================================== */",
    "",
    "async function useWalletConnect(){",
    " if(!CONFIG.walletConnectProjectId) throw new Error(\"WalletConnect Project ID is missing\");",
    " if(!window.__gbkWCProvider){",
    "  const mod=await import(\"https://esm.sh/@walletconnect/ethereum-provider?bundle\");",
    "  const EthereumProvider=mod.EthereumProvider||mod.default;",
    "  if(!EthereumProvider) throw new Error(\"WalletConnect provider failed to load\");",
    "  window.__gbkWCProvider=await EthereumProvider.init({projectId:CONFIG.walletConnectProjectId,optionalChains:[CONFIG.chainId],rpcMap:{56:CONFIG.rpc},showQrModal:true,metadata:{name:\"GBK Swap\",description:\"GBK Swap on BNB Smart Chain\",url:\"https://swap.gbkai.com\",icons:[]}});",
    "  window.__gbkWCProvider.on(\"accountsChanged\",async(accounts)=>{if(accounts&&accounts[0]){walletProvider=window.__gbkWCProvider;ethersProvider=new ethers.BrowserProvider(walletProvider);signer=await ethersProvider.getSigner();walletAddress=accounts[0];await finishConnection();}else{disconnectWallet();}});",
    "  window.__gbkWCProvider.on(\"chainChanged\",async()=>{try{const chain=await window.__gbkWCProvider.request({method:\"eth_chainId\"});if(String(chain).toLowerCase()!==\"0x38\"){toast(\"Please select BNB Smart Chain in your wallet\");return;}walletProvider=window.__gbkWCProvider;ethersProvider=new ethers.BrowserProvider(walletProvider);signer=await ethersProvider.getSigner();walletAddress=await signer.getAddress();await finishConnection();}catch(e){console.warn(\"WalletConnect chain change\",e);}});",
    "  window.__gbkWCProvider.on(\"disconnect\",()=>disconnectWallet());",
    " }",
    " const provider=window.__gbkWCProvider;",
    " const accounts=await provider.request({method:\"eth_accounts\"}).catch(()=>[]);",
    " if(!accounts||!accounts[0]) await provider.connect();",
    " walletProvider=provider;",
    " ethersProvider=new ethers.BrowserProvider(provider);",
    " const chain=await ethersProvider.getNetwork();",
    " if(Number(chain.chainId)!==CONFIG.chainId) throw new Error(\"Please connect on BNB Smart Chain\");",
    " signer=await ethersProvider.getSigner();",
    " walletAddress=await signer.getAddress();",
    " return true;",
    "}",
    "",
    "/* =====================================================",
    "   INJECTED WALLET"
   ].join("\n");

   out=out.slice(
    0,
    blockStart
   )+stable+out.slice(
    blockEnd+"/* =====================================================\n   INJECTED WALLET".length
   );
  }

  out=out.replace(
   "let appKit=null;",
   "let appKit=null;\nlet wcProvider=null;"
  );

  const headers=new Headers(response.headers);
  headers.set("Cache-Control","no-store");
  headers.set("X-GBK-Wallet-Fix",GBK_WALLET_FIX_VERSION);
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
 }catch(e){
  console.error("GBK wallet transform failed",e);
  return response;
 }
}

self.addEventListener("fetch",(event)=>{
 if(event.request.method!=="GET") return;

 const url=new URL(event.request.url);

 if(
  url.origin===self.location.origin &&
  (url.pathname==="/" || url.pathname==="/index.html")
 ){
  event.respondWith(
   fetch(event.request)
    .then(transformGBKIndex)
    .catch(()=>caches.match(event.request))
  );
 }else{
  event.respondWith(
   fetch(event.request)
    .catch(()=>caches.match(event.request))
  );
 }
});
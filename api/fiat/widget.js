async function getPartnerToken(){
  const key=process.env.TRANSAK_API_KEY,secret=process.env.TRANSAK_API_SECRET;
  if(!key||!secret) throw Error("Transak backend credentials are not configured");
  const r=await fetch("https://api.transak.com/partners/api/v2/refresh-token",{method:"POST",headers:{"x-api-key":key,"api-secret":secret,"content-type":"application/json"},body:JSON.stringify({apiKey:key})});
  const j=await r.json(); if(!r.ok) throw Error(j?.message||"Unable to get Transak access token");
  return j?.data?.accessToken;
}
export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"POST only"});
  try{
    const key=process.env.TRANSAK_API_KEY;
    const {direction,fiatCurrency,fiatAmount,address,country,cryptoCurrencyCode="USDT",network="bsc"}=req.body||{};
    if(!key) throw Error("TRANSAK_API_KEY is not configured");
    if(!fiatCurrency||!fiatAmount||!address||!country) throw Error("Missing fiatCurrency, fiatAmount, country or wallet address");
    const accessToken=await getPartnerToken();
    const host=req.headers.host||"swap.gbkai.com";
    const widgetParams={
      apiKey:key,
      referrerDomain:host,
      productsAvailed:direction==="SELL"?"SELL":"BUY",
      fiatAmount:Number(fiatAmount),
      fiatCurrency:String(fiatCurrency).toUpperCase(),
      cryptoCurrencyCode,
      network,
      walletAddress:address,
      disableWalletAddressForm:true,
      hideExchangeScreen:false,
      themeColor:"#3f806f"
    };
    const r=await fetch("https://api-gateway.transak.com/api/v2/auth/session",{method:"POST",headers:{"x-api-key":key,"access-token":accessToken,"content-type":"application/json","x-user-ip":req.headers["x-forwarded-for"]?.split(",")[0]?.trim()||"0.0.0.0"},body:JSON.stringify({widgetParams})});
    const j=await r.json();if(!r.ok) return res.status(r.status).json({error:j?.message||j?.error?.message||"Unable to create provider session",details:j});
    return res.status(200).json({widgetUrl:j?.data?.widgetUrl});
  }catch(e){return res.status(500).json({error:e.message})}
}
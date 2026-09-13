export default async function handler(req,res){
  try{
    const key=process.env.TRANSAK_API_KEY;
    if(!key) return res.status(500).json({error:"TRANSAK_API_KEY is not configured"});
    const country=String(req.query?.country||"").toUpperCase();
    const r=await fetch("https://api.transak.com/fiat/public/v1/currencies/fiat-currencies",{headers:{"x-api-key":key}});
    const j=await r.json(); if(!r.ok) return res.status(r.status).json({error:j?.message||"Transak error"});
    const all=j.response||[];
    const currencies=all.filter(x=>x.isAllowed!==false && (!country || (x.supportingCountries||[]).includes(country))).map(x=>({
      symbol:x.symbol,name:x.name,paymentOptions:x.paymentOptions||[],supportingCountries:x.supportingCountries||[]
    }));
    return res.status(200).json({defaultCurrency:currencies[0]?.symbol||"",currencies});
  }catch(e){return res.status(500).json({error:e.message})}
}
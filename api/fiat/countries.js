export default async function handler(req,res){
  try{
    const key=process.env.TRANSAK_API_KEY;
    if(!key) return res.status(500).json({error:"TRANSAK_API_KEY is not configured"});
    const r=await fetch("https://api.transak.com/api/v2/countries",{headers:{"x-api-key":key}});
    const j=await r.json();
    return res.status(r.status).json({countries:j.response||j.data||[]});
  }catch(e){return res.status(500).json({error:e.message})}
}
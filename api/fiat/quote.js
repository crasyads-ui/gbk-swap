export default async function handler(req,res){
  try{
    const key=process.env.TRANSAK_API_KEY;
    if(!key) return res.status(500).json({error:"TRANSAK_API_KEY is not configured"});
    const q=new URLSearchParams(req.query||{});
    const url="https://api.transak.com/api/v1/pricing/public/quotes?"+q.toString();
    const r=await fetch(url,{headers:{"x-api-key":key}});
    const j=await r.json();return res.status(r.status).json(j);
  }catch(e){return res.status(500).json({error:e.message})}
}
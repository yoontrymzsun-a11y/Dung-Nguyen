

const BASE='https://api.themoviedb.org/3';
const allowedGenres=new Set(['27','18','28','35','878']);
const allowedCountries=new Set(['US','KR','JP','VN','EU']);
const european=['FR','DE','GB','IT','ES','SE','DK','NO','FI','PL','NL','BE','AT','CH','IE','PT','GR','CZ','HU','RO'];
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'}});
const clean=m=>({id:m.id,title:m.title,year:m.release_date?.slice(0,4)||'',poster_path:m.poster_path||null,vote_average:m.vote_average||0,vote_count:m.vote_count||0,overview:m.overview||''});
async function tmdb(path,token){const r=await fetch(BASE+path,{headers:{Authorization:`Bearer ${token}`,accept:'application/json'}});if(!r.ok)throw Error(`TMDB returned ${r.status}`);return r.json()}
export default async (request)=>{
  if(request.method!=='GET')return json({error:'Method not allowed'},405);
  const token=Netlify.env.get('TMDB_READ_TOKEN')||process.env.TMDB_READ_TOKEN;
  if(!token)return json({error:'Chưa cấu hình TMDB_READ_TOKEN trên Netlify.'},503);
  const url=new URL(request.url),action=url.searchParams.get('action');
  try{
    if(action==='status'){await tmdb('/configuration',token);return json({ok:true})}
    if(action==='search'){
      const q=(url.searchParams.get('q')||'').trim();if(q.length<2||q.length>100)return json({error:'Tên phim phải dài từ 2 đến 100 ký tự'},400);
      const params=new URLSearchParams({query:q,include_adult:'false',language:'en-US',page:'1'});
      const data=await tmdb('/search/movie?'+params,token);
      return json({movies:(data.results||[]).filter(x=>x.title).map(clean).slice(0,20)});
    }
    if(action==='discover'){
      const genre=url.searchParams.get('genre')||'',country=url.searchParams.get('country')||'',era=url.searchParams.get('era')||'',mood=url.searchParams.get('mood')||'';
      if((genre&&!allowedGenres.has(genre))||(country&&!allowedCountries.has(country)))return json({error:'Bộ lọc không hợp lệ'},400);
      const params=new URLSearchParams({sort_by:'popularity.desc',include_adult:'false','vote_count.gte':'30',language:'en-US'});
      if(genre)params.set('with_genres',genre);
      if(country==='EU')params.set('with_origin_country',european.join('|'));
      else if(country)params.set('with_origin_country',country);
      if(era==='Trước 2000')params.set('primary_release_date.lte','1999-12-31');
      else if(era==='2000–2009'){params.set('primary_release_date.gte','2000-01-01');params.set('primary_release_date.lte','2009-12-31')}
      else if(era==='2010–2019'){params.set('primary_release_date.gte','2010-01-01');params.set('primary_release_date.lte','2019-12-31')}
      else if(era==='2020 trở đi')params.set('primary_release_date.gte','2020-01-01');
      const moods={'Căng thẳng':'53','Ấm áp':'10751','Bí ẩn':'9648','Suy ngẫm':'18'};
      if(moods[mood])params.set('with_genres',[genre,moods[mood]].filter(Boolean).join(','));
      let movies=[],seen=new Set();
      for(let page=1;page<=5;page++){
        params.set('page',String(page));const d=await tmdb('/discover/movie?'+params,token);
        for(const m of d.results||[]){if(m.title&&m.release_date&&m.poster_path&&!seen.has(m.id)){seen.add(m.id);movies.push(clean(m))}}
        if(page>=Math.min(d.total_pages||1,5))break;
      }
      return json({movies,moodIsApproximate:!!moods[mood]});
    }
    return json({error:'Unknown action'},400);
  }catch(e){return json({error:'Không thể kết nối TMDB: '+e.message},502)}
};

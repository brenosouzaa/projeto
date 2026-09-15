const {URL,KEY}=window.NFC_CONFIG||{};
    if(!URL||!KEY)throw new Error('Configuração do NFC Point ausente.');
    const app=document.getElementById('app');

    const S=()=>{try{return JSON.parse(localStorage.nfcsession||'null')}catch{return null}};
    const SS=s=>s?localStorage.nfcsession=JSON.stringify(s):localStorage.removeItem('nfcsession');
    const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,60);
    const safe=u=>{try{let x=new URL(u);return /^https?:$/.test(x.protocol)?x.href:''}catch{return''}};
    const initials=n=>String(n||'').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();

    const rootPath=()=>location.pathname.replace(/\/(?:index\.html)?$/,'/') || '/';
    const path=()=>{
      const q=new URLSearchParams(location.search);
      const clean=location.pathname.replace(/\/+$/,'')||'/';
      if(clean==='/admin'||q.get('view')==='admin')return'/admin';
      if(clean.startsWith('/loja/'))return clean;
      if(q.get('loja'))return'/loja/'+q.get('loja');
      return'/';
    };
    const go=p=>{
      history.pushState({},'',p);
      route();
    };
    const pub=(s,src='')=>location.origin+'/loja/'+encodeURIComponent(s)+(src?'?src='+encodeURIComponent(src):'');

    function toast(t,e=0){
      const x=document.createElement('div');
      x.className='toast'+(e?' err':'');
      x.setAttribute('role','status');
      x.textContent=t;
      document.body.append(x);
      setTimeout(()=>x.remove(),2600);
    }

    function setMeta({title='NFC Point — Sua empresa inteira em um toque',description='NFC + QR Code + página digital personalizada para estabelecimentos.',robots='index,follow',canonical=location.origin+'/',image=location.origin+'/og-image.png'}={}){
      document.title=title;
      const set=(sel,attr,value)=>{
        let el=document.querySelector(sel);
        if(!el)return;
        el.setAttribute(attr,value);
      };
      set('meta[name="description"]','content',description);
      set('meta[name="robots"]','content',robots);
      set('meta[property="og:title"]','content',title);
      set('meta[property="og:description"]','content',description);
      set('meta[property="og:image"]','content',image);
      set('meta[property="og:url"]','content',canonical);
      set('meta[name="twitter:title"]','content',title);
      set('meta[name="twitter:description"]','content',description);
      set('meta[name="twitter:image"]','content',image);
      set('link[rel="canonical"]','href',canonical);
    }

    function clearSchema(){
      document.getElementById('local-business-schema')?.remove();
    }

    function setLocalBusinessSchema(s,canonical){
      clearSchema();
      const data={
        '@context':'https://schema.org',
        '@type':'LocalBusiness',
        name:s.name,
        url:canonical
      };
      if(s.description)data.description=s.description;
      if(s.address)data.address=s.address;
      if(s.logo_url&&safe(s.logo_url))data.image=safe(s.logo_url);
      const sameAs=[];
      const site=safe(s.website_url);
      if(site)sameAs.push(site);
      let ig=String(s.instagram||'').trim().replace(/^@/,'');
      if(ig){
        const igUrl=ig.startsWith('http')?safe(ig):'https://instagram.com/'+encodeURIComponent(ig);
        if(igUrl)sameAs.push(igUrl);
      }
      if(sameAs.length)data.sameAs=sameAs;
      const el=document.createElement('script');
      el.type='application/ld+json';
      el.id='local-business-schema';
      el.textContent=JSON.stringify(data);
      document.head.appendChild(el);
    }

    async function req(p,o={}){
      const s=S(),h={apikey:KEY,'Content-Type':'application/json'};
      if(o.auth!==false&&s?.access_token)h.Authorization='Bearer '+s.access_token;
      if(o.prefer)h.Prefer=o.prefer;
      const r=await fetch(URL+'/rest/v1/'+p,{
        method:o.method||'GET',
        headers:h,
        body:o.body?JSON.stringify(o.body):undefined
      });
      const t=await r.text();
      let d=null;
      try{d=t?JSON.parse(t):null}catch{d=t}
      if(r.status===401&&s?.refresh_token&&!o.retry){
        const ok=await refresh();
        if(ok)return req(p,{...o,retry:true});
      }
      if(!r.ok)throw Error(d?.message||d?.error_description||'Erro '+r.status);
      return d;
    }

    async function refresh(){
      const s=S();
      if(!s?.refresh_token)return false;
      const r=await fetch(URL+'/auth/v1/token?grant_type=refresh_token',{
        method:'POST',
        headers:{apikey:KEY,'Content-Type':'application/json'},
        body:JSON.stringify({refresh_token:s.refresh_token})
      });
      if(!r.ok){SS(null);return false}
      SS(await r.json());
      return true;
    }

    async function login(email,password){
      const r=await fetch(URL+'/auth/v1/token?grant_type=password',{
        method:'POST',
        headers:{apikey:KEY,'Content-Type':'application/json'},
        body:JSON.stringify({email,password})
      });
      const d=await r.json();
      if(!r.ok)throw Error(d.error_description||d.msg||d.message||'Falha ao entrar');
      SS(d);
    }

    async function signup(email,password){
      const r=await fetch(URL+'/auth/v1/signup',{
        method:'POST',
        headers:{apikey:KEY,'Content-Type':'application/json'},
        body:JSON.stringify({email,password})
      });
      const d=await r.json();
      if(!r.ok)throw Error(d.error_description||d.msg||d.message||'Falha ao criar conta');
      if(d.access_token)SS(d);
      return d;
    }

    async function stores(){
      const u=S()?.user?.id;
      if(!u)return[];
      return req('stores?owner_id=eq.'+encodeURIComponent(u)+'&select=*&order=created_at.desc');
    }

    async function events(){
      return req('events?select=store_id,event_type,target,created_at&created_at=gte.'+encodeURIComponent(new Date(Date.now()-30*864e5).toISOString()));
    }

    async function storeBySlug(s){
      const d=await req('stores?slug=eq.'+encodeURIComponent(s)+'&is_active=eq.true&select=*&limit=1',{auth:false});
      return d?.[0];
    }

    async function track(id,type,target=''){
      try{
        await req('events',{
          method:'POST',
          body:{store_id:id,event_type:type,target},
          auth:false,
          prefer:'return=minimal'
        });
      }catch{}
    }


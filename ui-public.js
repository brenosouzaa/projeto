function privacyPage(){
  clearSchema();
  setMeta({title:'Política de privacidade | NFC Point',description:'Política de privacidade do NFC Point.',canonical:siteRoot()+'?view=privacy'});
  app.innerHTML=`<div class="wrap top"><a class="brand" href="/" data-go aria-label="NFC Point — início"><div class="logo" aria-hidden="true">N</div>NFC Point</a><a class="btn sm" href="/" data-go>Voltar</a></div><main class="wrap section" style="border-top:0;padding-top:42px"><div class="card" style="max-width:820px;margin:auto"><div class="mut small">Última atualização: 15 de setembro de 2026</div><h1 style="font-size:clamp(34px,6vw,52px);letter-spacing:-.04em;margin:8px 0 20px">Política de privacidade</h1><p class="sectionlead">Esta política explica como o NFC Point trata informações necessárias para disponibilizar páginas digitais de estabelecimentos, administrar contas e gerar métricas de uso.</p><h3>Informações tratadas</h3><p class="mut">Podemos tratar dados cadastrados no painel, como e-mail de acesso e informações fornecidas pelo responsável do estabelecimento. Nas páginas públicas, o sistema também registra eventos de uso, como visualizações, origem do acesso por NFC ou QR Code e cliques em links.</p><h3>Finalidades</h3><p class="mut">Os dados são usados para autenticação, funcionamento do painel, publicação e atualização das páginas, segurança do serviço e apresentação de métricas ao responsável pelo estabelecimento.</p><h3>Infraestrutura e compartilhamento</h3><p class="mut">O NFC Point utiliza provedores técnicos necessários para autenticação, banco de dados e operação do serviço. O NFC Point não vende dados pessoais. Informações podem ser processadas por esses provedores ou quando houver obrigação legal.</p><h3>Links externos</h3><p class="mut">As páginas podem conter links para serviços externos, como WhatsApp, Instagram, Google Maps e sites. Ao acessar esses serviços, também se aplicam as políticas de cada plataforma.</p><h3>Retenção e segurança</h3><p class="mut">Buscamos manter somente os dados necessários à operação do serviço e aplicar medidas razoáveis de segurança compatíveis com a natureza do sistema.</p><h3>Solicitações de privacidade</h3><p class="mut">Pedidos relacionados a acesso, correção ou exclusão de dados podem ser feitos pelos canais oficiais informados na contratação ou no atendimento do NFC Point.</p></div></main>`;
}

function notFound(message='Página inexistente ou desativada.'){
  clearSchema();
  setMeta({title:'Página não encontrada | NFC Point',description:'A página solicitada não foi encontrada.',robots:'noindex,nofollow',canonical:location.href});
  app.innerHTML=`<div class="auth"><div class="authbox notfound"><div class="brand" style="justify-content:center"><div class="logo" aria-hidden="true">N</div>NFC Point</div><h1>404</h1><p class="mut">${esc(message)}</p><a class="btn pri" href="/" data-go>Ir para o início</a></div></div>`;
}

function catalogPrice(v){
  const t=String(v||'').trim();if(!t)return'';
  if(/^r\$/i.test(t))return t;
  if(/^\d+(?:[.,]\d{1,2})?$/.test(t))return 'R$ '+t.replace('.',',');
  return t;
}

function openNativeCatalog(s,c){
  const items=Array.isArray(s.catalog_items)?s.catalog_items:[];
  const overlay=document.createElement('div');overlay.className='catalog-overlay';
  const categories=[...new Set(items.map(i=>String(i.category||'').trim()).filter(Boolean))];
  const renderItems=filter=>{
    const list=filter?items.filter(i=>String(i.category||'').trim()===filter):items;
    return list.length?list.map(i=>{
      const img=safe(i.image_url),price=catalogPrice(i.price),available=i.available!==false;
      return `<article class="catalog-product ${available?'':'is-unavailable'}">${img?`<div class="catalog-product-img"><img src="${esc(img)}" alt="${esc(i.name||'Item do catálogo')}"></div>`:''}<div class="catalog-product-body"><div class="catalog-product-top"><h3>${esc(i.name||'Item')}</h3>${price?`<b class="catalog-price">${esc(price)}</b>`:''}</div>${i.description?`<p>${esc(i.description)}</p>`:''}<div class="catalog-product-meta">${i.category?`<span>${esc(i.category)}</span>`:''}${available?'':'<span class="catalog-unavailable">Indisponível</span>'}</div></div></article>`;
    }).join(''):'<div class="catalog-empty">Nenhum item cadastrado nesta categoria.</div>';
  };
  overlay.innerHTML=`<div class="catalog-shell"><header class="catalog-head"><button class="catalog-close" type="button" aria-label="Fechar catálogo">←</button><div class="catalog-store"><div class="catalog-mini-logo" style="background:${esc(c)}">${safe(s.logo_url)?`<img src="${esc(safe(s.logo_url))}" alt="">`:esc(initials(s.name))}</div><div><div class="small mut">${esc(s.name)}</div><h2>${esc(s.catalog_title||'Veja o cardápio / catálogo')}</h2></div></div></header><div class="catalog-intro"><p>${esc(s.catalog_subtitle||'Conheça nossas opções')}</p>${categories.length?`<div class="catalog-filters"><button class="catalog-filter on" data-cat="">Todos</button>${categories.map(cat=>`<button class="catalog-filter" data-cat="${esc(cat)}">${esc(cat)}</button>`).join('')}</div>`:''}</div><div class="catalog-products" id="catalog-products">${renderItems('')}</div><div class="catalog-powered">Atualizado pelo estabelecimento • NFC Point</div></div>`;
  document.body.append(overlay);document.body.classList.add('catalog-open');track(s.id,'link_click','catalog');
  const escClose=e=>{if(e.key==='Escape')close()};
  const close=()=>{overlay.remove();document.body.classList.remove('catalog-open');document.removeEventListener('keydown',escClose)};
  overlay.querySelector('.catalog-close').onclick=close;
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  document.addEventListener('keydown',escClose);
  overlay.querySelectorAll('.catalog-filter').forEach(b=>b.onclick=()=>{overlay.querySelectorAll('.catalog-filter').forEach(x=>x.classList.toggle('on',x===b));overlay.querySelector('#catalog-products').innerHTML=renderItems(b.dataset.cat||'')});
}

async function publicPage(sl){
  app.innerHTML='<div class="auth"><div class="mut">Abrindo…</div></div>';
  try{
    const s=await storeBySlug(sl);if(!s){notFound();return}
    const src=new URLSearchParams(location.search).get('src'),type=src==='nfc'?'nfc_open':src==='qr'?'qr_open':'page_view';track(s.id,type);
    const canonical=pub(s.slug),description=(s.description||`${s.name} — ${s.category||'estabelecimento'}`).slice(0,155),logo=safe(s.logo_url);
    setMeta({title:`${s.name} | NFC Point`,description,canonical,image:logo});setLocalBusinessSchema(s,canonical);
    const c=/^#[0-9a-f]{6}$/i.test(String(s.accent_color||''))?s.accent_color:'#7c3aed',links=[],add=(l,u,i,t)=>{if(u)links.push({l,u,i,t})},wa=String(s.whatsapp||'').replace(/\D/g,'');
    add('Falar no WhatsApp',wa?'https://wa.me/'+(wa.startsWith('55')?wa:'55'+wa):'','💬','whatsapp');let ig=String(s.instagram||'').trim().replace(/^@/,'');add('Instagram',ig?(ig.startsWith('http')?safe(ig):'https://instagram.com/'+encodeURIComponent(ig)):'','📸','instagram');
    const maps=safe(s.maps_url)||(s.address?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.address):'');add('Como chegar',maps,'📍','maps');add('Visitar site',safe(s.website_url),'🌐','website');
    const catalogOn=!!s.catalog_enabled;
    app.innerHTML=`<div class="public"><main class="profile"><div class="ptop"><div class="plogo" style="background:${esc(c)}">${logo?`<img src="${esc(logo)}" alt="Logo de ${esc(s.name)}">`:esc(initials(s.name))}</div><h1>${esc(s.name)}</h1><div class="mut small">${esc(s.category)}</div>${s.description?`<p>${esc(s.description)}</p>`:''}</div><div class="links">${catalogOn?`<button class="plink catalog-launch" id="catalog-launch" type="button"><span class="pi" style="background:${esc(c)}" aria-hidden="true">▤</span><span class="plink-copy"><b>${esc(s.catalog_title||'Veja o cardápio / catálogo')}</b><small>${esc(s.catalog_subtitle||'Conheça nossas opções')}</small></span><span style="margin-left:auto" aria-hidden="true">›</span></button>`:''}${links.map(l=>`<a class="plink" target="_blank" rel="noopener" href="${esc(l.u)}" data-track="${l.t}"><span class="pi" style="background:${esc(c)}" aria-hidden="true">${l.i}</span>${esc(l.l)}<span style="margin-left:auto" aria-hidden="true">›</span></a>`).join('')}</div>${s.address||s.hours?`<div class="info">${s.address?`<p><b>📍 Endereço</b><br><span class="mut small">${esc(s.address)}</span></p>`:''}${s.hours?`<p><b>🕒 Horários</b><br><span class="mut small">${esc(s.hours)}</span></p>`:''}</div>`:''}<div class="foot">Página digital por <b>NFC Point</b> · <a href="/privacy" data-go>Privacidade</a></div></main></div>`;
    if(catalogOn)document.getElementById('catalog-launch').onclick=()=>openNativeCatalog(s,c);
    document.querySelectorAll('[data-track]').forEach(a=>a.onclick=()=>track(s.id,'link_click',a.dataset.track));
  }catch(e){clearSchema();app.innerHTML=`<div class="auth"><div class="authbox"><h1>Erro</h1><p class="err">${esc(e.message)}</p><a class="btn" href="/" data-go>Voltar</a></div></div>`}
}

function route(){const p=path();if(p==='/')landing();else if(p==='/admin')auth();else if(p==='/privacy')privacyPage();else if(p.startsWith('/loja/'))publicPage(decodeURIComponent(p.slice(6)));else notFound()}
route();
addEventListener('popstate',route);
document.addEventListener('click',e=>{const a=e.target.closest('[data-go]');if(a){e.preventDefault();go(a.getAttribute('href'))}});

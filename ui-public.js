function privacyPage(){
  clearSchema();
  setMeta({title:'Política de privacidade | NFC Point',description:'Política de privacidade do NFC Point.',canonical:siteRoot()+'?view=privacy'});
  app.innerHTML=`<div class="wrap top"><a class="brand" href="/" data-go aria-label="NFC Point — início"><div class="logo" aria-hidden="true">N</div>NFC Point</a><a class="btn sm" href="/" data-go>Voltar</a></div><main class="wrap section" style="border-top:0;padding-top:42px"><div class="card" style="max-width:820px;margin:auto"><div class="mut small">Última atualização: 15 de setembro de 2026</div><h1 style="font-size:clamp(34px,6vw,52px);letter-spacing:-.04em;margin:8px 0 20px">Política de privacidade</h1><p class="sectionlead">Esta política explica como o NFC Point trata informações necessárias para disponibilizar páginas digitais de estabelecimentos, administrar contas e gerar métricas de uso.</p><h3>Informações tratadas</h3><p class="mut">Podemos tratar dados cadastrados no painel, como e-mail de acesso e informações fornecidas pelo responsável do estabelecimento. Nas páginas públicas, o sistema também registra eventos de uso, como visualizações, origem do acesso por NFC ou QR Code e cliques em links.</p><h3>Finalidades</h3><p class="mut">Os dados são usados para autenticação, funcionamento do painel, publicação e atualização das páginas, segurança do serviço e apresentação de métricas ao responsável pelo estabelecimento.</p><h3>Infraestrutura e compartilhamento</h3><p class="mut">O NFC Point utiliza provedores técnicos necessários para autenticação, banco de dados e operação do serviço. O NFC Point não vende dados pessoais. Informações podem ser processadas por esses provedores ou quando houver obrigação legal.</p><h3>Links externos</h3><p class="mut">As páginas podem conter links para serviços externos, como WhatsApp, Instagram, Google Maps, catálogos e sites. Ao acessar esses serviços, também se aplicam as políticas de cada plataforma.</p><h3>Retenção e segurança</h3><p class="mut">Buscamos manter somente os dados necessários à operação do serviço e aplicar medidas razoáveis de segurança compatíveis com a natureza do sistema.</p><h3>Solicitações de privacidade</h3><p class="mut">Pedidos relacionados a acesso, correção ou exclusão de dados podem ser feitos pelos canais oficiais informados na contratação ou no atendimento do NFC Point.</p></div></main>`;
}

function notFound(message='Página inexistente ou desativada.'){
  clearSchema();
  setMeta({title:'Página não encontrada | NFC Point',description:'A página solicitada não foi encontrada.',robots:'noindex,nofollow',canonical:location.href});
  app.innerHTML=`<div class="auth"><div class="authbox notfound"><div class="brand" style="justify-content:center"><div class="logo" aria-hidden="true">N</div>NFC Point</div><h1>404</h1><p class="mut">${esc(message)}</p><a class="btn pri" href="/" data-go>Ir para o início</a></div></div>`;
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
    const maps=safe(s.maps_url)||(s.address?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.address):'');add('Como chegar',maps,'📍','maps');add('Ver catálogo / cardápio',safe(s.catalog_url),'📋','catalog');add('Visitar site',safe(s.website_url),'🌐','website');
    app.innerHTML=`<div class="public"><main class="profile"><div class="ptop"><div class="plogo" style="background:${esc(c)}">${logo?`<img src="${esc(logo)}" alt="Logo de ${esc(s.name)}">`:esc(initials(s.name))}</div><h1>${esc(s.name)}</h1><div class="mut small">${esc(s.category)}</div>${s.description?`<p>${esc(s.description)}</p>`:''}</div><div class="links">${links.map(l=>`<a class="plink" target="_blank" rel="noopener" href="${esc(l.u)}" data-track="${l.t}"><span class="pi" style="background:${esc(c)}" aria-hidden="true">${l.i}</span>${esc(l.l)}<span style="margin-left:auto" aria-hidden="true">›</span></a>`).join('')}</div>${s.address||s.hours?`<div class="info">${s.address?`<p><b>📍 Endereço</b><br><span class="mut small">${esc(s.address)}</span></p>`:''}${s.hours?`<p><b>🕒 Horários</b><br><span class="mut small">${esc(s.hours)}</span></p>`:''}</div>`:''}<div class="foot">Página digital por <b>NFC Point</b> · <a href="/privacy" data-go>Privacidade</a></div></main></div>`;
    document.querySelectorAll('[data-track]').forEach(a=>a.onclick=()=>track(s.id,'link_click',a.dataset.track));
  }catch(e){clearSchema();app.innerHTML=`<div class="auth"><div class="authbox"><h1>Erro</h1><p class="err">${esc(e.message)}</p><a class="btn" href="/" data-go>Voltar</a></div></div>`}
}

function route(){const p=path();if(p==='/')landing();else if(p==='/admin')auth();else if(p==='/privacy')privacyPage();else if(p.startsWith('/loja/'))publicPage(decodeURIComponent(p.slice(6)));else notFound()}
route();
addEventListener('popstate',route);
document.addEventListener('click',e=>{const a=e.target.closest('[data-go]');if(a){e.preventDefault();go(a.getAttribute('href'))}});

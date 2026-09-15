function catalogItemTemplate(item={}){
  const id=item.id||((crypto?.randomUUID&&crypto.randomUUID())||('item-'+Date.now()+'-'+Math.random().toString(16).slice(2)));
  const image=safe(item.image_url||'');
  return `<div class="catalog-edit-item" data-id="${esc(id)}" data-image="${esc(image)}">
    <div class="catalog-edit-head">
      <div><b>Item do catálogo</b><div class="mut small">Produto, serviço, prato ou opção.</div></div>
      <button class="btn sm danger catalog-remove" type="button">Remover</button>
    </div>
    <div class="formgrid">
      <div class="field"><label>Nome *</label><input class="input ci-name" value="${esc(item.name||'')}" placeholder="Ex.: Cappuccino especial" required></div>
      <div class="field"><label>Preço</label><input class="input ci-price" value="${esc(item.price||'')}" placeholder="Ex.: 18,90"></div>
      <div class="field"><label>Categoria</label><input class="input ci-category" value="${esc(item.category||'')}" placeholder="Ex.: Cafés"></div>
      <div class="field"><label>Foto</label><input class="input fileinput ci-file" type="file" accept="image/jpeg,image/png,image/webp"></div>
    </div>
    <div class="field"><label>Descrição</label><textarea class="textarea ci-description" placeholder="Uma descrição curta e objetiva.">${esc(item.description||'')}</textarea></div>
    <div class="catalog-edit-foot">
      <label class="checkline"><input class="ci-available" type="checkbox" ${item.available===false?'':'checked'}> Disponível</label>
      ${image?`<a class="catalog-thumb-link" href="${esc(image)}" target="_blank" rel="noopener"><img class="catalog-thumb" src="${esc(image)}" alt="Foto atual do item"></a>`:'<span class="mut small">Imagem opcional</span>'}
    </div>
  </div>`;
}

async function uploadCatalogImage(file,storeSlug,itemId){
  if(!file)return'';
  const allowed=['image/jpeg','image/png','image/webp'];
  if(!allowed.includes(file.type))throw Error('Use imagem JPG, PNG ou WebP.');
  if(file.size>4*1024*1024)throw Error('A imagem deve ter no máximo 4 MB.');
  const uid=S()?.user?.id;if(!uid)throw Error('Sessão expirada. Entre novamente.');
  const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
  const cleanSlug=slug(storeSlug)||'loja';
  const path=[uid,'catalog',cleanSlug,`${itemId}-${Date.now()}.${ext}`].map(encodeURIComponent).join('/');
  const r=await fetch(URL+'/storage/v1/object/nfcpoint-media/'+path,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+S().access_token,'Content-Type':file.type,'x-upsert':'false'},body:file});
  if(!r.ok){let d={};try{d=await r.json()}catch{}throw Error(d.message||d.error||'Não foi possível enviar a imagem.');}
  return URL+'/storage/v1/object/public/nfcpoint-media/'+path;
}

function modal(s=null){
  const x=s||{name:'',category:'Estabelecimento',slug:'',description:'',logo_url:'',accent_color:'#7c3aed',whatsapp:'',instagram:'',maps_url:'',catalog_url:'',website_url:'',address:'',hours:'',is_active:true,catalog_enabled:false,catalog_title:'Veja o cardápio / catálogo',catalog_subtitle:'Conheça nossas opções',catalog_items:[]};
  const currentItems=Array.isArray(x.catalog_items)?x.catalog_items:[];
  const m=document.createElement('div');
  m.className='modalbg';
  m.innerHTML=`
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">${s?'Editar':'Novo'} estabelecimento</h2>
      <form id="sf">
        <div class="formgrid">
          <div class="field"><label for="n">Nome *</label><input class="input" id="n" value="${esc(x.name)}" required></div>
          <div class="field"><label for="sl">Slug *</label><input class="input" id="sl" value="${esc(x.slug)}" required></div>
          <div class="field"><label for="cat">Categoria</label><input class="input" id="cat" value="${esc(x.category)}"></div>
          <div class="field"><label for="co">Cor</label><input class="input" id="co" type="color" value="${esc(x.accent_color||'#7c3aed')}"></div>
        </div>
        <div class="field"><label for="de">Descrição</label><textarea class="textarea" id="de">${esc(x.description)}</textarea></div>
        <div class="formgrid">
          <div class="field"><label for="wa">WhatsApp</label><input class="input" id="wa" value="${esc(x.whatsapp)}" placeholder="5511999999999"></div>
          <div class="field"><label for="ig">Instagram</label><input class="input" id="ig" value="${esc(x.instagram)}" placeholder="@perfil"></div>
          <div class="field"><label for="ad">Endereço</label><input class="input" id="ad" value="${esc(x.address)}"></div>
          <div class="field"><label for="hr">Horário</label><input class="input" id="hr" value="${esc(x.hours)}"></div>
          <div class="field"><label for="mp">Google Maps URL</label><input class="input" id="mp" type="url" value="${esc(x.maps_url)}"></div>
          <div class="field"><label for="web">Site URL</label><input class="input" id="web" type="url" value="${esc(x.website_url)}"></div>
          <div class="field"><label for="lo">Logo URL</label><input class="input" id="lo" type="url" value="${esc(x.logo_url||'')}"></div>
        </div>

        <section class="catalog-admin-card">
          <div class="catalog-admin-top">
            <div>
              <div class="catalog-kicker">RECURSO MENSAL</div>
              <h3>Cardápio / catálogo</h3>
              <p class="mut">Mantenha produtos, serviços e preços atualizados sem alterar o link NFC.</p>
            </div>
            <label class="switchline"><input type="checkbox" id="catalog-enabled" ${x.catalog_enabled?'checked':''}><span class="switch" aria-hidden="true"></span><b>Habilitar</b></label>
          </div>
          <div id="catalog-config">
            <div class="formgrid">
              <div class="field"><label for="catalog-title">Título</label><input class="input" id="catalog-title" value="${esc(x.catalog_title||'Veja o cardápio / catálogo')}"></div>
              <div class="field"><label for="catalog-subtitle">Subtítulo</label><input class="input" id="catalog-subtitle" value="${esc(x.catalog_subtitle||'Conheça nossas opções')}"></div>
            </div>
            <div class="catalog-admin-bar"><div><b>Itens</b><div class="mut small">Você pode alterar preços e disponibilidade quando quiser.</div></div><button type="button" class="btn sm" id="add-catalog-item">+ Adicionar item</button></div>
            <div id="catalog-items" class="catalog-edit-list">${currentItems.map(catalogItemTemplate).join('')}</div>
          </div>
        </section>

        <label class="checkline page-active"><input type="checkbox" id="act" ${x.is_active?'checked':''}> Página ativa</label>
        <div class="modalfoot">
          ${s?'<button type="button" class="btn danger" id="del">Excluir</button>':''}
          <button type="button" class="btn" id="cancel">Cancelar</button>
          <button class="btn pri" id="save">Salvar</button>
        </div>
      </form>
    </div>`;
  document.body.append(m);
  const q=id=>m.querySelector('#'+id);
  const n=q('n'),sl=q('sl'),cat=q('cat'),co=q('co'),de=q('de'),wa=q('wa'),ig=q('ig'),ad=q('ad'),hr=q('hr'),mp=q('mp'),web=q('web'),lo=q('lo'),act=q('act'),sf=q('sf'),catalogEnabled=q('catalog-enabled'),catalogConfig=q('catalog-config'),catalogItems=q('catalog-items');
  const syncCatalogVisibility=()=>catalogConfig.classList.toggle('catalog-disabled',!catalogEnabled.checked);
  syncCatalogVisibility();catalogEnabled.onchange=syncCatalogVisibility;
  q('add-catalog-item').onclick=()=>{catalogItems.insertAdjacentHTML('beforeend',catalogItemTemplate());catalogItems.lastElementChild?.scrollIntoView({behavior:'smooth',block:'nearest'})};
  catalogItems.addEventListener('click',e=>{const b=e.target.closest('.catalog-remove');if(b)b.closest('.catalog-edit-item')?.remove()});
  q('cancel').onclick=()=>m.remove();
  let touched=!!s;
  n.oninput=()=>{if(!touched)sl.value=slug(n.value)};
  sl.oninput=()=>{touched=true;sl.value=slug(sl.value)};
  sf.onsubmit=async e=>{
    e.preventDefault();
    const save=q('save');save.disabled=true;save.textContent='Salvando…';
    try{
      const items=[];
      for(const row of catalogItems.querySelectorAll('.catalog-edit-item')){
        const id=row.dataset.id;
        const name=row.querySelector('.ci-name').value.trim();
        if(!name)continue;
        let image=row.dataset.image||'';
        const file=row.querySelector('.ci-file').files?.[0];
        if(file)image=await uploadCatalogImage(file,sl.value,id);
        items.push({id,name,price:row.querySelector('.ci-price').value.trim(),category:row.querySelector('.ci-category').value.trim(),description:row.querySelector('.ci-description').value.trim(),image_url:image,available:row.querySelector('.ci-available').checked});
      }
      const payload={name:n.value.trim(),slug:slug(sl.value),category:cat.value.trim()||'Estabelecimento',accent_color:co.value,description:de.value.trim(),whatsapp:wa.value.trim(),instagram:ig.value.trim(),address:ad.value.trim(),hours:hr.value.trim(),maps_url:safe(mp.value.trim()),catalog_url:x.catalog_url||'',website_url:safe(web.value.trim()),logo_url:safe(lo.value.trim()),is_active:act.checked,catalog_enabled:catalogEnabled.checked,catalog_title:q('catalog-title').value.trim()||'Veja o cardápio / catálogo',catalog_subtitle:q('catalog-subtitle').value.trim()||'Conheça nossas opções',catalog_items:items};
      if(s)await req('stores?id=eq.'+s.id,{method:'PATCH',body:payload,prefer:'return=representation'});
      else await req('stores',{method:'POST',body:{...payload,owner_id:S().user.id},prefer:'return=representation'});
      toast('Salvo.');m.remove();dash();
    }catch(e){toast(e.message,1);save.disabled=false;save.textContent='Salvar'}
  };
  if(s)q('del').onclick=async()=>{
    if(confirm('Excluir este estabelecimento?')){
      try{await req('stores?id=eq.'+s.id,{method:'DELETE'});m.remove();dash()}
      catch(e){toast(e.message,1)}
    }
  };
  n.focus();
}

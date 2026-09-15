function modal(s=null){
  const x=s||{name:'',category:'Estabelecimento',slug:'',description:'',logo_url:'',accent_color:'#7c3aed',whatsapp:'',instagram:'',maps_url:'',catalog_url:'',website_url:'',address:'',hours:'',is_active:true};
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
          <div class="field"><label for="ca">Catálogo URL</label><input class="input" id="ca" type="url" value="${esc(x.catalog_url)}"></div>
          <div class="field"><label for="web">Site URL</label><input class="input" id="web" type="url" value="${esc(x.website_url)}"></div>
          <div class="field"><label for="lo">Logo URL</label><input class="input" id="lo" type="url" value="${esc(x.logo_url||'')}"></div>
        </div>
        <label><input type="checkbox" id="act" ${x.is_active?'checked':''}> Página ativa</label>
        <div class="modalfoot">
          ${s?'<button type="button" class="btn danger" id="del">Excluir</button>':''}
          <button type="button" class="btn" id="cancel">Cancelar</button>
          <button class="btn pri" id="save">Salvar</button>
        </div>
      </form>
    </div>`;
  document.body.append(m);
  const q=id=>m.querySelector('#'+id);
  const n=q('n'),sl=q('sl'),cat=q('cat'),co=q('co'),de=q('de'),wa=q('wa'),ig=q('ig'),ad=q('ad'),hr=q('hr'),mp=q('mp'),ca=q('ca'),web=q('web'),lo=q('lo'),act=q('act'),sf=q('sf');
  q('cancel').onclick=()=>m.remove();
  let touched=!!s;
  n.oninput=()=>{if(!touched)sl.value=slug(n.value)};
  sl.oninput=()=>{touched=true;sl.value=slug(sl.value)};
  sf.onsubmit=async e=>{
    e.preventDefault();
    const payload={name:n.value.trim(),slug:slug(sl.value),category:cat.value.trim()||'Estabelecimento',accent_color:co.value,description:de.value.trim(),whatsapp:wa.value.trim(),instagram:ig.value.trim(),address:ad.value.trim(),hours:hr.value.trim(),maps_url:safe(mp.value.trim()),catalog_url:safe(ca.value.trim()),website_url:safe(web.value.trim()),logo_url:safe(lo.value.trim()),is_active:act.checked};
    try{
      if(s)await req('stores?id=eq.'+s.id,{method:'PATCH',body:payload,prefer:'return=representation'});
      else await req('stores',{method:'POST',body:{...payload,owner_id:S().user.id},prefer:'return=representation'});
      toast('Salvo.');m.remove();dash();
    }catch(e){toast(e.message,1)}
  };
  if(s)q('del').onclick=async()=>{
    if(confirm('Excluir este estabelecimento?')){
      try{await req('stores?id=eq.'+s.id,{method:'DELETE'});m.remove();dash()}
      catch(e){toast(e.message,1)}
    }
  };
  n.focus();
}

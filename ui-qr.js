function qr(s){
  const nfcUrl=pub(s.slug,'nfc');
  const qrUrl=pub(s.slug,'qr');
  const img='https://api.qrserver.com/v1/create-qr-code/?size=420x420&data='+encodeURIComponent(qrUrl);
  const m=document.createElement('div');
  m.className='modalbg';
  m.innerHTML=`
    <div class="modal qr" role="dialog" aria-modal="true" aria-labelledby="qr-title">
      <h2 id="qr-title">Links para NFC e QR Code</h2>
      <p class="mut small">Use URLs diferentes para o painel conseguir separar a origem dos acessos.</p>
      <div class="qrcenter"><img src="${img}" alt="QR Code de ${esc(s.name)}"></div>
      <div class="linkbox"><b>URL para gravar no NFC</b><div class="small break">${esc(nfcUrl)}</div><button class="btn sm" style="margin-top:9px" data-copy="${esc(nfcUrl)}">Copiar NFC</button></div>
      <div class="linkbox"><b>URL usada no QR Code</b><div class="small break">${esc(qrUrl)}</div><button class="btn sm" style="margin-top:9px" data-copy="${esc(qrUrl)}">Copiar QR</button></div>
      <div class="modalfoot"><button class="btn pri" id="close">Fechar</button></div>
    </div>`;
  document.body.append(m);
  m.querySelector('#close').onclick=()=>m.remove();
  m.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{
    const u=b.dataset.copy;
    try{await navigator.clipboard.writeText(u);toast('Link copiado.')}
    catch{prompt('Copie:',u)}
  });
}

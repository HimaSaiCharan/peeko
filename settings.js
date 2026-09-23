(()=>{
  for(const el of document.querySelectorAll('[data-icon]'))el.innerHTML=FocusUI.icon(el.dataset.icon);
  const $=s=>document.querySelector(s);let state,toastTimer;
  function toast(message){$('#toast').textContent=message;$('#toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.display='none',3500);}
  async function save(patch){try{const result=await FocusUI.send({type:'save',patch});update(result);$('#save-status').textContent='Saved. Make yourself at home.';}catch(error){toast(error.message);}}
  for(const font of FocusFonts.choices){const option=document.createElement('option');option.value=font.id;option.textContent=font.name;option.style.fontFamily=font.family;$('#font').append(option);}
  for(const theme of FocusThemes.themes){
    const button=document.createElement('button');button.className='theme-card';button.dataset.theme=theme.id;button.setAttribute('aria-label',theme.name+' theme, '+theme.pet+' companion');
    FocusThemes.apply(button,theme.id);
    button.innerHTML='<div class="theme-art">'+FocusThemes.pet(theme.id)+'<div class="swatches"><i></i><i></i><i></i></div></div><div class="theme-meta"><span class="theme-name">'+theme.name+'</span><span class="theme-pet">Meet '+theme.pet+'</span></div><span class="selected-mark" aria-hidden="true">✓</span>';
    button.addEventListener('click',()=>save({theme:theme.id}));$('#theme-grid').append(button);
  }
  const preview=FocusUI.mount($('#panel-preview').attachShadow({mode:'open'}));
  function update(data){
    if(!data?.settings || data===state)return;state=data;const s=data.settings;FocusThemes.apply(document.documentElement,s.theme);FocusFonts.apply(document.documentElement,s);
    for(const key of ['minutes','seconds','sound','volume','font','textSize'])if(document.activeElement!==$('#'+key))$('#'+key).value=s[key];
    for(const key of ['collapsed','showPet','motion','notifications','snapToCorner'])$('#'+key).checked=s[key];
    $('#volume-value').textContent=s.volume+'%';$('#rule-minutes').textContent=s.minutes;$('#rule-seconds').textContent=s.seconds;
    for(const b of document.querySelectorAll('[data-theme]'))b.setAttribute('aria-pressed',String(b.dataset.theme===s.theme));
    for(const b of document.querySelectorAll('[data-corner]'))b.setAttribute('aria-pressed',String(b.dataset.corner===s.corner));
  }
  preview.onChange(update);
  for(const key of ['minutes','seconds','sound','volume','font','textSize','collapsed','showPet','motion','notifications','snapToCorner']){
    $('#'+key).addEventListener('change',e=>{
      if(!e.target.checkValidity()){e.target.reportValidity();return;}
      save({[key]:e.target.type==='checkbox'?e.target.checked:['minutes','seconds','volume'].includes(key)?Number(e.target.value):e.target.value});
    });
  }
  $('#volume').addEventListener('input',e=>$('#volume-value').textContent=e.target.value+'%');
  for(const b of document.querySelectorAll('[data-corner]'))b.addEventListener('click',()=>save({corner:b.dataset.corner,panelX:null,panelY:null}));
  $('#test-sound').addEventListener('click',async()=>{
    const button=$('#test-sound');button.disabled=true;
    try{await FocusUI.send({type:'sound',patch:{sound:$('#sound').value,volume:Number($('#volume').value)}});toast($('#sound').value==='silent'?'Silent mode is selected.':'Playing your reminder sound.');}catch(error){toast('Could not play sound: '+error.message);}finally{button.disabled=false;}
  });
  $('#preview').addEventListener('click',async()=>{try{await FocusUI.send({type:'action',action:'preview'});$('#overview').scrollIntoView({behavior:'smooth'});toast('Your break started automatically. Look away, or choose Skip.');}catch(error){toast(error.message);}});
  $('#reset').addEventListener('click',async()=>{try{await FocusUI.send({type:'action',action:'reset'});toast('A fresh focus interval has started.');}catch(error){toast(error.message);}});
  for(const a of document.querySelectorAll('nav a'))a.addEventListener('click',()=>{for(const link of document.querySelectorAll('nav a'))link.classList.toggle('selected',link===a);});
})();

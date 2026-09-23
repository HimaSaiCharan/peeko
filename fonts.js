globalThis.FocusFonts=(()=>{
  const choices=[
    {id:'roboto',name:'Roboto',family:'"Peeko Roboto", Arial, sans-serif'},
    {id:'sans',name:'System sans-serif',family:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'},
    {id:'arial',name:'Arial',family:'Arial, Helvetica, sans-serif'},
    {id:'verdana',name:'Verdana',family:'Verdana, Geneva, sans-serif'},
    {id:'trebuchet',name:'Trebuchet MS',family:'"Trebuchet MS", Helvetica, sans-serif'},
    {id:'georgia',name:'Georgia · serif',family:'Georgia, "Times New Roman", serif'},
    {id:'times',name:'Times New Roman · serif',family:'"Times New Roman", Times, serif'},
    {id:'mono',name:'Courier New · monospace',family:'"Courier New", Courier, monospace'}
  ];
  let loading;
  function loadRoboto(){
    if(!loading)loading=Promise.all(Object.entries(FocusFontData).map(async([weight,encoded])=>{
      // Buffer-backed FontFace avoids external requests and page font-src rules.
      const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
      const face=new FontFace('Peeko Roboto',bytes.buffer,{weight,style:'normal',display:'swap'});
      document.fonts.add(await face.load());
    })).catch(error=>{console.warn('Peeko: using the fallback font.',error);});
    return loading;
  }
  function apply(element,settings){
    const chosen=choices.find(f=>f.id===settings.font)||choices[0];
    element.style.setProperty('--font',chosen.family);
    element.style.setProperty('--font-scale',String({comfortable:1,large:1.15,extra:1.3}[settings.textSize]||1));
    if(chosen.id==='roboto')loadRoboto();
  }
  return {choices,apply,loadRoboto};
})();

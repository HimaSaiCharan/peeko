chrome.runtime.onMessage.addListener((m,sender,respond)=>{
  if(m.target!=='audio') return;
  (async()=>{
    const ctx=new AudioContext();
    try {
      await ctx.resume();
      const start=ctx.currentTime+0.02,volume=Math.min(1,m.volume/100)*0.22;
      const notes=m.finished ? [[660,0,.12],[880,.18,.22]] : m.sound==='buzzer' ? [[220,0,.25],[220,.4,.25],[220,.8,.35]] : m.sound==='bell' ? [[880,0,1.2],[1320,.12,1]] : [[523,0,.35],[659,.2,.35],[784,.4,.65]];
      for(const [freq,delay,length] of notes) {
        const osc=ctx.createOscillator(),gain=ctx.createGain();
        osc.type=m.sound==='buzzer'&&!m.finished?'triangle':'sine';osc.frequency.value=freq;
        gain.gain.setValueAtTime(0,start+delay);gain.gain.linearRampToValueAtTime(volume,start+delay+.02);gain.gain.exponentialRampToValueAtTime(.001,start+delay+length);
        osc.connect(gain);gain.connect(ctx.destination);osc.start(start+delay);osc.stop(start+delay+length+.03);
      }
      respond({ok:true});setTimeout(()=>ctx.close(),1800);
    } catch(error) {await ctx.close();respond({error:error.message});}
  })();
  return true;
});

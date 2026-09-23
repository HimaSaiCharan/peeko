import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {settings,fresh} from '../core.mjs';
const source=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
function element(){
  const children=new Map(),events={},props={};
  return {style:{setProperty(k,v){props[k]=v;},getPropertyValue(k){return props[k];}},
    contains(node){return [...children.values()].includes(node);},focus(){this.focused=true;},
    textContent:'',classList:{toggle(){}},setAttribute(){},append(){},closest(){return null;},
    querySelector(s){if(!children.has(s))children.set(s,element());return children.get(s);},
    addEventListener(k,f){(events[k]??=[]).push(f);},
    fire(k,e={}){for(const f of events[k]||[])f({currentTarget:this,target:this,preventDefault(){},...e});},
    setPointerCapture(id){this.capture=id;},hasPointerCapture(id){return this.capture===id;},releasePointerCapture(){this.capture=null;}
  };
}

test('ring and digits update together, pause freezes, and skip resets immediately',async()=>{
  let now=100000,frame;const nodes=element();nodes.host=element();
  const s=settings(),initial={settings:s,timer:{...fresh(s,now),phase:'break',deadline:now+20000,total:20000}};
  const context=vm.createContext({Date:{now:()=>now},requestAnimationFrame(fn){frame=fn;return 1;},cancelAnimationFrame(){},
    chrome:{runtime:{async sendMessage(){return initial;}},storage:{onChanged:{addListener(){},removeListener(){}}}},
    FocusThemes:{apply(){return {label:'Hello',pet:'Bolt'};},pet(){return '<svg/>';}},FocusFonts:{apply(){}}
  });
  vm.runInContext(source('ui.js'),context);const ui=context.FocusUI.mount(nodes);await new Promise(setImmediate);
  now+=5000;frame();assert.equal(nodes.querySelector('.time').textContent,'00:15');
  assert.equal(Number(nodes.querySelector('.progress').style.strokeDashoffset),502.655*.25);
  ui.update({settings:s,timer:{...initial.timer,paused:true,remaining:15000,deadline:null}});
  now+=7000;frame();assert.equal(nodes.querySelector('.time').textContent,'00:15');
  assert.equal(Number(nodes.querySelector('.progress').style.strokeDashoffset),502.655*.25);
  ui.update({settings:s,timer:fresh(s,now)});
  assert.equal(nodes.querySelector('.time').textContent,'20:00');
  assert.equal(Number(nodes.querySelector('.progress').style.strokeDashoffset),0);ui.destroy();
});

function contentHarness(patch={}){
  const host=element(),root=element(),window=element();let pet,onChange;
  host.attachShadow=()=>root;
  let data={settings:settings(patch),timer:fresh(settings(patch))};const saves=[];
  const ui={onChange(fn){onChange=fn;},update(next){data=next;onChange(next,10000);}};
  host.getBoundingClientRect=()=>({left:parseFloat(host.style.getPropertyValue('left')||12),top:parseFloat(host.style.getPropertyValue('top')||12),width:parseFloat(host.style.getPropertyValue('width')||360),height:data.settings.collapsed?(data.settings.showPet?118:48):480});
  const context=vm.createContext({innerWidth:1000,innerHeight:800,
    document:{getElementById(){return null;},documentElement:{append(){}},createElement(tag){if(tag==='div')return host;if(tag==='button'){pet=element();return pet;}return element();},addEventListener(){}},
    addEventListener:window.addEventListener.bind(window),ResizeObserver:class{observe(){}},
    FocusThemes:{pet(){return '<svg/>';}},FocusUI:{mount(){return ui;},icon(){return '<svg/>';},format(){return '00:10';},async send(message){saves.push(message.patch);data={...data,settings:{...data.settings,...message.patch}};return data;}}
  });
  vm.runInContext(source('positioning.js'),context);vm.runInContext(source('content.js'),context);ui.update(data);
  return {host,root,pet,window,saves,setSettings(patch){ui.update({...data,settings:{...data.settings,...patch}});},get data(){return data;}};
}
const pointer=(el,type,x,y)=>el.fire(type,{button:0,pointerId:1,clientX:x,clientY:y});

test('collapsed bar stays visible with pet disabled and expands with a click',async()=>{
  const h=contentHarness({collapsed:true,showPet:false});
  assert.equal(h.pet.style.display,'flex');assert.match(h.pet.innerHTML,/Peeko/);
  h.pet.fire('click',{detail:1});await new Promise(setImmediate);
  assert.equal(h.data.settings.collapsed,false);assert.equal(h.root.querySelector('.panel').style.display,'block');
});

test('bar stays under pointer until release, then snaps; drag does not expand it',async()=>{
  const h=contentHarness({collapsed:true,showPet:false,petX:0,petY:0});
  pointer(h.pet,'pointerdown',20,20);pointer(h.pet,'pointermove',320,220);
  assert.equal(h.host.getBoundingClientRect().left,312);assert.equal(h.saves.length,0);
  pointer(h.pet,'pointerup',320,220);h.pet.fire('click',{detail:1});await new Promise(setImmediate);
  assert.equal(h.host.getBoundingClientRect().left,12);assert.equal(h.data.settings.collapsed,true);
  assert.equal(h.saves.length,1);
});

test('expanded panel remains freely positioned when snapping is disabled',async()=>{
  const h=contentHarness({collapsed:false,showPet:false,snapToCorner:false,corner:'top-left'}),head=h.root.querySelector('.head');
  pointer(head,'pointerdown',20,20);pointer(head,'pointermove',220,170);pointer(head,'pointerup',220,170);
  await new Promise(setImmediate);assert.equal(h.host.getBoundingClientRect().left,212);assert.equal(h.host.getBoundingClientRect().top,162);
  assert.ok(h.data.settings.panelX>0&&h.data.settings.panelX<1);
});

test('losing window focus safely finishes a drag and snaps the panel',async()=>{
  const h=contentHarness({showPet:false,corner:'top-left'}),head=h.root.querySelector('.head');
  pointer(head,'pointerdown',20,20);pointer(head,'pointermove',600,250);h.window.fire('blur');await new Promise(setImmediate);
  assert.equal(h.data.settings.corner,'bottom-right');assert.equal(h.host.getBoundingClientRect().left,628);
  assert.equal(h.host.getBoundingClientRect().top,308);assert.equal(head.capture,null);
});


test('switching pet visibility during a drag releases capture without saving stale coordinates',()=>{
  const h=contentHarness({collapsed:true,showPet:true,petX:0,petY:0});
  pointer(h.pet,'pointerdown',20,20);pointer(h.pet,'pointermove',320,220);
  h.setSettings({showPet:false});
  assert.equal(h.pet.capture,null);assert.equal(h.saves.length,0);
  assert.equal(h.host.getBoundingClientRect().left,12);assert.match(h.pet.innerHTML,/Peeko/);
  pointer(h.pet,'pointerup',320,220);h.pet.fire('click',{detail:1});
  assert.equal(h.data.settings.collapsed,true);assert.equal(h.saves.length,0);
});

test('switching collapsed mode in another tab cancels the old panel drag',()=>{
  const h=contentHarness({showPet:false,corner:'top-left'}),head=h.root.querySelector('.head');
  pointer(head,'pointerdown',20,20);pointer(head,'pointermove',320,220);
  h.setSettings({collapsed:true});pointer(head,'pointerup',320,220);
  assert.equal(head.capture,null);assert.equal(h.data.settings.collapsed,true);assert.equal(h.saves.length,0);
});

test('keyboard focus follows collapse and expansion without stealing focus from a webpage',async()=>{
  const h=contentHarness({showPet:false});
  const panel=h.root.querySelector('.panel'),brand=h.root.querySelector('.brand');
  h.root.activeElement=panel.querySelector('[data-op="collapse"]');h.setSettings({collapsed:true});
  assert.equal(h.pet.focused,true);
  h.root.activeElement=h.pet;h.pet.fire('click',{detail:0});await new Promise(setImmediate);
  assert.equal(brand.focused,true);assert.equal(h.data.settings.collapsed,false);
  const other=contentHarness({showPet:false});other.root.activeElement=null;other.setSettings({collapsed:true});
  assert.equal(other.pet.focused,undefined);
});

test('pointer cancellation ends one drag and the next click can still expand',async()=>{
  const h=contentHarness({collapsed:true,showPet:false,petX:0,petY:0});
  pointer(h.pet,'pointerdown',20,20);pointer(h.pet,'pointermove',320,220);pointer(h.pet,'pointercancel',320,220);
  await new Promise(setImmediate);assert.equal(h.pet.capture,null);assert.equal(h.saves.length,1);
  pointer(h.pet,'pointerdown',20,20);pointer(h.pet,'pointerup',20,20);h.pet.fire('click',{detail:1});
  await new Promise(setImmediate);assert.equal(h.data.settings.collapsed,false);
});

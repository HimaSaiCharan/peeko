import {test} from 'node:test';
import assert from 'node:assert/strict';
import {settings} from '../core.mjs';
import '../positioning.js';
const P=globalThis.PeekoPosition;
test('panel remains inside viewport including pet headroom',()=>{
 const b=P.bounds(1000,800,360,480,92);
 assert.deepEqual(P.point(1,0,b),{left:628,top:104});
 assert.deepEqual(P.point(-10,20,b),{left:12,top:308});
});
test('small viewports never produce negative coordinates or NaN',()=>{
 const b=P.bounds(100,100,190,118,0),p=P.point(1,1,b);
 assert.deepEqual(p,{left:12,top:12});assert.deepEqual(P.normalized(p.left,p.top,b),{x:0,y:0});
});
test('new drag preferences migrate and invalid coordinates are rejected',()=>{
 const old=settings({minutes:12,corner:'bottom-left'});assert.equal(old.snapToCorner,true);assert.equal(old.panelX,null);assert.equal(old.minutes,12);
 const s=settings({snapToCorner:false,panelX:Infinity,panelY:-4});assert.equal(s.snapToCorner,false);assert.equal(s.panelX,null);assert.equal(s.panelY,0);
});

'use strict';
let layerOrder=[],layerTransparency=new Map(),draggedLayer=null,settingsStorageAvailable=true;
const transparencyFrames=new Set();
const viewPreferencesKey='rails-to-relics:layer-display:v1';
function defaultLayerOrder(){
  const rank=i=>i.layer==='base_clip_buffer_pl'?100:i.layer==='hist_ghost_towns_pt'?90:i.geometry==='pt'?80:i.geometry==='ln'?60:i.style?.fill===false?50:i.layer==='hydro_gsl_water_pl'?40:i.layer==='hydro_lakes_pl'?30:10;
  return [...catalog.layers].sort((a,b)=>rank(b)-rank(a)||catalog.layers.indexOf(b)-catalog.layers.indexOf(a)).map(i=>i.layer);
}
function initializeLayerControls(){
  const defaults=defaultLayerOrder();layerOrder=defaults;layerTransparency=new Map();
  try{
    const saved=JSON.parse(localStorage.getItem(viewPreferencesKey)||'null');
    if(saved&&saved.version===1){
      const valid=new Set(defaults);
      const order=Array.isArray(saved.order)?[...new Set(saved.order.filter(k=>valid.has(k)))]:[];
      layerOrder=order.concat(defaults.filter(k=>!order.includes(k)));
      for(const [key,value] of Object.entries(saved.transparency||{}))if(valid.has(key)&&Number.isFinite(value))layerTransparency.set(key,Math.max(0,Math.min(100,value)));
      // Apply the requested new starting order once while retaining local transparency.
      if(saved.defaultOrderRevision!==2&&layerOrder.includes('hist_ghost_towns_pt')&&layerOrder.includes('base_roads_ln')){layerOrder.splice(layerOrder.indexOf('hist_ghost_towns_pt'),1);layerOrder.splice(layerOrder.indexOf('base_roads_ln'),0,'hist_ghost_towns_pt');}
    }
  }catch{settingsStorageAvailable=false;}
}
function saveLayerControls(){
  try{localStorage.setItem(viewPreferencesKey,JSON.stringify({version:1,defaultOrderRevision:2,order:layerOrder,transparency:Object.fromEntries(layerTransparency)}));settingsStorageAvailable=true;}
  catch{settingsStorageAvailable=false;}
  $('display-settings-note').textContent=settingsStorageAvailable?'Order and transparency are saved in this browser.':'Order and transparency apply for this visit.';
}
function orderedItems(){const byKey=new Map(catalog.layers.map(i=>[i.layer,i]));return layerOrder.map(k=>byKey.get(k)).filter(Boolean);}
function transparencyFactor(key){return 1-(layerTransparency.get(key)||0)/100;}
function setLayerTransparency(key,value){
  if(!catalog.layers.some(i=>i.layer===key))return;
  const percent=Math.max(0,Math.min(100,Number(value)));if(!Number.isFinite(percent))return;
  layerTransparency.set(key,percent);
  const input=$('transparency-'+key),output=$('transparency-value-'+key);
  if(input){input.value=percent;input.setAttribute('aria-valuetext',percent+'% transparent');}
  if(output)output.textContent=percent+'%';
  const item=catalog.layers.find(i=>i.layer===key);
  if(cache.has(key)&&!transparencyFrames.has(key)){
    transparencyFrames.add(key);
    requestAnimationFrame(()=>{transparencyFrames.delete(key);cache.get(key)?.setStyle(f=>item.geometry==='pt'?pointStyle(item,f):style(item,f));});
  }
  saveLayerControls();
}
function promoteLayer(item){
  const index=layerOrder.indexOf(item.layer);if(index>=0)layerOrder.splice(index,1);layerOrder.unshift(item.layer);
  drawOrder();legend();renderLayerOrder();saveLayerControls();
  $('layer-order-status').textContent=item.title+' moved to the top.';
}
function reorderLayer(key,target,after=false){
  if(key===target||!layerOrder.includes(key)||!layerOrder.includes(target))return;
  layerOrder.splice(layerOrder.indexOf(key),1);
  layerOrder.splice(layerOrder.indexOf(target)+(after?1:0),0,key);
  drawOrder();legend();renderLayerOrder();saveLayerControls();
  const visible=orderedItems().filter(i=>active.has(i.layer));
  const item=visible.find(i=>i.layer===key);
  if(item)$('layer-order-status').textContent=item.title+' is '+(visible.indexOf(item)+1)+' of '+visible.length+' from the top.';
}
function moveLayer(key,direction){
  const visible=orderedItems().filter(i=>active.has(i.layer));
  const index=visible.findIndex(i=>i.layer===key),target=visible[index+direction];
  if(!target)return;
  reorderLayer(key,target.layer,direction>0);
  const button=$('move-'+(direction<0?'up-':'down-')+key);
  (button?.disabled?$('move-'+(direction<0?'down-':'up-')+key):button)?.focus();
}
function clearDropIndicators(){document.querySelectorAll('.order-row').forEach(row=>row.classList.remove('drop-before','drop-after'));}
function renderLayerOrder(){
  const list=$('layer-order-list');if(!list)return;
  const visible=orderedItems().filter(i=>active.has(i.layer));list.replaceChildren();
  if(!visible.length){const empty=document.createElement('p');empty.textContent='Select layers below to arrange them here.';list.append(empty);return;}
  visible.forEach((item,index)=>{
    const row=document.createElement('li');row.className='order-row';row.dataset.layer=item.layer;
    row.innerHTML=`<button class="drag-handle" aria-label="Drag ${escapeHTML(item.title)} to reorder" title="Drag to reorder">⠿</button><span class="order-name">${swatch(item,color(item.layer))}${escapeHTML(item.title)}</span><button id="move-up-${item.layer}" class="order-button" aria-label="Move ${escapeHTML(item.title)} up" ${index===0?'disabled':''}>↑</button><button id="move-down-${item.layer}" class="order-button" aria-label="Move ${escapeHTML(item.title)} down" ${index===visible.length-1?'disabled':''}>↓</button>`;
    const handle=row.querySelector('.drag-handle');let start=null,drop=null;
    handle.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();start={x:event.clientX,y:event.clientY};drop=null;draggedLayer=item.layer;handle.setPointerCapture(event.pointerId);});
    handle.addEventListener('pointermove',event=>{
      if(!start||Math.hypot(event.clientX-start.x,event.clientY-start.y)<5)return;
      const bounds=list.getBoundingClientRect();if(event.clientY<bounds.top+20)list.scrollTop-=12;else if(event.clientY>bounds.bottom-20)list.scrollTop+=12;
      const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.order-row');clearDropIndicators();drop=null;
      if(target&&list.contains(target)&&target.dataset.layer!==item.layer){const after=event.clientY>target.getBoundingClientRect().top+target.offsetHeight/2;drop={key:target.dataset.layer,after};target.classList.add(after?'drop-after':'drop-before');}
    });
    const endDrag=event=>{const destination=drop;start=null;drop=null;draggedLayer=null;clearDropIndicators();if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);if(event.type==='pointerup'&&destination)reorderLayer(item.layer,destination.key,destination.after);};
    handle.addEventListener('pointerup',endDrag);handle.addEventListener('pointercancel',endDrag);
    row.querySelector('#move-up-'+item.layer).onclick=()=>moveLayer(item.layer,-1);
    row.querySelector('#move-down-'+item.layer).onclick=()=>moveLayer(item.layer,1);
    list.append(row);
  });
}
function addTransparencyControl(row,item){
  const percent=layerTransparency.get(item.layer)||0;
  const control=document.createElement('div');control.className='layer-transparency';
  control.innerHTML=`<label for="transparency-${item.layer}">Transparency</label><input id="transparency-${item.layer}" type="range" min="0" max="100" step="1" value="${percent}" aria-label="Transparency of ${escapeHTML(item.title)}" aria-valuetext="${percent}% transparent" ${item.count?'':'disabled'}><output id="transparency-value-${item.layer}" for="transparency-${item.layer}">${percent}%</output>`;
  control.querySelector('input').addEventListener('input',e=>setLayerTransparency(item.layer,e.target.value));row.append(control);
}
function resetLayerControls(){
  layerOrder=defaultLayerOrder();layerTransparency.clear();
  for(const item of catalog.layers)setLayerTransparency(item.layer,0);
  drawOrder();renderLayerOrder();saveLayerControls();
  $('layer-order-status').textContent='Default layer order and transparency restored.';
}

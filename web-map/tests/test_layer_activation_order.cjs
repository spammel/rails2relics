const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const site=process.argv[2]||path.join(__dirname,'../site');
const els=new Map();
const document={getElementById(id){if(!els.has(id))els.set(id,{classList:{contains(){return false},toggle(){}},addEventListener(){},setAttribute(){},focus(){},textContent:''});return els.get(id)},querySelectorAll(){return []}};
const context=vm.createContext({document,URL,setTimeout,console,requestAnimationFrame:fn=>fn(),localStorage:{getItem(){return null},setItem(){}}});
vm.runInContext(fs.readFileSync(path.join(site,'layer-controls.js'),'utf8')+'\n'+fs.readFileSync(path.join(site,'app.js'),'utf8').replace(/initialize\(\);\s*$/,''),context);
vm.runInContext(`
catalog={layers:[{layer:'region',title:'Region',geometry:'pl'},{layer:'a',title:'A',geometry:'pt'},{layer:'b',title:'B',geometry:'ln'}]};
layerOrder=['region','a','b'];active=new Set(['region']);cache=new Map();map={};
legend=()=>{};renderLayerOrder=()=>{};saveLayerControls=()=>{};updateAttribution=()=>{};updateStatus=()=>{};
let finished={},painted=[];
load=item=>cache.has(item.layer)?Promise.resolve(cache.get(item.layer)):new Promise(resolve=>{finished[item.layer]=()=>{const group={addTo(){},remove(){},bringToFront(){painted.push(item.layer)}};cache.set(item.layer,group);resolve(group)}});
`,context);
(async()=>{
 const result=await vm.runInContext(`(async()=>{
  const a=catalog.layers[1],b=catalog.layers[2];
  const first=toggle(a,true),second=toggle(b,true);
  const latestIsFirstBeforeLoading=layerOrder[0]==='b';
  finished.b();await second;finished.a();await first;
  const lateCompletionDoesNotOverride=layerOrder[0]==='b'&&painted.at(-1)==='b';
  await toggle(b,false);const unchanged=layerOrder.join('|');await toggle(a,true);
  const alreadyActiveDoesNotMove=layerOrder.join('|')===unchanged;
  layerOrder=['region','a','b'];await toggle(b,true);
  const cachedLayerMovesToTop=layerOrder[0]==='b';
  await toggle(b,false);layerOrder=['region','a','b'];await toggle(b,true,false);
  const defaultActivationKeepsOrder=layerOrder.join('|')==='region|a|b';
  return {latestIsFirstBeforeLoading,lateCompletionDoesNotOverride,alreadyActiveDoesNotMove,cachedLayerMovesToTop,defaultActivationKeepsOrder};
 })()`,context);
 for(const [name,passed] of Object.entries(result))assert.equal(passed,true,name);
 console.log(JSON.stringify({passed:true,checks:result}));
})().catch(error=>{console.error(error);process.exitCode=1});

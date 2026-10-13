const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),zlib=require('node:zlib');
const site=process.argv[2]||path.join(__dirname,'../site');
const source=fs.readFileSync(path.join(site,'app.js'),'utf8');
const code=source.slice(source.indexOf('async function readCompressedLayer('),source.indexOf('async function load(item)'));
const compressed=fs.readFileSync(path.join(site,'data/hist_ghost_towns_pt.geojson.gz'));
async function check(body,status=200,decoder=DecompressionStream){
  const context=vm.createContext({Response,Blob,DecompressionStream:decoder===false?undefined:decoder,Uint8Array,TextDecoder,fetch:async()=>new Response(body,{status})});
  vm.runInContext(code,context);return vm.runInContext("readCompressedLayer('hist_ghost_towns_pt')",context);
}
(async()=>{
  for(const body of [compressed,zlib.gunzipSync(compressed)]){
    const data=await check(body);assert.equal(data.type,'FeatureCollection');assert.equal(data.features.length,9);
  }
  await assert.rejects(check('missing',404),/HTTP 404/);
  await assert.rejects(check(compressed,200,false),/Use a current/);
  console.log(JSON.stringify({passed:true,checks:['gzip payload decoded','HTTP-decoded payload accepted','HTTP error handled','unsupported browser fails clearly']}));
})().catch(error=>{console.error(error);process.exitCode=1});

from pathlib import Path
import gzip,json,sys
site=Path(sys.argv[1] if len(sys.argv)>1 else Path(__file__).resolve().parents[1]/'site')
catalog=json.loads((site/'catalog.json').read_text(encoding='utf-8-sig'))
total=0
for layer in catalog['layers']:
    data=json.loads(gzip.decompress((site/'data'/(layer['layer']+'.geojson.gz')).read_bytes()))
    assert data['type']=='FeatureCollection'
    assert len(data['features'])==layer['count'],layer['layer']
    assert not layer['layer'].startswith('sens_'),layer['layer']
    for f in data['features']:
        assert f['properties'].get('sensitivity','public')=='public',layer['layer']
    total+=len(data['features'])
assert total==catalog['count']
assert {i['layer'] for i in catalog['layers'] if i.get('default')}=={'base_clip_buffer_pl','hist_ghost_towns_pt','base_roads_ln','hydro_lakes_pl'}
for source in catalog['sources'].values():
    assert source.get('url','').startswith(('http://','https://')) or source.get('url','')==''
for token in ['/health','/shutdown','OPEN THE MAP','master_project.qgz']:
    assert token not in (site/'app.js').read_text(encoding='utf-8')
assert not list(site.rglob('*.gpkg'))
print(json.dumps({'passed':True,'layers':len(catalog['layers']),'features':total,'static_hosting':True}))

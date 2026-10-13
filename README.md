# rails2relics
Geospatial repository for cultural heritage for the north Salt Lake section of the US Transcontinental Railroad.


## Rails to Relics: Utah's Fading Frontier

A Cultural Landscape of America's First Transcontinental Railroad.

The interactive map has 39 public layer entries and 80,479 features. Study Area/Region, Ghost towns, Roads and Lakes and Waterbodies are initially enabled. Search places and click features for context and citations. Turn on other layers in the collapsed groups; newly enabled layers move to the top. Drag layers or use up/down controls, and adjust individual transparency sliders.

The map source, data credits, tests and update instructions are in [web-map](web-map/README.md). Compressed geometry is downloaded only when a layer is enabled. The browser snapshot is about 11 MB across all layers. Source terms are retained in [ATTRIBUTION.txt](web-map/site/ATTRIBUTION.txt) and the map's About & sources dialog.

GitHub Pages deployment is prepared in `.github/workflows/publish-map.yml`. Hosting is pending a Pages-compatible repository/plan choice; the expected site address is `https://spammel.github.io/rails2relics/` after deployment. The original local QGIS workspace and master GeoPackage are maintained separately.

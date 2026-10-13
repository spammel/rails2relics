# Rails to Relics: Utah's Fading Frontier

A Cultural Landscape of America's First Transcontinental Railroad.

**[Open the interactive map](https://spammel.github.io/rails2relics/)**

Geospatial repository for cultural heritage for the north Salt Lake section of the US Transcontinental Railroad.

## Explore the landscape

The map includes 39 public layer entries and 80,479 features. Study Area/Region, Ghost towns, Roads and Lakes and Waterbodies are initially enabled, with Ghost towns above Roads. Search places and click features for historical context, dates and source citations.

Open the collapsed theme groups to enable other layers. Newly enabled layers move to the top. Drag layers or use the up/down buttons to change drawing order, and adjust individual transparency sliders. Display preferences stay in your browser; Reset restores the starting view.

## Data and updates

The map source, credits, tests and update instructions are in [web-map](web-map/README.md). Compressed geometry is downloaded only when a layer is enabled. The browser snapshot is about 11 MB across all layers. Source terms are retained in [ATTRIBUTION.txt](web-map/site/ATTRIBUTION.txt) and the About & sources dialog.

GitHub Pages hosts the map. Updates to `web-map` on the default branch are validated and deployed automatically through [.github/workflows/publish-map.yml](.github/workflows/publish-map.yml). The original local QGIS workspace and full master GeoPackage are maintained separately.

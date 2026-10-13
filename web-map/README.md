# Rails to Relics: Utah's Fading Frontier

A Cultural Landscape of America's First Transcontinental Railroad.

This folder is the public browser map, ready for GitHub Pages. It preserves the localhost atlas's layer controls, popups, search, styling and default view. Study Area/Region, Ghost towns, Roads and Lakes and Waterbodies are initially enabled; Ghost towns draws above Roads. Theme groups start collapsed. New layers go to the top. Order and transparency are stored in the visitor's browser.

## Hosting

The workflow `.github/workflows/publish-map.yml` publishes only `web-map/site` from the repository's default branch. It validates the public snapshot and layer behavior before deploying. In Settings → Pages, select **GitHub Actions** as the publishing source. The expected address after successful deployment is https://spammel.github.io/rails2relics/ .

Private-repository Pages hosting requires an eligible GitHub plan. The site is publicly accessible when published. This bundle contains the approved public browser derivative. Repository visibility must remain as the owner chose it.

GitHub Pages serves static files. A current Chrome, Edge, Firefox or Safari decompresses each layer's gzip payload in the browser. No Python server, API key, WebGPU setup, npm installation, CDN, or external basemap is needed to view it. Data is fetched only when a layer is enabled.

## Source and attribution

There are 39 spatial layer entries, including 10 empty research templates, and 80,479 features in this snapshot. Browser geometry was simplified by 10 m for display. Source dates and individual terms are in `site/catalog.json` and `site/ATTRIBUTION.txt`. Leaflet's BSD-2-Clause license is in `site/vendor/LICENSE-Leaflet.txt`. Upstream Roads editor/creator usernames are omitted from this web copy. Local source paths were removed. The master GeoPackage, team-only layers and original source archives are maintained locally.

## Checks and updates

Run `python web-map/tools/validate_site.py web-map/site`, `node web-map/tests/test_layer_controls.cjs`, and `node web-map/tests/test_layer_activation_order.cjs` from the repository root. After updating the local atlas, rebuild this bundle using `07_Web_Publication/prepare_github_map.py`; review changes before publishing. The workflow's default-branch push trigger deploys updated files automatically.

Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

Gzip/HTTP decompression regression check: `node web-map/tests/test_static_loading.cjs`.

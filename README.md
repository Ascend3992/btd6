# Meadow Balloon Defense 3D

Latest version: **v55**. Adds the supplied Glue Gunner bottom path: 24-second Stickier Glue, 75% Stronger Glue slow, full-duration 37.5% MOAB slow, Relentless pop stuns, and Super Glue's class-specific immobilization, damage, +6 pierce and reapplication. Pop stuns query nearby Bloons and stop at their pierce limit. Includes the full middle and top paths, animated tower models, reference meadow and route, Round 81 health scaling and distinct Camo/Fortified/Regrow bloons.

[Download v55 from GitHub](https://github.com/Ascend3992/btd6/raw/refs/heads/main/releases/meadow-balloon-defense-v55.zip)

## Play online

The game is ready for GitHub Pages at https://ascend3992.github.io/btd6/ once Pages is enabled. In this repository's **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**, and click **Save**. No build or additional uploads are required.

## Run locally

Serve this folder with `python -m http.server 8000`, then open http://localhost:8000.

All required Three.js files and licenses are bundled in `assets/vendor/`. See [README.txt](README.txt) for game rules, tuning values and verification details.

[Bottom-path combat preview](docs/glue-bottom-combat.png) · [Middle-path combat preview](docs/glue-middle-combat.png) · [Top-path combat preview](docs/glue-top-combat.png) · [Glue Gunner preview](docs/glue-base-model.png) · [Map preview](docs/meadow-map-preview.png) · [Bloon variants](docs/bloon-variants-preview.png)

Run the regression checks with `bash scripts/test.sh` using Node.js 24 or newer.

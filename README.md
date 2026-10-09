# Meadow Balloon Defense 3D

Latest version: **v54**. Adds the supplied Glue Gunner middle-path stats: Bigger Globs pierce, 5-Bloon Glue Splatter, 3x Glue Hose speed, Glue Strike's +2 damage and temporary Lead/Frozen vulnerability, and Glue Storm's 20-second ability with one pulse per second and doubled ability-coating lifespan. Includes the reference meadow and route, animated tower models, Round 81 health scaling, distinct Camo/Fortified/Regrow bloons, Glue Gunner prioritization and top-path corrosion/acid puddles.

[Download v54 from GitHub](https://github.com/Ascend3992/btd6/raw/refs/heads/main/releases/meadow-balloon-defense-v54.zip)

## Play online

The game is ready for GitHub Pages at https://ascend3992.github.io/btd6/ once Pages is enabled. In this repository's **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**, and click **Save**. No build or additional uploads are required.

## Run locally

Serve this folder with `python -m http.server 8000`, then open http://localhost:8000.

All required Three.js files and licenses are bundled in `assets/vendor/`. See [README.txt](README.txt) for game rules, tuning values and verification details.

[Middle-path combat preview](docs/glue-middle-combat.png) · [Top-path combat preview](docs/glue-top-combat.png) · [Glue Gunner preview](docs/glue-base-model.png) · [Map preview](docs/meadow-map-preview.png) · [Bloon variants](docs/bloon-variants-preview.png)

Run the regression checks with `bash scripts/test.sh` using Node.js 24 or newer.

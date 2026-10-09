# Meadow Balloon Defense 3D

Latest version: **v57**. Adds all five reference-based Glue Gunner middle-path models, from Bigger Globs' orange nozzle to Glue Storm's orange protective suit, giant cannon and four articulated hoses. Every tier has idle motion, planted feet, attached hand/gun recoil and nozzle spray. Glue Strike casts and Glue Storm's repeating ability pulses animate the cannon and hose jets. Includes the existing top-path models, all supplied Glue Gunner stats, reference meadow and route, Round 81 health scaling and distinct Camo/Fortified/Regrow bloons.

[Download v57 from GitHub](https://github.com/Ascend3992/btd6/raw/refs/heads/main/releases/meadow-balloon-defense-v57.zip)

## Play online

The game is ready for GitHub Pages at https://ascend3992.github.io/btd6/ once Pages is enabled. In this repository's **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**, and click **Save**. No build or additional uploads are required.

## Run locally

Serve this folder with `python -m http.server 8000`, then open http://localhost:8000.

All required Three.js files and licenses are bundled in `assets/vendor/`. See [README.txt](README.txt) for game rules, tuning values and verification details.

[Middle-path models](docs/glue-middle-models.png) · [Middle-path shooting](docs/glue-middle-models-shooting.png) · [Ability poses](docs/glue-middle-models-ability.png) · [Top-path models](docs/glue-top-models.png) · [Shooting poses](docs/glue-top-models-shooting.png) · [Models in combat](docs/glue-top-models-combat.png) · [Bottom-path combat preview](docs/glue-bottom-combat.png) · [Middle-path combat preview](docs/glue-middle-combat.png) · [Map preview](docs/meadow-map-preview.png) · [Bloon variants](docs/bloon-variants-preview.png)

Run the regression checks with `bash scripts/test.sh` using Node.js 24 or newer.

# Meadow Balloon Defense 3D

Latest version: **v56**. Adds all five reference-based Glue Gunner top-path models, from Glue Soak's gray cap and green gun to The Bloon Solver's green protective suit, respirator, solvent capsules and heavy cannon. Each has planted feet, idle motion, attached gun/hand recoil, nozzle spray and fluid animation. Includes the supplied stats for all Glue Gunner paths, animated tower models, reference meadow and route, Round 81 health scaling and distinct Camo/Fortified/Regrow bloons.

[Download v56 from GitHub](https://github.com/Ascend3992/btd6/raw/refs/heads/main/releases/meadow-balloon-defense-v56.zip)

## Play online

The game is ready for GitHub Pages at https://ascend3992.github.io/btd6/ once Pages is enabled. In this repository's **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**, and click **Save**. No build or additional uploads are required.

## Run locally

Serve this folder with `python -m http.server 8000`, then open http://localhost:8000.

All required Three.js files and licenses are bundled in `assets/vendor/`. See [README.txt](README.txt) for game rules, tuning values and verification details.

[Top-path models](docs/glue-top-models.png) · [Shooting poses](docs/glue-top-models-shooting.png) · [Models in combat](docs/glue-top-models-combat.png) · [Bottom-path combat preview](docs/glue-bottom-combat.png) · [Middle-path combat preview](docs/glue-middle-combat.png) · [Map preview](docs/meadow-map-preview.png) · [Bloon variants](docs/bloon-variants-preview.png)

Run the regression checks with `bash scripts/test.sh` using Node.js 24 or newer.

# Meadow Balloon Defense 3D

Latest version: **v58**. Adds all five reference-based Glue Gunner bottom-path models, from Stickier Glue's yellow head splat and Stronger Glue's magenta suit to MOAB Glue's white visor gear, Relentless Glue's blue helmet and Super Glue's dark armor, twin cannons and red pressure valve. Each has idle motion, planted feet, attached gun/hand recoil and yellow or pink glue drips/spray. Real projectiles and impacts match the model's glue color; twin barrels alternate the existing shots without adding damage or projectiles. Includes all three Glue Gunner model paths and the existing supplied gameplay stats, abilities, map and Bloon variants.

[Download v58 from GitHub](https://github.com/Ascend3992/btd6/raw/refs/heads/main/releases/meadow-balloon-defense-v58.zip)

## Play online

The game is ready for GitHub Pages at https://ascend3992.github.io/btd6/ once Pages is enabled. In this repository's **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**, and click **Save**. No build or additional uploads are required.

## Run locally

Serve this folder with `python -m http.server 8000`, then open http://localhost:8000.

All required Three.js files and licenses are bundled in `assets/vendor/`. See [README.txt](README.txt) for game rules, tuning values and verification details.

[Bottom-path models](docs/glue-bottom-models.png) · [Bottom-path shooting](docs/glue-bottom-models-shooting.png) · [Bottom models in combat](docs/glue-bottom-models-combat.png) · [Middle-path models](docs/glue-middle-models.png) · [Middle-path shooting](docs/glue-middle-models-shooting.png) · [Ability poses](docs/glue-middle-models-ability.png) · [Top-path models](docs/glue-top-models.png) · [Shooting poses](docs/glue-top-models-shooting.png) · [Models in combat](docs/glue-top-models-combat.png) · [Bottom-path combat preview](docs/glue-bottom-combat.png) · [Middle-path combat preview](docs/glue-middle-combat.png) · [Map preview](docs/meadow-map-preview.png) · [Bloon variants](docs/bloon-variants-preview.png)

Run the regression checks with `bash scripts/test.sh` using Node.js 24 or newer.

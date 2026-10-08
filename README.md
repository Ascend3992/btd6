# Meadow Balloon Defense 3D

Latest version: **v53**. Includes the reference meadow and route, updated tower models and upgrades, Round 81 health scaling, and distinct Camo/Fortified/Regrow bloons. The Glue Gunner now has the supplied base stats, reference model with idle/attack animation, and coating prioritization with crosspath exceptions. Its full top path now includes timed corrosion, Ceramic/MOAB bonuses, twin Solver splatters and acid puddles.

[Download v53 from GitHub](https://github.com/Ascend3992/btd6/raw/refs/heads/main/releases/meadow-balloon-defense-v53.zip)

## Play online

The game is ready for GitHub Pages at https://ascend3992.github.io/btd6/ once Pages is enabled. In this repository's **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**, and click **Save**. No build or additional uploads are required.

## Run locally

Serve this folder with `python -m http.server 8000`, then open http://localhost:8000.

All required Three.js files and licenses are bundled in `assets/vendor/`. See [README.txt](README.txt) for game rules, tuning values and verification details.

[Top-path combat preview](docs/glue-top-combat.png) · [Glue Gunner preview](docs/glue-base-model.png) · [Map preview](docs/meadow-map-preview.png) · [Bloon variants](docs/bloon-variants-preview.png)

Run the regression checks with `bash scripts/test.sh` using Node.js 24 or newer.

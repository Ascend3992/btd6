# Meadow Balloon Defense 3D

Latest version: **v59**. Adds five reference Quincy models at levels 1, 3, 7, 10 and 20, with idle, bow-draw, firing and ability animations. Applies the supplied Quincy level 1–20 statistics and corrects his ricocheting arrows, first-impact explosive volleys, level-17 arrow lifetime, initial ability cooldowns and Rapid Shot firing rate. Storm of Arrows now uses its 100-unit target-centered area, exact class damage, fixed 60-Hz hit chances and 0.05s rehit limit. Hero leveling remains automatic every five rounds; supplied costs and XP are recorded as metadata. Includes all existing reference tower models, map, Bloon variants and gameplay updates.

[Download v59 from GitHub](https://github.com/Ascend3992/btd6/raw/refs/heads/main/releases/meadow-balloon-defense-v59.zip)

[Quincy models](docs/quincy-models.png) · [Bow-draw poses](docs/quincy-models-shooting.png) · [Ability poses](docs/quincy-models-abilities.png) · [All Quincy level stats and ability details](docs/quincy-level-stats.md) · [Quincy combat preview](docs/quincy-levels-combat.png)

## Play online

The game is ready for GitHub Pages at https://ascend3992.github.io/btd6/ once Pages is enabled. In this repository's **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**, and click **Save**. No build or additional uploads are required.

## Run locally

Serve this folder with `python -m http.server 8000`, then open http://localhost:8000.

All required Three.js files and licenses are bundled in `assets/vendor/`. See [README.txt](README.txt) for game rules, tuning values and verification details.

[Bottom-path models](docs/glue-bottom-models.png) · [Bottom-path shooting](docs/glue-bottom-models-shooting.png) · [Bottom models in combat](docs/glue-bottom-models-combat.png) · [Middle-path models](docs/glue-middle-models.png) · [Middle-path shooting](docs/glue-middle-models-shooting.png) · [Ability poses](docs/glue-middle-models-ability.png) · [Top-path models](docs/glue-top-models.png) · [Shooting poses](docs/glue-top-models-shooting.png) · [Models in combat](docs/glue-top-models-combat.png) · [Bottom-path combat preview](docs/glue-bottom-combat.png) · [Middle-path combat preview](docs/glue-middle-combat.png) · [Map preview](docs/meadow-map-preview.png) · [Bloon variants](docs/bloon-variants-preview.png)

Run the regression checks with `bash scripts/test.sh` using Node.js 24 or newer.

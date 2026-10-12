# Meadow Balloon Defense 3D

Latest version: **v62**. Adds a browsable upgrade-tree menu with all future tiers and hover descriptions, green Upgrades buttons, one-click cash purchases and usage-only XP. The Normal Difficulty pause menu has Auto Start, separate effects/music volume sliders, Restart and Continue. Includes the supplied Bloon pop sound and four looping background tracks. All 15 original Glue icons and previous combat statistics are preserved.

[Download v62 from GitHub](https://github.com/Ascend3992/btd6/raw/refs/heads/main/releases/meadow-balloon-defense-v62.zip)

[Upgrade tree](docs/upgrade-tree-desktop.png) · [Pause menu](docs/pause-menu-desktop.png) · [Menu and audio details](docs/upgrade-tree.md)

[Glue upgrade artwork](docs/glue-upgrade-icons.png) · [Icons in the upgrade panel](docs/glue-upgrade-icons-combat.png) · [Artwork details](docs/glue-upgrade-artwork.md)

[UI preview](docs/reference-ui-upgrades.png) · [Placement preview](docs/reference-ui-placement.png) · [Mobile layout](docs/reference-ui-mobile.png) · [Upgrade icon checklist](docs/ui-upgrade-icons.md)

[Quincy models](docs/quincy-models.png) · [Bow-draw poses](docs/quincy-models-shooting.png) · [Ability poses](docs/quincy-models-abilities.png) · [All Quincy level stats and ability details](docs/quincy-level-stats.md) · [Quincy combat preview](docs/quincy-levels-combat.png)

## Play online

The game is ready for GitHub Pages at https://ascend3992.github.io/btd6/ once Pages is enabled. In this repository's **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**, and click **Save**. No build or additional uploads are required.

## Run locally

Serve this folder with `python -m http.server 8000`, then open http://localhost:8000.

All required Three.js files and licenses are bundled in `assets/vendor/`. See [README.txt](README.txt) for game rules, tuning values and verification details.

[Bottom-path models](docs/glue-bottom-models.png) · [Bottom-path shooting](docs/glue-bottom-models-shooting.png) · [Bottom models in combat](docs/glue-bottom-models-combat.png) · [Middle-path models](docs/glue-middle-models.png) · [Middle-path shooting](docs/glue-middle-models-shooting.png) · [Ability poses](docs/glue-middle-models-ability.png) · [Top-path models](docs/glue-top-models.png) · [Shooting poses](docs/glue-top-models-shooting.png) · [Models in combat](docs/glue-top-models-combat.png) · [Bottom-path combat preview](docs/glue-bottom-combat.png) · [Middle-path combat preview](docs/glue-middle-combat.png) · [Map preview](docs/meadow-map-preview.png) · [Bloon variants](docs/bloon-variants-preview.png)

Run the regression checks with `bash scripts/test.sh` using Node.js 24 or newer.

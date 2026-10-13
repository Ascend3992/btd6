# Meadow Balloon Defense 3D

Latest version: **v65**. Automatically saves your run locally and offers Resume or New Game when you return. Towers, upgrades, cash, lives, usage XP, targeting, ability cooldowns and persistent effects restore from the saved round checkpoint. Leaving during round 60 lets you replay round 60 from its starting state. Includes all previous artwork, UI and audio updates.

[Download v65 from GitHub](https://github.com/Ascend3992/btd6/raw/refs/heads/main/releases/meadow-balloon-defense-v65.zip)

[Resume prompt](docs/resume-run-desktop.png) · [Phone resume prompt](docs/resume-run-mobile.png) · [Saved-run details](docs/save-progress.md)

[Boomerang upgrade tree](docs/boomer-upgrade-tree.png) · [Boomerang cards](docs/boomer-upgrade-icons-combat.png) · [Boomerang artwork details](docs/boomer-upgrade-artwork.md)

[Dart upgrade tree](docs/dart-upgrade-tree.png) · [Dart cards](docs/dart-upgrade-icons-combat.png) · [Dart artwork details](docs/dart-upgrade-artwork.md)

[Pause menu](docs/pause-menu-desktop.png) · [Menu and audio details](docs/upgrade-tree.md)

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

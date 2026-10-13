# Meadow Balloon Defense 3D

Latest version: **v66**. Adds a home screen, a Monkey Meadow map selector and Easy/Normal/Hard modes with restyled 3D difficulty badges. Each mode uses the supplied lives, rounds, prices and Bloon speeds; Easy’s round-40 MOAB has 133 base HP. Pause headings and saved runs reflect the selected mode. Easy and Normal wins award a silver map border. Existing v65 saves retain their original 100-round rules.

[Download v66 from GitHub](https://github.com/Ascend3992/btd6/raw/refs/heads/main/releases/meadow-balloon-defense-v66.zip)

[Home screen](docs/home-screen.png) · [Map selector](docs/map-selection.png) · [Mode selector](docs/mode-selection.png) · [Phone mode selector](docs/mode-selection-mobile.png) · [Mode rules](docs/home-and-modes.md)

[Saved runs](docs/save-progress.md)

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

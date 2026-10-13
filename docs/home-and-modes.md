# Home, map selection and difficulty — v66

Every load opens **Home**. Choose **Play** (or **New Game** when a checkpoint exists), select **Monkey Meadow**, then select a difficulty. Since v67, a difficulty opens its mode tree; choose a tree node to start. Standard Easy unlocks Deflation and Sandbox after a win. Since v68, Standard Normal unlocks Reverse and Apopalypse; [Normal branch details](normal-branches.md). [Branch and Sandbox details](easy-branches-and-sandbox.md). Monkey Meadow is the only current map. Back/Escape navigation returns through the menus without erasing the saved run; only choosing a new mode replaces it. Home’s **Resume** restores the saved run directly. Gameplay stays paused and its controls cannot receive focus while the menus are open.

[Home](home-screen.png) · [Map selector](map-selection.png) · [Mode selector](mode-selection.png) · [Phone selector](mode-selection-mobile.png) · [Saved-run Home](home-saved-run.png)

| Mode | Lives | Rounds | Prices versus Normal | Bloon speed versus Easy |
|---|---:|---|---:|---:|
| Easy | 200 | 1–40 | 85% | 1× |
| Normal (Medium) | 150 | 1–60 | 100% | 1.10× |
| Hard | 100 | 3–80 | 108% | 1.25× |

Starting cash is $650 in each Standard mode. Prices round to the nearest $5, with halfway values rounded down. The original v65 Normal prices are the source for all calculations; changing modes never compounds a discount. For example, Dart placement costs $170/$200/$215 and Sharp Shots costs $120/$140/$150 in Easy/Normal/Hard.

Easy’s round-40 MOAB has **133 base HP** instead of 200. Other MOAB health remains unchanged. The existing round data supplies the final Easy MOAB, Normal BFB and Hard ZOMG. Freeze and slow effects keep their existing behavior after the difficulty’s speed multiplier. Tower damage, attack rates, ranges and upgrade effects are unchanged.

Shop prices, affordability, purchases, upgrade-tree costs, invested value and sale refunds all use the selected mode’s price table. The HUD round denominator and victory condition use the mode’s ending round. Pause displays **EASY MODE**, **NORMAL MODE** or **HARD MODE**.

[Easy pause](pause-easy.png) · [Normal pause](pause-medium.png) · [Hard pause](pause-hard.png)

## Saved runs and medals

New saved runs record difficulty in schema 2. Resume applies the mode before rebuilding towers and upgrades, preserving their invested value and refunds. Existing schema-1 v65 runs migrate to **legacy Normal**: original default prices, base Bloon speed and the 100-round limit remain unchanged. Stored lives and cash are retained, including runs already past round 60. Home identifies these as a “100-round saved run.” Selecting a new mode starts its new rules.

Winning a fresh mode records an Easy, Normal or Hard medal for Monkey Meadow in a separate local browser entry. Completing **Easy and Normal** gives the map a **silver border**. Restart/New Game replace the run while keeping the medals. Legacy runs do not award the new medals. Both saves and medals belong to the same browser/profile and website; gameplay remains usable if storage is unavailable.

[Silver map border](map-silver-border.png) · [Saved-run behavior](save-progress.md)

## Artwork and checks

The three user-supplied reference badges were restyled with the image-generation tool into chunky low-poly 3D portraits with golden medallion rims, matching the game models. Easy retains the cyan helmet and pacifier; Normal retains the green camouflage helmet and cards; Hard retains dark armor and red eyes/cabling. The generated transparent PNG is preserved unchanged as `assets/ui/modes/difficulty-badges.png`; CSS displays its three equal cells. The map thumbnail uses the existing Monkey Meadow render. All 45 original tower upgrade icons remain untouched.

35 regression test files pass. New checks exercise price scaling/noncompounding, investment/refunds, lives/round limits, Bloon speed with freeze/slow, MOAB health, mode save validation, v65 migration, and medal storage failures. Chromium verifies the actual Home/map/mode flow and all three difficulty rules, real purchases, pause headings, sprite/map image loads, responsive layouts, saved Hard values, wins at 40/60/80, medals/silver border, restart and a v65-format round-83 resume. No page or resource errors occur.

## v69 Hard tree

Standard Hard unlocks Double HP MOABs → Half Cash and Alternate Bloons Rounds → Impoppable → CHIMPS. ABR ends at round 100 using the complete supplied table. Each later node requires a win in its predecessor. See [Hard rules, badges and saves](hard-branches.md).

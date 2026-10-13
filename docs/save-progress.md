# Saved runs — v68 (v65/v66/v67 compatible)

The game automatically keeps **one saved run** in this browser on this website. Return to the Home screen and choose **Resume** to continue. New Game opens map and mode selection; selecting an unlocked mode-tree node replaces the checkpoint. Browsing maps or going back does not discard it. No account or network connection is needed to save.

Checkpoints are written at the start of every round and after a round completes. Tower placements, purchases, sales and other changes made between rounds are also saved immediately. The pause menu shows the saved round. Saves run periodically between rounds and when the page becomes hidden or closes; progress does not depend on the browser delivering an unload event.

If you leave during **round 60**, Resume restores the run to the **beginning of round 60** and starts that round again. All changes made during the interrupted round—including earned cash, lost lives, purchases, placements, sales, damage and usage XP—are rolled back together. This prevents keeping pop rewards while replaying the same Bloons. If the selected mode continues beyond round 60 (for example, Hard or a legacy v65 run), completing round 60 saves round 61 with its reward already credited once. Completing the final round instead finishes the run and clears its checkpoint.

The checkpoint restores:

- Towers, positions, upgrade paths, targeting, throwing hand, Camo priority and damage totals.
- Cash, lives, current round, hero level, level XP and usage XP.
- Ability cooldowns, remaining active effects, Fan Club buffs, the tier of an already-running ability, Storm activation statistics, persistent acid puddles and the global Absolute Zero buff.
- Tower IDs, including IDs belonging to sold buff sources, so new towers do not accidentally reuse them.
- Speed, Auto Start and both volume sliders.

Live Bloons, projectiles and cosmetic effects are recreated by replaying the interrupted round. Switching to another tab pauses simulation while the page stays loaded; returning to that existing tab continues the live round. While Home/map/mode selection is open, simulation is paused and the checkpoint cannot be overwritten by the empty starting map. An interrupted-round Resume starts combat; a between-round Resume waits for Start Round before combat resumes, including when Auto Start was enabled.

**Restart**, starting a new run, and winning or losing a challenge run clear its save. Sandbox has no win/loss condition. Regular tab closure keeps it. A save belongs to the browser profile and website origin: a different browser, device, private session or hosting address has separate storage. Clearing that website’s browser data removes the save.

[Desktop resume prompt](resume-run-desktop.png) · [Phone resume prompt](resume-run-mobile.png) · [Checkpoint status in Pause](saved-run-pause.png)

## Implementation and validation

`run-save.js` stores a versioned JSON checkpoint (schema 4 since v68, with difficulty, branch, legacy flag, hero XP and Apopalypse wave state) under `meadow-btd6.saved-run`. It validates the map, tower types, bounded numeric values, unique IDs, hero count, upgrade crosspaths and Tier 5 uniqueness. Only allowed fields restore; renderers, meshes, enemy references and arbitrary properties never enter the save. Purchases reconstruct tower statistics from the existing upgrade functions rather than trusting saved attack damage or prices.

Writes use one atomic `localStorage.setItem`, so a failed quota write retains the previous successful save. Corrupt or incompatible data is rejected before model construction. Storage errors show a message and leave the game playable. The save schema is independent of artwork/cache versions, allowing later icon updates to retain compatible runs.

The original v65 validation passed 34 regression test files. Those checks cover real tower snapshots, isolated checkpoint arrays, malformed/oversized saves, unsafe properties, invalid upgrade paths, duplicate towers, sold-source IDs, ability tiers, Storm stats and storage/quota failures. Chromium tests a real page close and return at round 60, comparing all seven rebuilt towers and their derived attacks, resources, timers, usage XP and puddles. It also checks round 61 rewards, desktop/phone prompts, Resume/New Game, Restart, completed/failed run cleanup, malformed saves and blocked storage. v67 additionally tests the new hero XP progression and mode behavior.

## Difficulty compatibility in v66

New Easy, Normal and Hard saves use the selected mode’s round limits, prices and speed. The selected mode restores before tower upgrades are reconstructed, preserving invested value and refunds. The pause heading and HUD denominator restore with it.

Schema-1 saves from v65 migrate to legacy Normal and retain their original 100-round limit and base Bloon speed. Runs already past round 60 continue through round 100. Their stored lives and cash are kept. Home labels them as a “100-round saved run.” New Game chooses the new rules instead. Mode medals are saved separately and survive restarting or replacing a run.

## v67 branches and hero XP

Schema 3 adds Standard/Deflation/Sandbox and Quincy’s cumulative level XP. v65/v66 snapshots preserve their difficulty rules, economy, timers and stored hero level; the hero is seeded with the minimum cumulative XP for that level, then earns new XP from completed rounds. Overflow in new saves is restored exactly. An interrupted Standard/Deflation round replays from its pre-round XP checkpoint, so a completed round is never rewarded twice.

Deflation restores its rounds 31–60/no-income rules. Sandbox allows zero lives and cash up to 9,999,999, preserves the selected round/test hero level/board, and resumes with Bloon sends cleared. Manual zero lives stays zero; leak recovery retains the last manually set positive amount. Standard map progress and Easy branch unlocks are stored separately from the run checkpoint and survive Restart. Sandbox never updates those stats. See [Easy branches and Sandbox](easy-branches-and-sandbox.md).

## v68 Normal branches

Reverse restores its reversed route before replaying an interrupted round. Apopalypse uses continuous live snapshots instead of replaying a wave: seed, queued sends/spawn timing, pending completions and surviving Bloons with HP/positions/properties/effects/source references are restored, including icicle and puddle hit history. Towers, hero XP and economy resume with that same snapshot. Already completed waves cannot repeat XP rewards. In-flight projectiles and cosmetic effects are discarded, while cooldowns and durable combat effects persist. Schema 4 retains all older checkpoint formats. [Details](normal-branches.md).

# Saved runs — v65

The game automatically keeps **one saved run** in this browser on this website. Return to the page and choose **Resume** to continue, or **New Game** to discard the checkpoint. No account or network connection is needed to save.

Checkpoints are written at the start of every round and after a round completes. Tower placements, purchases, sales and other changes made between rounds are also saved immediately. The pause menu shows the saved round. Saves run periodically between rounds and when the page becomes hidden or closes; progress does not depend on the browser delivering an unload event.

If you leave during **round 60**, Resume restores the run to the **beginning of round 60** and starts that round again. All changes made during the interrupted round—including earned cash, lost lives, purchases, placements, sales, damage and usage XP—are rolled back together. This prevents keeping pop rewards while replaying the same Bloons. If round 60 was completed, you return ready for round 61 with its completion reward already credited once.

The checkpoint restores:

- Towers, positions, upgrade paths, targeting, throwing hand, Camo priority and damage totals.
- Cash, lives, current round, hero level and usage XP.
- Ability cooldowns, remaining active effects, Fan Club buffs, the tier of an already-running ability, Storm activation statistics, persistent acid puddles and the global Absolute Zero buff.
- Tower IDs, including IDs belonging to sold buff sources, so new towers do not accidentally reuse them.
- Speed, Auto Start and both volume sliders.

Live Bloons, projectiles and cosmetic effects are recreated by replaying the interrupted round. Switching to another tab pauses simulation while the page stays loaded; returning to that existing tab continues the live round. While the Resume prompt is open, simulation is paused and the checkpoint cannot be overwritten by the empty starting map. Escape leaves the prompt open. An interrupted-round Resume starts combat; a between-round Resume waits for Start Round before combat resumes, including when Auto Start was enabled.

**Restart**, **New Game**, winning and losing clear the saved run. Regular tab closure keeps it. A save belongs to the browser profile and website origin: a different browser, device, private session or hosting address has separate storage. Clearing that website’s browser data removes the save.

[Desktop resume prompt](resume-run-desktop.png) · [Phone resume prompt](resume-run-mobile.png) · [Checkpoint status in Pause](saved-run-pause.png)

## Implementation and validation

`run-save.js` stores a versioned JSON checkpoint under `meadow-btd6.saved-run`. It validates the map, tower types, bounded numeric values, unique IDs, hero count, upgrade crosspaths and Tier 5 uniqueness. Only allowed fields restore; renderers, meshes, enemy references and arbitrary properties never enter the save. Purchases reconstruct tower statistics from the existing upgrade functions rather than trusting saved attack damage or prices.

Writes use one atomic `localStorage.setItem`, so a failed quota write retains the previous successful save. Corrupt or incompatible data is rejected before model construction. Storage errors show a message and leave the game playable. The save schema is independent of artwork/cache versions, allowing later icon updates to retain compatible runs.

34 regression test files pass. New tests cover real tower snapshots, isolated checkpoint arrays, malformed/oversized saves, unsafe properties, invalid upgrade paths, duplicate towers, sold-source IDs, ability tiers, Storm stats and storage/quota failures. Chromium tests a real page close and return at round 60, comparing all seven rebuilt towers and their derived attacks, resources, timers, usage XP and puddles. It also checks round 61 rewards, desktop/phone prompts, Resume/New Game, Restart, completed/failed run cleanup, malformed saves and blocked storage. No combat balance changes are made.

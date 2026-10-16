# Ultimate Crosspathing and Place Anywhere — v76

Open the gear/settings button during a game to find the two new switches. Both start off for a new run and save with that run.

**Ultimate Crosspathing** opens every upgrade path on the six primary towers, allowing 5-5-5. Each upgrade still costs its normal difficulty-adjusted price. The five-tier cap and existing one-of-each-Tier-5-per-tower-type limit remain. Quincy uses his existing XP/level system, and the temporary MIB remains a free support tower with no upgrades. The original owned/next artwork and tier markers show all purchased paths. Existing model selection uses the highest path, with its existing tie order.

**Place Anywhere** allows placement on roads, obstacles, water and other towers, up to and including the map boundary for the tower’s center. Off-map placement, insufficient cash and a second Quincy are still blocked. The preview turns green or red using the same rules as the actual placement button/click. Repeated clicks on overlapping towers cycle through the stack so each tower can be selected, upgraded or sold.

Turning either switch off restores normal rules for subsequent purchases/placements. Existing 5-5-5 or overlapping towers stay in place. Saved runs retain both switches plus whether Ultimate Crosspathing has been used, so turning it off does not invalidate earlier upgrades. Existing versions 1–5 remain compatible; missing options default to off. Mid-round changes to switches save immediately; tower purchases still use the existing round-start checkpoint on resume.

[Desktop settings](play-options-desktop.png) · [Phone settings](play-options-mobile.png) · [5-5-5 upgrade panel](ultimate-crosspathing.png)

All 42 regression test files pass. The new checks exercise every purchase order of 5-5-5 for all six primary towers, unchanged normal crosspath locks, Tier 5 limits, deterministic combat stats, retained abilities, water/path/overlap/edge placement, unaffordable and extra-hero rejection, overlapping selection and saved-run validation. Combined high Boomerang paths now produce the same stats across purchase orders and checkpoint restoration. A combined Bomb Shooter exposes both MOAB Eliminator and passive Bomb Storm.

Chromium purchases all 90 upgrades through the actual selected-tower buttons, decodes the owned artwork, and verifies that each 5-5-5 primary attacks a real MOAB with its abilities available. It reloads the run and compares every tower’s paths, combat stats and position, including overlapping road placements and a free MIB centered at a map corner. Turning both switches off restores normal 3-2-0 locks and blocked road placement while keeping and reloading the existing six 5-5-5 towers. Desktop/phone UI, keyboard toggling, stack selection and actual green/red placement previews are also checked without page/resource errors.

All 90 original primary upgrade images, five audio files, the v75 MIB and the existing mode trees are preserved. The complete ZIP includes the runtime, all assets, documentation and regression test sources.

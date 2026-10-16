# Base Sniper Monkey — v77

The first Military tower uses the supplied base stats and model reference.

| Stat | Base value |
| --- | --- |
| Easy / Normal / Hard / Impoppable price | $300 / $350 / $380 / $420 |
| Damage / pierce | 2 / 1 |
| Attack interval | 1.59 seconds |
| Range | Infinite |
| Attack | Instant hitscan; no traveling damage projectile |
| Damage type | Sharp |
| Camo / Lead / Frozen | Cannot hit natively |
| Targets | First, Last, Strong, Close |
| Footprint radius | 6 game units |

Shots resolve damage immediately against the selected target anywhere on the map. Excess damage carries through that target’s child layers using the same multi-layer damage behavior as existing towers; another independent Bloon is not pierced. A short tracer and muzzle flash are cosmetic. MIB support applies from the Sniper’s position, so a nearby MIB can allow it to target Camo and hit Lead, Frozen and DDTs.

The procedural model follows the reference: green camouflage beret, black band, yellow circular badge, angular brown fur, large white eyes, tan face/belly/hands/feet, curled tail and a long gray rifle held upright. Idle motion and blinking work between rounds. Shooting raises the rifle and gripping arm into aim, then applies recoil and returns to the reference pose. Feet and root remain planted. The shop portrait is rendered from the same model.

[Idle model](sniper-model.png) · [Aiming model](sniper-aiming.png) · [In game](sniper-in-game.png) · [Phone panel](sniper-mobile.png) · [Upgrade browser overview](sniper-overview.png)

The shop lists the new tower and keeps the exact supplied prices, including Easy’s $300 rather than generic difficulty rounding. The selected panel provides targeting, selling and stats, plus an infinite-range base summary. Infinite range never scales a scene range circle. The upgrade browser shows the base overview and usage XP; upgrade paths await the supplied stats/models/artwork. Ultimate Crosspathing does not invent upgrades for this base-only tower.

Saved runs retain the Sniper’s position, target, damage counter, cooldown and usage XP. Infinite range is derived when the model is reconstructed, so saves do not contain invalid JSON numbers. Save schema 5 remains compatible, including the v76 gameplay switches, 5-5-5 primary towers and existing MIB. Sniper saves reject fabricated upgrade paths.

All 43 regression test files pass. New checks cover exact prices in each difficulty, global target selection, instant damage without a projectile, one target family per shot, excess layer damage, all targeting modes, Camo/Lead/Frozen/DDT restrictions, MIB support, 1.59s cadence at normal/fast-forward step sizes, between-round behavior, reference features, animation, planted feet, independent preview materials and save restoration.

Chromium verifies the real shop prices and decoded icon, placement and finite scene transforms, selected controls, instant 2 damage on a distant MOAB while leaving a second one untouched, attack cadence, native immunities, MIB-assisted hits and removal, restored target/cooldown/damage/options, overview arrows, existing Dart cards and mobile layout. There are no page or resource errors. All 90 original primary upgrade icons, five audio files and prior towers/modes remain included.

# Hard branches — v69

Selecting Hard shows Standard Hard with two connected paths. Beat Standard Hard to unlock **Double HP MOABs** and **Alternate Bloons Rounds**. Beat Double HP MOABs to unlock **Half Cash**. Beat ABR to unlock **Impoppable**, then beat Impoppable to unlock **CHIMPS**. Each node records its own local medal; existing Standard medals continue to count. Browsing/backing out preserves the saved run. Selecting an unlocked node begins a new run.

[Locked tree](hard-tree-locked.png) · [Unlocked tree](hard-tree-unlocked.png) · [Phone tree](hard-tree-mobile.png) · [Black CHIMPS node](hard-tree-black-badge.png)

| Mode | Lives | Rounds | Starting cash | Prices vs Normal | Rule |
|---|---:|---|---:|---:|---|
| Double HP MOABs | 100 | 3–80 | $650 | 108% | Every MOAB-class shell has twice its usual HP |
| Half Cash | 100 | 3–80 | $325 | 108% | Pops, end-of-round and generated income ×0.5 |
| Alternate Bloons Rounds | 100 | 3–100 | $650 | 108% | Supplied alternative round table |
| Impoppable | 1 | 6–100 | $650 | 120% | One life, higher costs |
| CHIMPS | 1 | 6–100 | $650 | 108% | No Continues, lost hearts, extra income, Knowledge, Powers or selling |

All five use Hard Bloon speed: **1.25× Easy**. Prices round to the nearest $5, ties down, from the original Normal costs. Impoppable's 120% Normal prices are 11.11% higher than Hard's 108%. Dart costs $240 and Sharp Shots $170 in Impoppable, versus $215/$150 in the other Hard modes. Both shop purchases and upgrades use this table.

Double HP applies to MOAB/BFB/ZOMG/DDT/BAD and every spawned blimp child, stacking with Fortified and existing round health scaling. Regular Bloons and Ceramics retain their health. Half Cash halves actual income at its source, including fractional amounts; sale refunds still follow Hard invested value.

## All 100 Alternate Bloon Rounds

[Original uploaded table](alternate-rounds-source.txt) is preserved unchanged. `alternate-rounds.js` contains all **100 rows, 285 ordered groups and 6,847 Bloons**, including repeated groups and Camo/Regrow/Fortified combinations. ABR overrides only the ABR run; other modes keep their existing tables.

Hard ABR starts at round 3, retains every row 1–100 in the data, and ends at **100** as requested. Examples include Camo Reds on round 5, Leads on round 10, Purples on round 15, a Fortified MOAB on 40, a Fortified BFB on 60, two ZOMGs on 80, and a Fortified BAD on 100. Clearing round 80 advances to 81 rather than awarding victory. The final round drains before completion.

The supplied table includes each round's aggregate duration but no individual group delays. Sends therefore retain the exact listed order/count/properties and are uniformly spaced from the first to last send across that duration. Spawning catches up on elapsed time, preserving those timings at all game speeds. Native pop rewards, round bonuses and existing round health/speed modifiers apply; the table's cash/RBE columns are source metadata, not extra payouts.

[ABR pause](alternate-pause.png) · [Fortified BAD on round 100](alternate-round-100.png)

## CHIMPS restrictions and badges

CHIMPS has one life, so any heart lost ends the run. Selling is disabled in the selected panel and guarded in the purchase handler. Extra generated cash is blocked; ordinary popping cash and normal end-of-round rewards remain available. Hero XP and tower abilities retain their normal rules. The game has no Monkey Knowledge, Powers or paid Continue mechanics.

A fresh, uninterrupted win earns a **black badge**. Resuming a saved run, backing out/closing its page or using **Retry Last Round** changes that run to **red**. Resume always marks red, even when the browser did not deliver a page-close event. Pause, Continue and switching tabs while the same game stays loaded preserve eligibility. Pause displays the current badge status.

After a CHIMPS defeat, Retry Last Round restores the actual pre-round checkpoint in place: cash, towers/upgrades, lives, hero XP, damage totals, cooldowns and durable effects all roll back together, then the same round restarts. Bloons/projectiles from the failed attempt are cleared. This is a retry, with red eligibility, rather than a Continue that adds lives or retains partial-wave rewards.

Victory displays the earned color. The map and tree show the best earned CHIMPS badge; a later red win never overwrites an existing black medal. Medals survive Restart/new runs and live in this browser/profile/site origin.

[Red retry status](chimps-red-retry.png) · [Black victory](chimps-black-victory.png)

## Saves, artwork and checks

Schema **5** adds Hard variants and CHIMPS eligibility while accepting schema 1–4 saves. Mode prices/rules apply before towers are rebuilt; Impoppable/CHIMPS saves validate exactly one life. Existing legacy 100-round runs, Easy/Normal branches and Apopalypse live actors/queues/effects remain compatible. CHIMPS retry is an in-memory defeat checkpoint; closing after defeat returns Home without that retry. Ordinary interrupted runs keep their saved checkpoint.

The five uploaded mode references were restyled with image generation into the game's faceted medallions. The transparent **1536×1024 RGBA** sprite is preserved unchanged as `assets/ui/modes/hard-branch-badges.png`: top row twin blue blimps, split gold coin, blue/yellow/red balloons; bottom row green Impoppable portrait, red CHIMPS, black CHIMPS. CSS displays the six equal cells. All 45 original upgrade icons and five uploaded MP3s are unchanged.

39 regression test files pass. Checks compare every ABR row with the original source, verify complete queue flags/order/count/duration, the unlock chain, all blimp health classes, economy/prices and badge persistence. Chromium checks actual desktop/phone menus and image loads, prerequisite wins, HP/cash, ABR spawning and round-100 victory, Impoppable price/save restoration, CHIMPS selling/income guards, pre-round retry restoration, red/black wins, resume eligibility and retention of the best badge.

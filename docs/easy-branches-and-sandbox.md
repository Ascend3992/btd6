# Easy branches, Sandbox and hero XP — v67

Selecting Easy, Normal or Hard now opens its mode tree. **Standard Easy** leads to two connected branches: **Deflation** and **Sandbox**. Both are locked until Monkey Meadow’s Standard Easy medal is earned; existing v66 Easy medals unlock them immediately. Since v68, Normal has Reverse and Apopalypse branches unlocked by a Normal win; [details](normal-branches.md). Hard currently shows only its Standard mode. Back/Escape navigation does not replace a checkpoint. A new run starts only when an unlocked tree node is selected.

[Locked Easy tree](easy-tree-locked.png) · [Unlocked tree](easy-tree-unlocked.png) · [Phone tree](easy-tree-mobile.png)

## Deflation

Deflation uses Easy’s 200 lives, 85% tower/upgrade prices and base Bloon speed. It starts on **round 31 with $20,000** and ends after round **60**. Pops, blimp destruction and round completion grant **no cash income**. Selling a tower remains an investment refund. All income awards go through the mode-aware income helper, so future supported income sources can honor this rule. No new income-producing tower has been added.

Quincy still earns level XP from completed rounds. Deflation saves and resumes with its own mode, economy, round and hero XP. Winning awards its own Deflation medal; it does not count as Standard Easy or Normal, grant the silver map border, or raise Sandbox’s standard-round limit.

[Deflation pause](deflation-pause.png)

## Sandbox

Easy Sandbox starts with **$9,999,999** and **999,999 lives**, using Easy prices and speed. Its blue shop has **Towers / Send Bloons** tabs. The Send Bloons tab includes:

- Set Round and Send Round. The HUD round indicator also focuses the round field. Setting or sending a round clears existing Bloons and queued sends. Sending a complete round uses the existing real round data. It never advances the round automatically.
- Count **1–999** and spacing **0–999 tenths of a second**. For example, 20 means two seconds. Zero spacing sends the full batch together. Custom sends append to existing queues and keep Bloons already on the map.
- Camo, Regrow and Fortified properties for custom sends. DDTs retain their inherent Camo property.
- All 17 standard Bloon/blimp types, plus **Test Bloon** and **MOAB Test Bloon**. Test Bloons have 1 trillion base HP, produce no children, leak for zero lives and have the lowest Strong targeting priority. MOAB Test Bloons are treated as blimps.
- Clear Bloons, Reset Damage, Remove Towers, Reset Abilities and Set Cash / Lives. Clear cancels queued sends and completes active end-of-round effects once. Remove Towers gives no refund; selling remains available normally. Reset Abilities resets cooldowns while retaining any active ability’s duration.
- A Quincy level selector for testing levels 1–20 without earning XP.

Cash and lives can be set to any whole number from **0 to 9,999,999**, using the stats editor or the HUD values. Cash earned/refunded while testing stays below the cap. Manually setting lives to zero stops tower attacks, abilities and damage effects without ending the game. If leaks reduce positive lives to zero, the last manually set positive life amount returns after **three seconds without another leak**. Manually setting zero disables that recovery until a positive value is entered.

The available round range ends at the highest round reached in a **Standard** game on Monkey Meadow, capped at 999. Existing Easy/Normal/Hard medals seed at least 40/60/80, and resumed v65 Standard saves preserve higher reached rounds. Deflation and Sandbox do not raise this limit. Round numbers supply the existing health/super-Ceramic modifiers. In Sandbox, DDTs have **480 base HP before round 90** and BADs have **28,000 base HP before round 100**; later rounds use existing health scaling. Easy’s special 133-HP round-40 MOAB applies to its challenge modes, while Sandbox uses the standard 200-HP MOAB for testing.

There are **no victory/defeat screens, rewards or medals** in Sandbox. Sends do not earn round-completion cash or hero XP, increment attack usage XP, or change map progress. Local tower damage counters still measure tests. End-of-round effects run when a send finishes or Clear Bloons is used; no automatic next round is scheduled. Auto Start is disabled in Sandbox. Restart returns to Home.

Sandbox boards save automatically, including towers, upgrades, chosen round, cash, lives (including manual zero), hero test level and cooldown state. Resume clears active Bloons/queued sends and leaves the round under manual control.

[Desktop Sandbox](sandbox-desktop.png) · [Towers and tools](sandbox-towers.png) · [Phone Sandbox](sandbox-mobile.png)

## Quincy level XP

The supplied XP formula is awarded **once after a round is completed**, to Quincy if he is currently placed:

```
r <= 20:      20r + 20
21 <= r <= 50: 40(r - 20) + 420
r > 50:       90(r - 50) + 1620
```

The original [per-level requirements](quincy-levels-source.txt) now determine leveling. Each requirement is XP needed after the previous level; excess XP carries forward, multiple levels can be earned together, and level 20 is the maximum. Quincy starts at level 1 with zero XP when placed, including late placements. Losing/restarting an interrupted round grants no XP for that unfinished attempt. Selling Quincy discards his level XP. Deflation grants normal round XP; Sandbox grants none.

The selected-tower panel shows **Level / XP toward the next level**, and the upgrade overview shows total **Level XP** and each future level’s requirement. Primary-tower attack usage XP remains a separate informational counter. Existing hero statistics, model milestones and ability unlock/cooldown rules are unchanged. New saved runs persist XP and overflow in schema 3. v65/v66 saves retain their stored hero level by seeding its minimum cumulative XP; future completed rounds use the new formula. Other saved economy/difficulty rules remain compatible.

[Quincy XP](quincy-round-xp.png) · [Hero statistics](quincy-level-stats.md) · [Saved runs](save-progress.md)

## Artwork and validation

The two uploaded reference badges were restyled with image generation to match the game’s chunky faceted 3D objects, cyan medallion inset and golden rim. Deflation retains the red balloon and white gloves; Sandbox retains the wooden sand box and blue shovel. The original generated 1774×887 RGBA sprite is stored unchanged as `assets/ui/modes/easy-branch-badges.png`, with transparency preserved. All 45 original tower upgrade icons and all five uploaded audio files remain unchanged.

37 regression test files cover the supplied XP formula and all level thresholds, Deflation income suppression, Sandbox spawning validation/spacing/health/Strong priorities, standard progress limits, price scaling and saves/migrations. Chromium checks actual tree locks/unlocks, all Standard modes and v65 compatibility, Deflation purchases/zero income/resume/win, all Sandbox controls, a 999-Bloon zero-spacing batch, life bounds/recovery, zero-life boards, cooldown/damage/tower resets, medals/XP isolation and responsive image loads.

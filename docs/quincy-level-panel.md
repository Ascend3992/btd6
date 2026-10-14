# Quincy level panel — v72

Selecting Quincy opens a purple-headed panel with his existing game-model portrait, targeting and damage total. Below the portrait, a shield shows the current level beside a blue XP meter, the exact XP earned/required for the next level, and the current level's effect. The next-level section shows what the upgrade adds and a green **Buy level** button with its current cash price.

[Desktop panel](quincy-level-panel.png) · [Phone panel](quincy-level-panel-mobile.png) · [Maximum level](quincy-level-panel-max.png)

The panel uses the existing Quincy models at levels 1, 3, 7, 10 and 20. The reference's Cyber skin is not added. Rapid Shot and Storm of Arrows remain available as compact ability buttons beneath progression and in the existing ability bar. Targeting, stats, selling (except in CHIMPS) and the full level overview remain available. Other towers retain their existing upgrade cards.

## XP and cash purchases

Natural XP still uses the supplied round formula and all original per-level requirements. The meter updates after completed rounds. Overflow carries forward; natural XP is never sold or deducted.

A purchase buys exactly the XP remaining to the **next** level, using the supplied Normal full-level cost/XP table (one cash per missing XP), then the selected difficulty's price multiplier and existing nearest-$5 rounding, ties down. Normal keeps its unrounded integer base amount. For example, level 1 with 40/180 XP costs **$140** in Normal, **$120** in Easy, **$150** in Hard/CHIMPS and **$170** in Impoppable. Each click buys one level. The price falls as natural XP is earned.

Insufficient cash disables the button and colors its price red. The handler also guards invalid selection, max level, Home/resume/restart and ended runs. Purchases cannot overspend or exceed level 20. On reaching level 20, the bar fills and **MAX LEVEL REACHED** replaces the next-level purchase.

A bought level uses the same stat/model/ability synchronization as a natural level: Camo at 5, Rapid Shot at 3, Storm at 10 and later attack improvements. Crossing an ability's unlock initializes its existing cooldown; later level purchases keep running cooldowns and effects. XP purchases are allowed in CHIMPS and do not change its no-selling/no-extra-income rules or badge eligibility.

## Saved purchases

Actual cash paid for levels contributes to Quincy's invested value and normal 70% sale refund. Schema 5 adds optional `heroLevelSpend`; v65–v71 snapshots without it restore zero paid investment. Only a hero may store nonzero spending, and values must be bounded nonnegative integers. Restore applies mode prices, rebuilds Quincy and adds his recorded paid amount once, preserving cash, XP, level, investment and cooldowns.

Between-round purchases save immediately. During a standard interrupted round, the entire pre-round checkpoint restores: a purchase made during that attempt rolls back with its cash, XP and investment. Apopalypse retains its existing live-wave snapshot behavior. CHIMPS Retry Last Round uses the same exact checkpoint rules. Sandbox still permits manually choosing a test level; that control does not refund previous purchases.

## Validation

All 39 regression test files pass, including new checks for partial-XP prices across difficulty modes, affordability/invalid-state/max-level guards, synchronized stats and unlocks, retained cooldowns, normal XP after purchasing, spend validation and older-save defaults. Chromium checks the real panel, XP values and meter, single-click cash charges, models/abilities, level-20 cap, phone purchase/layout, resume with paid investment and cooldowns, interrupted-round rollback and unchanged Tack upgrade cards/tree. All 75 original upgrade icons and five MP3s remain unchanged.

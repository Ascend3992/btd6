# Quincy level stats

The supplied table is preserved in [quincy-levels-source.txt](quincy-levels-source.txt). Base placement costs: $460 / $540 / $585 / $650. The game uses Normal ($540) pricing and its existing automatic leveling: level = min(20, 1 + floor((round - 1) / 5)). Level costs and XP are recorded as reference metadata; XP earning and buying hero levels are not implemented.

All normal arrows deal 1 damage, jump at most 50 units between targets, and have separate pierce budgets. Range units use the same 0.32 world scale as other towers. The existing 1.4s base arrow lifetime becomes 1.75s at level 17.

| Level | Supplied cost / XP | Range | Cooldown (s) | Arrows / shot | Pierce / arrow | MOAB damage | Camo | Explosive volley |
|---|---|---|---|---|---|---|---|---|
| 1 | $540 / N/A | 50 | 0.95 | 1 | 3 | 1 | No | None |
| 2 | $180 / 180 | 50 | 0.95 | 1 | 4 | 1 | No | None |
| 3 | $460 / 460 | 50 | 0.95 | 1 | 4 | 1 | No | None |
| 4 | $1,000 / 1,000 | 52 | 0.95 | 1 | 4 | 1 | No | None |
| 5 | $1,860 / 1,860 | 52 | 0.95 | 1 | 4 | 1 | Yes | None |
| 6 | $3,280 / 3,280 | 52 | 0.95 | 2 | 4 | 1 | Yes | None |
| 7 | $5,180 / 5,180 | 52 | 0.95 | 2 | 4 | 1 | Yes | Every 3rd |
| 8 | $8,320 / 8,320 | 52 | 0.95 | 2 | 4 | 3 | Yes | Every 3rd |
| 9 | $9,380 / 9,380 | 52 | 0.95 | 2 | 6 | 3 | Yes | Every 3rd |
| 10 | $13,620 / 13,620 | 52 | 0.95 | 2 | 6 | 3 | Yes | Every 3rd |
| 11 | $16,380 / 16,380 | 52 | 0.6 | 2 | 6 | 3 | Yes | Every 3rd |
| 12 | $14,400 / 14,400 | 52 | 0.6 | 2 | 7 | 3 | Yes | Every 3rd |
| 13 | $16,650 / 16,650 | 54 | 0.6 | 2 | 7 | 3 | Yes | Every 3rd |
| 14 | $14,940 / 14,940 | 54 | 0.6 | 2 | 7 | 4 | Yes | Every 3rd |
| 15 | $16,380 / 16,380 | 54 | 0.6 | 2 | 7 | 4 | Yes | Every 3rd |
| 16 | $17,820 / 17,820 | 54 | 0.4 | 2 | 7 | 4 | Yes | Every 3rd |
| 17 | $19,260 / 19,260 | 54 | 0.4 | 2 | 7 | 4 | Yes | Every 2nd |
| 18 | $20,700 / 20,700 | 54 | 0.25 | 2 | 7 | 4 | Yes | Every 2nd |
| 19 | $16,470 / 16,470 | 54 | 0.25 | 3 | 9 | 4 | Yes | Every 2nd |
| 20 | $17,280 / 17,280 | 54 | 0.2 | 3 | 9 | 4 | Yes | Every 2nd |

## Abilities

| Ability / levels | Duration | Cooldown | Initial cooldown | Effect |
|---|---|---|---|---|
| Rapid Shot, 3–12 | 8s | 60s | 16.7s at unlock | 3x attack speed |
| Rapid Shot, 13–14 | 12s | 60s | — | 3x attack speed |
| Rapid Shot, 15–20 | 12s | 45s | — | 4x attack speed |
| Storm, 10–17 | 3s | 70s | 23.33s at unlock | 5% chance/frame; 6 regular/Ceramic damage, 12 MOAB |
| Storm, 18–19 | 3s | 55s | — | 7.5% chance/frame; 6 regular, 24 Ceramic, 12 MOAB |
| Storm, 20 | 3s | 55s | — | 10% chance/frame; 10 regular, 34 Ceramic, 20 MOAB |

Storm selects a target across the map using Quincy's First/Last/Close/Strong targeting at activation and fixes its center at that position; with no target, it uses Quincy's position. It hits any number of eligible Bloons inside a 100-unit radius, including new arrivals. The simulation uses fixed 60-Hz chance rolls and a 0.05s per-Bloon rehit delay. Ability time and cooldowns pause between rounds. Storm's MOAB bonus is separate from the main arrows' triple/quad damage.

Every arrow in an explosive volley bursts once at its first impact, with 1 damage, 10 independent pierce and a 25.7-unit radius. The originating target can take both the arrow and burst damage. The arrow then continues ricocheting with its remaining pierce. MOAB bonuses apply to both the direct arrow and explosion. Ordinary arrows are Sharp; explosive bursts pop Lead while respecting Explosion immunity. Camo detection unlocks at 5 without Camo priority.

Clarifying behavior references: [Quincy on Bloons Wiki](https://bloons.fandom.com/wiki/Quincy_%28BTD6%29), [ability targeting](https://bloons.fandom.com/wiki/Activated_Abilities_%28BTD6%29), [Ninja Kiwi update notes on continuing after the initial explosion](https://store.steampowered.com/news/posts/?appids=960090&enddate=1571864957&feed=steam_community_announcements). The supplied numerical table takes priority.

## Reference models and animations

[Five model stages](quincy-models.png) · [Bow-draw poses](quincy-models-shooting.png) · [Ability poses](quincy-models-abilities.png) · [Combat](quincy-levels-combat.png)

| Model stage | Reference details |
|---|---|
| Level 1 | Gray segmented helmet, orange side bands, dark compound bow, black armor, segmented sleeves, three studded belt pouches and orange quiver fletching |
| Level 3 | More quiver arrows; Rapid Shot casting and orange accent pulse |
| Level 7 | Yellow/red striped explosive arrow in the quiver and explosive projectile fletching |
| Level 10 | Orange bow tips/cams and orange-striped helmet side wings; Storm casting and falling arrow effects |
| Level 20 | Orange reflective visor, orange-tipped helmet crest and mostly orange compound bow |

Intermediate levels retain the latest model stage. Idle breathing, blinking, tail and quiver motion leave the boots planted. Shooting animates the drawing hand, loaded arrow, bowstring and cams together, then returns to rest. Projectiles originate at the held bow's world-space launch point. Ability poses and effects are cosmetic; the ability simulation above controls hit chances and damage. Model replacements preserve targeting, cooldowns and active abilities and dispose the old body resources.

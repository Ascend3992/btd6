# Normal branches — v68

Choosing **Normal (Medium)** opens its connected mode tree. **Standard Normal** leads to **Reverse** and **Apopalypse**. Both unlock after a Normal win on Monkey Meadow; previously earned v66/v67 Normal medals unlock them immediately. Easy medals do not unlock them. Each branch records its own medal without replacing the parent’s medal. Easy’s Deflation/Sandbox branches remain unchanged, and Hard currently has only Standard Hard.

[Locked tree](normal-tree-locked.png) · [Unlocked tree](normal-tree-unlocked.png) · [Phone tree](normal-tree-mobile.png)

Both branches use Normal’s **150 lives**, **$650 starting cash**, **default prices**, **1.10× base Bloon speed**, and **rounds 1–60**. Browsing or backing out preserves the current save; selecting an unlocked node starts its mode.

## Reverse

Bloons enter at Monkey Meadow’s original exit and leave at its original entrance. Every round has the same Bloons and properties as Standard Normal, with the full spawn order reversed. Inter-Bloon spacing is reversed along with that order. The road and placement rules stay the same.

Track distances are recomputed for the reversed route. First/Last targeting and knockback continue to follow distance along the active route, so First targets the Bloon closest to the current exit. Child Bloons inherit their parent’s position on the reversed route. Selecting or resuming another mode restores the forward route. Pause displays **REVERSE MODE**.

Reverse keeps normal round breaks, cash rewards and completion XP. An interrupted round resumes from its starting checkpoint as before. The mode restores its route before rebuilding the run. Clearing round 60 earns the Reverse medal.

[Reverse pause](reverse-pause.png)

## Apopalypse

Press Start once to begin continuous waves. Each round randomizes the stock round’s group counts, ordinary color variants, order, spacing and eligible Camo/Regrow/Fortified properties. Counts vary by 75–125% around the corresponding stock groups; early-round colors and property introduction remain constrained by progression. Blimps retain their classes and do not gain random Camo/Regrow. Every wave has at least one Bloon.

A fresh run gets a random seed. That seed and round number reproduce future waves, so reloading cannot reroll an upcoming wave. The active queue itself is saved.

As soon as the **last Bloon enters**, the next wave begins in the same spawning step, even while earlier Bloons remain on the map. There is no waiting for clears, manual Start prompt or Auto Start delay between rounds. After the final wave enters, victory waits until **all surviving Bloons from every wave** are cleared. Leaks still cost lives and can end the run. Pause displays **APOPALYPSE MODE** and Auto Start is disabled because wave advancement is automatic.

Pops provide cash normally; there are **no end-of-round cash bonuses** in this continuous challenge. Quincy earns the supplied round XP once all Bloons from that individual wave are cleared. Children and regrown Bloons retain their original wave number. Overlapping/out-of-order clears cannot award the same wave’s XP twice. End-of-round effects run once per completed wave. Apopalypse has its own medal and does not raise the Standard map-progress limit used by Sandbox.

[Continuous waves](apopalypse-waves.png) · [Pause](apopalypse-pause.png) · [Resumed waves](apopalypse-resumed.png)

## Saves, artwork and verification

Save schema 4 remains compatible with v65/v66/v67 checkpoints, including hero XP, legacy 100-round Normal runs, Deflation and Sandbox. Reverse retains checkpoint replay. Apopalypse saves its live state because multiple waves can overlap: seed, pending wave completions, current queue and spawn timer, surviving Bloon types/HP/positions/properties/regrow ancestry, freeze/slow/glue/stun/burn effects, damage sources, shards/icicles and their hit history, puddle hit history, economy, towers and hero XP. Resume reconstructs those logical Bloons and continues the queue without resetting earned rewards or dropping surviving threats. In-flight projectiles and purely cosmetic effects are not stored; tower cooldowns and durable combat effects are retained.

Malformed positions, HP, wave numbers, IDs, sources, status data and hit references are rejected before scene construction. Saves never contain meshes or executable properties, and failed writes keep the previous valid save. Existing local medals and Standard progress remain separate from the run.

The two uploaded icon references were restyled with image generation into the game’s faceted 3D medallion style. Reverse retains cyan with two white rewind arrows; Apopalypse retains the black skull-and-crossbones balloon. The generated **1774×887 RGBA** sprite, `assets/ui/modes/normal-branch-badges.png`, is preserved unchanged with full transparency around the badges. All 45 original upgrade icons, tower combat statistics and five uploaded audio assets remain intact.

38 regression test files pass. Checks cover all 60 reversed round orders, endpoint/distance restoration, repeatable randomized waves, overlapping spawning, one-time XP, final-wave draining, branch rules/medals and live-save validation/ownership. Chromium checks actual unlocks, images and responsive trees, Reverse movement/round order/pause/resume, Apopalypse transitions and live effect/source restoration, and existing Standard/Easy/Sandbox behavior with no page or resource errors.

# Boomerang Monkey seeking throws — v74

Ordinary rangs previously flew a fixed circle oriented toward the target. That circle often passed beside a Bloon inside range, so aiming at it did not mean the projectile reached it.

Base throws, the first two top tiers and all middle-path ordinary throws now steer toward their aimed Bloon. A small handed bend preserves the curved look and Change Hands behavior, tapering near impact. After a hit, remaining pierce can seek another eligible Bloon in the tower's targeting range. If no eligible target remains, or the outbound distance budget is used, the rang returns to its source. Damage, pierce, projectile speed, attack rates and maximum travel budget remain unchanged. Each ordinary rang still hits an individual Bloon at most once.

Kylies, MOAB Press and MOAB Domination throws steer toward their aimed target on the outbound leg until the first hit, then continue their out-and-back flight. They return to the actual source after steering. Existing 0.3s/0.1s re-hit cooldowns, pierce, blimp bonuses, knockback and Domination expiration explosions are preserved. Special throws reacquire blimps if their original target disappears; incidental eligible Bloons can still be pierced. Glaive Ricochet already tracks targets and keeps its original behavior, as do Lord orbitals.

Target reacquisition uses the existing targeting mode and range rules. Seeking does not reveal Camo or bypass Lead/Frozen immunity; Red Hot Rangs keeps its existing Heat ability to pop Lead and Frozen. Both ordinary and Kylie collisions remain swept in short substeps, preventing fast-forward tunneling. Throws have bounded travel and cannot seek indefinitely.

[Moving MOAB combat](boomer-seeking-combat.png) · [Seeking Kylie](boomer-seeking-kylie.png)

All 40 regression test files pass. New checks cover moving targets across base/top/middle/Kylie/special throws, both hands, normal and fast-forward steps, close targets, return cleanup, pierce caps, one-hit history and eligible-target reacquisition. Existing Kylie re-hit, Press/knockback, Domination explosions, Glaive Lord, Perma/Turbo and visual checks continue to pass. Chromium compares the old and new base attacks against an actual round-40 MOAB moving along Monkey Meadow's road, checks Kylie damage and tracking, and verifies the seeking description in the upgrade overview. In that controlled MOAB run, both versions fired five throws: the old circle dealt one damage, while seeking dealt five.

Other towers, all 90 original upgrade icons, five MP3s, Quincy purchases/models, saved-run schema, mode trees, ABR table and CHIMPS badges remain unchanged. No new artwork is generated. The full ZIP includes the updated game and regression checks.

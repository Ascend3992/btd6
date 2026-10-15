# Temporary MIB — v75

The free MIB supports monkeys whose centers are within 25 game tiles of its center, including the boundary. As with existing tower ranges, 25 tiles is 8 world units. Its blue range circle shows this area. Bloons still need to be within each attacking monkey’s own range.

Supported monkeys can target Camo and bypass damage immunities for all materials and classes, including Lead, Purple, Frozen and DDTs. Eligibility is checked at targeting/hit time from the source monkey’s position. Selling/removing the MIB immediately removes the aura; multiple MIBs do not multiply damage. Previously applied glue/status effects retain their existing duration.

MIB does not change damage, attack speed, pierce or attack range, and does not invent crowd control: BADs retain their freeze immunity, and base Ice does not gain MOAB freezing. Base Glue remains zero direct damage. MIB has no attack, upgrade paths, ability or usage XP; it costs zero in all difficulties and modes. Normal placement rules apply. Saving/resuming restores the building and derives the aura from restored tower positions; existing saves remain compatible.

The procedural model follows the supplied twin-dish office reference: blue walls, orange windows, gray foundation, dark doorway, stepped cyan roof, X-braced mast and two faceted silver dishes. The top radar assembly rotates continuously while gameplay is running, including between rounds. The foundation and building remain still. The transparent shop portrait is a render of the same 3D model, and the selected portrait uses the live model.

[Selected MIB on desktop](mib-support-desktop.png) · [Selected MIB on phone](mib-support-mobile.png) · [Phone support overview](mib-support-overview-mobile.png)

All 41 regression test files pass. MIB tests cover all seven attackers against all materials, Camo/Frozen and all five blimp classes, exact radius and removal, source ownership for secondary projectiles, unchanged attack stats/range, real Sharp projectile damage to Lead, free mode prices, no MIB firing, glue/freeze behavior, isolated rotating model parts and save validation.

Chromium checks the actual shop image load, free placement, selected support panel, existing Dart upgrade cards, support indicator, overview navigation, animation and save/resume. Real Dart projectiles deal one damage each to Camo Lead, DDT and BAD targets under the aura; the DDT becomes untargetable when the MIB moves outside 25 tiles. Desktop and phone screenshots are included. All 90 original upgrade images, five MP3s and existing mode trees remain included.

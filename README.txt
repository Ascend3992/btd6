Meadow Balloon Defense 3D - v52 Glue Gunner base model, stats and coating prioritization

This version uses deploy-6abdc942324750a5403b3fb5.zip as the game base, with the updated Boomerang Monkey stats, upgrade models, animations and projectiles merged in.
Bomb Shooter stats now follow the supplied tables; its base and all 15 upgrade models follow the supplied references with idle and recoil animation.

Run locally
-----------
From this folder, run:
  python -m http.server 8000
Then open http://localhost:8000 in a browser with WebGL support.

Deploy index.html, game.js, boomerang-visuals.js, bomb-visuals.js, tack-visuals.js, ice-visuals.js, glue-visuals.js, bloon-renderer.js, bloon-visuals.js, meadow-map.js, style.css, _headers and assets together at the site root. No build step or external script host is required. Three.js 0.168.0 and its MIT license are bundled in assets/vendor. All tower models in this version are procedural; no GLTF assets or model loader are needed.

Preserved from the uploaded game
-------------------------------
- Rounds 1-100, six primary towers and Quincy. The meadow now follows the latest supplied map and arrow route.
- All 15 Dart Monkey upgrade models, held weapons, idle and attack animations. Tack Shooter base and all 15 upgrades use new reference models. Ice Monkey's base and all 15 upgrades use the supplied references. Glue Gunner has a new brown monkey / yellow gun reference model with idle, blink and recoil animations. Quincy retains its existing model and animations.
- Dart upgrade stats, prices, camo priority, crossbow critical hits, obstacle/wall ricochets and Ultra-Juggernaut splitting balls.
- Existing tower abilities, combat effects and other tower upgrades. Bloon status models now use the latest supplied textures as references.

Reference meadow and route
--------------------------
- The latest 826 x 532 reference is traced in meadow-map.js. Bloons enter from the left, cross the top loop's bottom edge toward its right side, turn upward and left around its roof, continue down through the first crossing, circle the lower-left loop, cross again toward the tall right loop, then follow the lower stone road to the bottom exit. Crossings are distinct ordered route segments and never switch branches.
- The lawn has generated grass texture, irregular bevelled gray pavers, chipped stone edges, white/yellow daisies, reference-positioned rocks/clover and dense pointed-leaf foliage concentrated in the three reference corners. Paving, decoration and the combat centerline share the same reference coordinates; the black annotation is interpreted as the route.
- The camera and meadow depth compensate for perspective to preserve the reference layout on screen, with the complete entry and exit fitted beside the tower shop. Pointer placement and path exclusion use the new geometry. Rocks remain projectile obstacles. Static paving, petals and foliage merge into a few meshes to preserve late-round rendering performance.

Round 81 health rules
--------------------
- All ceramics spawned from Round 81 onward, including ceramics inside blimps, become Super Ceramics: 60 HP, or 120 HP when Fortified. Their health stays flat in later rounds.
- Every descendant of a Super Ceramic preserves the single-child rule: Ceramic -> Rainbow -> Zebra -> Black -> Pink -> Yellow -> Green -> Blue -> Red. Camo, Fortified and Regrow properties remain attached to the family; Regrow restores the same Super Ceramic rules. Normal pre-81 ceramics and all blimp child counts retain their original branching.
- All five blimp classes use their existing base HP, multiplied by the supplied piecewise M; Fortified doubles their base HP. Spawned enemies retain their spawn round for children and regrowth. Numerically whole HP is rounded to avoid floating-point residue requiring an extra hit.
  R <= 80: 1
  81-100: 1 + (R-80) * 0.02
  101-124: 1.4 + (R-100) * 0.05
  125-150: 2.6 + (R-124) * 0.15
  151-250: 6.5 + (R-150) * 0.35
  251-300: 41.5 + (R-250)
  301-400: 91.5 + (R-300) * 1.5
  401-500: 241.5 + (R-400) * 2.5
  501+: 491.5 + (R-500) * 5
- This does not add Freeplay. The authored 100-round game and its Round 100 win condition remain intact; later multiplier brackets are implemented and tested for future use. No unrequested speed ramp or new round generation is added.

Distinct Camo, Fortified and Regrow models
----------------------------------------
- bloon-visuals.js creates the rounded colored shells, deep-notched puffed heart shapes, irregular high-contrast camouflage patches, and thick bronze armor bands with pale steel edges/rivets from the supplied examples. Combined variants show all active properties together. Zebra retains wavy black stripes; Rainbow retains its colored bands; Lead and Ceramic retain material-specific details.
- Camouflage is baked into the shell's vertex colors and preserved by the instancing renderer. It is not a ring decoration, so it remains visually distinct from armor and Zebra stripes. Camo blimp hulls and DDTs also receive painted patches; Fortified blimps use bronze armor with steel edges.
- Regrow restores one lost layer every three game seconds up to its original outer layer, carrying partial elapsed time across long frames. Damage restarts the timer; a zero-damage status effect does not. A damaged ceramic shell restores its layer to full HP after three seconds. Descendants retain their original Regrow ceiling and Super Ceramic status.
- All visual flag combinations keep shared instanced drawing. A browser stress check preserves 3,200 separate live bloons across Camo/Fortified/Regrow combinations with 421 total draw calls. Decamo and Regrow stripping update only the affected instance and retain attached status markers.

Updated Boomerang Monkey
-----------------------
- Base cost $325, damage 1, pierce 4, cooldown 1.2 seconds, range 43 game units, Sharp damage and no camo detection.
- All three upgrade paths use the supplied stats and Medium prices. This includes glaive ricochets, Glaive Lord orbitals and shredding damage, Bionic/Turbo/Perma attack speeds and abilities, straight out-and-back Kylies, independent MOAB Press throws and Domination explosions/burning.
- All 15 upgrade models follow the supplied upgrade images in the game's faceted style. Colored suits, glaive hoods, bionic lenses, Perma gear and Kylie hats distinguish the paths.
- Models breathe, sway, blink and move their tails while idle, including between rounds. Throwing animates the arm and body toward the target; rapid throws keep the arm moving and abilities brighten the bionic lights.
- Held and flying weapons match the upgrades: wooden/heated boomerangs, glaives and Kylies. Glaive Lord has three continuously orbiting, spinning glaives, including between rounds; its damage radius remains 30 game units.
- The highest-tier path supplies the outfit. Crosspaths update its weapon without replacing the primary outfit. Change Hands mirrors the model and throw direction. Replaced models release their geometry and materials.
- Boomerang visuals are implemented in boomerang-visuals.js; include it when deploying.

Updated base Bomb Shooter
-------------------------
- Base Medium cost $600, damage 1 (Explosion), pierce 22, cooldown 1.5s, range 40 game units, blast radius 12 game units and no Camo detection. Explosions pop Lead but cannot damage Black, Zebra or DDT bloons.
- The supplied base model reference is recreated as a rounded blue-black cannon with a thick, hollow muzzle, wooden spoked wheels and a low wood carriage. Its barrel retains aiming and recoil animations.
- The new base and all 15 upgrade models are implemented in bomb-visuals.js; include it when deploying.

Updated Bomb Shooter top path
-----------------------------
- All five models reproduce the supplied references in the game's faceted mesh style: red-banded Bigger Bombs, red bands and steel wheels for Heavy Bombs, a red/yellow Really Big Bombs cannon, green-striped Bloon Impact, and the red spiked muzzle, navy rear and treaded wheels with red triangular hubs of Bloon Crush.
- The base and all top-path cannons rock their barrels subtly while idle, including between rounds, and recoil with a small carriage/wheel response when firing. Bloon Crush's red hubs pulse gently. Tower anchors, targeting heading and purchased stats stay stable; replaced geometry/materials are disposed.
- The highest purchased tier across all three paths chooses the reference outfit. Ties prefer top, then middle, then bottom. Lower-tier crosspaths retain the higher-tier outfit and preserve purchased combat stats.
- Medium prices: Bigger Bombs $250, Heavy Bombs $650, Really Big Bombs $1,100, Bloon Impact $2,800 and Bloon Crush $55,000.
- Blast radius grows from 12 to 18 to 27 game units; damage progresses from 1 to 2 to 4 to 24. Bigger Bombs adds 6 pierce, Heavy Bombs adds 10 more, and Really Big Bombs sets explosion pierce to 80.
- Really Big Bombs pushes regular bloons back 20 game units. Impact adds 3 range and a true 1.4s stun. Crush pops Black/Zebra, stuns regular bloons and blimps for 2s, and pushes blimps back 5 units. BADs resist stun/knockback; Camo assistance is still required for DDTs.
- Explosions carry excess damage through eligible child layers. Crosspath stats are independent of purchase order, and in-flight bombs preserve their launch stats.
- Frag Bombs now fires real sharp fragments from the explosion center. Exact fragment numbers were not supplied: provisional (damage, pierce, count, lifetime) values are base (1, 1, 8, 0.15s), Really Big (2, 3, 12, 0.30s), Impact (2, 4, 16, 0.45s), Crush (12, 10, 16, 0.45s). These are centralized in bombFragmentTuning for replacement with supplied stats.

Updated Bomb Shooter middle path
--------------------------------
- All five supplied models are recreated as faceted meshes: Faster Reload's red-finned cannon, a red/white shark missile, a yellow Mauler, an orange-banded gray Assassin and a green-banded gray Eliminator. Missile launchers have round steel cradles with black/yellow hazard platforms and curved, bold painted eyes/teeth.
- Middle models idle and recoil between rounds and while attacking. Flying missiles and ability missiles match the upgraded body's colors, face and fins, with animated exhaust. Visual updates preserve targeting headings, placement anchors, purchased stats and ability timing.
- Medium prices: Faster Reload $250, Missile Launcher $400, MOAB Mauler $1,000, MOAB Assassin $3,450 and MOAB Eliminator $28,000.
- Faster Reload multiplies cooldown by 0.75; Missile Launcher additionally multiplies it by 0.7333, for approximately 0.825s. Missile Launcher increases projectile speed by 50% and adds 4 range. Mauler and Assassin each add another 5 range (49 and 54 total).
- Base-path MOAB damage is 16 for Mauler, 31 for Assassin and 100 for Eliminator. Assassin/Eliminator deal 5 Ceramic damage. Heavy Bombs adds 1 damage to both. Normal missiles retain Explosion immunities and require Camo support; category bonuses do not carry unchanged into regular child layers.
- Ability damage is instant (750/4,500) with First, Last, Close or Strong selection among living blimps anywhere on the map, including Camo DDTs. Missile flight is cosmetic. The existing 30s Assassin cooldown becomes 10s for Eliminator.
- The unspecified weaker ability explosion provisionally uses the tower's normal explosion damage, radius and pierce. Provisional normal fragment MOAB bonuses are +5/+10/+20 for Mauler/Assassin/Eliminator. Provisional ability fragments (damage, pierce, count, lifetime, MOAB bonus) are Assassin (5, 3, 8, 0.30s, +50) and Eliminator (20, 6, 12, 0.45s, +100); these remain centralized in bombFragmentTuning pending exact values.

Updated Bomb Shooter bottom path
--------------------------------
- All five supplied models are recreated in the faceted game style: Extra Range's red bullseye and wooden wheels, Frag Bombs' elongated muzzle, red starburst and steel wheels, Cluster Bombs' green/yellow cannon, Recursive Cluster's yellow bolted barrel and navy pedestal, and Bomb Blitz's navy/gold barrel, green pedestal and glowing muzzle.
- Barrels gently rock while idle, including between rounds, and recoil when firing. Bomb Blitz's muzzle halo and light rays pulse softly. Model changes preserve placement, targeting and combat stats, and release replaced geometry/materials.
- Medium prices: Extra Range $200, Frag Bombs $300, Cluster Bombs $700, Recursive Cluster $2,500 and Bomb Blitz $23,000. Extra Range adds 12 range; Frag Bombs adds another 2 (54 total).
- Frag Bombs uses separate 1-pierce Sharp attacks that cannot damage Lead. Cluster Bombs replaces fragments with eight secondary bombs, each with eight explosion pierce. Main explosion pierce stays at its purchased base/top-path value.
- Recursive Cluster deals 2 damage on all shots. Every second shot creates a primary explosion, eight secondary explosions and 64 tertiary explosions. A shared per-target limit caps tertiary hits at eight: up to 17 total hits despite 73 visible explosions.
- Bomb Blitz has a 0.9s base cooldown, 5 damage per explosion and recursion every shot. Faster Reload/Missile Launcher multiply that cooldown; Heavy Bombs adds one damage to every explosion. Upgrade order does not change the resulting stats or rewrite in-flight shots.
- Bomb Storm triggers after a life is lost. It deals exactly 2,000 damage to all current enemies, ignoring material/Camo immunity and glue amplification, then wipes out surviving MOABs and regular bloons, including newly spawned child layers. It retains the prototype's 45s cooldown and does not refund the lost life.
- Unspecified cluster spread, flight time and blast radii remain prototype defaults in bombClusterTuning: six game-unit spread, 0.16s flight, 12-unit secondary radius, 20-unit recursive radius and 1.5x primary radius on recursive shots. Exact counts, secondary pierce, hit caps, damage and cooldowns follow the supplied table.

Updated Tack Shooter base model
-------------------------------
- The supplied pink base Tack Shooter reference is recreated as a faceted pressure housing with a crossed-tack lid emblem, riveted dark upper/lower bands and eight hollow steel firing ports.
- Its housing gently pulses while idle, including between rounds. All eight ports retract when firing, and visual tacks emerge from the matching world-space muzzles. Placement anchors and combat stats stay stable.
- Base stats follow the supplied values: $260 Medium cost ($220 Easy/$280 Hard/$310 Impoppable), 1.12s cooldown, eight radial tacks, 23 range, one damage and one pierce per tack, Sharp damage, no Camo detection, and no Lead/Frozen popping. This game uses Medium pricing.
- Its six-unit footprint is converted with the game's range scale and enforced for tower overlap, path clearance and map edges. Normal damage resolves instantly throughout the range circle, up to eight eligible bloons; visual tacks do not collide. Reference upgrade bodies swap in cleanly on purchase.
- Tack visuals are implemented in tack-visuals.js; include it when deploying.

Updated Tack Shooter top-path stats
----------------------------------
- Medium prices: Faster Shooting $150, Even Faster Shooting $300, Hot Shots $600, Ring of Fire $3,500 and Inferno Ring $45,500. Supplied prices for all four difficulties and XP amounts are stored in tackTopUpgradeDetails; the game uses Medium costs and has no XP unlock system.
- Each speed tier multiplies normal attack cooldown by 0.75 (0.84s then 0.63s). Each also multiplies Blade Maelstrom/Super Maelstrom's blade interval by 0.85, including subsequent volleys of an active storm; ability duration and cooldown stay unchanged.
- Hot Shots deals two damage instantly throughout its range circle, up to its tack count, with Lead/Frozen popping. Damage carries through child layers; flying hot tacks are cosmetic.
- Ring of Fire replaces the normal circular volley with a visible flame burst: five damage, 30 pierce, 23 range and 0.315s cooldown. It cannot pop Purple or detect Camo. Inferno bursts deal eight damage (+4 against blimps), with 35 range and 45 pierce.
- Inferno adds independently timed homing meteors with 700 impact damage, an area explosion and 50 damage per second of burning. Meteors use the tower's First/Last/Strong/Close targeting and require Camo assistance. Existing burn handling carries the burn through child layers and credits the original tower.
- Crosspath stats are recomputed from purchased tiers so upgrade order cannot change damage, pierce, range or cooldown. Super Range adds flame pierce and each of the two bottom crosspaths adds flame damage.
- Values omitted from the table remain provisional in tackTopTuning: 0.1s Inferno flame cooldown, +1 Inferno flame damage per bottom crosspath tier, four-second meteor interval, 28 projectile speed, map-wide meteor targeting, 50 explosion damage, 18-unit explosion radius, 10 explosion pierce and five-second burn duration. Supplied 700 impact damage and 50 damage per second are exact; Ring of Fire's +1/+2 bottom crosspath damage is also exact.

Updated Tack Shooter top-path models
-----------------------------------
- Faster Shooting and Even Faster Shooting use pink pressure vessels with three/four fanned tack silhouettes. Hot Shots turns gold with a flame lid emblem and dark vented steel ports.
- Ring of Fire has an orange housing, open dark furnace collar, flickering layered flames and glowing firing ports. Inferno Ring adds red armor, gold trim/bolts, four bent black exhaust pipes with downward fire jets and taller furnace flames.
- Idle pressure motion, lid movement and flame flicker continue between rounds. Radial volleys recoil the ports; flame bursts swell the fire and pulse glowing mouths. Inferno meteor launches produce a separate furnace surge. The chassis and tower position stay fixed.
- Dominant top-path upgrades use these models, with top taking equal-tier ties. Extra-tack crosspaths add physical ports so actual shots still originate at their matching mouths. Upgrade replacements release the old body's geometry and materials.

Updated Tack Shooter middle-path stats
-------------------------------------
- Medium prices: Long Range Tacks $100, Super Range Tacks $225, Blade Shooter $550, Blade Maelstrom $2,700 and Super Maelstrom $15,000. Supplied difficulty prices and XP amounts are stored in tackMiddleUpgradeDetails; Medium costs are used and the game has no XP unlock system.
- Long Range adds four range and faster visual projectiles. Super Range adds another four range and three pierce. Blade Shooter adds 15 range (46 total), replaces visual tacks with large saws and sets the stored pierce stat to eight. Its circular attack pops Frozen but cannot pop Lead or detect Camo.
- Maelstrom's main attack deals two damage; Super Maelstrom's main attack deals five damage and pops all standard materials, including Lead, Frozen and Purple. Main Camo detection still requires support.
- Abilities emit two clockwise spinning blade waves for three seconds or four stronger, higher-pierce waves for nine seconds. Each top speed tier multiplies their blade interval by 0.85; purchased stats and launch snapshots remain independent of upgrade order. Ability blades pop Frozen and hit Camo; Super ability blades also pop Lead.
- Super Range adds exactly 15 pierce to flame bursts (45 for Ring of Fire; 60 for Inferno Ring). Inferno meteors gain one direct-hit pierce: the same meteor can hit two distinct targets for 700 damage each, then explodes after its last impact. Explosion pierce remains separately tuned.
- The Tack Zone receives +8 pierce and +16 range from Super Range instead of +3/+4. Long Range still adds its own four range. These bonuses apply identically whether Super Range or Tack Zone is purchased first.
- Unspecified values remain provisional: a 1.25x Long Range projectile-speed multiplier and 0.31-radian clockwise step in tackMiddleTuning; ability damage 2/4, pierce 50/100, base blade intervals 0.15s/0.12s and 20s cooldowns in primaryAbilities.tack. Exact supplied wave counts, durations, main damage and crosspath bonuses are implemented directly.

Updated Tack Shooter middle-path models
--------------------------------------
- Long Range Tacks adds steel-edged dark clamps to the crossed-tack pink lid. Super Range Tacks adds a flared armored skirt and four reinforced feet.
- Blade Shooter turns blue with a black saw emblem and exposed spinning silver saws at every radial launch slot. Blade Maelstrom adds a raised dark rotor with a silver cap saw, rim and underslung cutting vanes.
- Super Maelstrom uses a cyan spiral cap and four orbiting silver saws. The rotor, cutting blades, vortex and orbit move slowly in idle; firing gives port recoil and a spin surge, while the active Maelstrom ability accelerates them. Blade Maelstrom reverses with More Tacks; Super Maelstrom retains clockwise rotation.
- Main blades launch at the matching physical slot, including extra-tack crosspaths. Maelstrom waves launch from the raised rotor, and all flying blades use matching faceted saw geometry. Idle motion continues between rounds; the chassis stays anchored and old geometry/materials are released on upgrade.
- The highest purchased tier selects the model, with top then middle taking ties. Supplied stats, costs and ability timing are preserved.

Updated Tack Shooter bottom-path stats
-------------------------------------
- Medium prices: More Tacks $110, Even More Tacks $110, Tack Sprayer $450, Overdrive $3,200 and The Tack Zone $20,000. All supplied difficulty prices and XP values are stored in tackBottomUpgradeDetails; the game uses Medium prices and has no XP unlock system.
- Visual volleys contain 10, 12, 16, 16 and 32 tacks respectively; these counts also cap the nearby bloons hit by each instant circular attack. Sprayer adds one to the stored pierce stat (two total). Overdrive divides cooldown by three; Tack Zone multiplies it by another 0.6, giving a 0.224s base interval, plus seven range (30 total). Top speed tiers multiply this interval normally. Long frames catch up volleys to preserve the purchased firing rate.
- More Tacks/Even More Tacks add exactly one/two Ring of Fire damage instead of extra tacks. Flame bursts remain area attacks without an additional tack volley.
- Blade Maelstrom gains 0.5s per bottom crosspath tier (3.5s/4s) and turns counter-clockwise with More Tacks. Super Maelstrom gains 1.5s per tier (10.5s/12s) and retains its clockwise direction. Purchasing these upgrades during an active storm extends its remaining time once per tier while preserving elapsed time.
- Tack Zone's blimp-only bonus is applied on circular attack hits and does not carry unchanged into regular child layers. Its unspecified magnitude retains a provisional +2 in tackBottomTuning.zoneMoabDamage; regular bloons take one damage. Lead/Frozen/Camo limitations remain unless assistance is provided.
- Super Range adds the exact +8 pierce/+16 range bonuses to Tack Zone; with both middle crosspaths its stored pierce stat is 10 and range is 50. Stats and ability bonuses are independent of purchase order; in-flight visual tacks never apply damage.

Updated Tack Shooter bottom-path models
--------------------------------------
- More Tacks and Even More Tacks keep the pink crossed-tack cap and dark riveted bands, with ten/twelve hollow steel barrels. Tack Sprayer turns red and uses sixteen barrels in two staggered rows.
- Overdrive has a domed gunmetal cap with a red star and meridian stripes, steel armor bands, glowing red barrel mouths and black armor spikes. Tack Zone adds a curved white skull emblem with red eyes and 32 smaller steel barrels in two staggered rows.
- All five have pressure idle motion, lid bobbing and volley recoil. Armored mouths pulse during firing. The chassis stays grounded; actual projectile directions align with their individual physical ports and extra rows preserve the 360-degree firing pattern.
- Bottom crosspaths on other primary models retain their extra physical ports and existing flame/Maelstrom interactions. Top and middle crosspaths on bottom models preserve the dominant bottom silhouette. Stats, costs, footprints and cooldowns are unchanged.

Updated Ice Monkey base stats and model
--------------------------------------
- Base: $400 Medium cost, Primary class, 25 range, 40 pierce, one Cold damage, 2.4-second cooldown and a 1.5-second freeze. The prototype uses Medium pricing; exact costs for other difficulties were not supplied. Placement metadata allows land/water; the current meadow map has no water terrain.
- Freezing stops regular bloons completely, including child layers exposed by the Ice hit. Frames spanning the thaw move enemies only during the unfrozen portion. Lead, White, Zebra and Camo limitations are retained, and blimps do not receive the regular freeze.
- The new procedural base follows the supplied white fur, cyan mask/belly, blue fists/feet, white curled tail and tall icy crown. Breathing, head movement, blinking and tail sway continue between rounds. Freeze attacks lift the arms and pulse the fists with small ice sparks; feet and placement anchors remain planted.
- The selection panel displays freeze duration. Buying an upgrade replaces and releases the reference base while retaining position and combat state; all three paths now follow their supplied tables and references.
- Include ice-visuals.js when deploying. Ice attacks wait between rounds; the Tack Shooter's circular damage behavior remains intact.

Restored Tack Shooter circular damage
------------------------------------
- Normal Tack Shooter attacks instantly hit eligible bloons anywhere in the range circle, up to the purchased tack count (8/10/12/16/32). Angle, distance to a flying tack and projectile travel no longer determine normal-attack hits.
- All normal flying tacks, hot tacks and blades are cosmetic; updating their positions cannot deal a second hit. Damage, MOAB bonuses, layer carry-through, immunities, range, cooldown and between-round idle behavior remain active.
- The stored pierce values remain as supplied, while normal circular volleys use the original game's tack-count target limit. Ring of Fire/Inferno bursts retain their area pierce limits. Maelstrom ability blades and Inferno meteors retain their actual damaging projectile behavior.

Combat fixes retained
---------------------
- Only one of each Tier 5 upgrade can exist at a time. Selling its tower makes that upgrade available again.
- Triple Shot fires three accurately aimed darts and retargets if the original target pops.
- Ultra-Juggernaut never knocks back MOAB-class bloons. For regular bloons, hits apply 0.15 seconds of knockback: 600% for light targets and 200% for Ceramics, Leads and Fortified targets. Re-hits refresh the effect.
- The selected tower panel shows its total damage dealt, including ability and damage-over-time damage attributed to that tower.
- Damaging a blimp gives no cash. Popping its blimp layer pays exactly $1. Regular-bloon cash scaling and round rewards are unchanged.

Bottom-path prototype tuning
----------------------------
Values omitted from the supplied specification are defined in boomerSpecialTuning in game.js: a 3-second base special cooldown (1.5 seconds with Domination, further shortened by middle crosspaths), 3/6 game units of Press/Domination knockback and 50 Domination damage to blimps. Domination's explosion deals 20 damage within 20 game units and burns for 10 damage per second for 4 seconds. Improved Rangs/Glaives add 4/9 special pierce and multiply knockback by 1.25/1.5. BADs remain immune to knockback.

Updated Ice Monkey top path
---------------------------
- Permafrost, Cold Snap, Ice Shards, Embrittlement and Super Brittle use the supplied Medium prices ($150/$350/$1,500/$2,300/$28,000). All four difficulty prices and XP values are stored in iceTopUpgradeMetadata; this game currently uses Medium pricing with no XP unlock system.
- Permafrost slows regular bloons by 50% after thawing, for the affected freeze layers. Cold Snap detects Camo and pops/freezes Lead. Ice Shards adds five range and strips Camo/Regrow before spawning children; popping a bloon frozen by this tower releases three equally spaced real shards.
- Embrittlement can hit blimps and DDTs, permanently strips Camo/Regrow and temporarily allows sharp and freezing damage. Affected enemies take +1 damage from subsequent attacks. Super Brittle raises the bonus to +4, halves attack cooldown, releases six stronger shards, increases Ceramic damage and applies 25% slowing to blimps. BADs still resist slows.
- Top-path range is 30 units from Ice Shards onward. Base damage (1), pierce (40) and freeze duration (1.5s) remain unless crosspaths change them. Crosspath stats are recomputed independently of purchase order. Deep Freeze's two-layer freezing and thawed slowing carry through one child layer; the revised middle path sets its freeze to 2.2s and its pierce to 45.
- Models have white fur/cyan features with a forehead snowflake, slate snowflake headband, diamond crest and large fists, red features/lightning crest, and purple features/large flanking ice walls, respectively. Each has breathing, blinking, tail sway, casting arm motion and glowing hand sparks. Floating crystals sway/pulse. Feet and platforms stay anchored, including during model replacements; all replaced geometry/materials are released.
- Values absent from the supplied table are provisional in iceTopTuning: 3s brittle duration; shard damage 1/6 and pierce 3/6 at Tier 3/Tier 5; speed 28 world units/s and 0.65s lifetime; +2 Super Brittle Ceramic damage. All supplied numeric effects are implemented as specified.

Updated Ice Monkey middle path
------------------------------
- Enhanced Freeze, Deep Freeze, Arctic Wind, Snowstorm and Absolute Zero use Medium prices $200/$300/$2,750/$4,000/$21,000. All supplied difficulty prices and XP values are stored in iceMiddleUpgradeMetadata.
- Enhanced Freeze multiplies attack cooldown by 0.75 (1.8s) and freezes for 1.75s. Deep Freeze raises freeze duration to 2.2s and pierce to 45, with two frozen regular-bloon layers.
- Arctic Wind slows eligible bloons by 40% only while inside its range. Initial land-tower placement on water is allowed inside an Arctic Wind-or-better Ice Monkey's radius. The placed tower records its placement surface/source at that moment; later changes do not grant existing towers frozen-water placement. The present meadow has no water regions, so that terrain rule is ready for water maps without adding new ponds to this map.
- Snowstorm increases base range to 30 units. Its ability freezes ordinary bloons for 6s; White, Zebra, Camo and blimps for 3s. Lead/DDT require Lead popping from Cold Snap. It soaks two regular layers and has a 30s cooldown. Frozen blimps can still be damaged by ordinary sharp attacks; BADs retain the game's control immunity.
- Absolute Zero has 300 pierce, 40 base range and eight-layer main/ability freezing. Its ability freezes every susceptible on-screen bloon for 10s, including normally immune materials and DDTs, and makes every Ice Monkey attack 50% faster for 10s. Cooldown is 25s. The buff applies equally to all Ice Monkeys, pauses between rounds, and does not stack; another activation refreshes its duration.
- Every Absolute Zero attack also briefly freezes freezable regular bloons across the map, including when no target is in its local range. This secondary freeze deals no damage. Its unspecified duration is provisionally 0.3s in iceMiddleTuning.
- Models follow the references: red earmuffs, red knit hat with white pompom, orange parka/red scarf, white fur parka/brown mittens with a blue scarf and hovering ice mountain, then a bright blue crystalline mask/parka with white hood, mittens and hanging icicles. Breathing, blinking, head/tail movement, scarf flutter, hovering, casting arm motion and glowing hand sparks remain active. All parts are contained in the replaceable frame, with unused/replaced geometry and materials released.
- Dominant models follow the highest tier across all three paths, with top then middle taking ties. Top/bottom crosspaths recompute stats independently of purchase order.

Updated Ice Monkey bottom path
------------------------------
- Larger Radius, Re-Freeze, Cryo Cannon, Icicles and Icicle Impale use Medium prices $150/$200/$1,900/$2,750/$30,000. All four supplied difficulty prices and XP values are stored in iceBottomUpgradeMetadata; difficulty selection and XP unlocks remain outside this prototype.
- Larger Radius adds exactly seven range (32 total from the supplied base). Re-Freeze enables hits and refreshes on already frozen regular bloons, including ability freezes; it does not change firing speed. Native Ice attacks otherwise wait for targets to thaw unless brittleness grants vulnerability.
- Cryo Cannon changes the radial main attack into a real targeted snowball. Its impact freezes up to 40 eligible bloons within a 20-unit blast radius for 1.2s, dealing one damage. It uses the explicitly supplied total range of 46; the accompanying +19 statement does not sum to 46 with the supplied 25-unit base and +7 Larger Radius. In-flight shots retain their firing stats and still explode at the last known target point if the target pops.
- Icicles deals two damage to regular bloons and ten total to blimps (two plus eight). Blimps gain no freeze, slowdown or icicle status at this tier. Frozen regular bloons grow icicles for two seconds: each pile deals three sharp damage to up to three non-frozen contacts, once per target family. A spatial grid and swept contact checks find fast crossings without scanning every host against every bloon. Damage carries through popped regular layers and is credited to the Ice Monkey.
- Icicle Impale deals 50 total damage to blimps and freezes eligible blimps. BADs retain control immunity. Cold Snap crosspaths are needed for Camo/Lead/DDTs; Impale does not grant unlisted detection or material bypass. Blimp-only bonus damage is capped to normal damage when reaching regular children.
- Bottom/middle crosspaths multiply the cannon cooldown by 0.75 and add 0.25/0.7s to its regular freeze, with Deep Freeze adding five pierce and a second frozen layer. Top-path crosspaths supply Permafrost and Cold Snap. All stats are independent of purchase order, and the panel displays blast radius, icicle contacts and blimp damage/freeze.
- Models follow the gray fists, angular dark sunglasses, gray headphones/cyan cannon, segmented cyan ice armor/cannon, and spiked armor/navy ice mantle/loaded white impale spike references. Breathing, blinking where visible, tail sway, casting motion, muzzle glow, cannon recoil and cape flutter animate in the existing faceted style. Feet and tower anchors stay fixed; shots start at the held cannon's transformed muzzle. Upgrading releases the complete previous frame.
- Missing numeric values remain provisional in iceBottomTuning: Cryo/Icicles firing intervals 1s/0.5s, projectile speed 32 world units/s and lifetime 3s, Impale blimp freeze 1.2s, and icicle contact radius 0.85 world units. Supplied damage, range, pierce, duration, prices and XP are preserved.
- Icicle markers use one growing instanced batch. A browser check kept 3,200 affected ceramics alive with 3,200 icicle markers and 476 total scene draw calls. Popping, expiration and spent contact charges release only the corresponding marker.

Late-round performance
----------------------
- Every spawned child remains an independent bloon. Pre-81 ceramic branching is preserved, including 16 Pink descendants per regular ceramic. From Round 81, the newly requested Super Ceramic rules explicitly replace duplicate children with a single chain. Authored round data is unchanged; no spawn caps or hidden bloons are used.
- bloon-renderer.js combines each visual variant into shared geometry and draws all instances together. Batches grow automatically, use per-bloon transforms, and remove popped instances in constant time. Camo/Regrow stripping moves only the affected instance to its new appearance; attached freeze/glue markers stay intact.
- Freeze and icicle markers also share instanced drawing while following each bloon's world position and status. Popping or thawing removes only that marker, including markers attached to disposed parent meshes. A browser check froze over 3,200 real bloons with a single shared marker batch and about 540 total scene draw calls.
- Target selection uses a single pass instead of sorting all candidates. Projectile collision checks first reject enemies outside conservative swept bounds, preserving collision order, children, tunneling prevention and real damage. HUD writes coalesce into one frame; enemy cleanup compacts once; large hits process HP/income in bulk.
- Browser stress test: 200 ceramics still produced 3,200 live Pink children. Draw calls decreased from 10,281 to 682 and median frame-processing time from about 200ms to 4ms in the local software-rendered browser. These timings describe the test environment, not a promised frame rate on every device.
- A second stress test with eight attacking upgraded towers produced exactly the same remaining bloons, HP, cash and per-tower damage as v47. Median frame-processing time fell from about 275ms to 16ms in the final local test; timings vary with hardware and browser load. Include bloon-renderer.js when deploying.

Verification
------------
The development checkout's regression tests pass across 24 test files, covering tower stats, abilities, child damage, immunities, income, targeting, animations, model disposal, Ice freezing/shards/brittle effects, middle-path abilities and speed boosts, snowball blast pierce, icicle swept contacts, blimp freezing and rendering batches, Round 81 boundaries, single-child families and Regrow timing. Browser checks verify the actual upgrade models, casts, child freezing, DDT vulnerability, crosspath selection and cleanup. The downloadable ZIP includes the playable runtime assets; tests remain in the development checkout.

Visual previews:
  docs/boomerang-upgrades.png
  docs/restored-towers.png
  docs/meadow-map-preview.png
  docs/bloon-variants-preview.png

Glue Gunner v52
---------------
- Normal cost $270, display range 46, footprint 6, cooldown 1s, damage 0, pierce 1. Base glue slows non-blimps to 50% for 11s and soaks exactly three layers; glue level 1.
- Straight glue shots use 300 display units/s, a 0.43s lifespan and radius 4, converted to the same world scale as the tower range. Swept collision preserves hits on long frames without extending projectile life.
- Base shots ignore Camo, blimps, bosses and equal/higher-ranked active glue. First, Last, Close and Strong target eligible Bloons. Existing upgraded blimp glue remains available.
- The newer supplied prioritization diagram governs all crosspaths. Independent coatings retain their timers, layer limits and corrosion. Highest active rank controls target exclusion; the latest active coating controls slowdown. Expired coatings stop blocking weaker glue.
- All 26 regression test files pass, including the full precedence matrix, coating inheritance/expiry, projectile limits and animation checks. Browser verification confirms the gun muzzle, zero base damage/income, correct slow and target skipping, and no runtime errors.

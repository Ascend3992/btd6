Meadow Balloon Defense 3D - v34 merged edition

This version uses deploy-6abdc942324750a5403b3fb5.zip as the game base, with the updated Boomerang Monkey stats, upgrade models, animations and projectiles merged in.

Run locally
-----------
From this folder, run:
  python -m http.server 8000
Then open http://localhost:8000 in a browser with WebGL support.

Deploy index.html, game.js, boomerang-visuals.js, style.css, _headers and assets together at the site root. No build step or external script host is required. Three.js 0.168.0 and its MIT license are bundled in assets/vendor. All tower models in this version are procedural; no GLTF assets or model loader are needed.

Preserved from the uploaded game
-------------------------------
- The modeled 3D meadow, rounds 1-100, six primary towers and Quincy.
- All 15 Dart Monkey upgrade models, held weapons, idle and attack animations. Bomb Shooter, Tack Shooter, Ice Monkey, Glue Gunner and Quincy keep their uploaded models and animations.
- Dart upgrade stats, prices, camo priority, crossbow critical hits, obstacle/wall ricochets and Ultra-Juggernaut splitting balls.
- Existing tower abilities, bloon models, combat effects and other tower upgrades.

Updated Boomerang Monkey
-----------------------
- Base cost $325, damage 1, pierce 4, cooldown 1.2 seconds, range 43 game units, Sharp damage and no camo detection.
- All three upgrade paths use the supplied stats and Medium prices. This includes glaive ricochets, Glaive Lord orbitals and shredding damage, Bionic/Turbo/Perma attack speeds and abilities, straight out-and-back Kylies, independent MOAB Press throws and Domination explosions/burning.
- All 15 upgrade models follow the supplied upgrade images in the game's faceted style. Colored suits, glaive hoods, bionic lenses, Perma gear and Kylie hats distinguish the paths.
- Models breathe, sway, blink and move their tails while idle, including between rounds. Throwing animates the arm and body toward the target; rapid throws keep the arm moving and abilities brighten the bionic lights.
- Held and flying weapons match the upgrades: wooden/heated boomerangs, glaives and Kylies. Glaive Lord has three continuously orbiting, spinning glaives, including between rounds; its damage radius remains 30 game units.
- The highest-tier path supplies the outfit. Crosspaths update its weapon without replacing the primary outfit. Change Hands mirrors the model and throw direction. Replaced models release their geometry and materials.
- Boomerang visuals are implemented in boomerang-visuals.js; include it when deploying.

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

Verification
------------
Run regression tests with Node.js 24 or newer:
  node --test tests/*.test.cjs
The merged version passed 28 regression tests and browser checks covering the restored tower models, all Boomerang models and animations, mixed Dart/Boomerang ricochets, Triple Shot, damage counters, cash rewards and Tier 5 purchasing limits.

Visual previews:
  docs/boomerang-upgrades.png
  docs/restored-towers.png

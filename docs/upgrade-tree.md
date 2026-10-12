# Upgrade overview and game audio — v62

Open the green **Upgrades** button above the shop or beneath the selected monkey’s sell controls. The selected or placement monkey opens first; the shop defaults to Dart Monkey otherwise. The arrows browse all seven towers, wrapping at either end. Keyboard left/right arrows also browse, and Back or Escape returns to the game without losing the selected monkey.

Each primary tower has three connected paths with five tiers each. Cyan nodes show tiers 1–4 and gold nodes show tier 5. Hover, keyboard focus or tap displays the upgrade’s implemented effect and in-game cash cost. All future upgrades can be inspected immediately. Quincy instead shows his 20 automatic levels. There are no Paragons, XP purchases or unlock buttons. Original Glue artwork is shared with the owned/next cards; other towers use their existing equipment badges pending supplied artwork.

Clicking a next-upgrade card on a placed tower buys it once, directly with cash. Existing cash, two-path/crosspath and unique Tier 5 limits still apply. The old description-and-second-click purchase panel has been removed. The blue info button still opens combat statistics.

**Usage XP** counts normal attack volleys: one XP for each fired volley or radial attack with a target, including zero-damage Glue and freeze attacks. It aggregates across monkeys of the same type within the current game and remains after selling them. Idle towers earn none. Extra damage ticks and ability-only effects do not add usage XP. XP never restricts upgrades, spends cash, changes attack statistics or purchases Quincy levels. Restarting resets the counter.

The upgrade overview and pause menu stop simulation, including spawning, movement, attacks, cooldowns and auto-start timers. Closing either resumes from the same game time. The **Normal Difficulty** pause menu has only an Auto Start switch, independent sound-effect/music sliders, Restart and Continue. Auto Start is synchronized with the shop’s existing button. Restart starts a fresh game.

## Supplied audio

All recordings are local and retain their uploaded bytes. The browser starts audio after the first pointer or keyboard interaction.

- `assets/audio/btd-bloon-pop.mp3` plays for each destroyed Bloon layer or blimp shell. Nonlethal Ceramic/blimp damage and slowing/freezing without a pop stay silent. The recording is decoded once and independent audio sources let simultaneous pops overlap.
- Background music plays **Sunset Samba → Winter Is Coming → Sunshine Serenade → Fiesta Flamenco → Sunset Samba**, repeating. The current track name appears beside the volume sliders. Music continues while menus are open.
- Sound effects and music default to 35% and 30%. Moving either slider to zero mutes that category independently. Music pauses at zero and resumes the same track when raised.

[Desktop upgrade tree](upgrade-tree-desktop.png) · [Hover details](upgrade-tree-hover.png) · [Phone upgrade tree](upgrade-tree-mobile.png) · [Desktop pause menu](pause-menu-desktop.png) · [Phone pause menu](pause-menu-mobile.png)

## Validation

33 regression test files cover existing combat plus usage accounting and audio overlap/playlist/volume behavior. Chromium checks one-click purchases and all 15 owned/next Glue icons, tier order, overview navigation and descriptions, actual image/audio decoding, music cycling through all four tracks, pop versus nonlethal damage, independent volume controls, Auto Start synchronization, responsive menus, and simulation pause/resume. No combat tuning is changed.

# SLA Blueprint News (Foundry VTT module)

Generate SLA Industries **BPN** mission briefings inside Foundry. Each briefing
creates a **folder ("package")** containing several separate journal entries:

- one **character-sheet entry per NPC** — a black-and-white "ident" portrait,
  who they are, their disposition, and why they matter (player handout).
- one **card entry per OTEM item** — a line-art icon and a description.

plus the two core documents:

- **`… [Player]`** (ownership *Observer*) — a player document with two pages:
  - **Mission Brief** — the official corporate dispatch.
  - **Field Dossier** — a player handout: the cast (NPCs), OTEM (items &
    equipment), and key locations with a schematic site map.
- **`… [GM]`** (ownership *None* for players) — the GM document: the twist, the
  withheld fact, the true threat read, levers, dice state, and the GM-only
  secrets for every NPC / item / location, linked back to the player document.

The GM picks the operative **SCL level** and dials the **credits** and **SCL
increase** rewards on sliders (pay scales up to ~2000c on standard work).

Styled in the SLA house look with bundled local fonts and **procedural artwork**
generated per briefing (flat, non-photorealistic). NPC/monster generation is a
separate concern — each briefing exposes an archetype seam for a companion module.

This module is the Foundry wrapper around an **engine-agnostic** core
([blueprint-news](https://github.com/slaguru666/blueprint-news)); the generation,
art, and render layers are vendored under `module/vendor/` and contain no Foundry
calls.

## Use

GM only. Open the generator from:

- the **Journal sidebar** header button (“Blueprint News”), or
- the **Notes** scene-controls toolbar, or
- the console / macro: `game.slaBlueprintNews.open()`

Pick a colour band / scenario frame (or leave on *Any* to roll), watch the live
preview, then **Create Journal** (writes the two pages) or **Post to Chat**.
Every briefing is reproducible from its **seed**, which also drives the artwork.

To reveal a brief to players, show or grant them the journal entry as usual —
they will only see the Mission Brief page, never the GM Dossier.

## Install

**On a server (recommended):** Setup → Add-on Modules → Install Module → paste
the manifest URL:

```
https://raw.githubusercontent.com/slaguru666/sla-blueprint-news/main/module.json
```

**By hand:** copy this `sla-blueprint-news/` folder into your server's
`Data/modules/` directory and restart Foundry.

## Compatibility

Foundry VTT v13–v14 (verified 14.361). System-agnostic — it writes plain journal
entries and does not touch any system's actor/item schema.

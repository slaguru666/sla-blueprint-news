/**
 * SLA Blueprint News — entry point.
 *
 * Thin Foundry wrapper around the engine-agnostic component vendored under
 * module/vendor/. Registers a global API and a Journal-directory button that
 * opens the generator; the generator writes briefings into journal entries.
 */

import { BlueprintNewsApp } from "./app/generator-app.mjs";

const MODULE_ID = "sla-blueprint-news";

Hooks.once("init", () => {
  game.slaBlueprintNews = { open: () => BlueprintNewsApp.open() };
});

/* Journal directory header button (GM only) — the natural home, since this
   tool produces journal entries. */
Hooks.on("renderJournalDirectory", (_app, html) => {
  if (!game.user?.isGM) return;
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root) return;
  const header =
    root.querySelector(".directory-header .action-buttons") ??
    root.querySelector(".directory-header .header-actions") ??
    root.querySelector(".directory-header");
  if (!header || header.querySelector(".sla-bpn-open")) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "sla-bpn-open";
  btn.innerHTML = `<i class="fas fa-file-contract"></i> ${game.i18n.localize("SLABPN.Open")}`;
  btn.addEventListener("click", () => BlueprintNewsApp.open());
  header.appendChild(btn);
});

/* Token-group toolbar button (GM only). v14 controls is a keyed object and
   tools fire via onChange; v13 is an array. */
Hooks.on("getSceneControlButtons", (controls) => {
  if (!game.user?.isGM) return;
  const open = () => BlueprintNewsApp.open();
  const tool = {
    name: "slaBpnOpen",
    title: game.i18n.localize("SLABPN.ToolbarOpen"),
    icon: "fas fa-file-contract",
    visible: true,
    button: true,
    toggle: false,
    onChange: open,
    onClick: open
  };
  if (controls && !Array.isArray(controls)) {
    const grp = controls.tokens ?? controls.token ?? null;
    if (grp) {
      grp.tools ??= {};
      grp.tools[tool.name] = tool;
    }
    return;
  }
  const grp = controls.find((c) => c.name === "token" || c.name === "tokens");
  if (grp) {
    if (Array.isArray(grp.tools)) grp.tools.push(tool);
    else { grp.tools ??= {}; grp.tools[tool.name] = tool; }
  }
});

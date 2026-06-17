/**
 * SLA Blueprint News — generator window (ApplicationV2 + Handlebars).
 *
 * Mirrors the standalone app over the vendored engine: pick band / frame /
 * squad / payment, watch a live preview, then Create Journals (a player-facing
 * Mission Brief page + a GM-only Dossier page) or Post to Chat.
 *
 * The render layer is engine-free; this file is the only Foundry-aware code.
 */

import { generateBPN, randomSeed } from "../vendor/core/bpn-core.js";
import { COLOURS } from "../vendor/core/data/colours.js";
import { framesForColour } from "../vendor/core/data/frames.js";
import { briefHTML, dossierHTML } from "../vendor/render/bpn-render.js";
import { crestDataURI } from "../vendor/art/bpn-art.js";

const MODULE_ID = "sla-blueprint-news";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class BlueprintNewsApp extends HandlebarsApplicationMixin(ApplicationV2) {
  state = {
    seed: randomSeed(),
    colourKey: "",
    frameId: "",
    squadSize: 4,
    paymentType: "",
    view: "player"
  };

  static DEFAULT_OPTIONS = {
    id: "sla-blueprint-news-app",
    tag: "div",
    classes: ["sla-bpn-window"],
    window: { title: "SLABPN.Title", resizable: true, icon: "fas fa-file-contract" },
    position: { width: 1080, height: 820 },
    actions: {
      reroll: BlueprintNewsApp.#onReroll,
      applySeed: BlueprintNewsApp.#onApplySeed,
      copySeed: BlueprintNewsApp.#onCopySeed,
      view: BlueprintNewsApp.#onView,
      create: BlueprintNewsApp.#onCreate,
      chat: BlueprintNewsApp.#onChat
    }
  };

  static PARTS = { body: { template: `modules/${MODULE_ID}/templates/generator.html` } };

  static open() { return new BlueprintNewsApp().render({ force: true }); }

  /** Resolve the current briefing from UI state (deterministic from seed). */
  _bpn() {
    return generateBPN({
      seed: this.state.seed,
      colourKey: this.state.colourKey || undefined,
      frameId: this.state.frameId || undefined,
      squadSize: this.state.squadSize,
      overrides: { paymentType: this.state.paymentType || "__RANDOM__" }
    });
  }

  async _prepareContext() {
    const bpn = this._bpn();
    // keep state in step with what was actually rolled (band/frame/seed)
    this.state.seed = bpn.seed;

    const colourOptions = [
      { key: "", label: "Any (roll d20)", selected: this.state.colourKey === "" }
    ].concat(COLOURS.map((c) => ({
      key: c.key,
      label: `${c.label} — ${c.type}`,
      selected: c.key === this.state.colourKey
    })));

    const frames = this.state.colourKey ? framesForColour(this.state.colourKey) : [];
    const frameOptions = [{ id: "", label: "Any in band", selected: this.state.frameId === "" }]
      .concat(frames.map((f) => ({ id: f.id, label: f.shortTitle, selected: f.id === this.state.frameId })));

    const previewHTML = this.state.view === "gm"
      ? dossierHTML(bpn, { artMode: "img" })
      : this.state.view === "both"
        ? briefHTML(bpn, { artMode: "img" }) + dossierHTML(bpn, { artMode: "img" })
        : briefHTML(bpn, { artMode: "img" });

    const paymentOptions = [
      { value: "", label: "Any" },
      { value: "Per Squad", label: "Per Squad" },
      { value: "Per Operative", label: "Per Operative" }
    ].map((o) => ({ ...o, selected: o.value === this.state.paymentType }));

    const viewButtons = [
      { view: "player", label: "Player Brief" },
      { view: "gm", label: "GM Dossier" },
      { view: "both", label: "Both" }
    ].map((v) => ({ ...v, active: v.view === this.state.view }));

    return {
      state: this.state,
      colourOptions,
      frameOptions,
      frameDisabled: !this.state.colourKey,
      paymentOptions,
      viewButtons,
      previewHTML
    };
  }

  _onRender() {
    const root = this.element;
    root.querySelectorAll("[data-field]").forEach((el) => {
      el.addEventListener("change", () => {
        const f = el.dataset.field;
        this.state[f] = f === "squadSize" ? Number(el.value) || 4 : el.value;
        if (f === "colourKey") this.state.frameId = "";
        this.render();
      });
    });
  }

  static #onReroll() { this.state.seed = randomSeed(); this.render(); }

  static #onApplySeed() {
    const v = this.element.querySelector('[data-field="seed"]')?.value?.trim();
    if (v) this.state.seed = v;
    this.render();
  }

  static async #onCopySeed() {
    try { await navigator.clipboard.writeText(this.state.seed); ui.notifications.info("Seed copied."); } catch (_) {}
  }

  static #onView(event, target) {
    this.state.view = target.dataset.view || "player";
    this.render();
  }

  static async #onCreate() {
    const bpn = this._bpn();
    const O = CONST.DOCUMENT_OWNERSHIP_LEVELS;
    const HTML = CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML;
    const wrap = (html) => `<div class="bpn">${html}</div>`;

    const entry = await JournalEntry.create({
      name: `${bpn.colour.label} BPN — ${bpn.shortTitle}`,
      ownership: { default: O.OBSERVER },
      flags: { [MODULE_ID]: { seed: bpn.seed, colourKey: bpn.colourKey, frameId: bpn.gm.frameId } },
      pages: [
        {
          name: "Mission Brief",
          type: "text",
          title: { show: false, level: 1 },
          ownership: { default: O.OBSERVER },
          text: { format: HTML, content: wrap(briefHTML(bpn, { artMode: "img" })) }
        },
        {
          name: "GM Dossier",
          type: "text",
          title: { show: false, level: 1 },
          ownership: { default: O.NONE },
          text: { format: HTML, content: wrap(dossierHTML(bpn, { artMode: "img" })) }
        }
      ]
    });

    ui.notifications.info(`Created BPN journal "${entry.name}" (player Brief + GM Dossier page).`);
    entry.sheet?.render(true);
  }

  static async #onChat() {
    const bpn = this._bpn();
    const card = `<div class="bpn"><div class="bpn-chat-card" style="--bpn-accent:${bpn.colour.accent};">
      <div class="bpn-chat-card__head">
        <img src="${crestDataURI(bpn, { size: 56 })}" width="56" height="56" alt="">
        <div>
          <div class="bpn-chat-card__band">${bpn.colour.label} BPN · ${bpn.colour.type}</div>
          <div class="bpn-chat-card__title">${bpn.shortTitle}</div>
          <div class="bpn-chat-card__meta">${bpn.bpnId} · SCL ${bpn.sclRequirement} · ${bpn.reward.grossContract}</div>
        </div>
      </div>
      <p class="bpn-chat-card__brief">${foundry.utils.escapeHTML(bpn.missionBrief)}</p>
    </div></div>`;
    await ChatMessage.create({ speaker: { alias: "SLA Blueprint News" }, content: card });
  }
}

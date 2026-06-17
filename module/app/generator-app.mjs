/**
 * SLA Blueprint News — generator window (ApplicationV2 + Handlebars).
 *
 * Mirrors the standalone app over the vendored engine: pick band / frame /
 * squad / payment, set the operative SCL level, dial the credits and SCL-
 * increase rewards on sliders (live preview, no hardcoded numbers), then
 * Create Journals (player Brief page + GM-only Dossier page) or Post to Chat.
 *
 * The render layer is engine-free; this file is the only Foundry-aware code.
 */

import { generateBPN, randomSeed } from "../vendor/core/bpn-core.js";
import { COLOURS } from "../vendor/core/data/colours.js";
import { framesForColour } from "../vendor/core/data/frames.js";
import { briefHTML, fieldDossierHTML, dossierHTML } from "../vendor/render/bpn-render.js";
import { crestDataURI } from "../vendor/art/bpn-art.js";

const MODULE_ID = "sla-blueprint-news";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const ART = { artMode: "img" };

const previewHTMLFor = (bpn, view) => {
  if (view === "field") return fieldDossierHTML(bpn, ART);
  if (view === "gm") return dossierHTML(bpn, ART);
  if (view === "both") return briefHTML(bpn, ART) + fieldDossierHTML(bpn, ART) + dossierHTML(bpn, ART);
  return briefHTML(bpn, ART);
};

const cbsReadoutFor = (r) =>
  `${r.cbsBasisValue}c ${r.cbsBasis === "op" ? "per Op" : "per Squad"}${r.cbsOpenEnded ? "+" : ""} · gross ${r.grossContractValue}c · ${r.takeHomeEach}`;

export class BlueprintNewsApp extends HandlebarsApplicationMixin(ApplicationV2) {
  state = {
    seed: randomSeed(),
    colourKey: "",
    frameId: "",
    squadSize: 4,
    paymentType: "",
    sclLevel: null,     // null → core defaults per band
    cbsValue: null,     // null → use the seed's rolled default
    sclIncrease: null,
    view: "player"
  };

  static DEFAULT_OPTIONS = {
    id: "sla-blueprint-news-app",
    tag: "div",
    classes: ["sla-bpn-window"],
    window: { title: "SLABPN.Title", resizable: true, icon: "fas fa-file-contract" },
    position: { width: 1080, height: 860 },
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
      sclLevel: this.state.sclLevel ?? undefined,
      cbsValue: this.state.cbsValue ?? undefined,
      sclIncrease: this.state.sclIncrease ?? undefined,
      overrides: { paymentType: this.state.paymentType || "__RANDOM__" }
    });
  }

  async _prepareContext() {
    const bpn = this._bpn();
    this.state.seed = bpn.seed;
    this.state.sclLevel = bpn.sclLevel; // reflect the resolved level in the select

    const colourOptions = [{ key: "", label: "Any (roll d20)", selected: this.state.colourKey === "" }]
      .concat(COLOURS.map((c) => ({ key: c.key, label: `${c.label} — ${c.type}`, selected: c.key === this.state.colourKey })));

    const frames = this.state.colourKey ? framesForColour(this.state.colourKey) : [];
    const frameOptions = [{ id: "", label: "Any in band", selected: this.state.frameId === "" }]
      .concat(frames.map((f) => ({ id: f.id, label: f.shortTitle, selected: f.id === this.state.frameId })));

    const paymentOptions = [
      { value: "", label: "Any" },
      { value: "Per Squad", label: "Per Squad" },
      { value: "Per Operative", label: "Per Operative" }
    ].map((o) => ({ ...o, selected: o.value === this.state.paymentType }));

    const sclOptions = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => ({
      value: n,
      label: `SCL ${n}${n === 10 ? " (lowest)" : n === 1 ? " (highest)" : ""}`,
      selected: n === bpn.sclLevel
    }));

    const viewButtons = [
      { view: "player", label: "Player Brief" },
      { view: "field", label: "Field Dossier" },
      { view: "gm", label: "GM Dossier" },
      { view: "both", label: "All" }
    ].map((v) => ({ ...v, active: v.view === this.state.view }));

    const r = bpn.reward;
    const reward = {
      basisLabel: r.cbsBasis === "op" ? "per operative" : "per squad",
      cbsMin: r.cbsMin, cbsMax: r.cbsMax, cbsValue: r.cbsBasisValue,
      sclMin: r.sclMin, sclMax: r.sclMax, sclValue: r.sclIncreaseValue,
      cbsReadout: cbsReadoutFor(r),
      scliReadout: `${r.sclIncrease} SCL`
    };

    return { state: this.state, colourOptions, frameOptions, paymentOptions, sclOptions, viewButtons, reward, previewHTML: previewHTMLFor(bpn, this.state.view) };
  }

  _onRender() {
    const root = this.element;
    root.querySelectorAll("[data-field]").forEach((el) => {
      el.addEventListener("change", () => {
        const f = el.dataset.field;
        if (f === "squadSize") this.state.squadSize = Number(el.value) || 4;
        else if (f === "sclLevel") this.state.sclLevel = Number(el.value) || 10;
        else this.state[f] = el.value;
        // changing the band or payment basis resets the dialled rewards
        if (f === "colourKey") { this.state.frameId = ""; this.state.cbsValue = null; this.state.sclIncrease = null; }
        if (f === "paymentType") { this.state.cbsValue = null; this.state.sclIncrease = null; }
        this.render();
      });
    });
    // sliders update the preview live, without a full re-render (keeps the grip)
    root.querySelectorAll("[data-slider]").forEach((el) => {
      el.addEventListener("input", () => {
        this.state[el.dataset.slider] = Number(el.value);
        this.#refreshPreview();
      });
    });
  }

  #refreshPreview() {
    const bpn = this._bpn();
    const host = this.element.querySelector(".sla-bpn-gen__preview");
    if (host) host.innerHTML = previewHTMLFor(bpn, this.state.view);
    const cbsR = this.element.querySelector('[data-readout="cbs"]');
    const scliR = this.element.querySelector('[data-readout="scli"]');
    if (cbsR) cbsR.textContent = cbsReadoutFor(bpn.reward);
    if (scliR) scliR.textContent = `${bpn.reward.sclIncrease} SCL`;
  }

  static #onReroll() { this.state.seed = randomSeed(); this.state.cbsValue = null; this.state.sclIncrease = null; this.render(); }

  static #onApplySeed() {
    const v = this.element.querySelector('[data-field="seed"]')?.value?.trim();
    if (v) this.state.seed = v;
    this.state.cbsValue = null; this.state.sclIncrease = null;
    this.render();
  }

  static async #onCopySeed() {
    try { await navigator.clipboard.writeText(this.state.seed); ui.notifications.info("Seed copied."); } catch (_) {}
  }

  static #onView(event, target) { this.state.view = target.dataset.view || "player"; this.render(); }

  static async #onCreate() {
    const bpn = this._bpn();
    const O = CONST.DOCUMENT_OWNERSHIP_LEVELS;
    const HTML = CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML;
    const wrap = (html) => `<div class="bpn">${html}</div>`;
    const base = `${bpn.colour.label} BPN — ${bpn.shortTitle}`;
    const flags = { [MODULE_ID]: { seed: bpn.seed, colourKey: bpn.colourKey, frameId: bpn.gm.frameId, sclLevel: bpn.sclLevel } };
    const page = (name, content, owner) => ({ name, type: "text", title: { show: false, level: 1 }, ownership: { default: owner }, text: { format: HTML, content } });

    // Separate player document: the Mission Brief + the Field Dossier handout.
    const playerEntry = await JournalEntry.create({
      name: `${base} [Player]`,
      ownership: { default: O.OBSERVER },
      flags,
      pages: [
        page("Mission Brief", wrap(briefHTML(bpn, ART)), O.OBSERVER),
        page("Field Dossier", wrap(fieldDossierHTML(bpn, ART)), O.OBSERVER)
      ]
    });

    // Separate GM-only document, linked back to the player document.
    const gmEntry = await JournalEntry.create({
      name: `${base} [GM]`,
      ownership: { default: O.NONE },
      flags,
      pages: [
        page("GM Dossier", wrap(dossierHTML(bpn, ART)) + `<p class="bpn-rolls">Player document: @UUID[${playerEntry.uuid}]{${base} [Player]}</p>`, O.NONE)
      ]
    });

    ui.notifications.info(`Created "${base}": a player document (Brief + Field Dossier) and a separate GM document.`);
    gmEntry.sheet?.render(true);
  }

  static async #onChat() {
    const bpn = this._bpn();
    const card = `<div class="bpn"><div class="bpn-chat-card" style="--bpn-accent:${bpn.colour.accent};">
      <div class="bpn-chat-card__head">
        <img src="${crestDataURI(bpn, { size: 56 })}" width="56" height="56" alt="">
        <div>
          <div class="bpn-chat-card__band">${bpn.colour.label} BPN · ${bpn.colour.type}</div>
          <div class="bpn-chat-card__title">${bpn.shortTitle}</div>
          <div class="bpn-chat-card__meta">${bpn.bpnId} · ${bpn.sclRequirement} · ${bpn.reward.grossContract}</div>
        </div>
      </div>
      <p class="bpn-chat-card__brief">${foundry.utils.escapeHTML(bpn.missionBrief)}</p>
    </div></div>`;
    await ChatMessage.create({ speaker: { alias: "SLA Blueprint News" }, content: card });
  }
}

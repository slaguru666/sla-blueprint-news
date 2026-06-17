/* Blueprint News — render layer.
 *
 * Turns a BPN object (from core) into the two separate surfaces:
 *   - the Player Brief: the official corporate dispatch
 *   - the GM Dossier:   the handler-only truth
 *
 * Pure DOM + string building, framework-free. Functions come in two flavours:
 *   briefHTML(bpn) / dossierHTML(bpn)   -> markup strings (export, embedding)
 *   renderBrief(bpn, el) / renderDossier(bpn, el) -> mount into an element
 *
 * The host page must include render/bpn-render.css and the bundled fonts.css.
 */

import {
  crestSVG, bannerSVG, portraitSVG, siteMapSVG, npcPortraitSVG, itemIconSVG,
  crestDataURI, bannerDataURI, portraitDataURI, siteMapDataURI, npcPortraitDataURI, itemIconDataURI
} from "../art/bpn-art.js";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

/* The SLA "Third Eye" mark, used on the GM banner. */
function thirdEyeSVG(colour = "#ff5b5b") {
  return `<svg class="bpn-eye" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M32 14 C50 14 58 28 58 32 C58 36 50 50 32 50 C14 50 6 36 6 32 C6 28 14 14 32 14 Z" fill="none" stroke="${colour}" stroke-width="3"/>
    <circle cx="32" cy="32" r="9" fill="none" stroke="${colour}" stroke-width="3"/>
    <line x1="10" y1="54" x2="54" y2="10" stroke="${colour}" stroke-width="3"/>
  </svg>`;
}

function fact(label, value) {
  return `<div><span class="bpn-label">${esc(label)}</span><span class="bpn-value">${esc(value)}</span></div>`;
}

function card(label, value) {
  return `<div class="bpn-card"><span class="bpn-label">${esc(label)}</span><span class="bpn-value">${esc(value)}</span></div>`;
}

/* ---------------- PLAYER BRIEF ---------------- */

export function briefHTML(bpn, { art = true, artMode = "inline" } = {}) {
  const c = bpn.colour;
  const img = artMode === "img";
  const banner = !art ? ""
    : img ? `<img class="bpn-hero__artimg" src="${bannerDataURI(bpn, { width: 1200, height: 360 })}" alt="">`
          : bannerSVG(bpn, { width: 1200, height: 360 });
  const crest = img ? `<img src="${crestDataURI(bpn, { size: 184 })}" alt="">` : crestSVG(bpn, { size: 184 });
  const portrait = img ? `<img src="${portraitDataURI(bpn, { size: 120 })}" alt="">` : portraitSVG(bpn, { size: 120 });

  return `<article class="bpn-brief" style="--bpn-accent:${esc(c.accent)};">
  <div class="bpn-doc">
    <header class="bpn-hero">
      <div class="bpn-hero__art" aria-hidden="true">${banner}</div>
      <div class="bpn-stamp">Issued by<b>${esc(bpn.issuingDepartment)}</b></div>
      <div class="bpn-hero__crest">${crest}</div>
      <div class="bpn-hero__copy">
        <span class="bpn-hero__band"><b>${esc(c.label)}</b> BPN &middot; ${esc(c.type)}</span>
        <h1 class="bpn-hero__title">${esc(bpn.shortTitle)}</h1>
        <p class="bpn-hero__sub">${esc(c.summary)}</p>
      </div>
    </header>

    <div class="bpn-facts">
      ${fact("BPN ID", bpn.bpnId)}
      ${fact("SCL Requirement", bpn.sclRequirement)}
      ${fact("Gross Contract", bpn.reward.grossContract)}
      ${fact("Est. Take-home", bpn.reward.takeHomeEach)}
    </div>

    <div class="bpn-body">
      <section>
        <h2 class="bpn-section__title">Mission Brief</h2>
        <p class="bpn-brief-text">${esc(bpn.missionBrief)}</p>
      </section>

      <section>
        <h2 class="bpn-section__title">Objectives</h2>
        <div class="bpn-objective"><span class="bpn-label">Primary</span><span class="bpn-value">${esc(bpn.objective)}</span></div>
        <div class="bpn-objective" style="margin-top:8px;"><span class="bpn-label">Secondary</span><span class="bpn-value">${esc(bpn.extraObjective)}</span></div>
      </section>

      <section>
        <h2 class="bpn-section__title">Operational Picture</h2>
        <div class="bpn-grid">
          ${card("Location", bpn.location)}
          ${card("Atmosphere", bpn.atmosphere)}
          ${card("Declared Opposition", bpn.opposition)}
          ${card("Mission Focus", bpn.missionFocus)}
        </div>
      </section>

      <section>
        <h2 class="bpn-section__title">On-site Contact &amp; Pressures</h2>
        <div class="bpn-contact">
          <div class="bpn-contact__ident">${portrait}</div>
          <div class="bpn-contact__detail">
            <span class="bpn-label">Primary Contact</span>
            <span class="bpn-value bpn-contact__name">${esc(bpn.contact.name)}</span>
            <span class="bpn-value">${esc(bpn.contact.role)}</span>
            <span class="bpn-contact__pos">${esc(bpn.contact.location)}</span>
          </div>
        </div>
        <div class="bpn-grid" style="margin-top:12px;">
          ${card("Civilian Pressure", bpn.civilianFaction)}
          ${card("Operational Hook", bpn.hook)}
        </div>
      </section>
    </div>

    <footer class="bpn-footer">
      ${fact("Media Posture", bpn.reward.mediaCoverage)}
      ${fact("Squad Size", `${bpn.squadSize} Operatives`)}
      ${fact("SCL Increase", bpn.reward.sclIncrease)}
      ${fact("Cleanup Directive", bpn.cleanupDirective)}
    </footer>
  </div>
</article>`;
}

/* ---------------- PLAYER FIELD DOSSIER ---------------- */
/* A separate player-facing document: the cast, OTEM and locations the squad
   are cleared to know, with a schematic site map. The GM-only secrets for the
   same entries live in the GM Dossier. */

/** A simple NPC character-sheet card: portrait, who they are, why they matter. */
export function npcCardHTML(npc, { artMode = "inline", accent = "#9fb0c4" } = {}) {
  const art = artMode === "img"
    ? `<img src="${npcPortraitDataURI(npc, { size: 168, accent })}" alt="${esc(npc.name)}">`
    : npcPortraitSVG(npc, { size: 168, accent });
  return `<div class="bpn-npc-card">
    <div class="bpn-npc-card__art">${art}</div>
    <div class="bpn-npc-card__body">
      <div class="bpn-npc-card__name">${esc(npc.name)}</div>
      <div class="bpn-npc-card__role">${esc(npc.role)} · ${esc(npc.disposition)}</div>
      <p class="bpn-npc-card__desc">${esc(npc.description)}</p>
      <div class="bpn-npc-card__sig"><span class="bpn-label">Why they matter</span>${esc(npc.significance)}</div>
    </div>
  </div>`;
}

/** A simple item card: line-art icon, what it is, a description. */
export function itemCardHTML(item, { artMode = "inline", accent = "#9fb0c4" } = {}) {
  const art = artMode === "img"
    ? `<img src="${itemIconDataURI(item, { size: 120, accent })}" alt="${esc(item.name)}">`
    : itemIconSVG(item, { size: 120, accent });
  return `<div class="bpn-item-card">
    <div class="bpn-item-card__art">${art}</div>
    <div class="bpn-item-card__body">
      <div class="bpn-item-card__name">${esc(item.name)}</div>
      <p class="bpn-item-card__desc">${esc(item.description)}</p>
      <div class="bpn-item-card__note">${esc(item.player)}</div>
    </div>
  </div>`;
}

function siteRow(s, i) {
  return `<div class="bpn-detail-item">
    <div class="bpn-detail-item__name"><span class="bpn-site-no">${i + 1}</span>${esc(s.name)}</div>
    <div class="bpn-detail-item__line">${esc(s.player)}</div>
  </div>`;
}

export function fieldDossierHTML(bpn, { artMode = "inline" } = {}) {
  const c = bpn.colour;
  const map = artMode === "img"
    ? `<img class="bpn-sitemap__img" src="${siteMapDataURI(bpn, { width: 640, height: 320 })}" alt="sector schematic">`
    : siteMapSVG(bpn, { width: 640, height: 320 });

  return `<article class="bpn-field" style="--bpn-accent:${esc(c.accent)};">
  <div class="bpn-doc">
    <header class="bpn-field__head">
      <span class="bpn-hero__band"><b>${esc(c.label)}</b> Field Dossier</span>
      <h2 class="bpn-field__title">${esc(bpn.shortTitle)} — Operative Pack</h2>
      <p class="bpn-field__sub">Player reference: who you'll meet, what's in play, and where. Cleared for squad eyes.</p>
    </header>
    <div class="bpn-body">
      <section>
        <h2 class="bpn-section__title">Cast on the Ground</h2>
        <div class="bpn-card-grid">${bpn.cast.map((n) => npcCardHTML(n, { artMode, accent: c.accent })).join("")}</div>
      </section>
      <section>
        <h2 class="bpn-section__title">OTEM · Items &amp; Equipment</h2>
        <div class="bpn-card-grid bpn-card-grid--items">${bpn.otem.map((o) => itemCardHTML(o, { artMode, accent: c.accent })).join("")}</div>
      </section>
      <section>
        <h2 class="bpn-section__title">Key Locations</h2>
        <div class="bpn-sitemap">${map}</div>
        <div class="bpn-detail-list">${bpn.sites.map(siteRow).join("")}</div>
      </section>
    </div>
  </div>
</article>`;
}

/* ---------------- GM DOSSIER ---------------- */

export function dossierHTML(bpn, { artMode = "inline" } = {}) {
  const c = bpn.colour;
  const g = bpn.gm;
  const seam = bpn.npcSeam;
  const r = g.rolls ?? {};
  const eye = artMode === "img"
    ? `<img class="bpn-eye" src="data:image/svg+xml;utf8,${encodeURIComponent(thirdEyeSVG("#ff5b5b"))}" alt="">`
    : thirdEyeSVG("#ff5b5b");

  const seamRow = (seam.contactArchetype || seam.threatArchetype)
    ? `<section class="bpn-seam">
        <p class="bpn-eyebrow">NPC / Monster Hand-off</p>
        <p class="bpn-value" style="margin:6px 0 0;">This brief reserves two cast slots for the companion NPC module:</p>
        <p style="margin:8px 0 0; line-height:1.9;">
          Contact archetype <code>${esc(seam.contactArchetype ?? "—")}</code> &mdash; ${esc(bpn.contact.name)}, ${esc(bpn.contact.role)}.<br>
          Threat archetype <code>${esc(seam.threatArchetype ?? "—")}</code> &mdash; ${esc(seam.threatRole ?? g.threatLead ?? "—")}.
        </p>
      </section>`
    : "";

  return `<article class="bpn-dossier" style="--bpn-accent:${esc(c.accent)};">
  <div class="bpn-doc">
    <header class="bpn-dossier__banner">
      ${eye}
      <h2>GM Dossier — ${esc(bpn.shortTitle)}</h2>
      <span class="bpn-eyebrow">Restricted &middot; Handler Eyes Only</span>
    </header>

    <div class="bpn-body">
      <div class="bpn-grid">
        <div class="bpn-reveal bpn-twist">
          <span class="bpn-label">Operational Twist</span>
          <span class="bpn-value">${esc(g.localTwist)}</span>
        </div>
        <div class="bpn-reveal">
          <span class="bpn-label">Withheld Fact</span>
          <span class="bpn-value">${esc(g.complication)}</span>
        </div>
      </div>

      <section>
        <h2 class="bpn-section__title">True Threat Read</h2>
        <div class="bpn-card">
          <dl class="bpn-threat-read">
            <dt>Lead</dt><dd>${esc(g.threatLead || "—")}</dd>
            <dt>Numbers</dt><dd>${esc(g.threatCountLabel || "—")}</dd>
            <dt>Attitude</dt><dd>${esc(g.oppositionAttitude)}</dd>
          </dl>
        </div>
      </section>

      <section>
        <h2 class="bpn-section__title">Levers &amp; Escalation</h2>
        <div class="bpn-grid">
          ${card("Escalation Trigger", g.escalationEvent)}
          ${card("Civilian Lever", bpn.civilianFaction)}
          ${card("Financier Reality", g.financierNote)}
          ${card("CBS Bands", `${bpn.reward.cbsBandOp} per Op / ${bpn.reward.cbsBandSquad} per Squad`)}
        </div>
      </section>

      <section>
        <h2 class="bpn-section__title">Cast · OTEM · Sites — GM Notes</h2>
        <div class="bpn-gmnotes">
          ${bpn.cast.map((n) => `<div class="bpn-gmnote"><span class="bpn-gmnote__k">${esc(n.name)} — ${esc(n.role)}</span><span class="bpn-gmnote__v">${esc(n.gm)}</span></div>`).join("")}
          ${bpn.otem.map((o) => `<div class="bpn-gmnote"><span class="bpn-gmnote__k">${esc(o.name)}</span><span class="bpn-gmnote__v">${esc(o.gm)}</span></div>`).join("")}
          ${bpn.sites.map((s, i) => `<div class="bpn-gmnote"><span class="bpn-gmnote__k">${i + 1}. ${esc(s.name)}</span><span class="bpn-gmnote__v">${esc(s.gm)}</span></div>`).join("")}
        </div>
      </section>

      ${seamRow}

      <p class="bpn-rolls">Seed ${esc(bpn.seed)} &middot; frame ${esc(g.frameId)} &middot; rolls: colour ${esc(r.colour ?? 0)}, pay ${esc(r.paymentType ?? 0)}, CBS ${esc(r.cbsTier ?? 0)}, SCL ${esc(r.sclTier ?? 0)}, media ${esc(r.media ?? 0)}, financier ${esc(r.financier ?? 0)}.</p>
    </div>
  </div>
</article>`;
}

/* ---------------- mount helpers ---------------- */

export function renderBrief(bpn, el, opts) {
  const root = typeof el === "string" ? document.querySelector(el) : el;
  if (!root) return;
  root.classList.add("bpn");
  root.innerHTML = briefHTML(bpn, opts);
}

export function renderDossier(bpn, el) {
  const root = typeof el === "string" ? document.querySelector(el) : el;
  if (!root) return;
  root.classList.add("bpn");
  root.innerHTML = dossierHTML(bpn);
}

export function renderField(bpn, el, opts) {
  const root = typeof el === "string" ? document.querySelector(el) : el;
  if (!root) return;
  root.classList.add("bpn");
  root.innerHTML = fieldDossierHTML(bpn, opts);
}

/* Render all three surfaces into one element (the print / "all" view). */
export function renderBoth(bpn, el, opts) {
  const root = typeof el === "string" ? document.querySelector(el) : el;
  if (!root) return;
  root.classList.add("bpn");
  root.innerHTML = briefHTML(bpn, opts) + fieldDossierHTML(bpn, opts) + dossierHTML(bpn, opts);
}

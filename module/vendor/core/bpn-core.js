/* Blueprint News — engine-agnostic generation core.
 *
 * No DOM, no game-engine APIs. Given a seed (and optional overrides) it
 * produces a fully-resolved BPN object that is identical every time for the
 * same inputs — which lets the renderer and the procedural art stay in sync.
 *
 * The returned object deliberately separates what the squad is allowed to see
 * (top-level fields) from what only the GM sees (the `gm` block).
 */

import { COLOURS, COLOUR_ROLL_TABLE, colourByKey } from "./data/colours.js";
import { TABLES, COLOUR_MISSION_IDEAS } from "./data/tables.js";
import { framesForColour } from "./data/frames.js";

/* ---- seeded randomness -------------------------------------------------- */

function hashSeed(str) {
  let h = 2166136261 >>> 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(seed) {
  return mulberry32(hashSeed(seed));
}

/** A fresh human-friendly seed, e.g. "BPN-7F3A-21C9". Uses Math.random by
 *  design — call this once at the app layer, then everything downstream is
 *  deterministic from the returned string. */
export function randomSeed() {
  const block = () => Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
  return `BPN-${block()}-${block()}`;
}

/* ---- small helpers ------------------------------------------------------ */

function pick(rng, arr) {
  return Array.isArray(arr) && arr.length ? arr[Math.floor(rng() * arr.length)] : "";
}

function rollDie(rng, faces) {
  return Math.floor(rng() * faces) + 1;
}

function pad(n, width = 3) {
  return String(n).padStart(width, "0");
}

function take(value, fallback = "") {
  const v = String(value ?? "").trim();
  return v || String(fallback ?? "").trim();
}

function clampSquad(value) {
  const n = Number(value ?? 4);
  if (!Number.isFinite(n)) return 4;
  return Math.max(1, Math.min(8, Math.round(n)));
}

function formatScl(value = 0) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "+0.0";
  const fixed = Math.abs(n) >= 1 ? n.toFixed(1) : n.toFixed(2);
  const trimmed = fixed.replace(/\.?0+$/, "");
  return `${n >= 0 ? "+" : ""}${trimmed}`;
}

/* ---- reward / SCL maths ------------------------------------------------- */

function creditsFromRange(range = { min: 0, max: 0 }, tier = "mid") {
  const min = Number(range?.min ?? 0);
  const max = range?.max == null ? null : Number(range.max);
  if (!Number.isFinite(min)) return 0;
  if (max === null || !Number.isFinite(max)) {
    if (tier === "low") return Math.round(min);
    if (tier === "mid") return Math.round(min * 1.15);
    return Math.round(min * 1.35);
  }
  if (tier === "low") return Math.round(min);
  if (tier === "high") return Math.round(max);
  return Math.round((min + max) / 2);
}

function tierFromRoll(roll = 1) {
  if (roll <= 2) return "low";
  if (roll <= 4) return "mid";
  return "high";
}

function mediaFromRoll(roll = 1) {
  if (roll <= 1) return "None";
  if (roll <= 3) return "Station Analysis";
  if (roll <= 5) return "Third Eye News";
  return "GoreZone / Contract Circuit Special";
}

function rewardPackage(rng, colour, input) {
  const paymentTypeRoll = rollDie(rng, 6);
  const cbsTierRoll = rollDie(rng, 6);
  const sclTierRoll = rollDie(rng, 6);
  const mediaRoll = rollDie(rng, 6);
  const financierRoll = rollDie(rng, 6);

  const squadSize = clampSquad(input.squadSize);
  const paymentType = input.paymentType && input.paymentType !== "__RANDOM__"
    ? String(input.paymentType)
    : (paymentTypeRoll <= 4 ? "Per Squad" : "Per Operative");
  const cbsTier = tierFromRoll(cbsTierRoll);
  const sclTier = tierFromRoll(sclTierRoll);

  const grossPerOp = creditsFromRange(colour.cbsPerOpRange, cbsTier);
  const grossPerSquad = creditsFromRange(colour.cbsPerSquadRange, cbsTier);
  const grossContractValue = paymentType === "Per Operative" ? grossPerOp * squadSize : grossPerSquad;

  const financierCutPercent = input.financierCutPercent
    ? Number(input.financierCutPercent)
    : (financierRoll <= 2 ? 10 : financierRoll <= 4 ? 15 : 20);
  const netContract = Math.max(0, Math.round(grossContractValue * (1 - financierCutPercent / 100)));
  const takeHomeEach = Math.max(1, Math.floor(netContract / squadSize));

  const sclByTier = {
    low: Number(colour.sclRange?.min ?? 0.1),
    mid: Number(colour.sclRange?.typical ?? colour.sclRange?.min ?? 0.1),
    high: Number(colour.sclRange?.max ?? colour.sclRange?.typical ?? 0.2)
  };

  return {
    paymentType,
    squadSize,
    grossContractValue,
    netContract,
    takeHomeEach,
    financierCutPercent,
    cbsBandOp: `${colour.cbsPerOpRange?.min ?? 0}c - ${colour.cbsPerOpRange?.max ?? "?"}c`,
    cbsBandSquad: `${colour.cbsPerSquadRange?.min ?? 0}c - ${colour.cbsPerSquadRange?.max ?? "?"}c`,
    sclIncrease: formatScl(sclByTier[sclTier] ?? sclByTier.mid),
    mediaCoverage: input.mediaCoverage && input.mediaCoverage !== "__RANDOM__"
      ? String(input.mediaCoverage)
      : mediaFromRoll(mediaRoll),
    notes: `Financier cut assumed at ${financierCutPercent}%. Take-home is after the financier slice, split across ${squadSize} Operatives.`,
    rolls: { paymentType: paymentTypeRoll, cbsTier: cbsTierRoll, sclTier: sclTierRoll, media: mediaRoll, financier: financierRoll }
  };
}

/* ---- derived prose ------------------------------------------------------ */

function objectiveFromFocus(focusText = "") {
  const t = String(focusText ?? "").toLowerCase();
  if (t.includes("eliminate")) return "Neutralise the designated threat and confirm status.";
  if (t.includes("escort") || t.includes("protect")) return "Keep the protected asset moving and alive through the full route.";
  if (t.includes("retrieve")) return "Recover the designated item, data, or specimen intact and preserve chain of custody.";
  if (t.includes("investigate")) return "Identify culprit(s), secure evidence, and produce an admissible corporate finding.";
  if (t.includes("contain") || t.includes("quarantine")) return "Lock the threat down before it jumps sectors.";
  if (t.includes("riot") || t.includes("crowd")) return "Restore order without losing the public narrative.";
  if (t.includes("hunt")) return "Track, isolate, and capture or terminate the named target.";
  if (t.includes("clean up")) return "Recover all traces of the prior SLA incident before public disclosure.";
  if (t.includes("sabotage") || t.includes("destroy")) return "Disable the objective and leave a believable false story behind.";
  return "Complete the assigned contract objective and report all outcomes.";
}

function cleanupDirective(colourKey = "blue") {
  const k = String(colourKey ?? "blue").toLowerCase();
  const map = {
    blue: "Restore basic street function and hand the site back looking manageable.",
    yellow: "Protect the recovered asset's chain of custody at all times.",
    green: "Confirm every kill and leave nothing twitching for the cameras.",
    white: "Return with evidence, witnesses, and a narrative command can sign off on.",
    grey: "Keep the paperwork clean and the department's name out of the fallout.",
    silver: "Keep public optics sponsor-safe from briefing to extraction.",
    jade: "Seal contamination and route all samples through Karma only.",
    red: "Stabilise the zone first, then explain it to the cameras.",
    black: "Remove traces, minimise witnesses, and suppress operational signatures.",
    platinum: "Preserve classification and return all material to Head Office only."
  };
  return map[k] ?? "Recover evidence, suppress compromising exposure, and file a command-ready debrief.";
}

/** Trim trailing whitespace/punctuation so clauses join cleanly. */
function trimEnd(s = "") {
  return String(s).replace(/[.\s]+$/, "");
}

/** Lowercase only the first letter — keeps acronyms (SLA) and names (DarkNight). */
function lcFirst(s = "") {
  const v = String(s);
  return v.charAt(0).toLowerCase() + v.slice(1);
}

function buildMissionBrief(b) {
  const objective = lcFirst(trimEnd(objectiveFromFocus(b.missionFocus)));
  const loc = trimEnd(b.location);
  const opp = lcFirst(trimEnd(b.opposition));
  return [
    `${b.issuingDepartment} has issued ${b.bpnId}, a ${b.colour.label.toUpperCase()} ${b.colour.type.toLowerCase()} contract.`,
    `${b.contact.name} — ${b.contact.role} — wants the squad to ${objective}.`,
    `Operational spine: ${loc}.`,
    `${b.hook}`,
    `Expect ${opp}.`,
    `Media posture is ${b.reward.mediaCoverage.toLowerCase()}; command expects a clean narrative.`
  ].join(" ");
}

/* ---- public API --------------------------------------------------------- */

/**
 * Resolve a complete BPN from inputs.
 * @param {object} opts
 * @param {string} [opts.seed]      Reproducibility seed; one is generated if absent.
 * @param {string} [opts.colourKey] Force a colour band; otherwise rolled on the d20 table.
 * @param {string} [opts.frameId]   Force a scenario frame within the band.
 * @param {object} [opts.overrides] Any field to pin to a specific value (e.g. {location: "..."}).
 * @param {number} [opts.squadSize] Default 4.
 */
export function generateBPN(opts = {}) {
  const seed = take(opts.seed, randomSeed());
  const rng = makeRng(seed);
  const ov = opts.overrides ?? {};

  // Colour band: forced, or rolled on the d20 issue table.
  let colour;
  let colourRoll = 0;
  if (opts.colourKey) {
    colour = colourByKey(opts.colourKey);
  } else {
    colourRoll = rollDie(rng, 20);
    const row = COLOUR_ROLL_TABLE.find((r) => colourRoll >= r.min && colourRoll <= r.max) ?? COLOUR_ROLL_TABLE[0];
    colour = colourByKey(row.key);
  }

  // Scenario frame within the band.
  const frames = framesForColour(colour.key);
  const frame = (opts.frameId && frames.find((f) => f.id === opts.frameId)) || pick(rng, frames);

  const reward = rewardPackage(rng, colour, { squadSize: opts.squadSize ?? ov.squadSize, ...ov });

  const contactName = take(
    ov.contactName,
    `${pick(rng, TABLES.contactFirstNames)} ${pick(rng, TABLES.contactLastNames)}`
  );

  const hookFallback = frame.colourMissionIdea || pick(rng, COLOUR_MISSION_IDEAS[colour.key] ?? []);

  const bpn = {
    seed,
    bpnId: take(ov.bpnId, `${colour.label.toUpperCase().slice(0, 2)}-${pad(rollDie(rng, 999))}-${pad(rollDie(rng, 999))}`),
    shortTitle: take(ov.shortTitle, frame.shortTitle),
    colourKey: colour.key,
    colour,
    issuingDepartment: take(ov.issuingDepartment, frame.issuingDepartment || pick(rng, TABLES.issuingDepartments)),
    squadSize: reward.squadSize,
    sclRequirement: take(ov.sclRequirement, colour.sclReq),

    contact: {
      name: contactName,
      role: take(ov.contactRole, frame.contactRole),
      location: take(ov.contactLocation, frame.contactLocation)
    },

    missionFocus: take(ov.missionFocus, frame.missionFocus || pick(rng, TABLES.missionFocus)),
    hook: take(ov.hook, hookFallback),
    objective: objectiveFromFocus(take(ov.missionFocus, frame.missionFocus)),
    location: take(ov.location, frame.location || pick(rng, TABLES.locations)),
    atmosphere: take(ov.atmosphere, frame.atmosphere || pick(rng, TABLES.atmospheres)),
    opposition: take(ov.opposition, frame.opposition || pick(rng, TABLES.opposition)),
    civilianFaction: take(ov.civilianFaction, frame.civilianFaction || pick(rng, TABLES.civilianFactions)),
    extraObjective: take(ov.extraObjective, frame.extraObjective || pick(rng, TABLES.extraObjectives)),
    cleanupDirective: cleanupDirective(colour.key),

    reward: {
      paymentType: reward.paymentType,
      grossContract: `${reward.grossContractValue}c (${reward.paymentType})`,
      grossContractValue: reward.grossContractValue,
      takeHomeEach: `${reward.takeHomeEach}c each`,
      financierCut: `${reward.financierCutPercent}%`,
      financierCutPercent: reward.financierCutPercent,
      sclIncrease: reward.sclIncrease,
      mediaCoverage: reward.mediaCoverage,
      cbsBandOp: reward.cbsBandOp,
      cbsBandSquad: reward.cbsBandSquad
    },

    // Seam for a future NPC/monster module: archetype keys only, no stat schema.
    npcSeam: {
      contactArchetype: frame.contactArchetype ?? null,
      threatArchetype: frame.threatArchetype ?? null,
      threatRole: frame.threatRole ?? null
    },

    // GM-only truth. The renderer keeps this on a separate surface.
    gm: {
      complication: take(ov.complication, frame.complication || pick(rng, TABLES.complications)),
      localTwist: take(ov.localTwist, frame.localTwist || pick(rng, TABLES.localTwists)),
      oppositionAttitude: take(ov.oppositionAttitude, frame.oppositionAttitude || pick(rng, TABLES.oppositionAttitudes)),
      escalationEvent: take(ov.escalationEvent, frame.escalationEvent || pick(rng, TABLES.escalationEvents)),
      threatLead: take(ov.threatLead, frame.threatRole),
      threatCountLabel: take(ov.threatCountLabel, frame.threatCountLabel),
      financierNote: reward.notes,
      frameId: frame.id,
      rolls: { colour: colourRoll, ...reward.rolls }
    }
  };

  bpn.missionBrief = take(ov.missionBrief, buildMissionBrief(bpn));
  return bpn;
}

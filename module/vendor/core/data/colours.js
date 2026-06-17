/* SLA Industries BPN colour bands — the spine of the whole system.
   Pure data, no engine or DOM dependencies. Each band carries its
   classification, pay/SCL/media profile, and a render accent. */

export const COLOURS = [
  {
    key: "blue",
    label: "Blue",
    type: "Street Maintenance",
    summary: "Street maintenance and dirty clean-up contracts.",
    details: "Sewer clearances, vermin extermination, infrastructure support, and low-end evictions.",
    sclReq: "10 - 9",
    sclRange: { min: 0.05, typical: 0.1, max: 0.2 },
    cbsPerOpRange: { min: 50, max: 150 },
    cbsPerSquadRange: { min: 100, max: 300 },
    mediaCoverage: "Rare / None",
    accent: "#57b3ff"
  },
  {
    key: "yellow",
    label: "Yellow",
    type: "Retrieval",
    summary: "Recover a person, item, data package, or specimen.",
    details: "Primary objective is bring it back, often issued by Housing, Cloak, or Karma.",
    sclReq: "10 - 9",
    sclRange: { min: 0.05, typical: 0.1, max: 0.2 },
    cbsPerOpRange: { min: 100, max: 200 },
    cbsPerSquadRange: { min: 200, max: 400 },
    mediaCoverage: "Station Analysis / None",
    accent: "#ffdb6e"
  },
  {
    key: "green",
    label: "Green",
    type: "Cloak / Extermination",
    summary: "Combat-focused extermination and suppression assignments.",
    details: "Kill or capture designated threats before they escalate into full emergency response.",
    sclReq: "10 - 8",
    sclRange: { min: 0.1, typical: 0.1, max: 0.3 },
    cbsPerOpRange: { min: 100, max: 250 },
    cbsPerSquadRange: { min: 200, max: 500 },
    mediaCoverage: "Station Analysis / Third Eye",
    accent: "#78d48f"
  },
  {
    key: "white",
    label: "White",
    type: "Investigation",
    summary: "Detective and analytical assignments.",
    details: "Evidence-led cases with witness work, profiling, and pattern analysis.",
    sclReq: "10 - 7",
    sclRange: { min: 0.1, typical: 0.1, max: 0.3 },
    cbsPerOpRange: { min: 150, max: 300 },
    cbsPerSquadRange: { min: 250, max: 500 },
    mediaCoverage: "Third Eye / Station Analysis",
    accent: "#dce8f9"
  },
  {
    key: "grey",
    label: "Grey",
    type: "Departmental Enforcement / Corporate",
    summary: "Internal enforcement and politically sensitive corporate work.",
    details: "Escort, asset protection, audit support, and departmentally awkward clean-ups.",
    sclReq: "9 - 7",
    sclRange: { min: 0.1, typical: 0.2, max: 0.3 },
    cbsPerOpRange: { min: 200, max: 400 },
    cbsPerSquadRange: { min: 300, max: 600 },
    mediaCoverage: "Station Analysis",
    accent: "#9da6b3"
  },
  {
    key: "silver",
    label: "Silver",
    type: "Diplomatic / Escort / PR",
    summary: "High-profile, social, and reputation-sensitive contracts.",
    details: "VIP escort, public appearances, negotiations, and camera-facing operations.",
    sclReq: "9 - 6",
    sclRange: { min: 0.1, typical: 0.2, max: 0.4 },
    cbsPerOpRange: { min: 200, max: 500 },
    cbsPerSquadRange: { min: 300, max: 800 },
    mediaCoverage: "Third Eye / GoreZone",
    accent: "#d7dee8"
  },
  {
    key: "jade",
    label: "Jade",
    type: "Environmental / Biohazard",
    summary: "Containment and neutralisation of biological and chemical threats.",
    details: "Biohazard incidents, toxic leaks, mutations, and containment failures.",
    sclReq: "9 - 6",
    sclRange: { min: 0.1, typical: 0.2, max: 0.4 },
    cbsPerOpRange: { min: 250, max: 500 },
    cbsPerSquadRange: { min: 400, max: 800 },
    mediaCoverage: "Third Eye / Contract Circuit",
    accent: "#41d0a3"
  },
  {
    key: "red",
    label: "Red",
    type: "Emergency Response",
    summary: "Crisis-response and red-alert operations.",
    details: "Riots, terror incidents, major failures, and high-risk live-response deployments.",
    sclReq: "10 - 5",
    sclRange: { min: 0.1, typical: 0.2, max: 0.5 },
    cbsPerOpRange: { min: 200, max: 500 },
    cbsPerSquadRange: { min: 300, max: 1000 },
    mediaCoverage: "Third Eye / GoreZone",
    accent: "#ff6f6f"
  },
  {
    key: "black",
    label: "Black",
    type: "Covert / Black Ops",
    summary: "Classified, deniable, and often off-record operations.",
    details: "Assassination, sabotage, deep infiltration, and disavowed clean-up actions.",
    sclReq: "7 - 4",
    sclRange: { min: 0.2, typical: 0.4, max: 0.7 },
    cbsPerOpRange: { min: 500, max: 1000 },
    cbsPerSquadRange: { min: 800, max: 2000 },
    mediaCoverage: "None (classified)",
    accent: "#9a7cff"
  },
  {
    key: "platinum",
    label: "Platinum",
    type: "Head Office / Top Secret",
    summary: "Highest-level Head Office operations.",
    details: "World-shaping, deeply classified, and politically lethal assignments.",
    sclReq: "5 - 1",
    sclRange: { min: 0.3, typical: 0.5, max: 1.0 },
    cbsPerOpRange: { min: 1000, max: null },
    cbsPerSquadRange: { min: 1500, max: null },
    mediaCoverage: "Classified / Special",
    accent: "#f5f0d7"
  }
];

/* d20 issue table — how often each band lands when rolled randomly. */
export const COLOUR_ROLL_TABLE = [
  { min: 1, max: 4, key: "blue" },
  { min: 5, max: 7, key: "yellow" },
  { min: 8, max: 9, key: "green" },
  { min: 10, max: 12, key: "white" },
  { min: 13, max: 13, key: "grey" },
  { min: 14, max: 14, key: "silver" },
  { min: 15, max: 15, key: "jade" },
  { min: 16, max: 17, key: "red" },
  { min: 18, max: 19, key: "black" },
  { min: 20, max: 20, key: "platinum" }
];

export const COLOUR_BY_KEY = Object.fromEntries(COLOURS.map((c) => [c.key, c]));

export function colourByKey(key = "white") {
  return COLOUR_BY_KEY[String(key ?? "white").toLowerCase()] ?? COLOUR_BY_KEY.white;
}

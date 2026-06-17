/* Generic SLA flavour tables used to fill any gaps a scenario frame
   leaves open, and to drive fully-random briefings. Pure data. */

export const TABLES = {
  missionFocus: [
    "Eliminate a threat before it reaches public view.",
    "Capture a target alive for interrogation.",
    "Protect or escort a person through a hostile district.",
    "Protect or escort a cargo asset.",
    "Retrieve an item or specimen intact.",
    "Retrieve data or recordings without contamination.",
    "Investigate a crime scene with political fallout.",
    "Profile and locate a serial killer before media lock-on.",
    "Contain or quarantine an outbreak or Ebb event.",
    "Crowd control and riot suppression under cameras.",
    "Hunt a named hostile and confirm status.",
    "Clean up an old SLA operational mess."
  ],

  locations: [
    "Downtown backstreets.",
    "Sewer network and maintenance tunnels.",
    "Industrial sector and power spine.",
    "Residential block or tenement arc.",
    "Transit system and monorail stations.",
    "Cannibal Sector perimeter.",
    "Corporate laboratory or asset vault.",
    "Nightclub and entertainment block.",
    "Broadcast tower and media hub.",
    "Hospital, triage zone, or Karma lab."
  ],

  opposition: [
    "Street gang with light arms and local lookouts.",
    "Organised crime syndicate with political backing.",
    "Serial killer cell already moving to a second target.",
    "DarkNight agents with a deniable brief.",
    "Carrien pack using service tunnels.",
    "Rogue biogenetic asset or escaped Stormer variant.",
    "Rival SLA squad chasing the same payout.",
    "Corrupt Shivers protecting the wrong people.",
    "Cultists, Sh'ien influence, or Ebb residue.",
    "Corporate security with strict no-survivor orders."
  ],

  complications: [
    "The issuing department withheld one critical fact.",
    "Third Eye goes live before the squad enters the zone.",
    "A witness can identify one operative by name.",
    "The target is embedded in civilians.",
    "The package is alive and unstable.",
    "Transit lockdown traps everyone inside the district.",
    "The real employer is not the signatory on the BPN.",
    "L.A.D. response in the zone is unreliable.",
    "Communications are jammed or intercepted.",
    "The BPN is partly a ratings play dressed up as emergency work."
  ],

  contactRoles: [
    "Shiver precinct liaison",
    "Mort Department dispatcher",
    "Department-M observer",
    "Corporate asset handler",
    "Embedded media fixer",
    "Sector security captain",
    "Karma field scientist",
    "Independent financier",
    "Freelance financier",
    "Darkfinder case officer"
  ],

  contactFirstNames: [
    "Anika", "Blaine", "Caro", "Drex", "Ephra", "Fenn", "Galia", "Havel",
    "Iona", "Jarek", "Kiva", "Luther", "Mara", "Nikol", "Orin", "Petra"
  ],

  contactLastNames: [
    "Voss", "Kane", "Talon", "Mercer", "Sloane", "Varik", "Drahl", "Kessler",
    "Morn", "Black", "Harrow", "Vale", "Kestral", "Renn", "Soren", "Yarrow"
  ],

  civilianFactions: [
    "Local residents trying to keep their block standing.",
    "Black-market traders who know the unofficial routes.",
    "A fan club for a specific operative or squad.",
    "A semi-legal street clinic with decent gear and bad ties.",
    "Displaced refugees from a devastated sector.",
    "A corporate outreach team doing smiling PR work."
  ],

  oppositionAttitudes: [
    "Underestimate the squad and get cocky.",
    "Are terrified of SLA but cornered and desperate.",
    "See the squad as expendable obstacles, not people.",
    "Are only in it for the money.",
    "Hope to cut a deal or run rather than die.",
    "Use the squad as a distraction for a bigger move."
  ],

  atmospheres: [
    "Oppressive rain, thunder, and ankle-deep water in the streets.",
    "Chemical smog and neon halos around every light source.",
    "Rolling blackouts, flicker failures, and generator hum.",
    "Industrial noise and heavy machine vibration.",
    "Crowded streets with sale events or festivals in progress.",
    "Curfew with Shivers on every corner and everyone watching."
  ],

  localTwists: [
    "The district is regarded as cursed by locals.",
    "A recent promo shoot left half-finished set pieces everywhere.",
    "A minor celebrity is present and drawing attention.",
    "Surveillance coverage is patchy or disabled.",
    "Someone is independently live-streaming the operation.",
    "A rival squad failed a BPN here recently and left damage behind."
  ],

  extraObjectives: [
    "Capture at least one enemy alive for interrogation.",
    "Recover specific data intact with no EMP or overkill.",
    "Ensure a particular building remains undamaged.",
    "Plant a tracking device unnoticed.",
    "Secure a specific piece of gear for a sponsor.",
    "Ensure that no civilians witness one critical event."
  ],

  escalationEvents: [
    "Opposition reinforcements arrive mid-operation.",
    "The environment becomes more dangerous: fire, flood, or collapse.",
    "Media crews show up and start reframing the mission.",
    "A key NPC flees, forcing an ugly pursuit.",
    "Communications fail at the worst possible moment.",
    "A supposedly neutral faction chooses a side."
  ],

  issuingDepartments: [
    "Mort Department / Ops Control",
    "Department-M / Internal Containment",
    "Shiver Command Liaison Desk",
    "Karma Hazard Response",
    "Cloak Tactical Oversight",
    "Media Relations / Sponsor Operations",
    "Head Office Special Assignments"
  ],

  mediaOptions: [
    "None",
    "Rare / None",
    "Station Analysis",
    "Third Eye News",
    "GoreZone / Contract Circuit Special",
    "Classified / Special"
  ]
};

/* Per-colour mission hooks — short pitched ideas keyed by band. */
export const COLOUR_MISSION_IDEAS = {
  blue: [
    "Clear out Carrien and secure the pump station before repairs begin.",
    "Survey a derelict subway spur and mark safe lanes for clean-up crews.",
    "Evict a low-level gang from a recycling depot without wrecking the machinery."
  ],
  yellow: [
    "Recover a stolen prototype before it disappears through the black market.",
    "Locate a missing departmental courier and return the carried drives intact.",
    "Retrieve a captured informant before rivals extract anything useful."
  ],
  green: [
    "Neutralise a threat before it can trigger full emergency escalation.",
    "Sweep a district after repeated monster sightings and stop the panic source.",
    "Guard a prisoner transfer while hostile assets try to reclaim the cargo."
  ],
  white: [
    "Uncover who is issuing forged BPNs to lure squads into ambushes.",
    "Trace sabotaged SLA-manufactured ammo back to the source.",
    "Link a string of identical killings across multiple sectors."
  ],
  grey: [
    "Protect engineers installing surveillance hardware in a tense district.",
    "Assist a corporate audit team investigating missing shipments.",
    "Guard a prototype vehicle during a live test run."
  ],
  silver: [
    "Escort a diplomatic envoy without provoking a public incident.",
    "Keep a sponsor-backed appearance alive while controlling optics.",
    "Secure a high-profile interview venue before the cameras roll."
  ],
  jade: [
    "Contain a biohazard leak in a mixed-use block and secure samples.",
    "Neutralise a mutated outbreak before it reaches transport lines.",
    "Lock down a failed research ward and extract surviving technicians."
  ],
  red: [
    "Board a hijacked monorail in motion and rescue the hostages.",
    "Retake a broadcast tower seized by extremists.",
    "Stabilise a district where fires, looters, and panic are all spreading."
  ],
  black: [
    "Infiltrate a sealed compound, remove a target, and leave no public trace.",
    "Sabotage a rival operation and redirect blame elsewhere.",
    "Extract records from an internal vault while command denies the mission exists."
  ],
  platinum: [
    "Recover a lost prototype before anyone realises it escaped.",
    "Investigate an off-limits sector where sensors keep going dark.",
    "Quietly remove an inconvenient public hero from the board."
  ]
};

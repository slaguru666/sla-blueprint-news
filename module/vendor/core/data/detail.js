/* Vocabulary for the expanded briefing detail — cast (NPCs), OTEM (items &
   equipment), and locations. Pure data; bpn-core assembles entries from these
   with the briefing seed, so every briefing gets coherent, varied detail with
   a player-facing line and a GM-only secret.

   "OTEM" is used here for mission-relevant items, gear, and objects of note. */

export const DETAIL = {
  /* ---- cast / NPCs ---- */
  npcRoles: [
    "Sector fixer", "Nervous witness", "Off-duty Shiver", "Street medic",
    "Corporate liaison", "Information broker", "Frightened bystander",
    "Local enforcer", "Black-market runner", "Maintenance technician",
    "Embedded journalist", "Karma field tech", "Departmental clerk",
    "Sponsor's handler", "Squatter elder", "Transit controller"
  ],
  npcDispositions: [
    "Cooperative", "Wary", "Openly hostile", "Opportunistic", "Terrified",
    "Loyal to the issuing department", "Bitter and uncooperative",
    "Eager to please the cameras", "Quietly desperate"
  ],
  npcPlayerNotes: [
    "Can point the squad to the right door if handled well.",
    "Keeps demanding to know who is paying for the damage.",
    "Has a name and a face the public already half-recognises.",
    "Will talk, but only away from the crowd.",
    "Carries a comms slate they keep glancing at.",
    "Insists they 'didn't see anything' a little too quickly.",
    "Offers help in exchange for a favour later.",
    "Is clearly waiting for someone who has not arrived."
  ],
  npcSecrets: [
    "Is quietly feeding movement reports to the true employer.",
    "Knows where the real objective is and is sitting on it.",
    "Will flip to the squad's side if offered a clean way out.",
    "Is marked for removal by the opposition and does not know it.",
    "Has already sold the squad's arrival time to a third party.",
    "Is an undercover asset of a department that is not on the BPN.",
    "Plans to loot the site the moment the shooting starts.",
    "Is the actual target the GM is steering the mission toward."
  ],

  /* ---- OTEM (items & equipment) ---- */
  otemNames: [
    "Sealed data slate", "Sample canister", "Concealed weapon cache",
    "Forged clearance chip", "Departmental evidence crate", "Surveillance bug cluster",
    "Prototype component", "Encrypted comms relay", "Med-kit with restricted stims",
    "Sponsor-branded camera drone", "Maintenance master-key", "Blood-stained ID card"
  ],
  otemPlayerNotes: [
    "Logged on the BPN manifest; command wants it back intact.",
    "Spotted on the contact's last report, location uncertain.",
    "Rumoured to be on-site but not officially confirmed.",
    "Will read as contraband if a Shiver scans the squad.",
    "Worth a quiet bonus to the right buyer.",
    "Fragile — rough handling will ruin its value."
  ],
  otemSecrets: [
    "Is still broadcasting a locator only the GM's faction can hear.",
    "Is a decoy; the real article left the site hours ago.",
    "Is booby-trapped to wipe or detonate if opened wrong.",
    "Implicates the issuing department if it ever reaches Head Office.",
    "Is worth far more than the BPN pay and everyone on-site knows it.",
    "Matches evidence from a case SLA officially closed."
  ],

  /* ---- locations / sites ---- */
  siteNames: [
    "the loading dock", "a sub-level service gallery", "the relay/control room",
    "a collapsed access stair", "the upper catwalks", "a sealed storage bay",
    "the perimeter checkpoint", "a flooded maintenance shaft", "the lobby atrium",
    "a back-alley cut-through", "the rooftop plant deck", "an evidence locker"
  ],
  sitePlayerNotes: [
    "Marked as the recommended entry point.",
    "Command flags it as the likely chokepoint.",
    "Civilian traffic runs straight through it.",
    "Reported as the contact's fallback position.",
    "Surveillance here is patchy at best.",
    "Last place the objective was logged."
  ],
  siteSecrets: [
    "Has a second exit the opposition is using to flank.",
    "Is wired to seal on a silent alarm and trap whoever is inside.",
    "Hides the true objective behind a maintenance panel.",
    "Is where the escalation event will first break out.",
    "Conceals a body the issuing department wants nobody to find.",
    "Is overlooked on the official map command handed the squad."
  ]
};

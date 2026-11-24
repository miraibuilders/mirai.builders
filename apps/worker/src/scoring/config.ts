export const SCORING_CONFIG = {
  technicalDecay: {
    max: 40,
    eolPhp: 15,
    outdatedCms: 10,
    missingDmarc: 5,
    expiringTls: 5,
    exposedSecrets: 5,
  },
  segmentFit: {
    max: 25,
    target: 25,
    adjacent: 12,
    nonTarget: 0,
    targetSegments: [
      "foreign_owned_smb",
      "professional_office",
      "auto_shop",
      "inbound_tourism",
    ],
    adjacentSegments: ["clinic", "local_business"],
  },
  reachability: {
    max: 20,
    referral: 20,
    mikaNetwork: 15,
    coldList: 5,
  },
  websitePresence: {
    max: 10,
    live: 10,
    parkedOrExpired: 0,
    none: 0,
  },
  sizeProxy: {
    max: 5,
    pointsPerStaff: 1,
  },
  thresholds: {
    A: 80,
    B: 60,
    C: 40,
  },
} as const;

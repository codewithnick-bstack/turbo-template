/**
 * Photography used across the site. Every entry is licensed for commercial
 * use (Unsplash License / Pexels License); attribution lives in
 * public/photos/MANIFEST.md. Alt text describes content, not mood — screen
 * readers do not need to know it is "dramatic".
 */
export const photos = {
  craneDusk: {
    src: "/photos/crane-dusk.jpg",
    alt: "Tower crane silhouetted against a dusk sky above a high-rise under construction",
  },
  commercialHighrise: {
    src: "/photos/commercial-highrise.jpg",
    alt: "Steel and glass high-rise under construction in daylight",
  },
  heavyCivil: {
    src: "/photos/heavy-civil.jpg",
    alt: "Aerial view of a multi-level highway interchange",
  },
  development: {
    src: "/photos/development.jpg",
    alt: "Wide view of a mixed-use development site with several tower cranes",
  },
  trades: {
    src: "/photos/trades.jpg",
    alt: "Worker in a hard hat tying rebar by hand",
  },
  superintendent: {
    src: "/photos/superintendent.jpg",
    alt: "Two people in hard hats talking on a construction site",
  },
  siteMeeting: {
    src: "/photos/site-meeting.jpg",
    alt: "Engineer reviewing plans at a site office table",
  },
  concrete: {
    src: "/photos/concrete.jpg",
    alt: "Bundled steel rebar stacked on a jobsite",
  },
  skylineBand: {
    src: "/photos/skyline-band.jpg",
    alt: "City skyline across a river at blue hour",
  },
  bridgeDusk: {
    src: "/photos/bridge-dusk.jpg",
    alt: "Manhattan Bridge and the New York skyline at dusk",
  },
  plans: {
    src: "/photos/plans.jpg",
    alt: "Architectural drawings spread across a desk",
  },
  employerOffice: {
    src: "/photos/employer-office.jpg",
    alt: "Construction site seen through an office window",
  },

  // Second batch, added 2026-09-04 so no photograph has to appear on more
  // than one page. Same licence terms; see MANIFEST.md.
  steelErection: {
    src: "/photos/steel-erection.jpg",
    alt: "Ironworkers setting steel beams on a high-rise frame",
  },
  bridgeGirder: {
    src: "/photos/bridge-girder.jpg",
    alt: "Crawler crane lifting a bridge girder into place",
  },
  tunnelWorks: {
    src: "/photos/tunnel-works.jpg",
    alt: "Underground tunnel section under construction",
  },
  nightSite: {
    src: "/photos/night-site.jpg",
    alt: "Construction site working under floodlights at night",
  },
  surveyor: {
    src: "/photos/surveyor.jpg",
    alt: "Surveyor sighting through a total station on site",
  },
  fieldOffice: {
    src: "/photos/field-office.jpg",
    alt: "Site office desk with drawings and a laptop",
  },
  safetyBriefing: {
    src: "/photos/safety-briefing.jpg",
    alt: "Crew in hard hats gathered for a site safety briefing",
  },
  welding: {
    src: "/photos/welding.jpg",
    alt: "Welder joining steel, sparks around the arc",
  },
  earthworks: {
    src: "/photos/earthworks.jpg",
    alt: "Excavator moving earth on a cleared site",
  },
  concretePour: {
    src: "/photos/concrete-pour.jpg",
    alt: "Boom pump placing concrete on a deck",
  },
  facadeInstall: {
    src: "/photos/facade-install.jpg",
    alt: "Glass curtain wall panels being installed on a tower",
  },
  mechanicalRoom: {
    src: "/photos/mechanical-room.jpg",
    alt: "Ductwork and piping in a building mechanical room",
  },
  industrialShell: {
    src: "/photos/industrial-shell.jpg",
    alt: "Interior of an industrial building shell under construction",
  },
  paving: {
    src: "/photos/paving.jpg",
    alt: "Paving crew laying asphalt on a highway",
  },
  energyInfra: {
    src: "/photos/energy-infra.jpg",
    alt: "Wind turbines against an open sky",
  },
  finishedBuilding: {
    src: "/photos/finished-building.jpg",
    alt: "Completed commercial building exterior at dusk",
  },
  hardhatDetail: {
    src: "/photos/hardhat-detail.jpg",
    alt: "Hands holding a hard hat",
  },
  residentialDevelopment: {
    src: "/photos/residential-development.jpg",
    alt: "Aerial view of a mixed-use residential development under construction",
  },
} as const;

export type Photo = (typeof photos)[keyof typeof photos];

/** Homepage two-door cards, in the same order as `paths` in site-data. */
export const pathPhotos: readonly Photo[] = [
  photos.superintendent,
  photos.siteMeeting,
];

/** Homepage industry tiles, keyed by the industry slug in site-data. */
export const industryPhotos: Record<string, Photo> = {
  "commercial-construction": photos.commercialHighrise,
  "heavy-construction": photos.heavyCivil,
  "real-estate-development": photos.development,
  "sub-contracting": photos.trades,
};

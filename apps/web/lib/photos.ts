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

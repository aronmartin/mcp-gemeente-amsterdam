export type GeometryMode = "none" | "centroid" | "full";
export type LinksMode = "none" | "self" | "relations" | "full";

export type FieldProfile = {
  /** Whitelist van top-level velden. Leeg = alle velden meenemen. */
  include: string[];
  geometry: GeometryMode;
  links: LinksMode;
};

export type ToolProfile = {
  minimal: FieldProfile;
  default: FieldProfile;
  full: FieldProfile;
};

const GENERIC_PROFILE: ToolProfile = {
  minimal: { include: [], geometry: "centroid", links: "self" },
  default: { include: [], geometry: "centroid", links: "relations" },
  full:    { include: [], geometry: "full",     links: "full" },
};

const MONUMENTEN_PROFILE: ToolProfile = {
  minimal: {
    include: ["naam", "identificatie", "ligtInBuurt"],
    geometry: "none",
    links: "self",
  },
  default: {
    include: [
      "naam", "identificatie", "ligtInBuurt",
      "monumentTypeOmschrijving", "statusOmschrijving", "bouwjaar",
    ],
    geometry: "centroid",
    links: "relations",
  },
  full: { include: [], geometry: "full", links: "full" },
};

const AFVAL_PROFILE: ToolProfile = {
  minimal: {
    include: ["id", "idNummer", "afvalwegingOmschrijving", "ligtInBuurt"],
    geometry: "centroid",
    links: "self",
  },
  default: {
    include: [
      "id", "idNummer", "afvalwegingOmschrijving", "ligtInBuurt",
      "typeOmschrijving", "containerKleur", "eigenaarschapOmschrijving",
    ],
    geometry: "centroid",
    links: "relations",
  },
  full: { include: [], geometry: "full", links: "full" },
};

const PARKEERVAKKEN_PROFILE: ToolProfile = {
  minimal: {
    include: ["id", "eTypeCode"],
    geometry: "centroid",
    links: "self",
  },
  default: {
    include: ["id", "eTypeCode", "eTypeOmschrijving", "bgtFunctie"],
    geometry: "centroid",
    links: "relations",
  },
  full: { include: [], geometry: "full", links: "full" },
};

const WIOR_PROFILE: ToolProfile = {
  minimal: {
    include: ["naam", "statusOmschrijving", "typeOmschrijving", "datumBegin", "datumEinde"],
    geometry: "none",
    links: "self",
  },
  default: {
    include: [
      "id", "naam", "statusOmschrijving", "typeOmschrijving", "datumBegin", "datumEinde",
    ],
    geometry: "centroid",
    links: "relations",
  },
  full: { include: [], geometry: "full", links: "full" },
};

const TOOL_PROFILES: Record<string, ToolProfile> = {
  ams_monumenten_list: MONUMENTEN_PROFILE,
  ams_afvalcontainers_list: AFVAL_PROFILE,
  ams_parkeervakken_list: PARKEERVAKKEN_PROFILE,
  ams_wior_list: WIOR_PROFILE,
};

export function resolveProfile(toolName: string, detail: "minimal" | "default" | "full"): FieldProfile {
  const profile = TOOL_PROFILES[toolName] ?? GENERIC_PROFILE;
  return profile[detail];
}

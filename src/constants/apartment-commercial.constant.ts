export const APARTMENT_OWNERSHIP = {
  LANDOWNER: "landowner",
  BUYER: "buyer",
} as const;

export type ApartmentOwnershipType = (typeof APARTMENT_OWNERSHIP)[keyof typeof APARTMENT_OWNERSHIP];

export const APARTMENT_OWNERSHIP_LABELS = {
  [APARTMENT_OWNERSHIP.LANDOWNER]: "בעל קרקע בתמ״א",
  [APARTMENT_OWNERSHIP.BUYER]: "רוכש",
} as const;

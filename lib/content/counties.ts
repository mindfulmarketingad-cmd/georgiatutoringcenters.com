import { cities, listings, type CityGroup, type Listing } from "@/lib/listings";

/**
 * City to Georgia county lookup, keyed by the citySlug the importer writes.
 *
 * The Outscraper export ships a `county` column, but it holds Google's
 * neighbourhood name ("Buckhead", "Midtown Atlanta"), not the county, so it
 * cannot be used. This table is maintained by hand instead.
 *
 * A handful of Georgia towns straddle a county line (Braselton, Bogart,
 * Conley, Loganville, Buford); those are mapped to the county that holds the
 * town centre. Verify against an authoritative source before treating any of
 * this as an official record.
 */
export const CITY_COUNTY: Record<string, string> = {
  acworth: "Cobb",
  adairsville: "Bartow",
  albany: "Dougherty",
  alpharetta: "Fulton",
  americus: "Sumter",
  athens: "Clarke",
  atlanta: "Fulton",
  augusta: "Richmond",
  austell: "Cobb",
  bainbridge: "Decatur",
  blairsville: "Union",
  "blue-ridge": "Fannin",
  bogart: "Oconee",
  braselton: "Jackson",
  brunswick: "Glynn",
  buford: "Gwinnett",
  calhoun: "Gordon",
  canton: "Cherokee",
  carrollton: "Carroll",
  cartersville: "Bartow",
  cataula: "Harris",
  chamblee: "DeKalb",
  chatsworth: "Murray",
  clarkesville: "Habersham",
  cleveland: "White",
  cohutta: "Whitfield",
  "college-park": "Fulton",
  columbus: "Muscogee",
  conley: "Clayton",
  conyers: "Rockdale",
  cordele: "Crisp",
  covington: "Newton",
  crandall: "Murray",
  cumming: "Forsyth",
  dacula: "Gwinnett",
  dahlonega: "Lumpkin",
  dallas: "Paulding",
  dalton: "Whitfield",
  decatur: "DeKalb",
  doraville: "DeKalb",
  douglas: "Coffee",
  douglasville: "Douglas",
  dublin: "Laurens",
  duluth: "Gwinnett",
  dunwoody: "DeKalb",
  "east-point": "Fulton",
  ellenwood: "DeKalb",
  euharlee: "Bartow",
  evans: "Columbia",
  fairburn: "Fulton",
  fayetteville: "Fayette",
  fitzgerald: "Ben Hill",
  "flowery-branch": "Hall",
  folkston: "Charlton",
  "forest-park": "Clayton",
  gainesville: "Hall",
  // Source row carries no city, only ZIP 30650 (Madison, Morgan County).
  georgia: "Morgan",
  gordon: "Wilkinson",
  gray: "Jones",
  griffin: "Spalding",
  grovetown: "Columbia",
  hinesville: "Liberty",
  hiram: "Paulding",
  "holly-springs": "Cherokee",
  jesup: "Wayne",
  "johns-creek": "Fulton",
  jonesboro: "Clayton",
  kathleen: "Houston",
  kennesaw: "Cobb",
  lagrange: "Troup",
  lawrenceville: "Gwinnett",
  leesburg: "Lee",
  lilburn: "Gwinnett",
  "lithia-springs": "Douglas",
  lithonia: "DeKalb",
  "locust-grove": "Henry",
  loganville: "Walton",
  ludowici: "Long",
  mableton: "Cobb",
  macon: "Bibb",
  mansfield: "Newton",
  marietta: "Cobb",
  martinez: "Columbia",
  mcdonough: "Henry",
  midland: "Muscogee",
  milledgeville: "Baldwin",
  milton: "Fulton",
  monroe: "Walton",
  monticello: "Jasper",
  morrow: "Clayton",
  moultrie: "Colquitt",
  newnan: "Coweta",
  norcross: "Gwinnett",
  oglethorpe: "Macon",
  "peachtree-city": "Fayette",
  "peachtree-corners": "Gwinnett",
  "pine-mountain": "Harris",
  pooler: "Chatham",
  "powder-springs": "Cobb",
  "richmond-hill": "Bryan",
  rincon: "Effingham",
  ringgold: "Catoosa",
  riverdale: "Clayton",
  rockmart: "Polk",
  rome: "Floyd",
  roswell: "Fulton",
  "sandy-springs": "Fulton",
  savannah: "Chatham",
  scottdale: "DeKalb",
  sharpsburg: "Coweta",
  smyrna: "Cobb",
  snellville: "Gwinnett",
  "st-marys": "Camden",
  statesboro: "Bulloch",
  stockbridge: "Henry",
  "stone-mountain": "DeKalb",
  stonecrest: "DeKalb",
  "sugar-hill": "Gwinnett",
  suwanee: "Gwinnett",
  thomasville: "Thomas",
  tifton: "Tift",
  tucker: "DeKalb",
  tyrone: "Fayette",
  "union-city": "Fulton",
  valdosta: "Lowndes",
  "villa-rica": "Carroll",
  "warm-springs": "Meriwether",
  "warner-robins": "Houston",
  washington: "Wilkes",
  watkinsville: "Oconee",
  "west-point": "Troup",
  "wilmington-island": "Chatham",
  winder: "Barrow",
  winston: "Douglas",
  winterville: "Clarke",
  woodstock: "Cherokee",
};

export type CountyGroup = {
  /** County name without the "County" suffix, e.g. "Fulton". */
  county: string;
  countySlug: string;
  count: number;
  listings: Listing[];
  cities: CityGroup[];
};

export function countyOf(listing: Listing): string | undefined {
  return CITY_COUNTY[listing.citySlug];
}

export function countySlugOf(county: string): string {
  return county.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

let cache: CountyGroup[] | null = null;

export function counties(): CountyGroup[] {
  if (cache) return cache;

  const cityGroups = new Map(cities().map((group) => [group.citySlug, group]));
  const map = new Map<string, CountyGroup>();

  for (const listing of listings) {
    const county = countyOf(listing);
    if (!county) continue;
    const slug = countySlugOf(county);
    const group = map.get(slug) ?? {
      county,
      countySlug: slug,
      count: 0,
      listings: [],
      cities: [],
    };
    group.count += 1;
    group.listings.push(listing);
    map.set(slug, group);
  }

  for (const group of map.values()) {
    const seen = new Set<string>();
    for (const listing of group.listings) {
      if (seen.has(listing.citySlug)) continue;
      seen.add(listing.citySlug);
      const cityGroup = cityGroups.get(listing.citySlug);
      if (cityGroup) group.cities.push(cityGroup);
    }
    group.cities.sort((a, b) => a.city.localeCompare(b.city));
  }

  cache = [...map.values()].sort(
    (a, b) => b.count - a.count || a.county.localeCompare(b.county)
  );
  return cache;
}

export function getCounty(slug: string): CountyGroup | undefined {
  return counties().find((group) => group.countySlug === slug);
}

/** Cities in the data with no county mapping yet; surfaced by the import check. */
export function unmappedCities(): string[] {
  return [...new Set(listings.filter((l) => !countyOf(l)).map((l) => l.citySlug))];
}

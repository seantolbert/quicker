import type { Intake } from "./types";

/** A realistic intake for tests: a plumber with reviews, photos, and a website. */
export const fixtureIntake: Intake = {
  retrieved_at: "2026-11-06T12:00:00.000Z",
  place_id: "ChIJ_fixture_place_id_123",
  source: { business: "google_places", contact: "google_places", hours: "google_places", reviews: "google_places", website: "website" },
  business: {
    name: "Rio Grande Plumbing",
    primary_type: "plumber",
    type_label: "Plumber",
    types: ["plumber", "point_of_interest"],
    rating: 4.9,
    review_count: 212,
    maps_url: "https://maps.google.com/?cid=1",
    business_status: "OPERATIONAL",
  },
  contact: {
    phone: "(512) 555-0199",
    address: "1200 E Cesar Chavez St, Austin, TX 78702",
    website: "https://riograndeplumbing.example",
  },
  hours: ["Monday: 7:00 AM – 6:00 PM", "Saturday: 8:00 AM – 2:00 PM", "Sunday: Closed"],
  services: [{ name: "Water heater repair" }, { name: "Drain cleaning" }],
  reviews: [
    {
      author: "Dana P.",
      author_uri: "https://www.google.com/maps/contrib/1",
      rating: 5,
      text: "Luis showed up within an hour, explained the leak in plain English, and charged exactly what he quoted.",
      link: "https://maps.google.com/review/1",
      attribution: "Google",
    },
    {
      author: "Marcus T.",
      rating: 5,
      text: "Replaced our 40-gallon water heater the same day. Clean, quick, fair.",
      attribution: "Google",
    },
  ],
  images: [
    {
      id: "photo-1",
      path: "photos/photo-1.jpg",
      origin: "google_places",
      rights_status: "sample_only",
      alt: "Photo from Rio Grande Plumbing's Google listing",
      width: 1600,
      height: 1067,
      attribution: [{ name: "Rio Grande Plumbing" }],
    },
  ],
  logo: {
    id: "logo",
    path: "brand/logo.png",
    origin: "website",
    rights_status: "pending_client_confirmation",
    alt: "Rio Grande Plumbing logo",
    attribution: [{ name: "Rio Grande Plumbing" }],
  },
  colors: { primary: "#e8b04a", swatches: ["#e8b04a"], source: "logo" },
  website: { url: "https://riograndeplumbing.example", pages: [], robots_blocked: false, excerpt: "Family-owned since 2009." },
  facebook_url: null,
  open_questions: [],
};

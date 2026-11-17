import type { ConceptId } from "@/sections/_motion/vocabulary";
import type { Theme } from "@/spec/theme";

/**
 * Intake record, following the client-site-intake skill's keys. Stored at
 * data/projects/<id>/intake.json. Image paths are relative to the project
 * folder ("photos/photo-1.jpg") and served on the site from "/photos/…".
 */

export type RightsStatus = "sample_only" | "pending_client_confirmation" | "client_confirmed";

export type ImageRecord = {
  id: string;
  path: string;
  origin: "google_places" | "website";
  source_url?: string;
  rights_status: RightsStatus;
  alt: string;
  width?: number;
  height?: number;
  attribution: { name: string; uri?: string }[];
};

export type Review = {
  author: string;
  author_uri?: string;
  rating: number;
  text: string;
  date?: string;
  relative_date?: string;
  link?: string;
  attribution: "Google";
};

export type Intake = {
  retrieved_at: string;
  place_id: string;
  /** Where each top-level field came from. */
  source: Record<string, string>;
  business: {
    name: string;
    primary_type?: string;
    type_label?: string;
    types: string[];
    summary?: string;
    rating?: number;
    review_count?: number;
    maps_url?: string;
    business_status?: string;
  };
  contact: {
    phone?: string;
    phone_website?: string;
    address?: string;
    email?: string;
    website?: string;
  };
  hours: string[];
  services: { name: string; description?: string }[];
  reviews: Review[];
  images: ImageRecord[];
  logo: ImageRecord | null;
  colors: { primary?: string; swatches: string[]; theme_color?: string; source: "logo" | "theme-color" | "none" };
  website: {
    url: string;
    title?: string;
    description?: string;
    excerpt?: string;
    pages: string[];
    robots_blocked: boolean;
  } | null;
  facebook_url: string | null;
  open_questions: string[];
};

export type TradeId =
  | "hvac"
  | "plumbing"
  | "electrical"
  | "roofing"
  | "general-contractor"
  | "mobile-detailing"
  // General presets (Quicker's own, beyond the industry-design-direction trades).
  | "food-drink"
  | "beauty-wellness"
  | "retail"
  | "professional-services";

/** Design direction, following the industry-design-direction skill. Stored at data/projects/<id>/direction.json. */
export type Direction = {
  trade: TradeId;
  trade_label: string;
  matched_by: string;
  theme: Theme;
  contrast: { pair: string; ratio: number; min: number; pass: boolean }[];
  /** Older direction files stored only the description string. */
  motion: { concept: ConceptId; description: string } | string;
  copy_voice: string;
  hero_image: string | null;
  open_questions: string[];
};

export type Candidate = { placeId: string; name: string; address?: string };

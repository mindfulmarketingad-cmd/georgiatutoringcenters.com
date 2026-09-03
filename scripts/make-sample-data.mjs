#!/usr/bin/env node
/**
 * Builds data/sample-listings.json: Outscraper-shaped placeholder rows used
 * only until a real export is dropped into data/outscraper/.
 *
 * Everything here is fictional on purpose — invented business names, 555
 * phone numbers and example.com websites — so no real business is ever
 * misrepresented by the placeholder build.
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const cities = [
  ["Atlanta", "30309", 33.7838, -84.3853],
  ["Savannah", "31401", 32.0809, -81.0912],
  ["Augusta", "30904", 33.4735, -82.0105],
  ["Columbus", "31904", 32.5093, -84.9713],
  ["Macon", "31210", 32.8629, -83.7318],
  ["Athens", "30606", 33.9385, -83.4126],
  ["Marietta", "30062", 33.9626, -84.5299],
  ["Alpharetta", "30022", 34.0576, -84.2749],
  ["Roswell", "30075", 34.0345, -84.3524],
  ["Sandy Springs", "30328", 33.9304, -84.3733],
  ["Johns Creek", "30097", 34.0289, -84.1986],
  ["Duluth", "30097", 34.0029, -84.1446],
  ["Lawrenceville", "30043", 33.9562, -83.9879],
  ["Decatur", "30030", 33.7748, -84.2963],
  ["Kennesaw", "30144", 34.0234, -84.6155],
  ["Peachtree City", "30269", 33.3968, -84.5963],
  ["Woodstock", "30188", 34.1015, -84.5194],
  ["Newnan", "30263", 33.3807, -84.7997],
  ["Valdosta", "31602", 30.8327, -83.2785],
  ["Warner Robins", "31088", 32.5985, -83.6242],
];

const brands = [
  ["Peachtree Learning Lab", "Tutoring service", "Math Tutoring, Reading Tutoring, Homework Help"],
  ["Bright Steps Tutoring Center", "Learning center", "Early Learning, Reading Tutoring, Phonics"],
  ["Magnolia Math Academy", "Math tutoring center", "Math Tutoring, Algebra, Calculus"],
  ["Red Clay Test Prep", "Test preparation center", "Test Prep, SAT, ACT"],
  ["Southern Scholars Center", "Tutoring service", "Homework Help, Study Skills, Test Prep"],
  ["Little Learners Studio", "Educational institution", "Early Learning, Pre-K Readiness"],
  ["Robot Garden STEM Lab", "STEM education center", "STEM, Coding, Robotics"],
  ["Sunbelt Reading Clinic", "Reading tutor", "Reading Tutoring, Dyslexia Support, Literacy"],
  ["Ridgeview Academic Coaching", "Tutoring service", "Study Skills, Homework Help, Online Tutoring"],
  ["Camellia Learning Center", "Learning center", "Math Tutoring, Reading Tutoring, Enrichment"],
  ["Kite & Compass Tutoring", "Tutoring service", "Online Tutoring, Test Prep, Writing"],
  ["Blue Heron Study Center", "Tutoring service", "Homework Help, Science, Math Tutoring"],
  ["Gwinnett Bridge Learning", "Special education school", "Special Needs Support, ADHD Coaching"],
  ["Chattahoochee Prep Works", "Test preparation center", "SAT Prep, ACT Prep, Exam Coaching"],
  ["Storybook Literacy House", "Reading tutor", "Phonics, Reading Tutoring, Writing"],
  ["Summit Scholars Tutoring", "Tutoring service", "Math Tutoring, Test Prep, Homework Help"],
];

const summaries = [
  "One-to-one instruction with a written learning plan for every student, plus small-group sessions after school.",
  "Certified teachers work with students from kindergarten through high school on the exact skills their class is covering now.",
  "Diagnostic assessment first, then a paced program that families can follow week to week.",
  "Flexible after-school and weekend scheduling built around busy family calendars.",
  "Mixes in-center sessions with online tutoring so students never miss a week.",
  "Small class sizes, progress reports for parents, and free consultations before enrolling.",
];

const hoursSets = [
  { Monday: "3-8PM", Tuesday: "3-8PM", Wednesday: "3-8PM", Thursday: "3-8PM", Friday: "3-6PM", Saturday: "9AM-2PM", Sunday: "Closed" },
  { Monday: "9AM-7PM", Tuesday: "9AM-7PM", Wednesday: "9AM-7PM", Thursday: "9AM-7PM", Friday: "9AM-5PM", Saturday: "10AM-3PM", Sunday: "Closed" },
  { Monday: "2-8PM", Tuesday: "2-8PM", Wednesday: "2-8PM", Thursday: "2-8PM", Friday: "Closed", Saturday: "9AM-1PM", Sunday: "1-5PM" },
];

const streets = ["Peachtree Rd NE", "Main St", "Oak Grove Ln", "Church St", "Highland Ave", "Mill Creek Dr", "Sycamore Way", "Broad St"];

const rows = [];
let n = 0;
for (const [city, zip, lat, lng] of cities) {
  const perCity = 3;
  for (let i = 0; i < perCity; i++) {
    const [brand, category, subtypes] = brands[n % brands.length];
    const jitterLat = lat + (((n * 37) % 100) - 50) / 4000;
    const jitterLng = lng + (((n * 53) % 100) - 50) / 4000;
    const rating = (3.9 + ((n * 7) % 11) / 10).toFixed(1);
    rows.push({
      name: `${brand} - ${city}`,
      category,
      subtypes,
      phone: `+1 470-555-0${String(100 + n).slice(-3)}`,
      site: `https://www.example.com/${brand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      street: `${1200 + n * 7} ${streets[n % streets.length]}`,
      city,
      us_state: "Georgia",
      postal_code: zip,
      full_address: `${1200 + n * 7} ${streets[n % streets.length]}, ${city}, GA ${zip}`,
      latitude: Number(jitterLat.toFixed(6)),
      longitude: Number(jitterLng.toFixed(6)),
      rating: Number(rating) > 5 ? 5 : Number(rating),
      reviews: 12 + ((n * 29) % 240),
      photos_count: 4 + (n % 20),
      range: ["$$", "$$", "$$$", "$"][n % 4],
      business_status: "OPERATIONAL",
      verified: "TRUE",
      about: `${summaries[n % summaries.length]} Serving families across ${city} and nearby Georgia communities.`,
      working_hours: JSON.stringify(hoursSets[n % hoursSets.length]),
      place_id: `sample-${String(n + 1).padStart(4, "0")}`,
    });
    n++;
  }
}

writeFileSync(join(root, "data", "sample-listings.json"), JSON.stringify(rows, null, 2) + "\n");
console.log(`Wrote ${rows.length} sample rows.`);

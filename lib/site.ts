export const site = {
  name: "Georgia Tutoring Centers",
  domain: "georgiatutoringcenters.com",
  url: "https://georgiatutoringcenters.com",
  tagline: "Find the right tutoring center for your child, anywhere in Georgia.",
  description:
    "Free directory of Georgia tutoring and learning centers. Compare math tutoring, reading help, test prep and STEM programs by city, hours, ratings and cost.",
  email: "hello@georgiatutoringcenters.com",
  adsenseClient: "ca-pub-9332749804326149",
  social: {
    facebook: "https://www.facebook.com/georgiatutoringcenters",
    instagram: "https://www.instagram.com/georgiatutoringcenters",
    twitter: "https://twitter.com/gatutoringcntrs",
  },
} as const;

export const headerLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/find", label: "Find" },
  { href: "/counties", label: "Counties" },
  { href: "/partners", label: "Partners" },
  { href: "/reviews", label: "Reviews" },
  { href: "/costs", label: "Costs" },
  { href: "/about", label: "About" },
  { href: "/search", label: "Search" },
] as const;

export const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/sitemap", label: "Sitemap" },
] as const;

export const hubs = [
  {
    href: "/find",
    label: "Find a Center",
    blurb: "Browse tutoring centers by city and by subject across Georgia.",
    tone: "leaf",
    icon: "compass",
  },
  {
    href: "/partners",
    label: "Partner Directory",
    blurb: "The full listicle of every tutoring center listed on the site.",
    tone: "mint",
    icon: "book",
  },
  {
    href: "/reviews",
    label: "Reviews",
    blurb: "Ratings, review counts and what families say about each center.",
    tone: "sun",
    icon: "star",
  },
  {
    href: "/costs",
    label: "Costs & Pricing",
    blurb: "What tutoring actually costs in Georgia, by program and format.",
    tone: "sky",
    icon: "tag",
  },
  {
    href: "/blog",
    label: "Learning Blog",
    blurb: "Guides for parents on choosing tutors, test prep and study habits.",
    tone: "grass",
    icon: "pencil",
  },
  {
    href: "/search",
    label: "Search the Site",
    blurb: "Search every center, guide and cost page in one place.",
    tone: "clover",
    icon: "search",
  },
] as const;

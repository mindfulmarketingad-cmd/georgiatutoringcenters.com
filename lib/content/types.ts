export type Section = {
  h2: string;
  body: string[];
  list?: string[];
};

export type Faq = { q: string; a: string };

export type Article = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  category: string;
  published: string;
  updated: string;
  readMinutes: number;
  intro: string;
  sections: Section[];
  faqs: Faq[];
};

export type PriceRow = {
  option: string;
  typicalRange: string;
  bestFor: string;
};

export type CostGuide = Article & {
  priceRows: PriceRow[];
  quickAnswer: string;
};

/**
 * Resume builder subscription.
 *
 * One place for the price and what it buys, so the figure on the pricing
 * panel, in the page copy, in the FAQs and in the terms can never drift apart.
 */
export const plan = {
  name: "Resume Builder",
  price: 5.99,
  currency: "USD",
  priceLabel: "$5.99",
  interval: "month" as const,
  intervalLabel: "per month",
  includes: [
    "Download your resume as a PDF, a Word file or plain text",
    "Every one of the five templates, switched as often as you like",
    "Unlimited edits and re-downloads while the subscription is active",
    "Keep as many separate resumes as you need on your device",
  ],
  /** Kept on its own line because it has to appear next to the price by law. */
  renewalNotice:
    "This is a recurring subscription. It renews automatically every month at $5.99 until you cancel, and you can cancel at any time from your account with no cancellation fee.",
} as const;

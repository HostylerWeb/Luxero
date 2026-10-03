import type { FaqCategory, FaqItem } from "./content-types";

export const FAQ_CATEGORIES: FaqCategory[] = [
  { id: "general", name: "General" },
  { id: "payment", name: "Payment" },
  { id: "delivery", name: "Shipping & Delivery" },
];

export const FAQS_BY_CATEGORY: Record<string, FaqItem[]> = {
  general: [
    {
      question: "How do I enter a competition?",
      answer:
        "Browse our competitions, select your desired prize, choose how many tickets you'd like to purchase, and complete the checkout process. You'll receive a confirmation email with your ticket numbers.",
    },
    {
      question: "How are winners selected?",
      answer:
        "Winners are selected using a verified random number generator (RNG) that picks a winning ticket number after the competition closes. The winner is notified via email within 7 days of the draw.",
    },
    {
      question: "When will the draw take place?",
      answer:
        "Each competition page shows the scheduled draw date and time. Draws occur automatically once all tickets are sold or the countdown timer reaches zero, whichever comes first.",
    },
    {
      question: "How will I know if I've won?",
      answer:
        "We'll email the winner at the email address used during purchase. The winner's name and prize will also be displayed on our Winners page. Make sure to keep your account email up to date.",
    },
    {
      question: "How long does prize delivery take?",
      answer:
        "Once winner verification is complete, prizes are typically dispatched within 14 working days. UK deliveries usually arrive within 5-7 working days.",
    },
    {
      question: "Can I get a refund on my tickets?",
      answer:
        "All ticket purchases are final and non-refundable. Competition entries remain valid even if the draw date changes.",
    },
    {
      question: "Are there any age restrictions?",
      answer:
        "Yes, you must be 18 years or older to participate in any competition. We verify age at sign-up and checkout, and reserve the right to verify winners.",
    },
    {
      question: "Can I enter for free by post?",
      answer:
        "Yes. Free postal entry is available for active competitions. Visit our Free Postal Entry page for the postal address and what to include (your full name, address, contact details, competition name, and your Luxero account email). Incomplete entries cannot be accepted.",
    },
    {
      question: "Can I buy tickets for someone else?",
      answer:
        "Yes, you can purchase tickets as a gift. The tickets will be assigned to your account, but you can notify us after the draw to update delivery details.",
    },
  ],
  payment: [
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit and debit cards including Visa, Mastercard, and American Express. Apple Pay and Google Pay are also supported for faster checkout.",
    },
    {
      question: "Is my payment information secure?",
      answer:
        "Absolutely. All payments are processed through our secure payment platform. We never store your card details.",
    },
    {
      question: "Can I use a promo code?",
      answer:
        "Yes, you can enter a promo code at checkout for discounts or bonus tickets. Promo codes cannot be combined with other offers and have expiry dates.",
    },
  ],
  delivery: [
    {
      question: "Do you ship internationally?",
      answer:
        "Yes, we ship to most countries worldwide. International shipping costs and delivery times vary by destination. All customs duties and import taxes are the responsibility of the recipient.",
    },
    {
      question: "What happens if I'm not home for delivery?",
      answer:
        "The courier will usually attempt delivery twice before returning the package. We recommend providing a safe location or office address for prize deliveries.",
    },
  ],
};

export const FAQ_SUPPORT_EMAIL = "contact@luxero.win";

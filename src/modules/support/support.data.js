/**
 * Seed content for Help & Support (replace with CMS / DB later).
 */
module.exports = {
  categories: [
    { id: "vehicles", title: "Vehicles", icon: "vehicles", articleCount: 12 },
    { id: "events", title: "Events & RSVPs", icon: "events", articleCount: 8 },
    { id: "billing", title: "Billing", icon: "billing", articleCount: 6 },
    { id: "membership", title: "Membership", icon: "membership", articleCount: 9 },
  ],

  articles: [
    {
      id: "art-summon",
      topicId: "vehicles",
      title: "How do I summon a vehicle?",
      excerpt:
        "From the dashboard, tap Summon under Quick Actions, or message James. Forecourt within 30 minutes during hours.",
    },
    {
      id: "art-add-vehicle",
      topicId: "vehicles",
      title: "Adding a vehicle to your garage",
      excerpt: "Use Garage → Add vehicle and upload registration details for concierge review.",
    },
    {
      id: "art-events-rsvp",
      topicId: "events",
      title: "RSVP and reminders",
      excerpt: "Confirm attendance in Events; reminders follow your notification preferences.",
    },
    {
      id: "art-billing-cycle",
      topicId: "billing",
      title: "Understanding your statement",
      excerpt: "Auto-debit dates, AED balances, and how to download past statements.",
    },
    {
      id: "art-founding-tier",
      topicId: "membership",
      title: "Founding Member benefits",
      excerpt: "Priority events, concierge line, and garage allocations explained.",
    },
  ],

  faqs: [
    {
      id: "faq-summon",
      question: "How do I summon a vehicle?",
      answer:
        "From the dashboard, tap the Summon icon under Quick Actions, or message James directly. Your vehicle will be brought to the forecourt within 30 minutes during operating hours.",
      order: 1,
    },
    {
      id: "faq-founding",
      question: "What does the Founding Member tier include?",
      answer:
        "Founding Members receive priority access to curated events, a dedicated concierge channel, and enhanced garage allocations. See Membership in the app for your full entitlements.",
      order: 2,
    },
    {
      id: "faq-new-vehicle",
      question: "How do I add a new vehicle to my collection?",
      answer:
        "Open Garage, tap Add vehicle, and submit registration and imagery. Our team verifies details before the vehicle appears in your profile.",
      order: 3,
    },
    {
      id: "faq-guest",
      question: "Can I bring a guest to the Clubhouse?",
      answer:
        "Guests may accompany you when registered in advance through Events or by messaging concierge. Policies vary by occasion.",
      order: 4,
    },
    {
      id: "faq-events-curated",
      question: "How are events curated?",
      answer:
        "The programme team selects experiences aligned with member interests. Invitations respect your RSVP and notification settings.",
      order: 5,
    },
  ],
};

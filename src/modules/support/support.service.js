const supportRepository = require("./support.repository");

function buildContacts() {
  return [
    {
      id: "concierge",
      title: "Call Concierge",
      subtitle: "24/7 · DIRECT LINE",
      actionType: "phone",
      phoneNumber: process.env.CONCIERGE_PHONE || "+971 4 000 0000",
    },
    {
      id: "steve",
      title: "Ask Steve",
      subtitle: "INSTANT REPLY",
      actionType: "chat",
      deeplink: process.env.STEVE_CHAT_DEEPLINK || "toybox://concierge/steve",
    },
  ];
}

function normalizeQuery(q) {
  return String(q || "")
    .trim()
    .toLowerCase();
}

exports.getOverview = () => {
  const { categories, faqs } = supportRepository.getStaticData();
  return {
    headline: "Help & Support",
    tagline: "We're here to help.",
    categories,
    faqs: [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0)),
    contacts: buildContacts(),
  };
};

exports.search = (rawQuery) => {
  const q = normalizeQuery(rawQuery);
  if (!q) {
    return { query: "", articles: [], faqs: [] };
  }
  const { articles, faqs } = supportRepository.getStaticData();

  const articleHits = articles.filter((a) => {
    const hay = `${a.title} ${a.excerpt}`.toLowerCase();
    return hay.includes(q);
  });

  const faqHits = faqs.filter((f) => {
    const hay = `${f.question} ${f.answer}`.toLowerCase();
    return hay.includes(q);
  });

  return { query: rawQuery?.trim() || "", articles: articleHits, faqs: faqHits };
};

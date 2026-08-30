// Canonical identity data for Public Thinking authors — one entry per real
// person, keyed by the exact name used in a content file's `authors` list.
// This is the single source of truth for url/image/bio/sameAs so a person's
// identity never forks across pieces or across EN/DE. A name with no entry
// here still works as a plain byline — it just renders without a linked
// profile, photo, or bio, for a contributor who isn't a public author yet.
module.exports = {
  "Carmelito Bauer": {
    url: "https://communitygeeks.ai/about/#founder",
    role: "Founder, Communitygeeks",
    bio: "Today his work focuses on how community, developer relations, partnerships, and ecosystem strategy are evolving.",
    bioDe: "Sein Fokus liegt heute darauf, wie sich Community, Developer Relations, Partnerschaften und Ökosystem-Strategie verändern.",
    image: "/assets/images/founder.jpg",
    sameAs: ["https://www.linkedin.com/in/carmelitob/"],
  },
};

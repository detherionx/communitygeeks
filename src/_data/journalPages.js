const { DateTime } = require("luxon");
const { loadAll } = require("../lib/publicThinkingLoader");

// The homepage's field journal (the celestial researcher scene, src/assets/js/researcher.js) shows the two latest
// published observations: the previous one complete on the left page, the newest being written on the right page.
// This derives both pages from the same canonical piece list the ledger and the archive use, so a new piece moves
// into the journal on its own. Each piece may describe its own notation in frontmatter:
//
//   journal:
//     headline: "THREAD"                 # the big word the pen writes (≤ 15 chars reads at display size; longer falls
//                                        #  back to the regular ink size)
//     sketch: "thread"                   # a named hand sketch drawn by researcher.js (reticulum | container | thread);
//                                        #  add a sketch there when a piece needs one, or omit for text only
//     lines: ["who keeps it? a human.", "guardrails, review, trust.", "boundaries matter more."]
//                                        # short notes: the first is written on the right page, all of them appear
//                                        #  once the observation has moved to the left page
//
// A piece without `journal` still appears: its title in capitals as the headline, no sketch, no lines.
function pageFor(piece, pageNo) {
  const d = DateTime.fromJSDate(new Date(piece.date), { zone: "utc" });
  const j = piece.journal || {};
  return {
    obs: piece.obs,
    date: d.toFormat("d LLL").toUpperCase(),
    dateLong: d.toFormat("d LLL yyyy").toUpperCase(),
    page: pageNo,
    headline: (j.headline || piece.title).toUpperCase(),
    sketch: j.sketch || null,
    lines: Array.isArray(j.lines) ? j.lines.slice(0, 3) : [],
  };
}

module.exports = () => {
  const en = loadAll().filter((item) => item.lang !== "de"); // newest first
  if (!en.length) return null;
  const right = en[0], left = en[1] || null;
  // page numbers advance with the observation count (the journal started at p. 40 with OBS. 001 on the left)
  const leftNo = 40 + 2 * (Number(left ? left.obs : right.obs) - 1);
  return { volume: "06", left: left ? pageFor(left, leftNo) : null, right: pageFor(right, leftNo + 1) };
};

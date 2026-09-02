// Single enum for Public Thinking's format taxonomy. Previously hand-typed in
// three places (homepage sidebar list, archive filter pills, template
// comment) with no shared source, this is now the one place that changes
// when a format is added, renamed, or reordered. `filterType` values must
// match a content file's `filterType` frontmatter field exactly, since that's
// what src/assets/js/public-thinking-filter.js matches against.
module.exports = [
  { format: "Research Finding", filterType: "research", labelEn: "Research Findings", labelDe: "Forschungsergebnisse" },
  { format: "Executive One-Pager", filterType: "onepager", labelEn: "Executive One-Pagers", labelDe: "Executive One-Pager" },
  { format: "Case Study", filterType: "case", labelEn: "Case Studies", labelDe: "Case Studies" },
  { format: "Field Note", filterType: "field", labelEn: "Field Notes", labelDe: "Feldnotizen" },
];

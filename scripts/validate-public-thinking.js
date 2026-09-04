#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content", "public-thinking");
const SCHEMA_PATH = path.join(ROOT, "schemas", "public-thinking.schema.json");
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
const formats = require(path.join(ROOT, "src", "_data", "publicThinkingFormats.js"));
const people = require(path.join(ROOT, "src", "_data", "people.js"));
const outputJson = process.argv.includes("--json");

const errors = [];
const warnings = [];
const add = (list, file, field, code, message, line) => list.push({ file, field, code, message, ...(line ? { line } : {}) });
const error = (...args) => add(errors, ...args);
const warn = (...args) => add(warnings, ...args);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const valueType = (value) => Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
const allowedType = (value, expected) => (Array.isArray(expected) ? expected : [expected]).includes(valueType(value));
const dateString = (value) => value instanceof Date && !Number.isNaN(value.valueOf())
  ? value.toISOString().slice(0, 10)
  : typeof value === "string" ? value : "";
const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(dateString(value)) && !Number.isNaN(Date.parse(`${dateString(value)}T00:00:00Z`));

function validateValue(value, rule, file, field) {
  if (!rule || value === undefined) return;
  const normalized = rule.format === "date" && value instanceof Date ? dateString(value) : value;
  if (rule.type && !allowedType(normalized, rule.type)) {
    error(file, field, "INVALID_TYPE", `Expected ${Array.isArray(rule.type) ? rule.type.join(" or ") : rule.type}, received ${valueType(normalized)}.`);
    return;
  }
  if (typeof normalized === "string") {
    if (rule.minLength && normalized.trim().length < rule.minLength) error(file, field, "EMPTY_VALUE", "Value must not be empty.");
    if (rule.pattern && !(new RegExp(rule.pattern)).test(normalized)) error(file, field, "INVALID_PATTERN", `Value does not match ${rule.pattern}.`);
    if (rule.format === "date" && !isIsoDate(normalized)) error(file, field, "INVALID_DATE", "Use a real date in YYYY-MM-DD format.");
  }
  if (rule.enum && !rule.enum.includes(normalized)) error(file, field, "INVALID_ENUM_VALUE", `Expected one of: ${rule.enum.join(", ")}.`);
  if (Array.isArray(normalized)) {
    if (rule.minItems !== undefined && normalized.length < rule.minItems) error(file, field, "TOO_FEW_ITEMS", `Expected at least ${rule.minItems} item(s).`);
    if (rule.maxItems !== undefined && normalized.length > rule.maxItems) error(file, field, "TOO_MANY_ITEMS", `Expected no more than ${rule.maxItems} item(s).`);
    if (rule.uniqueItems && new Set(normalized.map((item) => JSON.stringify(item))).size !== normalized.length) error(file, field, "DUPLICATE_ITEMS", "Items must be unique.");
    if (rule.items) normalized.forEach((item, index) => validateValue(item, rule.items, file, `${field}[${index}]`));
  }
  if (normalized && typeof normalized === "object" && !Array.isArray(normalized) && !(normalized instanceof Date)) {
    if (rule.required) rule.required.forEach((key) => {
      if (normalized[key] === undefined || normalized[key] === null || normalized[key] === "") error(file, `${field}.${key}`, "REQUIRED_FIELD_MISSING", "Required field is missing.");
    });
    if (rule.additionalProperties === false && rule.properties) Object.keys(normalized).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(rule.properties, key)) error(file, `${field}.${key}`, "UNKNOWN_FIELD", "Field is not defined by the publication schema.");
    });
    if (rule.properties) Object.entries(rule.properties).forEach(([key, childRule]) => validateValue(normalized[key], childRule, file, `${field}.${key}`));
  }
}

const files = fs.readdirSync(CONTENT_DIR).filter((name) => name.endsWith(".md")).sort();
const articles = files.map((filename) => {
  const relative = path.posix.join("content/public-thinking", filename);
  const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf8");
  let parsed;
  try {
    parsed = matter(raw);
  } catch (cause) {
    error(relative, "frontmatter", "INVALID_FRONTMATTER", cause.message);
    return { filename, relative, data: {}, content: "", raw };
  }
  const bodyStartLine = raw.slice(0, raw.indexOf(parsed.content)).split(/\r?\n/).length;
  return { filename, relative, data: parsed.data, content: parsed.content, raw, bodyStartLine };
});

for (const article of articles) {
  const { data, relative, content } = article;
  for (const field of schema.required) {
    if (data[field] === undefined || data[field] === null || data[field] === "") error(relative, field, "REQUIRED_FIELD_MISSING", "Required field is missing.");
  }
  for (const key of Object.keys(data)) {
    if (!Object.prototype.hasOwnProperty.call(schema.properties, key)) error(relative, key, "UNKNOWN_FIELD", "Field is not defined by the publication schema.");
  }
  for (const [field, rule] of Object.entries(schema.properties)) validateValue(data[field], rule, relative, field);
  if (data.lang === "en" && !data.journal) error(relative, "journal", "REQUIRED_FIELD_MISSING", "English source articles require homepage journal metadata.");

  const taxonomy = formats.find((entry) => entry.filterType === data.filterType);
  if (!taxonomy) error(relative, "filterType", "UNKNOWN_FILTER_TYPE", "Filter type is not defined in src/_data/publicThinkingFormats.js.");
  else if (data.lang === "en" && data.format !== taxonomy.format) error(relative, "format", "FORMAT_FILTER_MISMATCH", `English format must be "${taxonomy.format}" when filterType is "${data.filterType}".`);

  if (Array.isArray(data.authors)) data.authors.forEach((author, index) => {
    if (!people[author]) warn(relative, `authors[${index}]`, "AUTHOR_NOT_IN_DIRECTORY", `"${author}" has no canonical profile in src/_data/people.js. Confirm consent and whether a plain byline is intentional.`);
  });

  for (const [field, value] of Object.entries(data)) {
    const inspect = (candidate, location) => {
      if (typeof candidate === "string" && candidate.includes("—")) error(relative, location, "EM_DASH_IN_METADATA", "Communitygeeks authored metadata must not use an em dash.");
      else if (Array.isArray(candidate)) candidate.forEach((item, index) => inspect(item, `${location}[${index}]`));
      else if (candidate && typeof candidate === "object" && !(candidate instanceof Date)) Object.entries(candidate).forEach(([key, item]) => inspect(item, `${location}.${key}`));
    };
    inspect(value, field);
  }

  const summaryLength = typeof data.summary === "string" ? [...data.summary].length : 0;
  const recommended = schema["x-communitygeeks"].summaryRecommendedCharacters;
  if (summaryLength && (summaryLength < recommended.min || summaryLength > recommended.max)) warn(relative, "summary", "SUMMARY_LENGTH", `Summary is ${summaryLength} characters; review the recommended ${recommended.min} to ${recommended.max} range.`);

  content.split(/\r?\n/).forEach((lineText, index) => {
    if (lineText.includes("—")) warn(relative, "body", "EM_DASH_IN_BODY", "Review this em dash. Rewrite authored copy, but preserve an exact quotation.", article.bodyStartLine + index);
  });
}

const bySlug = new Map();
for (const article of articles) {
  const slug = article.data.slug;
  if (!slug) continue;
  if (bySlug.has(slug)) error(article.relative, "slug", "DUPLICATE_SLUG", `Slug is also used by ${bySlug.get(slug).relative}.`);
  else bySlug.set(slug, article);
}

const byTranslationKey = new Map();
for (const article of articles) {
  const key = article.data.translationKey;
  if (!key) continue;
  if (!byTranslationKey.has(key)) byTranslationKey.set(key, []);
  byTranslationKey.get(key).push(article);
}

const pairFields = schema["x-communitygeeks"].pairEqualFields;
const pairLanguages = schema["x-communitygeeks"].pairLanguages;
for (const [key, group] of byTranslationKey.entries()) {
  for (const lang of pairLanguages) {
    const matches = group.filter((article) => article.data.lang === lang);
    if (matches.length === 0) error(group[0].relative, "translationKey", "MISSING_TRANSLATION", `Translation key "${key}" has no ${lang.toUpperCase()} counterpart.`);
    if (matches.length > 1) matches.forEach((article) => error(article.relative, "translationKey", "DUPLICATE_TRANSLATION", `Translation key "${key}" has more than one ${lang.toUpperCase()} article.`));
  }
  const en = group.find((article) => article.data.lang === "en");
  const de = group.find((article) => article.data.lang === "de");
  if (en && de) pairFields.forEach((field) => {
    const enValue = field === "date" ? dateString(en.data[field]) : en.data[field];
    const deValue = field === "date" ? dateString(de.data[field]) : de.data[field];
    if (!same(enValue, deValue)) error(de.relative, field, "TRANSLATION_PAIR_MISMATCH", `${field} must match ${en.relative}.`);
  });
}

for (const article of articles) {
  const related = Array.isArray(article.data.related) ? article.data.related : [];
  for (const [index, item] of related.entries()) {
    const target = bySlug.get(item.slug);
    if (!target) error(article.relative, `related[${index}].slug`, "BROKEN_RELATED_SLUG", `No published article uses slug "${item.slug}".`);
    else {
      if (target.data.lang !== article.data.lang) error(article.relative, `related[${index}].slug`, "RELATED_LANGUAGE_MISMATCH", `Related article must use the ${article.data.lang} route.`);
      if (item.title !== target.data.title) error(article.relative, `related[${index}].title`, "RELATED_TITLE_MISMATCH", `Expected the canonical title "${target.data.title}".`);
    }
  }
}

const result = {
  valid: errors.length === 0,
  schema: path.relative(ROOT, SCHEMA_PATH).replace(/\\/g, "/"),
  filesChecked: articles.length,
  errors,
  warnings,
};

if (outputJson) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  const print = (label, entries) => entries.forEach((entry) => {
    const where = `${entry.file}${entry.line ? `:${entry.line}` : ""}${entry.field ? ` [${entry.field}]` : ""}`;
    console.log(`${label} ${entry.code} ${where}: ${entry.message}`);
  });
  print("ERROR", errors);
  print("WARN ", warnings);
  console.log(`Public Thinking validation ${result.valid ? "passed" : "failed"}: ${result.filesChecked} files, ${errors.length} errors, ${warnings.length} warnings.`);
}

process.exitCode = result.valid ? 0 : 1;

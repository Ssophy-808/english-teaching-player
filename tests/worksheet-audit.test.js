const path = require("node:path");
const fs = require("node:fs");

const root = path.resolve(__dirname, "..");
global.window = global;

[
  "data/book1.js",
  "data/book1-activities.js",
  "data/book1-passport.js",
  "data/book2.js",
  "data/book3.js",
  "data/book3-review.js",
  "data/review-units.js",
  "data/practice-data.js",
  "data/course-schema.js",
  "js/teaching-flow.js",
  "data/worksheet-unit-packs.js",
  "data/worksheet-data.js"
].forEach((file) => require(path.join(root, file)));

const BOOK_PROFILES = Object.freeze({
  "book-1": Object.freeze({ maxSentenceWords: 6, maxScrambleChunks: 5, maxAnswerSentences: 1, readingLines: null }),
  "book-2": Object.freeze({ maxSentenceWords: 8, maxScrambleChunks: 6, maxAnswerSentences: 2, readingLines: [3, 4] }),
  "book-3": Object.freeze({ maxSentenceWords: 10, maxScrambleChunks: 8, maxAnswerSentences: 2, readingLines: [4, 6] }),
  "book-4": Object.freeze({ maxSentenceWords: 12, maxScrambleChunks: 9, maxAnswerSentences: 2, readingLines: [5, 12] }),
  "book-5": Object.freeze({ maxSentenceWords: 14, maxScrambleChunks: 9, maxAnswerSentences: 2, readingLines: [5, 12] }),
  "book-6": Object.freeze({ maxSentenceWords: 15, maxScrambleChunks: 9, maxAnswerSentences: 2, readingLines: [5, 12] })
});

const REPORT_ONLY_CATEGORIES = new Set([
  "allowlist_word",
  "duplicate_prompt_structure",
  "scramble_order_manual_review",
  "cloze_answer_manual_review"
]);

const ALL_CATEGORIES = [
  "duplicate_prompt",
  "duplicate_expected_answer",
  "duplicate_prompt_structure",
  "multiple_choice_choice_count",
  "multiple_choice_duplicate_choices",
  "multiple_choice_answer_count",
  "multiple_choice_punctuation_only_distractor",
  "scramble_same_as_answer",
  "scramble_multiple_sentences",
  "scramble_too_many_chunks",
  "scramble_order_manual_review",
  "allowlist_word",
  "forbidden_string",
  "book1_reading_comprehension",
  "reading_sentence_too_long",
  "reading_sentence_count",
  "answer_too_many_sentences",
  "cloze_missing_answers",
  "cloze_word_bank_answer_count",
  "cloze_duplicate_word_bank",
  "cloze_answer_manual_review",
  "grammar_focus_unstructured",
  "grammar_focus_missing",
  "missing_asset",
  "missing_audio"
];

const FORBIDDEN_STRINGS = [
  "first picture",
  "second picture",
  "same lesson topic",
  "both questions"
];

const FUNCTION_WORDS = new Set(`
  a an the i you he she it we they me my your his her its our their this that these those
  am is are was were be been being have has had do does did can cannot could will would
  not no yes and or but so to of in on at for from with as about there here what who where
  when how which one two three four five six seven eight nine ten eleven twelve thirteen
  fourteen fifteen sixteen seventeen eighteen nineteen twenty some any all own very today
  tomorrow now too also then please
`.trim().split(/\s+/));

const DIRECTION_WORDS = new Set(`
  answer answers change choose circle complete correct draw each fill find first following
  information line lines listen look make match missing next number order part passage picture
  pictures question questions read rewrite say sentence sentences student study use word words
  write wrong affirmative negative plural singular directed best whole carefully matching
`.trim().split(/\s+/));

const GRAMMAR_TERMS = [
  "there is", "there are", "how many", "how old", "what color", "what are", "what is",
  "what do", "what does", "are these", "are those", "is this", "is that", "who has",
  "who is", "where is", "where are", "do", "does", "has", "have", "can", "am", "is",
  "are", "like", "likes", "want", "wants"
];

const audit = new Map();

function add(category, location, message, details = {}) {
  if (!audit.has(category)) audit.set(category, []);
  audit.get(category).push({ location, message, ...details });
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeWithoutPunctuation(value) {
  return normalizeText(value).replace(/[^a-z0-9']+/g, "");
}

function words(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.map((word) => word.toLowerCase()) || [];
}

function sentences(value) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return [];
  return text.split(/(?<=[.!?])\s+(?=[A-Z“\"])/).map((sentence) => sentence.trim()).filter(Boolean);
}

function grammarFocusText(unit) {
  const focus = unit.grammarFocus;
  if (typeof focus === "string") return focus;
  if (!focus) return "";
  return [focus.concept, ...(focus.patterns || []), ...(focus.forms || []), ...(focus.contrasts || [])].filter(Boolean).join(" ");
}

function vocabularyText(unit) {
  return (unit.vocabulary || []).map((entry) => {
    if (typeof entry === "string") return entry;
    return [entry.word, ...(entry.aliases || [])].filter(Boolean).join(" ");
  }).join(" ");
}

function passportText(unit) {
  return (unit.passportSentences || []).map((entry) => {
    if (Array.isArray(entry)) return entry.join(" ");
    return entry?.text || entry || "";
  }).join(" ");
}

function unitAllowlist(book, unitIndex) {
  const allowed = new Set([...FUNCTION_WORDS, ...DIRECTION_WORDS]);
  const teachingUnits = book.units.filter((unit) => !unit.isReview);
  const currentUnit = book.units[unitIndex];
  const sourceUnits = currentUnit.isReview
    ? teachingUnits
    : teachingUnits.slice(0, teachingUnits.findIndex((unit) => unit.id === currentUnit.id) + 1);

  sourceUnits.forEach((unit) => {
    [vocabularyText(unit), passportText(unit), (unit.mainSentences || []).join(" "), grammarFocusText(unit)]
      .forEach((text) => words(text).forEach((word) => allowed.add(word)));
  });
  return allowed;
}

function itemPrompt(item) {
  return item.prompt || item.left || item.source || item.directive || item.lead
    || item.contextLines?.join(" ") || item.dialogueLines?.join(" ")
    || item.situationLines?.join(" ") || item.lines?.join(" ") || "";
}

function choiceText(choice) {
  if (typeof choice === "string") return choice;
  return choice?.text || choice?.label || choice?.value || "";
}

function pageContentForAllowlist(page) {
  const content = [
    ...(page.passageLines || []),
    ...(page.endingLines || []),
    ...(page.dialogueLines || []),
    page.intro || "",
    ...(page.information || []).flatMap((entry) => [entry.label, entry.value]),
    ...(page.items || []).flatMap((item) => [
      itemPrompt(item),
      ...(item.choices || []).map(choiceText),
      ...(item.contextLines || []),
      ...(item.dialogueLines || []),
      ...(item.situationLines || []),
      ...(item.lines || [])
    ])
  ];
  return content.filter(Boolean).join(" ");
}

function pageText(page) {
  return [
    page.title,
    page.instruction,
    page.skill,
    pageContentForAllowlist(page),
    ...(page.items || []).map((item) => item.expectedAnswer || item.answer || "")
  ].filter(Boolean).join(" ");
}

function promptStructure(value, unit) {
  let result = normalizeText(value);
  const vocabulary = (unit.vocabulary || []).flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    return [entry.word, ...(entry.aliases || [])].filter(Boolean);
  }).sort((a, b) => String(b).length - String(a).length);
  vocabulary.forEach((term) => {
    const escaped = normalizeText(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (escaped.length < 2) return;
    result = result.replace(new RegExp(`\\b${escaped}\\b`, "g"), "<vocab>");
  });
  return result.replace(/\b\d+\b/g, "<number>").replace(/\s+/g, " ").trim();
}

function auditDuplicates(page, location, unit) {
  const promptMap = new Map();
  const answerMap = new Map();
  const structureMap = new Map();
  (page.items || []).forEach((item, itemIndex) => {
    const prompt = normalizeText(itemPrompt(item));
    const answer = normalizeText(item.expectedAnswer || item.answer || "");
    if (prompt) {
      const isExactDuplicate = promptMap.has(prompt);
      if (isExactDuplicate) add("duplicate_prompt", `${location}/item-${itemIndex + 1}`, `Duplicates item ${promptMap.get(prompt) + 1}: ${itemPrompt(item)}`);
      else promptMap.set(prompt, itemIndex);
      const structure = promptStructure(prompt, unit);
      if (structureMap.has(structure) && !isExactDuplicate) {
        add("duplicate_prompt_structure", `${location}/item-${itemIndex + 1}`, `Matches the structure of item ${structureMap.get(structure) + 1}: ${itemPrompt(item)}`);
      } else if (!structureMap.has(structure)) structureMap.set(structure, itemIndex);
    }
    if (answer) {
      if (answerMap.has(answer)) add("duplicate_expected_answer", `${location}/item-${itemIndex + 1}`, `Duplicates item ${answerMap.get(answer) + 1}: ${item.expectedAnswer || item.answer}`);
      else answerMap.set(answer, itemIndex);
    }
  });
}

function auditAnswerLength(page, location, profile) {
  (page.items || []).forEach((item, itemIndex) => {
    const answer = item.expectedAnswer || item.answer || "";
    if (!answer) return;
    const count = sentences(answer).length || 1;
    if (count > profile.maxAnswerSentences) {
      add("answer_too_many_sentences", `${location}/item-${itemIndex + 1}`, `${count} answer sentences exceed limit ${profile.maxAnswerSentences}: ${answer}`);
    }
  });
}

function collectMedia(page) {
  const values = [];
  const collect = (asset) => {
    if (!asset) return;
    if (typeof asset === "string") values.push({ kind: /\.(mp3|wav|m4a|ogg)$/i.test(asset) ? "audio" : "asset", value: asset });
    else {
      if (asset.image) values.push({ kind: "asset", value: asset.image });
      if (asset.sprite?.src) values.push({ kind: "asset", value: asset.sprite.src });
      if (asset.audio) values.push({ kind: "audio", value: asset.audio });
    }
  };
  (page.heroAssets || []).forEach(collect);
  (page.sceneAssets || []).forEach(collect);
  collect(page.image);
  collect(page.audio);
  (page.items || []).forEach((item) => {
    collect(item.asset);
    collect(item.image);
    collect(item.audio);
  });
  return values;
}

function auditMedia(page, location) {
  collectMedia(page).forEach(({ kind, value }) => {
    if (!value || /^(?:https?:|data:|blob:)/i.test(value) || !/[\\/]/.test(value)) return;
    const localPath = path.resolve(root, value.replace(/^\/+/, ""));
    if (!fs.existsSync(localPath)) add(kind === "audio" ? "missing_audio" : "missing_asset", location, `Missing local ${kind}: ${value}`);
  });
}

function auditMultipleChoice(page, location) {
  if (page.type !== "multiple_choice") return;
  (page.items || []).forEach((item, itemIndex) => {
    const itemLocation = `${location}/item-${itemIndex + 1}`;
    const choices = (item.choices || []).map(choiceText);
    if (choices.length !== 3) add("multiple_choice_choice_count", itemLocation, `Expected 3 choices, found ${choices.length}.`);
    const normalized = choices.map(normalizeText);
    if (new Set(normalized).size !== normalized.length) add("multiple_choice_duplicate_choices", itemLocation, `Choices are not unique: ${choices.join(" | ")}`);
    const answer = normalizeText(item.expectedAnswer);
    const answerCount = normalized.filter((choice) => choice === answer).length;
    if (answerCount !== 1) add("multiple_choice_answer_count", itemLocation, `Expected answer appears ${answerCount} times: ${item.expectedAnswer}`);
    const answerBare = normalizeWithoutPunctuation(item.expectedAnswer);
    choices.forEach((choice) => {
      if (normalizeText(choice) === answer) return;
      if (normalizeWithoutPunctuation(choice) === answerBare) {
        add("multiple_choice_punctuation_only_distractor", itemLocation, `Distractor differs only by punctuation/spacing: ${choice}`);
      }
    });
  });
}

function auditScramble(page, location, profile) {
  const scrambleTypes = new Set(["unscramble", "template_question_order", "template_answer_order"]);
  if (!scrambleTypes.has(page.type)) return;
  (page.items || []).forEach((item, itemIndex) => {
    const itemLocation = `${location}/item-${itemIndex + 1}`;
    const prompt = itemPrompt(item);
    const expected = item.expectedAnswer || "";
    const chunks = String(prompt).split(/\s*\/\s*/).map((chunk) => chunk.trim()).filter(Boolean);
    const reconstructed = chunks.join(" ");
    if (normalizeWithoutPunctuation(reconstructed) === normalizeWithoutPunctuation(expected)) {
      add("scramble_same_as_answer", itemLocation, `Scramble is still in answer order: ${prompt}`);
    }
    if (sentences(expected).length > 1 || (expected.match(/[.!?]/g) || []).length > 1) {
      add("scramble_multiple_sentences", itemLocation, `Expected answer contains more than one sentence: ${expected}`);
    }
    if (chunks.length > profile.maxScrambleChunks) {
      add("scramble_too_many_chunks", itemLocation, `${chunks.length} chunks exceed limit ${profile.maxScrambleChunks}: ${prompt}`);
    }
    const normalizedChunks = chunks.map(normalizeWithoutPunctuation).filter(Boolean);
    const hasRepeatedChunks = new Set(normalizedChunks).size !== normalizedChunks.length;
    if (!Array.isArray(item.acceptedAnswers) && hasRepeatedChunks) {
      add("scramble_order_manual_review", itemLocation, "Repeated chunks may allow ambiguous ordering; acceptedAnswers is missing.", { prompt, expected });
    }
  });
}

function auditAllowlist(page, location, allowlist) {
  const unknown = [...new Set(words(pageContentForAllowlist(page)).filter((word) => !allowlist.has(word)))];
  unknown.forEach((word) => add("allowlist_word", location, `Word is outside the cumulative unit allowlist: ${word}`, { word }));
}

function auditForbiddenStrings(page, location) {
  const haystack = normalizeText(JSON.stringify(page));
  FORBIDDEN_STRINGS.forEach((forbidden) => {
    if (haystack.includes(forbidden)) add("forbidden_string", location, `Contains forbidden meta-language: ${forbidden}`);
  });
}

function readingSentences(page) {
  return [...(page.passageLines || []), ...(page.endingLines || [])].flatMap(sentences);
}

function auditReading(page, location, bookId, profile) {
  if (bookId === "book-1" && page.type === "reading_comprehension") {
    add("book1_reading_comprehension", location, "Book 1 must not contain reading_comprehension pages.");
  }
  if (!["reading_comprehension", "reading_cloze"].includes(page.type)) return;
  const passageSentences = readingSentences(page);
  passageSentences.forEach((sentence, sentenceIndex) => {
    const count = words(sentence).length;
    if (count > profile.maxSentenceWords) {
      add("reading_sentence_too_long", `${location}/sentence-${sentenceIndex + 1}`, `${count} words exceed limit ${profile.maxSentenceWords}: ${sentence}`);
    }
  });
  if (page.type === "reading_comprehension" && profile.readingLines) {
    const [min, max] = profile.readingLines;
    if (passageSentences.length < min || passageSentences.length > max) {
      add("reading_sentence_count", location, `${passageSentences.length} sentences fall outside ${min}–${max}.`);
    }
  }
  if (page.type === "reading_cloze") {
    const answers = page.answers || (page.items || []).map((item) => item.expectedAnswer).filter(Boolean);
    const normalizedBank = (page.wordBank || []).map(normalizeText);
    if (!answers.length) add("cloze_missing_answers", location, "Cloze has no answer list.");
    answers.forEach((answer, answerIndex) => {
      const occurrences = normalizedBank.filter((word) => word === normalizeText(answer)).length;
      if (page.wordBank && occurrences !== 1) {
        add("cloze_word_bank_answer_count", `${location}/blank-${answerIndex + 1}`, `Answer appears ${occurrences} times in Word Bank: ${answer}`);
      }
      add("cloze_answer_manual_review", `${location}/blank-${answerIndex + 1}`, "Confirm that context permits only this answer.", { answer });
    });
    if (new Set(normalizedBank).size !== normalizedBank.length) add("cloze_duplicate_word_bank", location, "Word Bank contains duplicate entries.");
  }
}

function focusTerms(unit) {
  const focus = normalizeText(grammarFocusText(unit));
  return GRAMMAR_TERMS.filter((term) => focus.includes(term));
}

function auditGrammarFocus(unit, lesson, location) {
  const terms = focusTerms(unit);
  if (!terms.length) {
    add("grammar_focus_unstructured", location, `No auditable grammar term found in grammarFocus: ${grammarFocusText(unit)}`);
    return;
  }
  const dayText = normalizeText((lesson.worksheet.pages || []).map(pageText).join(" "));
  if (!terms.some((term) => dayText.includes(term))) {
    add("grammar_focus_missing", location, `No page appears to assess grammarFocus terms: ${terms.join(", ")}`);
  }
}

const books = (global.COURSE_CATALOG || []).filter((book) => BOOK_PROFILES[book.id]);

books.forEach((book) => {
  const profile = BOOK_PROFILES[book.id];
  book.units.forEach((unit, unitIndex) => {
    const allowlist = unitAllowlist(book, unitIndex);
    unit.lessons.forEach((lesson, lessonIndex) => {
      const day = lesson.worksheet?.day || lessonIndex + 1;
      const dayLocation = `${book.id}/${unit.id}/day-${day}`;
      auditGrammarFocus(unit, lesson, dayLocation);
      (lesson.worksheet?.pages || []).forEach((page, pageIndex) => {
        const location = `${dayLocation}/page-${pageIndex + 1}:${page.type}`;
        auditDuplicates(page, location, unit);
        auditMultipleChoice(page, location);
        auditScramble(page, location, profile);
        auditAnswerLength(page, location, profile);
        auditAllowlist(page, location, allowlist);
        auditForbiddenStrings(page, location);
        auditReading(page, location, book.id, profile);
        auditMedia(page, location);
      });
    });
  });
});

const rows = ALL_CATEGORIES
  .map((category) => ({ category, count: audit.get(category)?.length || 0, mode: REPORT_ONLY_CATEGORIES.has(category) ? "report" : "violation" }))
  .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));

console.log("\nWorksheet audit baseline");
console.log(`Books: ${books.map((book) => book.id).join(", ")}`);
console.table(rows);

for (const { category, count, mode } of rows) {
  if (!count) continue;
  console.log(`\n[${mode.toUpperCase()}] ${category}: ${count}`);
  audit.get(category).slice(0, 10).forEach((entry, index) => {
    console.log(`${index + 1}. ${entry.location} — ${entry.message}`);
  });
}

const hardViolationCount = rows
  .filter((row) => row.mode === "violation")
  .reduce((sum, row) => sum + row.count, 0);
const reportOnlyCount = rows
  .filter((row) => row.mode === "report")
  .reduce((sum, row) => sum + row.count, 0);

console.log(`\nAudit totals: ${hardViolationCount} violations; ${reportOnlyCount} report-only findings.`);
console.log("Default mode is report-only. Set WORKSHEET_AUDIT_STRICT=1 after the baseline is approved to fail on hard violations.");

if (process.env.WORKSHEET_AUDIT_STRICT === "1" && hardViolationCount > 0) process.exitCode = 1;

module.exports = { BOOK_PROFILES, audit, rows };

const assert = require("node:assert/strict");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
global.window = global;
require(path.join(root, "data/book1.js"));
require(path.join(root, "data/book1-activities.js"));
require(path.join(root, "data/book1-passport.js"));
require(path.join(root, "data/book2.js"));
require(path.join(root, "data/book3.js"));
require(path.join(root, "data/book3-review.js"));
require(path.join(root, "data/review-units.js"));
require(path.join(root, "data/practice-data.js"));

const passportSnapshot = JSON.stringify(global.CURRICULUM_BOOKS.map((book) =>
  book.units.map((unit) => unit.passportSentences || [])));
require(path.join(root, "data/course-schema.js"));
require(path.join(root, "js/teaching-flow.js"));
require(path.join(root, "data/worksheet-data.js"));
require(path.join(root, "js/worksheet-components.js"));

const books = global.COURSE_CATALOG.filter((book) => ["book-1", "book-2", "book-3"].includes(book.id));
assert.equal(books.length, 3, "Book 1, Book 2, and Book 3 must exist");

const readingClozeQuestions = books.flatMap((book) => book.units)
  .flatMap((unit) => unit.lessons)
  .flatMap((lesson) => lesson.steps)
  .filter((step) => step.activity === "practice-loop")
  .flatMap((step) => step.practiceLoop.questions)
  .filter((question) => question.type === "reading-cloze");
assert.ok(readingClozeQuestions.length >= 1, "Practice sets must include a Reading Cloze demo");
readingClozeQuestions.forEach((question) => {
  const blanks = question.passage.filter((part) => part && typeof part === "object" && Number.isInteger(part.blank));
  assert.equal(question.wordBank, undefined, "Reading Cloze must not provide a Word Bank");
  assert.equal(question.answers.length, blanks.length, "Reading Cloze must provide one answer per blank");
  const passageText = question.passage.filter((part) => typeof part === "string").join("");
  assert.ok((passageText.match(/[.!?](?:\s|$)/g) || []).length >= 3, "Reading Cloze must be a connected passage of at least three sentences");
});
books.forEach((book) => {
  assert.equal(book.units.filter((unit) => !unit.isReview).length, 9, `${book.id} must have 9 teaching units`);
  assert.equal(book.units.filter((unit) => unit.isReview).length, 4, `${book.id} must have three section reviews and one final review`);
  book.units.forEach((unit) => {
    const expectedDays = unit.isReview && unit.reviewRange === "1–9" ? 5 : 4;
    assert.equal(unit.lessons.length, expectedDays, `${book.id}/${unit.id} must have ${expectedDays} days`);
    unit.lessons.forEach((lesson, index) => {
      assert.equal(lesson.worksheet.pages.length, 4, `${lesson.id} must have four worksheet pages`);
      lesson.worksheet.pages.forEach((page) => {
        assert.ok(page.items.length > 0, `${lesson.id}/${page.type} must contain questions`);
        assert.ok((page.sceneAssets || []).length > 0 || page.items.some((item) => item.asset?.image || item.asset?.sprite?.src || item.asset?.visual), `${lesson.id}/${page.type} must contain visible picture assets`);
        if (page.type === "sentence_transform") page.items.forEach((item) => {
          const source = item.prompt.split("→")[0].trim();
          const sourceIsNegative = /\b(?:am|is|are) not\b|\b(?:cannot|can't|do not|don't|does not|doesn't)\b/i.test(source);
          assert.equal(item.prompt.includes("Change to affirmative."), sourceIsNegative, `${lesson.id} transform direction must match source polarity`);
          assert.notEqual(item.expectedAnswer, source, `${lesson.id} sentence transformation must change the sentence`);
        });
        const studentMarkup = global.WorksheetComponents.studentPage(lesson, page, 0, 1);
        assert.match(studentMarkup, /wb-handwriting-row/, `${lesson.id}/${page.type} must include four-line handwriting guides`);
        const itemLimit = page.layout === "locked_template" ? 8 : page.type === "multiple_choice" ? 6 : 4;
        assert.ok(page.items.length <= itemLimit, `${lesson.id}/${page.type} must leave one full-width writing row per sentence`);
        if (page.type === "unscramble") page.items.forEach((item) => {
          assert.doesNotMatch(item.expectedAnswer, /[.!?]\s+[A-Z]/, `${lesson.id} unscramble items must contain only one sentence`);
        });
      });
      assert.ok(lesson.steps.length > 0, `${lesson.id} must have player steps`);
      assert.ok(lesson.steps.some((step) => step.activity === "flow-games" || step.activity === "guided-practice" || step.activity === "practice-loop" || step.activity === "picture-flash" || step.activity === "boss-battle"), `${lesson.id} must include an activity`);
      assert.equal(Number(String(lesson.day).match(/\d+/)[0]), index + 1);
    });
  });
});

const progressiveFirstPageTitles = [
  "Look and Answer", "Make the Question", "Write Your Question", "Picture Question Challenge"
];
books.forEach((book) => book.units.filter((unit) => !unit.isReview).forEach((unit) => {
  const expectedProgression = book.id === "book-3" && unit.id === "unit-5"
    ? ["Look and Answer", "Choose and Write", "Look, Think, and Answer", "Build Complete Sentences"]
    : progressiveFirstPageTitles;
  assert.deepEqual(
    unit.lessons.map((lesson) => lesson.worksheet.pages[0].title),
    expectedProgression,
    `${book.id}/${unit.id} must build independent question writing from Day 1 to Day 4`
  );
  unit.lessons.forEach((lesson) => {
    assert.deepEqual(
      lesson.worksheet.pages.map((page) => page.items.length),
      [8, 4, 6, 8],
      `${book.id}/${unit.id}/${lesson.id} must use the standard four-page workload`
    );
    assert.equal(lesson.worksheet.pages[0].layout, "locked_template", `${book.id}/${unit.id}/${lesson.id} first page must use the locked template`);
    assert.equal(lesson.worksheet.pages[1].type, "matching", `${book.id}/${unit.id}/${lesson.id} second page must be matching`);
    assert.equal(lesson.worksheet.pages[2].type, "multiple_choice", `${book.id}/${unit.id}/${lesson.id} third page must be multiple choice`);
    assert.equal(lesson.worksheet.pages[3].layout, "locked_template", `${book.id}/${unit.id}/${lesson.id} fourth page must use the locked template`);
  });
}));

function expectedAnswerSubject(question) {
  const value = String(question).toLowerCase();
  if (/^(?:are|do|can) you\b|^(?:what|where) do you\b|^how old are you\b|^where are you\b|^who are you\b/.test(value)) return "i";
  if (/^am i\b|^who am i\b/.test(value)) return "you";
  if (/^(?:is|does) he\b|^what does he\b|^who is he\b|^how old is he\b|^where is he\b/.test(value)) return "he";
  if (/^(?:is|does) she\b|^what does she\b|^who is she\b|^how old is she\b|^where is she\b/.test(value)) return "she";
  if (/^(?:are|do) they\b|^what do they\b|^where are they\b/.test(value)) return "they";
  if (/^(?:are|do) we\b|^what do we\b/.test(value)) return "we";
  return "";
}

function actualAnswerSubject(answer) {
  const value = String(answer).toLowerCase().replace(/^(yes|no),\s*/, "");
  return value.match(/^(i|you|he|she|we|they)\b/)?.[1] || "";
}

books.forEach((book) => book.units.forEach((unit) => unit.lessons.forEach((lesson) => {
  lesson.worksheet.pages.forEach((page) => page.items.forEach((item) => {
    if (item.choices) {
      assert.ok(item.choices.includes(item.expectedAnswer), `${book.id}/${unit.id}/${lesson.id}/${page.type} must include its correct answer among the choices`);
    }
    const pair = String(item.expectedAnswer || "").split(" → ");
    if (pair.length === 2) {
      const expectedSubject = expectedAnswerSubject(pair[0]);
      const actualSubject = actualAnswerSubject(pair[1]);
      if (expectedSubject && actualSubject) {
        assert.equal(actualSubject, expectedSubject, `${book.id}/${unit.id}/${lesson.id} answer subject must match: ${pair.join(" → ")}`);
      }
    }
    assert.doesNotMatch(String(item.expectedAnswer || ""), /like to (?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/i, `${book.id}/${unit.id}/${lesson.id} must not use a weekday as an activity`);
    assert.doesNotMatch(String(item.expectedAnswer || ""), /\bmy me\b|\bone years old\b/i, `${book.id}/${unit.id}/${lesson.id} must use a natural family or age answer`);
    assert.doesNotMatch(String(item.expectedAnswer || ""), /^(?:What\s+)?(?:does|do)\s+[^?.!]+\s+(?:likes|wants|has)\b/i, `${book.id}/${unit.id}/${lesson.id} auxiliary questions must use the base verb`);
    assert.doesNotMatch(String(item.expectedAnswer || ""), /^(?:He|She|It)\s+(?:like|want|have)\b/i, `${book.id}/${unit.id}/${lesson.id} third-person answers must use the correct verb form`);
    assert.doesNotMatch(String(item.expectedAnswer || ""), /^(?:I|You|We|They)\s+(?:likes|wants|has)\b/i, `${book.id}/${unit.id}/${lesson.id} non-third-person answers must use the base verb`);
    assert.doesNotMatch(String(item.expectedAnswer || ""), /\b(?:undefined|null)\b/i, `${book.id}/${unit.id}/${lesson.id} answers must not contain missing data`);
    assert.doesNotMatch(String(item.prompt || ""), /\+\s*(?:complete question|check the grammar)/i, `${book.id}/${unit.id}/${lesson.id} must not use abstract plus-sign question cues`);
  }));
  lesson.worksheet.pages.filter((page) => page.type === "matching").forEach((page) => {
    if (!page.items.every((item) => String(item.expectedAnswer).includes(" → "))) return;
    const expectedPairs = page.items.flatMap((item) => String(item.expectedAnswer).split(" → ")).sort();
    const displayedPairs = page.items.flatMap((item) => [item.left, item.right]).sort();
    assert.deepEqual(displayedPairs, expectedPairs, `${book.id}/${unit.id}/${lesson.id} matching choices must contain every question and answer exactly once`);
  });
})));

const book1Unit4 = books.find((book) => book.id === "book-1").units.find((unit) => unit.id === "unit-4");
assert.deepEqual(book1Unit4.lessons[0].worksheet.pages.map((page) => page.items.length), [8, 4, 6, 8], "Book 1 Unit 4 must use the full standard worksheet format");
const book1Unit4FirstPage = global.WorksheetComponents.studentPage(book1Unit4.lessons[0], book1Unit4.lessons[0].worksheet.pages[0], 0, 4);
assert.match(book1Unit4FirstPage, /wb-locked-template/, "Book 1 Unit 4 must use the same locked writing template as Book 3 Unit 4");
assert.match(book1Unit4FirstPage, /Look and Answer/, "Book 1 Unit 4 must retain the Book 3 Unit 4 page-title position");
assert.match(book1Unit4FirstPage, /Name:/, "Book 1 Unit 4 must retain the Book 3 Unit 4 name line");

books.forEach((book) => {
  const teachingUnits = book.units.filter((unit) => !unit.isReview);
  assert.notEqual(teachingUnits[0].lessons[3].worksheet.pages[3].title, "Mixed Question and Answer Review", `${book.id} first unit must keep its original Day 4 final page`);
  teachingUnits.slice(1).forEach((unit) => {
    const reviewPage = unit.lessons[3].worksheet.pages[3];
    assert.equal(reviewPage.title, "Mixed Question and Answer Review", `${book.id}/${unit.id} Day 4 must end with a mixed review worksheet`);
    assert.equal(reviewPage.items.length, 8, `${book.id}/${unit.id} mixed review must contain eight questions`);
    assert.ok(reviewPage.items.every((item) => /\?$/.test(item.prompt)), `${book.id}/${unit.id} mixed review must give complete questions`);
    assert.ok(reviewPage.items.every((item) => item.asset?.image || item.asset?.sprite?.src || item.asset?.visual), `${book.id}/${unit.id} mixed review must give a picture for every question`);
    assert.ok(reviewPage.items.every((item) => !/^Answer:/i.test(item.prompt)), `${book.id}/${unit.id} mixed review must ask children to write answers, not questions`);
    reviewPage.items.forEach((item) => {
      const expectedSubject = expectedAnswerSubject(item.prompt);
      const actualSubject = actualAnswerSubject(item.expectedAnswer);
      if (expectedSubject && actualSubject) assert.equal(actualSubject, expectedSubject, `${book.id}/${unit.id} mixed review question and answer subjects must match`);
      assert.doesNotMatch(item.expectedAnswer, /\bmangos\b/i, `${book.id}/${unit.id} must spell mangoes correctly`);
    });
  });
});

books.forEach((book) => {
  const reviews = book.units.filter((unit) => unit.isReview);
  assert.deepEqual(reviews.map((unit) => unit.reviewRange), ["1–3", "4–6", "7–9", "1–9"], `${book.id} must include three section reviews and a final 1–9 review`);
  reviews.forEach((review) => {
    const finalReview = review.reviewRange === "1–9";
    assert.equal(review.lessons.length, finalReview ? 5 : 4, `${book.id}/${review.id} must have the correct review day count`);
    assert.equal(review.reviewSections.length, finalReview ? 9 : 3, `${book.id}/${review.id} must combine the correct source units`);
    const expectedFirstPages = [
      "Reading Cloze Writing", "Review: Make the Question", "Follow the Question Chain", "Cumulative Reading Cloze Writing"
    ];
    if (finalReview) expectedFirstPages.push("Final Reading Cloze Writing");
    assert.deepEqual(review.lessons.map((lesson) => lesson.worksheet.pages[0].title), expectedFirstPages, `${book.id}/${review.id} must increase independence across all review days`);
    const worksheetJson = JSON.stringify(review.lessons.map((lesson) => lesson.worksheet.pages));
    assert.doesNotMatch(worksheetJson, /\[Unit\s+\d+\]/, `${book.id}/${review.id} must not label individual questions by unit number`);
    assert.match(worksheetJson, /reading_cloze/, `${book.id}/${review.id} must include a Reading Cloze writing page`);
    review.lessons.flatMap((lesson) => lesson.worksheet.pages)
      .filter((page) => page.type === "reading_cloze")
      .forEach((page) => {
        assert.equal(page.wordBank, undefined, `${book.id}/${review.id} Reading Cloze must not provide a Word Bank`);
        assert.ok(page.passageLines.length >= 3 && page.passageLines.length <= 5, `${book.id}/${review.id} Reading Cloze needs a 3–5 sentence passage`);
        assert.ok(page.items.every((item) => item.prompt.includes("________")), `${book.id}/${review.id} Reading Cloze sentences need blanks`);
      });
    assert.match(worksheetJson, /chain_questions/, `${book.id}/${review.id} must include a linked question chain`);
  });
});

const book1FirstReview = books.find((book) => book.id === "book-1")
  .units.find((unit) => unit.isReview && unit.reviewRange === "1–3");
book1FirstReview.lessons.forEach((lesson) => lesson.worksheet.pages.forEach((page) => page.items.forEach((item) => {
  assert.doesNotMatch(
    `${item.question || ""} ${item.prompt || ""} ${item.answer || ""} ${item.expectedAnswer || ""}`,
    /\b(?:we|they|them|their|these|those|parents|cousins)\b/i,
    "Book 1 Review 1–3 must not introduce plural-person grammar"
  );
})));

const book2Unit1 = books.find((book) => book.id === "book-2").units.find((unit) => unit.id === "unit-1");
assert.doesNotMatch(JSON.stringify(book2Unit1.passportSentences), /\b(?:dog|cat)\b/i, "Book 2 Unit 1 classroom pictures must not use unrelated animal prompts");
assert.match(JSON.stringify(book2Unit1.passportSentences), /Is there a television\?/, "Book 2 Unit 1 television picture must use a television question");

const book2FruitUnits = books.find((book) => book.id === "book-2").units
  .filter((unit) => ["unit-4", "unit-5"].includes(unit.id));
book2FruitUnits.forEach((unit) => {
  const day1AnswerPage = unit.lessons[0].worksheet.pages[0];
  const day1Answers = day1AnswerPage.items.map((item) => item.expectedAnswer);
  const day1Questions = day1AnswerPage.items.map((item) => item.prompt);
  assert.ok(day1Answers.some((answer) => /^Yes,/i.test(answer)), `${unit.id} must include positive fruit answers`);
  assert.ok(day1Answers.some((answer) => /^No,/i.test(answer)), `${unit.id} must include negative fruit answers`);
  assert.ok(day1Questions.some((question) => /^What are (?:these|those)\?/i.test(question)), `${unit.id} must include What are these/those questions`);
  assert.ok(day1Questions.some((question) => /^Are (?:these|those)\b/i.test(question)), `${unit.id} must include Are these/those questions`);

  const mixedPage = unit.lessons[0].worksheet.pages[3];
  assert.equal(mixedPage.items.filter((item) => /^Fix:/i.test(item.prompt)).length, 5, `${unit.id} must limit repeated correction items to five`);
  assert.equal(mixedPage.items.filter((item) => /^(?:Put in order|Change to plural|Change to singular):/i.test(item.prompt)).length, 3, `${unit.id} must use the lower section for reorder and number-form practice`);

  unit.lessons.slice(1).forEach((lesson) => {
    const writingPage = lesson.worksheet.pages[0];
    const prompts = writingPage.items.map((item) => item.prompt).join(" ");
    assert.doesNotMatch(prompts, /\b(?:apples|bananas|oranges|peaches|strawberries|kiwis|mangoes|tomatoes|cherries)\b/i, `${unit.id}/${lesson.id} picture cues must not reveal the fruit word`);
    const expectedQuestions = writingPage.items.map((item) => item.expectedAnswer);
    assert.ok(expectedQuestions.some((question) => /^What are (?:these|those)\?/i.test(question)), `${unit.id}/${lesson.id} must practise What questions`);
    assert.ok(expectedQuestions.some((question) => /^Are (?:these|those)\b/i.test(question)), `${unit.id}/${lesson.id} must practise Yes/No questions`);
  });
});

const book2FirstReview = books.find((book) => book.id === "book-2")
  .units.find((unit) => unit.isReview && unit.reviewRange === "1–3");
const book2ReviewWords = new Set(book2FirstReview.vocabulary.map((item) => String(item.word || item)));
const book2UsedReviewWords = new Set(book2FirstReview.lessons.flatMap((lesson) => lesson.worksheet.pages)
  .flatMap((page) => page.items).map((item) => item.asset?.word).filter(Boolean));
book2ReviewWords.forEach((word) => assert.ok(book2UsedReviewWords.has(word), `Book 2 Review 1–3 must use vocabulary word: ${word}`));
const book2Day4Words = book2FirstReview.lessons[3].worksheet.pages.flatMap((page) => page.items)
  .map((item) => item.asset?.word).filter(Boolean);
assert.equal(new Set(book2Day4Words).size, book2Day4Words.length, "Book 2 Review 1–3 Day 4 must not repeat vocabulary across worksheet pages");

const book3Unit4Day1 = books.find((book) => book.id === "book-3")
  .units.find((unit) => unit.id === "unit-4").lessons[0];
assert.equal(book3Unit4Day1.worksheet.pages.length, 4, "Book 3 Unit 4 Day 1 must keep four one-topic pages");
assert.deepEqual(book3Unit4Day1.worksheet.pages.map((page) => page.type), ["template_picture_answer", "matching", "multiple_choice", "template_fix_mistakes"]);
assert.deepEqual(book3Unit4Day1.worksheet.pages.map((page) => page.items.length), [8, 4, 6, 8]);
book3Unit4Day1.worksheet.pages.forEach((page, index) => {
  const markup = global.WorksheetComponents.studentPage(book3Unit4Day1, page, 0, 4);
  if (index === 0 || index === 3) assert.match(markup, /wb-locked-template/, `${page.type} must render the locked template class`);
  if (page.type === "matching") assert.match(markup, /wb-matching-section/, "Matching page must retain the matching layout");
  if (page.type === "multiple_choice") assert.match(markup, /wb-choice-section/, "Multiple-choice page must retain choice cards");
});
assert.doesNotMatch(JSON.stringify(book3Unit4Day1.worksheet.pages), /Ava/, "The replaced girl name must not remain in the lesson");
assert.match(JSON.stringify(book3Unit4Day1.worksheet.pages), /Lumi/, "Girl-name questions must use Lumi");

const book3Unit4Lessons = books.find((book) => book.id === "book-3")
  .units.find((unit) => unit.id === "unit-4").lessons;
const book3Unit4Vocabulary = books.find((book) => book.id === "book-3")
  .units.find((unit) => unit.id === "unit-4").vocabulary;
book3Unit4Vocabulary.forEach((item) => {
  assert.ok(item.image, `Book 3 Unit 4 ${item.word} must use the supplied picture`);
  assert.ok(require("node:fs").existsSync(path.join(root, item.image)), `${item.word} picture file must exist`);
});
const book3FirstFourUnits = books.find((book) => book.id === "book-3").units.slice(0, 4);
book3FirstFourUnits.flatMap((unit) => unit.vocabulary).forEach((item) => {
  assert.ok(item.image, `Book 3 Units 1-4 ${item.word} must have a picture`);
  assert.ok(require("node:fs").existsSync(path.join(root, item.image)), `Configured picture for ${item.word} must exist`);
});
book3FirstFourUnits.slice(0, 3).forEach((unit) => {
  assert.deepEqual(unit.lessons.map((lesson) => lesson.worksheet.pages[0].title), [
    "Look and Answer", "Make the Question", "Write Your Question", "Picture Question Challenge"
  ], `${unit.id} must build question-writing independence from Day 1 to Day 4`);
  unit.lessons.forEach((lesson) => {
    assert.deepEqual(lesson.worksheet.pages.map((page) => page.items.length), [8, 4, 6, 8], `${lesson.id} must keep the fixed four-page workload`);
    assert.equal(lesson.worksheet.pages[0].layout, "locked_template", `${lesson.id} writing page must use the locked template`);
    assert.equal(lesson.worksheet.pages[3].layout, "locked_template", `${lesson.id} final writing page must use the locked template`);
    assert.equal(lesson.worksheet.pages[1].type, "matching", `${lesson.id} must retain matching`);
    assert.equal(lesson.worksheet.pages[2].type, "multiple_choice", `${lesson.id} must retain multiple choice`);
  });
});
assert.equal(book3Unit4Lessons[1].worksheet.pages[0].title, "Make the Question", "Day 2 must begin independent question construction");
assert.equal(book3Unit4Lessons[2].worksheet.pages[0].title, "Write Your Question", "Day 3 must add mixed guided question writing");
assert.equal(book3Unit4Lessons[3].worksheet.pages[0].title, "Picture Question Challenge", "Day 4 must begin independent mixed production");
const promptsByDay = book3Unit4Lessons.map((lesson) => lesson.worksheet.pages
  .filter((page) => page.title !== "Mixed Question and Answer Review")
  .flatMap((page) => page.items.map((item) => item.prompt || item.left)));
promptsByDay.forEach((prompts, dayIndex) => {
  promptsByDay.slice(dayIndex + 1).forEach((laterPrompts, offset) => {
    const duplicates = [...new Set(prompts.filter((prompt) => laterPrompts.includes(prompt)))];
    assert.deepEqual(duplicates, [], `Book 3 Unit 4 Day ${dayIndex + 1} and Day ${dayIndex + offset + 2} must not reuse question prompts`);
  });
});
assert.doesNotMatch(JSON.stringify(book3Unit4Lessons), /Ava/, "Book 3 Unit 4 must use Lumi for the girl name across all days");

const book3Unit5 = books.find((book) => book.id === "book-3").units.find((unit) => unit.id === "unit-5");
assert.deepEqual(
  book3Unit5.lessons.map((lesson) => lesson.worksheet.pages[0].title),
  ["Look and Answer", "Choose and Write", "Look, Think, and Answer", "Build Complete Sentences"],
  "Book 3 Unit 5 must follow the workbook-style grammar progression"
);
const book3Unit5Day1Correction = book3Unit5.lessons[0].worksheet.pages[3];
assert.deepEqual(
  book3Unit5Day1Correction.items.slice(0, 5).map((item) => item.expectedAnswer),
  [
    "My little sister has three teeth.",
    "She doesn't have short legs.",
    "I don't have a big nose.",
    "Lumi doesn't have a big head.",
    "We have two arms."
  ],
  "Book 3 Unit 5 must practise the correction patterns from the workbook"
);
const book3Unit5Day2Unscramble = book3Unit5.lessons[1].worksheet.pages[3];
assert.ok(book3Unit5Day2Unscramble.items.some((item) => /^Who has\b/.test(item.expectedAnswer)), "Book 3 Unit 5 unscramble must include Who has questions");
assert.ok(book3Unit5Day2Unscramble.items.some((item) => /\b(?:don't|doesn't) have\b/.test(item.expectedAnswer)), "Book 3 Unit 5 unscramble must include negative sentences");
assert.ok(book3Unit5Day2Unscramble.items.some((item) => /\b(?:bunny|bicycle|popcorn|fish)\b/i.test(item.expectedAnswer)), "Book 3 Unit 5 unscramble must reuse vocabulary from Units 1–4");
assert.deepEqual(
  book3Unit5.lessons[0].worksheet.pages[3].items.map((item) => item.prompt)
    .filter((prompt) => book3Unit5.lessons[2].worksheet.pages[3].items.some((item) => item.prompt === prompt)),
  [],
  "Book 3 Unit 5 Day 1 and Day 3 correction prompts must not repeat"
);
const book3Unit5NewPages = book3Unit5.lessons.flatMap((lesson, lessonIndex) => lesson.worksheet.pages
  .filter((page, pageIndex) => !(lessonIndex === 3 && pageIndex === 3)));
book3Unit5NewPages.flatMap((page) => page.items).forEach((item) => {
  const completeAnswers = String(item.expectedAnswer || "").split(" → ");
  completeAnswers.filter((value) => /\?$/.test(value)).forEach((question) => {
    assert.match(question, /^Who has\b/, "Book 3 Unit 5 must keep Who has as its only question pattern");
  });
});
const book3Unit5Json = JSON.stringify(book3Unit5NewPages);
assert.match(book3Unit5Json, /\bteeth\b/, "Book 3 Unit 5 must practise tooth/teeth");
assert.match(book3Unit5Json, /\bfeet\b/, "Book 3 Unit 5 must practise foot/feet");
assert.match(book3Unit5Json, /\b(?:bunny|spider|fish|bicycle|popcorn|puzzle)\b/i, "Book 3 Unit 5 must spiral vocabulary from Units 1–4");

const book1 = books.find((book) => book.id === "book-1");
const book1Numbers = book1.units.find((unit) => unit.id === "unit-3").vocabulary;
assert.deepEqual(book1Numbers.map((item) => item.visual), ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], "Book 1 numbers must display as plain numerals");
book1.units.filter((unit) => ["unit-4", "unit-5", "unit-7", "unit-8", "unit-9"].includes(unit.id))
  .flatMap((unit) => unit.vocabulary).filter((item) => item.image).forEach((item) => {
    assert.ok(require("node:fs").existsSync(path.join(root, item.image)), `Book 1 icon for ${item.word} must exist`);
  });

const book3 = books.find((book) => book.id === "book-3");
book3.units.filter((unit) => ["unit-5", "unit-7", "unit-8", "unit-9"].includes(unit.id))
  .flatMap((unit) => unit.vocabulary).filter((item) => item.image).forEach((item) => {
    assert.ok(require("node:fs").existsSync(path.join(root, item.image)), `Book 3 icon for ${item.word} must exist`);
  });
const book3Days = book3.units.find((unit) => unit.id === "unit-8").vocabulary.filter((item) => /day$/i.test(item.word));
assert.deepEqual(book3Days.map((item) => item.visual), ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"], "Weekday prompts must show the Chinese weekday beside the question");

const indexHtml = require("node:fs").readFileSync(path.join(root, "index.html"), "utf8");
assert.doesNotMatch(indexHtml, /id="worksheet-word"/, "Player must not generate Word files dynamically");
assert.doesNotMatch(indexHtml, /worksheet-word-export\.js/, "Fixed Word files must be produced separately from the Player");
assert.match(indexHtml, /id="worksheet-shuffle"/, "Player must retain adjustable worksheet ordering");
assert.match(indexHtml, /id="worksheet-reset"/, "Player must retain adjustable worksheet reset controls");
const worksheetComponents = require("node:fs").readFileSync(path.join(root, "js", "worksheet-components.js"), "utf8");
assert.match(worksheetComponents, /wb-picture-count/, "Worksheet picture questions must display a quantity cue when the answer depends on a count");
assert.equal(JSON.stringify(global.CURRICULUM_BOOKS.map((book) =>
  book.units.map((unit) => unit.passportSentences || []))), passportSnapshot, "Passport sentences must remain unchanged");

const routeContext = {
  URL, URLSearchParams,
  document: { currentScript: { src: "https://example.com/english-teaching-player/js/routes.js" } },
  location: { pathname: "/english-teaching-player/", search: "", origin: "https://example.com" },
  history: { replaceState() {}, pushState() {} }
};
routeContext.window = routeContext;
vm.runInNewContext(require("node:fs").readFileSync(path.join(root, "js/routes.js"), "utf8"), routeContext);
assert.equal(routeContext.LessonRoutes.pathFor("book-1", "unit-2", 4), "/english-teaching-player/book1/unit2/day4/");
assert.equal(routeContext.LessonRoutes.pathFor("book-3", "unit-10", 1), "/english-teaching-player/book3/unit10/day1/");
assert.equal(routeContext.LessonRoutes.pathFor("book-3", "unit-13", 5), "/english-teaching-player/book3/unit13/day5/");
assert.deepEqual({ ...routeContext.LessonRoutes.parse("/english-teaching-player/book2/unit9/day3/") }, { bookId: "book-2", unitId: "unit-9", day: 3 });
assert.equal(routeContext.LessonRoutes.phonicsPathFor("sio2", "unit1"), "/english-teaching-player/phonics/sio2/unit1/");
assert.deepEqual(
  { ...routeContext.LessonRoutes.parse("/english-teaching-player/phonics/sio2/unit1/") },
  { phonics: true, courseId: "sio2", phonicsUnitId: "unit1", bookId: "", unitId: "", day: 0 }
);
assert.equal(routeContext.LessonRoutes.literacyPathFor("book1", "unit4"), "/english-teaching-player/literacy/book1/unit4/");
assert.deepEqual(
  { ...routeContext.LessonRoutes.parse("/english-teaching-player/literacy/book1/unit4/") },
  { literacy: true, literacyBookId: "book-1", literacyUnitId: "unit-4", bookId: "", unitId: "", day: 0 }
);

const phonicsContext = { window: {} };
vm.runInNewContext(require("node:fs").readFileSync(path.join(root, "data/phonics-data.js"), "utf8"), phonicsContext);
const phonicsUnit = phonicsContext.window.PHONICS_COURSES[0].units[0];
assert.equal(phonicsContext.window.PHONICS_COURSES[0].units.length, 12, "Sound It Out 2 must expose all 12 units");
assert.equal(phonicsUnit.title, "Long a");
assert.deepEqual(Array.from(phonicsUnit.patterns, (pattern) => pattern.display), ["A space E", "A-I", "A-Y", "E-I-G-H"]);
assert.deepEqual(Array.from(phonicsUnit.words.filter((word) => word.core), (word) => word.word), ["cape", "late", "nail", "rain", "hay", "ray", "eight", "weigh"]);
assert.ok(phonicsUnit.words.every((word) => Object.hasOwn(word, "audio")), "Every phonics word must expose an audio field");
assert.equal(phonicsContext.window.PHONICS_COURSES[0].units[4].title, "Long u");
assert.deepEqual(Array.from(phonicsContext.window.PHONICS_COURSES[0].units[8].patterns, (pattern) => pattern.id), ["er", "ir", "ur"]);
assert.deepEqual(Array.from(phonicsContext.window.PHONICS_COURSES[0].units[11].words.filter((word) => word.core), (word) => word.word), ["ghee", "ghost", "cough", "laugh", "phone", "photo", "dolphin", "graph"]);
assert.ok(phonicsContext.window.PHONICS_COURSES[0].units.every((item) => item.words.every((word) => Object.hasOwn(word, "audio"))), "Every SIO2 word must expose an audio field");
assert.match(indexHtml, /id="phonics-view"/, "The phonics student view must be mounted in the existing SPA");
assert.match(indexHtml, /js\/phonics-practice\.js/, "The reusable phonics activity engine must load");

const literacyContext = { window: {} };
vm.runInNewContext(require("node:fs").readFileSync(path.join(root, "data/literacy-data.js"), "utf8"), literacyContext);
const literacyBank = literacyContext.window.LITERACY_BANKS[0];
assert.equal(literacyBank.id, "book1-unit4");
assert.ok(literacyBank.questions.length >= 10, "The literacy demo bank must contain at least 10 reusable question groups");
assert.ok(literacyBank.questions.some((question) => question.type === "reading" && question.questions.length >= 2), "The literacy bank must support reading sets with subquestions");
assert.ok(literacyBank.questions.some((question) => question.image), "The literacy bank must support picture-plus-context questions");
literacyBank.questions.filter((question) => question.image).forEach((question) => {
  assert.ok(require("node:fs").existsSync(path.join(root, question.image)), `Literacy image must exist: ${question.image}`);
});
assert.ok(literacyBank.questions.every((question) => question.type === "reading" || (Array.isArray(question.choices) && Number.isInteger(question.answer))), "Every standalone literacy question must expose choices and an answer index");
assert.match(indexHtml, /id="literacy-view"/, "The literacy practice view must be mounted in the existing SPA");
assert.match(indexHtml, /js\/literacy-practice\.js/, "The reusable LiteracyQuestion engine must load");

console.log("Smoke tests passed: catalog, review day structure, worksheets, Passport integrity, activities, routes, phonics, and literacy data.");

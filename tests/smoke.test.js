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

const passportSnapshot = JSON.stringify(global.CURRICULUM_BOOKS.map((book) =>
  book.units.map((unit) => unit.passportSentences || [])));
require(path.join(root, "data/course-schema.js"));
require(path.join(root, "js/teaching-flow.js"));
require(path.join(root, "data/worksheet-data.js"));
require(path.join(root, "js/worksheet-components.js"));

const books = global.COURSE_CATALOG.filter((book) => ["book-1", "book-2", "book-3"].includes(book.id));
assert.equal(books.length, 3, "Book 1, Book 2, and Book 3 must exist");
books.forEach((book) => {
  assert.equal(book.units.filter((unit) => !unit.isReview).length, 9, `${book.id} must have 9 teaching units`);
  assert.equal(book.units.filter((unit) => unit.isReview).length, 3, `${book.id} must have three cumulative reviews`);
  book.units.forEach((unit) => {
    assert.equal(unit.lessons.length, 4, `${book.id}/${unit.id} must have four days`);
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
  assert.deepEqual(
    unit.lessons.map((lesson) => lesson.worksheet.pages[0].title),
    progressiveFirstPageTitles,
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
  if (/^(?:are|do|can) you\b|^(?:what|where) do you\b|^how old are you\b|^where are you\b/.test(value)) return "i";
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
  const reviews = book.units.filter((unit) => unit.isReview);
  assert.deepEqual(reviews.map((unit) => unit.reviewRange), ["1–3", "4–6", "7–9"], `${book.id} review ranges must cover every three units`);
  reviews.forEach((review) => {
    assert.equal(review.lessons.length, 4, `${book.id}/${review.id} must have Day 1-Day 4`);
    assert.equal(review.reviewSections.length, 3, `${book.id}/${review.id} must combine three source units`);
    assert.deepEqual(review.lessons.map((lesson) => lesson.worksheet.pages[0].title), [
      "A Connected Review Story", "Review: Make the Question", "Follow the Question Chain", "Lumi and Ludi's Review Story"
    ], `${book.id}/${review.id} must increase independence across four days`);
    const worksheetJson = JSON.stringify(review.lessons.map((lesson) => lesson.worksheet.pages));
    assert.doesNotMatch(worksheetJson, /\[Unit\s+\d+\]/, `${book.id}/${review.id} must not label individual questions by unit number`);
    assert.match(worksheetJson, /story_cloze/, `${book.id}/${review.id} must include a connected cloze passage`);
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
const promptsByDay = book3Unit4Lessons.map((lesson) => lesson.worksheet.pages.flatMap((page) => page.items.map((item) => item.prompt || item.left)));
promptsByDay.forEach((prompts, dayIndex) => {
  promptsByDay.slice(dayIndex + 1).forEach((laterPrompts, offset) => {
    const duplicates = [...new Set(prompts.filter((prompt) => laterPrompts.includes(prompt)))];
    assert.deepEqual(duplicates, [], `Book 3 Unit 4 Day ${dayIndex + 1} and Day ${dayIndex + offset + 2} must not reuse question prompts`);
  });
});
assert.doesNotMatch(JSON.stringify(book3Unit4Lessons), /Ava/, "Book 3 Unit 4 must use Lumi for the girl name across all days");

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
assert.deepEqual({ ...routeContext.LessonRoutes.parse("/english-teaching-player/book2/unit9/day3/") }, { bookId: "book-2", unitId: "unit-9", day: 3 });

console.log("Smoke tests passed: catalog, four-day structure, worksheets, Passport integrity, activities, and routes.");

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

const passportSnapshot = JSON.stringify(global.CURRICULUM_BOOKS.map((book) =>
  book.units.map((unit) => unit.passportSentences || [])));
require(path.join(root, "data/course-schema.js"));
require(path.join(root, "js/teaching-flow.js"));
require(path.join(root, "data/worksheet-data.js"));

const books = global.COURSE_CATALOG.filter((book) => ["book-1", "book-2"].includes(book.id));
assert.equal(books.length, 2, "Book 1 and Book 2 must exist");
books.forEach((book) => {
  assert.equal(book.units.length, 9, `${book.id} must have 9 units`);
  book.units.forEach((unit) => {
    assert.equal(unit.lessons.length, 4, `${book.id}/${unit.id} must have four days`);
    unit.lessons.forEach((lesson, index) => {
      assert.equal(lesson.worksheet.pages.length, 4, `${lesson.id} must have four worksheet pages`);
      lesson.worksheet.pages.forEach((page) => assert.ok(page.items.length > 0, `${lesson.id}/${page.type} must contain questions`));
      assert.ok(lesson.steps.length > 0, `${lesson.id} must have player steps`);
      assert.ok(lesson.steps.some((step) => step.activity === "flow-games" || step.activity === "guided-practice" || step.activity === "practice-loop" || step.activity === "picture-flash" || step.activity === "boss-battle"), `${lesson.id} must include an activity`);
      assert.equal(Number(String(lesson.day).match(/\d+/)[0]), index + 1);
    });
  });
});
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
assert.deepEqual({ ...routeContext.LessonRoutes.parse("/english-teaching-player/book2/unit9/day3/") }, { bookId: "book-2", unitId: "unit-9", day: 3 });

console.log("Smoke tests passed: catalog, four-day structure, worksheets, Passport integrity, activities, and routes.");

(function () {
  "use strict";

  const ranges = [
    { start: 1, end: 3, id: "unit-10", label: "R1" },
    { start: 4, end: 6, id: "unit-11", label: "R2" },
    { start: 7, end: 9, id: "unit-12", label: "R3" },
    { start: 1, end: 9, id: "unit-13", label: "FINAL", days: 5, title: "Final Review 1–9" }
  ];

  function wordOf(entry) {
    return typeof entry === "string" ? entry : entry?.word || "";
  }

  function uniqueVocabulary(units) {
    const seen = new Set();
    return units.flatMap((unit) => unit.vocabulary || []).filter((entry) => {
      const key = wordOf(entry).toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function uniqueSentences(units) {
    return [...new Set(units.flatMap((unit) => unit.mainSentences || []).filter(Boolean))];
  }

  function uniquePassport(units) {
    const seen = new Set();
    return units.flatMap((unit) => unit.passportSentences || []).filter((entry) => {
      const key = JSON.stringify(entry);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function makeReviewUnit(book, range) {
    const sourceUnits = book.units.slice(range.start - 1, range.end);
    const title = range.title || `Review ${range.start}–${range.end}`;
    const dayCount = range.days || 4;
    return {
      id: range.id,
      bookId: book.id,
      title,
      topic: "Cumulative Review",
      isReview: true,
      reviewLabel: range.label,
      reviewRange: `${range.start}–${range.end}`,
      displayOrder: range.end + 0.5,
      sourceUnitIds: sourceUnits.map((unit) => unit.id),
      vocabulary: uniqueVocabulary(sourceUnits),
      mainSentences: uniqueSentences(sourceUnits),
      passportSentences: uniquePassport(sourceUnits),
      grammarFocus: {
        concept: `${title} cumulative grammar`,
        patterns: uniqueSentences(sourceUnits).slice(0, 12)
      },
      phonics: { review: true, groups: [] },
      materials: { wordwallUrl: "", wordwallDay1Url: "", wordwallDay2Url: "", bookUrl: "" },
      days: Array.from({ length: dayCount }, (_, index) => ({
        day: index + 1,
        objective: [
          "Recognize and answer",
          "Build the question",
          "Correct and combine",
          "Apply across lessons",
          "Complete the final cumulative review"
        ][index]
      })),
      reviewSections: sourceUnits.map((unit, index) => ({
        id: unit.id,
        title: `Unit ${range.start + index}`,
        vocabulary: unit.vocabulary || [],
        mainSentences: unit.mainSentences || [],
        passportSentences: unit.passportSentences || []
      }))
    };
  }

  (window.CURRICULUM_BOOKS || []).forEach((book) => {
    const lessonUnits = (book.units || []).filter((unit) => !unit.isReview).slice(0, 9);
    if (lessonUnits.length < 9) return;
    book.units = [...lessonUnits, ...ranges.map((range) => makeReviewUnit({ ...book, units: lessonUnits }, range))];
  });
})();

(function () {
  "use strict";

  function normalizeUnit(unit) {
    const materials = unit.materials || {};
    const grammarFocus = unit.grammarFocus || {
      concept: unit.topic || unit.title,
      patterns: (unit.mainSentences || []).slice(0, 6)
    };
    return {
      ...unit,
      grammarFocus,
      passportSentences: Array.isArray(unit.passportSentences) ? unit.passportSentences : [],
      days: Array.isArray(unit.days) && unit.days.length === 4
        ? unit.days
        : [1, 2, 3, 4].map((day) => ({ day, objective: ["Learn", "Practise", "Extend", "Apply"][day - 1] })),
      activities: Array.isArray(unit.activities) ? unit.activities : [],
      showBook: unit.showBook || { url: materials.bookUrl || "", title: `Show Book - ${unit.title}` },
      worksheet: unit.worksheet || { enabled: true }
    };
  }

  window.CURRICULUM_BOOKS = (window.CURRICULUM_BOOKS || []).map((book) => ({
    ...book,
    units: (book.units || []).map(normalizeUnit)
  }));
  window.CourseSchema = { normalizeUnit };
})();

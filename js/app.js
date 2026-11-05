(function () {
  "use strict";

  const catalog = Array.isArray(window.COURSE_CATALOG) ? window.COURSE_CATALOG : [];
  const libraryGrid = document.getElementById("library-grid");
  const libraryTitle = document.getElementById("library-title");
  const libraryPath = document.getElementById("library-path");
  const continueButton = document.getElementById("continue-button");
  const continueLabel = document.getElementById("continue-label");

  let selectedBook = null;
  let selectedUnit = null;

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cardMarkup({ number, title, subtitle, action, comingSoon = false }) {
    return `
      <button class="library-card${comingSoon ? " is-coming" : ""}" type="button" data-action="${escapeHtml(action)}" ${comingSoon ? "disabled" : ""}>
        <span class="card-number">${escapeHtml(number)}</span>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(subtitle)}</p>
      </button>
    `;
  }

  function backCard(action, label) {
    return `<button class="library-card back-card" type="button" data-action="${escapeHtml(action)}">← ${escapeHtml(label)}</button>`;
  }

  function renderBooks() {
    selectedBook = null;
    selectedUnit = null;
    libraryTitle.textContent = "Choose a book";
    libraryPath.textContent = "Book → Unit → Lesson";
    libraryGrid.innerHTML = catalog.map((book, index) => cardMarkup({
      number: index + 1,
      title: book.title,
      subtitle: book.units.length ? `${book.subtitle} · ${book.units.filter((unit) => !unit.isReview).length} units + ${book.units.filter((unit) => unit.isReview).length} reviews` : `${book.subtitle} · Coming soon`,
      action: `book:${book.id}`,
      comingSoon: !book.units.length
    })).join("") + cardMarkup({
      number: "SIO 2",
      title: "Sound It Out",
      subtitle: "Phonics Practice · 12 interactive units",
      action: "phonics:sio2"
    }) + cardMarkup({
      number: "THINK",
      title: "素養題練習",
      subtitle: "Context Clues · 情境推理與短閱讀",
      action: "literacy:book1-unit4"
    });
    scrollToTop();
  }

  function dayNumber(lesson, index = 0) {
    return Number(String(lesson?.day || index + 1).match(/\d+/)?.[0]) || index + 1;
  }

  function renderUnits(book) {
    selectedBook = book;
    selectedUnit = null;
    libraryTitle.textContent = "Choose a unit";
    libraryPath.textContent = book.title;
    const displayUnits = book.units.map((unit, index) => ({ unit, index }))
      .sort((a, b) => (a.unit.displayOrder ?? (a.index + 1)) - (b.unit.displayOrder ?? (b.index + 1)));
    libraryGrid.innerHTML = backCard("books", "All books") + displayUnits.map(({ unit, index }) => cardMarkup({
      number: unit.isReview ? unit.reviewLabel : index + 1,
      title: `${unit.title} · ${unit.topic}`,
      subtitle: `${unit.lessons.length} lesson${unit.lessons.length === 1 ? "" : "s"}`,
      action: `unit:${unit.id}`,
      comingSoon: !unit.lessons.length
    })).join("");
    scrollToTop();
  }

  function renderLessons(book, unit) {
    selectedBook = book;
    selectedUnit = unit;
    libraryTitle.textContent = "Choose a lesson";
    libraryPath.textContent = `${book.title}  /  ${unit.title} ${unit.topic}`;
    libraryGrid.innerHTML = backCard(`book:${book.id}`, "All units") + unit.lessons.map((lesson, index) => {
      const minutes = lesson.phases?.reduce((sum, phase) => sum + (Number(phase.duration) || 0), 0)
        ?? lesson.steps.reduce((sum, step) => sum + (Number(step.duration) || 0), 0);
      return cardMarkup({
        number: index + 1,
        title: lesson.title,
        subtitle: `${lesson.day || "Lesson"} · ${lesson.steps.length} steps · ${minutes} min${lesson.dailyHandout ? " · 每日講義 4 面" : ""}`,
        action: `lesson:${lesson.id}`
      });
    }).join("");
    scrollToTop();
  }

  function buildLessonContext(book, unit, lesson) {
    return {
      ...lesson,
      bookId: book.id,
      bookTitle: book.title,
      unitId: unit.id,
      unitTitle: unit.title,
      unitTopic: unit.topic,
      isReview: Boolean(unit.isReview),
      reviewRange: unit.reviewRange || ""
    };
  }

  function findLesson(bookId, unitId, lessonId) {
    const book = catalog.find((item) => item.id === bookId);
    const unit = book?.units.find((item) => item.id === unitId);
    const lesson = unit?.lessons.find((item) => item.id === lessonId);
    return book && unit && lesson ? { book, unit, lesson } : null;
  }

  function openLesson(book, unit, lesson, stepIndex = 0, updateRoute = true) {
    scrollToTop();
    if (updateRoute) window.LessonRoutes.navigate(window.LessonRoutes.pathFor(book.id, unit.id, dayNumber(lesson)));
    window.LessonPlayer.open(buildLessonContext(book, unit, lesson), stepIndex);
  }

  function applyRoute() {
    const route = window.LessonRoutes.parse();
    if (route.phonics) {
      window.PhonicsPractice?.open(route.courseId, route.phonicsUnitId);
      return;
    }
    if (route.literacy) {
      const bankId = `${String(route.literacyBookId).replaceAll("-", "")}-${String(route.literacyUnitId).replaceAll("-", "")}`;
      window.LiteracyPractice?.open(bankId);
      return;
    }
    if (!route.bookId) { renderBooks(); return; }
    const book = catalog.find((item) => item.id === route.bookId);
    if (!book) { renderBooks(); return; }
    if (!route.unitId) { renderUnits(book); return; }
    const unit = book.units.find((item) => item.id === route.unitId);
    if (!unit) { renderUnits(book); return; }
    if (!route.day) { renderLessons(book, unit); return; }
    const lesson = unit.lessons.find((item, index) => dayNumber(item, index) === route.day);
    if (lesson) { selectedBook = book; selectedUnit = unit; openLesson(book, unit, lesson, 0, false); }
    else renderLessons(book, unit);
  }

  function updateContinueLesson() {
    const progress = window.LessonPlayer.getSavedProgress();
    const found = progress && findLesson(progress.bookId, progress.unitId, progress.lessonId);
    if (!found) {
      continueButton.hidden = true;
      return;
    }

    continueButton.hidden = false;
    continueLabel.textContent = `${found.book.title} · ${found.lesson.title} · Step ${Number(progress.stepIndex) + 1}`;
    continueButton.onclick = () => openLesson(found.book, found.unit, found.lesson, progress.stepIndex);
  }

  libraryGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-action]");
    if (!card || card.disabled) return;
    const [type, id] = card.dataset.action.split(":");

    if (type === "books") { window.LessonRoutes.navigate(window.LessonRoutes.pathFor()); renderBooks(); }
    if (type === "book") {
      const book = catalog.find((item) => item.id === id);
      if (book) { window.LessonRoutes.navigate(window.LessonRoutes.pathFor(book.id)); renderUnits(book); }
    }
    if (type === "unit" && selectedBook) {
      const unit = selectedBook.units.find((item) => item.id === id);
      if (unit) { window.LessonRoutes.navigate(window.LessonRoutes.pathFor(selectedBook.id, unit.id)); renderLessons(selectedBook, unit); }
    }
    if (type === "lesson" && selectedBook && selectedUnit) {
      const lesson = selectedUnit.lessons.find((item) => item.id === id);
      if (lesson) openLesson(selectedBook, selectedUnit, lesson);
    }
    if (type === "phonics") {
      window.LessonRoutes.navigate(window.LessonRoutes.phonicsPathFor(id, "unit1"));
      window.PhonicsPractice?.open(id, "unit1");
      window.PhonicsPractice?.showUnits();
    }
    if (type === "literacy") {
      const practiceBank = (window.LITERACY_BANKS || []).find((item) => item.id === id);
      if (practiceBank) {
        window.LessonRoutes.navigate(window.LessonRoutes.literacyPathFor(practiceBank.bookId, practiceBank.unitId));
        window.LiteracyPractice?.open(practiceBank.id);
      }
    }
  });

  window.PhonicsPractice?.init({
    onExit() {
      window.LessonRoutes.navigate(window.LessonRoutes.pathFor(), true);
      renderBooks();
    }
  });

  window.LiteracyPractice?.init({
    onExit() {
      window.LessonRoutes.navigate(window.LessonRoutes.pathFor(), true);
      renderBooks();
    }
  });

  window.LessonPlayer.init({
    onExit() {
      updateContinueLesson();
      if (selectedBook && selectedUnit) {
        window.LessonRoutes.navigate(window.LessonRoutes.pathFor(selectedBook.id, selectedUnit.id), true);
        renderLessons(selectedBook, selectedUnit);
      }
    }
  });
  window.addEventListener("popstate", () => window.location.reload());
  applyRoute();
  updateContinueLesson();
})();

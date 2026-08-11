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
      subtitle: book.units.length ? `${book.subtitle} · ${book.units.length} unit` : `${book.subtitle} · Coming soon`,
      action: `book:${book.id}`,
      comingSoon: !book.units.length
    })).join("");
  }

  function renderUnits(book) {
    selectedBook = book;
    selectedUnit = null;
    libraryTitle.textContent = "Choose a unit";
    libraryPath.textContent = book.title;
    libraryGrid.innerHTML = backCard("books", "All books") + book.units.map((unit, index) => cardMarkup({
      number: index + 1,
      title: `${unit.title} · ${unit.topic}`,
      subtitle: `${unit.lessons.length} lesson${unit.lessons.length === 1 ? "" : "s"}`,
      action: `unit:${unit.id}`,
      comingSoon: !unit.lessons.length
    })).join("");
  }

  function renderLessons(book, unit) {
    selectedBook = book;
    selectedUnit = unit;
    libraryTitle.textContent = "Choose a lesson";
    libraryPath.textContent = `${book.title}  /  ${unit.title} ${unit.topic}`;
    libraryGrid.innerHTML = backCard(`book:${book.id}`, "All units") + unit.lessons.map((lesson, index) => {
      const minutes = lesson.steps.reduce((sum, step) => sum + (Number(step.duration) || 0), 0);
      return cardMarkup({
        number: index + 1,
        title: lesson.title,
        subtitle: `${lesson.day || "Lesson"} · ${lesson.steps.length} steps · ${minutes} min`,
        action: `lesson:${lesson.id}`
      });
    }).join("");
  }

  function buildLessonContext(book, unit, lesson) {
    return {
      ...lesson,
      bookId: book.id,
      bookTitle: book.title,
      unitId: unit.id,
      unitTitle: unit.title,
      unitTopic: unit.topic
    };
  }

  function findLesson(bookId, unitId, lessonId) {
    const book = catalog.find((item) => item.id === bookId);
    const unit = book?.units.find((item) => item.id === unitId);
    const lesson = unit?.lessons.find((item) => item.id === lessonId);
    return book && unit && lesson ? { book, unit, lesson } : null;
  }

  function openLesson(book, unit, lesson, stepIndex = 0) {
    window.LessonPlayer.open(buildLessonContext(book, unit, lesson), stepIndex);
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

    if (type === "books") renderBooks();
    if (type === "book") {
      const book = catalog.find((item) => item.id === id);
      if (book) renderUnits(book);
    }
    if (type === "unit" && selectedBook) {
      const unit = selectedBook.units.find((item) => item.id === id);
      if (unit) renderLessons(selectedBook, unit);
    }
    if (type === "lesson" && selectedBook && selectedUnit) {
      const lesson = selectedUnit.lessons.find((item) => item.id === id);
      if (lesson) openLesson(selectedBook, selectedUnit, lesson);
    }
  });

  window.LessonPlayer.init({
    onExit() {
      updateContinueLesson();
    }
  });
  renderBooks();
  updateContinueLesson();
})();

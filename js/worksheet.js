(function () {
  "use strict";

  let lesson = null;
  let mode = "student";
  let hiddenQuestions = new Set();
  let orders = {};

  const modal = document.getElementById("worksheet-modal");
  const preview = document.getElementById("worksheet-preview");
  const title = document.getElementById("worksheet-title");
  const closeButton = document.getElementById("worksheet-close");
  const studentButton = document.getElementById("worksheet-student-mode");
  const answerButton = document.getElementById("worksheet-answer-mode");
  const shuffleButton = document.getElementById("worksheet-shuffle");
  const resetButton = document.getElementById("worksheet-reset");
  const printButton = document.getElementById("worksheet-print");

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function visibleQuestions(part) {
    const questions = lesson?.worksheet?.blocks?.[part]?.questions || [];
    const order = orders[part] || questions.map((_, index) => index);
    return order.map((index) => questions[index]).filter((question) => question && !hiddenQuestions.has(question.id));
  }

  function questionMarkup(question, index) {
    const choices = question.choices?.length
      ? `<span class="worksheet-choices">${question.choices.map((choice, choiceIndex) => `(${String.fromCharCode(65 + choiceIndex)}) ${escapeHtml(choice)}`).join(" &nbsp; ")}</span>`
      : "";
    const writingLines = question.type === "dialogue" ? 2 : question.type === "choice" ? 0 : 1;
    return `
      <li class="worksheet-question" data-question-id="${escapeHtml(question.id)}">
        <button class="worksheet-remove no-print" type="button" data-remove-question="${escapeHtml(question.id)}" title="Remove this question">×</button>
        <span class="worksheet-question-visual">${escapeHtml(question.visual || "")}</span>
        <div><p>${escapeHtml(question.worksheetPrompt)}</p>${choices}${writingLines ? `<span class="worksheet-answer-line ${writingLines > 1 ? "is-double" : ""}"></span>` : ""}</div>
      </li>`;
  }

  function studentPage(part) {
    const block = lesson.worksheet.blocks[part];
    const questions = visibleQuestions(part);
    return `
      <section class="worksheet-page" data-part="${part}">
        <header class="worksheet-page-header">
          <div><span>BOOK 3 · UNIT 1 · DAY ${escapeHtml(lesson.worksheet.day)}</span><h1>${escapeHtml(lesson.worksheet.unitTitle)}</h1></div>
          <strong>PART ${part}</strong>
        </header>
        <div class="worksheet-name-row"><span>Name 姓名：________________</span><span>Class 班級：____________</span><span>Date 日期：____________</span></div>
        <section class="worksheet-grammar-box"><h2>${escapeHtml(block.title)}</h2><p>${escapeHtml(block.subtitle)}</p></section>
        <h3>Practice 練習</h3>
        <ol class="worksheet-question-list">${questions.map(questionMarkup).join("")}</ol>
        <footer><span>English Teaching Player</span><span>Check every answer before you finish.</span></footer>
      </section>`;
  }

  function answerPage() {
    const parts = ["A", "B"];
    return `
      <section class="worksheet-page worksheet-answer-page">
        <header class="worksheet-page-header teacher-key">
          <div><span>TEACHER ANSWER KEY</span><h1>Book 3 Unit 1 · Day ${escapeHtml(lesson.worksheet.day)}</h1></div>
          <strong>KEY</strong>
        </header>
        <div class="worksheet-answer-columns">
          ${parts.map((part) => {
            const block = lesson.worksheet.blocks[part];
            return `<section><h2>${escapeHtml(block.title)}</h2><ol>${visibleQuestions(part).map((question) => `<li><strong>${escapeHtml(question.answer)}</strong><small>${escapeHtml(question.skill)}</small></li>`).join("")}</ol></section>`;
          }).join("")}
        </div>
        <section class="worksheet-teaching-note"><h2>Teaching Notes 教學提示</h2><p>Player 全班複習後進入 Write Time。Part A、Part B 分兩次完成；先讓學生獨立書寫，再顯示答案進行同儕或全班訂正。</p></section>
      </section>`;
  }

  function render() {
    if (!lesson?.worksheet) return;
    title.textContent = `Book 3 Unit 1 · Day ${lesson.worksheet.day} 講義`;
    studentButton.classList.toggle("is-active", mode === "student");
    answerButton.classList.toggle("is-active", mode === "answer");
    preview.innerHTML = mode === "student" ? studentPage("A") + studentPage("B") : answerPage();
  }

  function setLesson(nextLesson) {
    lesson = nextLesson?.worksheet ? nextLesson : null;
    mode = "student";
    hiddenQuestions = new Set();
    orders = {};
  }

  function open(part = "") {
    if (!lesson?.worksheet) return;
    mode = "student";
    render();
    modal.hidden = false;
    document.body.classList.add("worksheet-open");
    if (part) preview.querySelector(`[data-part="${part}"]`)?.scrollIntoView({ block: "start" });
    closeButton.focus();
  }

  function close() {
    modal.hidden = true;
    document.body.classList.remove("worksheet-open");
  }

  function shuffle(array) {
    const copy = [...array];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-worksheet-close]")) close();
    const remove = event.target.closest("[data-remove-question]");
    if (remove) {
      hiddenQuestions.add(remove.dataset.removeQuestion);
      render();
    }
  });
  studentButton.addEventListener("click", () => { mode = "student"; render(); });
  answerButton.addEventListener("click", () => { mode = "answer"; render(); });
  shuffleButton.addEventListener("click", () => {
    ["A", "B"].forEach((part) => {
      const count = lesson?.worksheet?.blocks?.[part]?.questions?.length || 0;
      orders[part] = shuffle(Array.from({ length: count }, (_, index) => index));
    });
    render();
  });
  resetButton.addEventListener("click", () => {
    hiddenQuestions = new Set();
    orders = {};
    render();
  });
  printButton.addEventListener("click", () => {
    document.body.classList.add("printing-worksheet");
    window.print();
  });
  window.addEventListener("afterprint", () => document.body.classList.remove("printing-worksheet"));

  window.WorksheetBuilder = { setLesson, open, close };
})();

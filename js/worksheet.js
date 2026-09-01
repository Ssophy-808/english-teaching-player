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

  function worksheetParts() {
    const preferredOrder = ["A", "B", "C", "D"];
    const blocks = lesson?.worksheet?.blocks || {};
    return preferredOrder.filter((part) => blocks[part]).concat(Object.keys(blocks).filter((part) => !preferredOrder.includes(part)));
  }

  function questionVisualMarkup(question) {
    const label = question.answer || question.skill || "Question picture";
    if (question.image) {
      return `<img class="worksheet-question-picture" src="${escapeHtml(question.image)}" alt="${escapeHtml(label)}">`;
    }
    if (question.sprite) {
      const cols = Number(question.sprite.cols) || 1;
      const rows = Number(question.sprite.rows) || 1;
      const col = Math.max(0, Number(question.sprite.col) || 0);
      const row = Math.max(0, Number(question.sprite.row) || 0);
      const x = cols > 1 ? col * 100 / (cols - 1) : 0;
      const y = rows > 1 ? row * 100 / (rows - 1) : 0;
      return `<span class="worksheet-question-picture worksheet-question-sprite" role="img" aria-label="${escapeHtml(label)}" style="background-image:url('${escapeHtml(question.sprite.src || "")}');background-size:${cols * 100}% ${rows * 100}%;background-position:${x}% ${y}%"></span>`;
    }
    return question.visual
      ? `<span class="worksheet-question-visual" role="img" aria-label="${escapeHtml(label)}">${escapeHtml(question.visual)}</span>`
      : "";
  }

  function questionMarkup(question, index) {
    const choices = question.choices?.length
      ? `<span class="worksheet-choices">${question.choices.map((choice, choiceIndex) => `(${String.fromCharCode(65 + choiceIndex)}) ${escapeHtml(choice)}`).join(" &nbsp; ")}</span>`
      : "";
    const writingLines = question.type === "dialogue" ? 2 : question.type === "choice" ? 0 : 1;
    return `
      <li class="worksheet-question" data-question-id="${escapeHtml(question.id)}">
        <button class="worksheet-remove no-print" type="button" data-remove-question="${escapeHtml(question.id)}" title="Remove this question">×</button>
        ${questionVisualMarkup(question)}
        <div><p>${escapeHtml(question.worksheetPrompt)}</p>${choices}${Array.from({ length: writingLines }, () => `<span class="worksheet-answer-line" aria-hidden="true"></span>`).join("")}</div>
      </li>`;
  }

  function studentPage(part) {
    const block = lesson.worksheet.blocks[part];
    const questions = visibleQuestions(part);
    return `
      <section class="worksheet-page" data-part="${part}">
        <header class="worksheet-page-header">
          <div><span>${escapeHtml(lesson.bookTitle)} · ${escapeHtml(lesson.unitTitle)} · DAY ${escapeHtml(lesson.worksheet.day)}</span><h1>${escapeHtml(lesson.unitTopic || lesson.worksheet.unitTitle)}</h1></div>
          <strong>PART ${part}</strong>
        </header>
        <div class="worksheet-name-row"><span>Name 姓名：________________</span><span>Class 班級：____________</span><span>Date 日期：____________</span></div>
        <section class="worksheet-grammar-box"><h2>${escapeHtml(block.title)}</h2><p>${escapeHtml(block.subtitle)}</p></section>
        <h3>Practice 練習</h3>
        <ol class="worksheet-question-list">${questions.map(questionMarkup).join("")}</ol>
        <footer><span>English Teaching Player</span><span>Check every answer before you finish.</span></footer>
      </section>`;
  }

  function answerPage(parts, pageIndex) {
    return `
      <section class="worksheet-page worksheet-answer-page">
        <header class="worksheet-page-header teacher-key">
          <div><span>TEACHER ANSWER KEY</span><h1>${escapeHtml(lesson.bookTitle)} ${escapeHtml(lesson.unitTitle)} · Day ${escapeHtml(lesson.worksheet.day)}</h1></div>
          <strong>KEY ${pageIndex + 1}</strong>
        </header>
        <div class="worksheet-answer-columns">
          ${parts.map((part) => {
            const block = lesson.worksheet.blocks[part];
            return `<section><h2>${escapeHtml(block.title)}</h2><ol>${visibleQuestions(part).map((question) => `<li><strong>${escapeHtml(question.answer)}</strong><small>${escapeHtml(question.skill)}</small></li>`).join("")}</ol></section>`;
          }).join("")}
        </div>
        <section class="worksheet-teaching-note"><h2>Teaching Notes 教學提示</h2><p>先用 Player 做全班口說與判斷，再讓學生獨立完成講義；A、B 保留基礎練習，C、D 加入改錯、重組與完整句輸出。</p></section>
      </section>`;
  }

  function answerPages(parts) {
    const groups = [];
    for (let index = 0; index < parts.length; index += 2) groups.push(parts.slice(index, index + 2));
    return groups.map((group, index) => answerPage(group, index)).join("");
  }

  function render() {
    if (!lesson?.worksheet) return;
    title.textContent = `${lesson.bookTitle} ${lesson.unitTitle} · Day ${lesson.worksheet.day} 講義`;
    const parts = worksheetParts();
    studentButton.textContent = `學生版 · ${parts.length} pages`;
    studentButton.classList.toggle("is-active", mode === "student");
    answerButton.classList.toggle("is-active", mode === "answer");
    preview.innerHTML = mode === "student" ? parts.map(studentPage).join("") : answerPages(parts);
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
    worksheetParts().forEach((part) => {
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

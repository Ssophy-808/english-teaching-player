(function () {
  "use strict";

  const TYPE_LABELS = {
    context: "情境判斷",
    "reverse-question": "看回答找問句",
    dialogue: "對話接續",
    "state-inference": "情緒／狀態推理",
    "image-context": "看圖＋情境",
    "multi-clue": "多線索整合",
    "dialogue-cloze": "短對話填空",
    reading: "小閱讀理解"
  };

  let onExit = null;
  let bank = null;
  let questions = [];
  let currentIndex = 0;
  let teacherMode = false;
  let shuffleQuestions = true;
  let state = freshState();
  const elements = {};

  function freshState() {
    return { attempts: 0, selected: -1, correct: false, revealed: false, completed: new Set() };
  }

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }

  function shuffled(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function cacheElements() {
    elements.homeView = document.getElementById("home-view");
    elements.playerView = document.getElementById("player-view");
    elements.phonicsView = document.getElementById("phonics-view");
    elements.view = document.getElementById("literacy-view");
    elements.stage = document.getElementById("literacy-stage");
    elements.title = document.getElementById("literacy-title");
    elements.home = document.getElementById("literacy-home-button");
    elements.banks = document.getElementById("literacy-banks-button");
    elements.teacher = document.getElementById("literacy-teacher-button");
    elements.fullscreen = document.getElementById("literacy-fullscreen-button");
  }

  function expandQuestions(source) {
    return source.flatMap((item) => {
      if (item.type !== "reading") return [{ ...item, sourceType: item.type }];
      return item.questions.map((question, index) => ({
        ...question,
        id: `${item.id}-${question.id || index + 1}`,
        type: "reading",
        sourceType: "reading",
        passageTitle: item.title,
        passage: item.passage,
        grammar: question.grammar || item.grammar,
        difficulty: question.difficulty || item.difficulty
      }));
    });
  }

  function typeLabel(type) { return TYPE_LABELS[type] || type; }
  function difficultyStars(value) {
    const level = Math.max(1, Math.min(3, Number(value) || 1));
    return `${"★".repeat(level)}${"☆".repeat(3 - level)}`;
  }
  function correctChoice(question) { return question.choices[question.answer]; }

  function lineBlock(lines, className) {
    if (!lines?.length) return "";
    const values = Array.isArray(lines) ? lines : [lines];
    return `<div class="${className}">${values.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}</div>`;
  }

  function teacherPanel(question) {
    if (!teacherMode) return "";
    return `<aside class="literacy-teacher-panel">
      <div><span>Question Type</span><strong>${escapeHtml(typeLabel(question.sourceType))}</strong></div>
      <div><span>Grammar</span><strong>${escapeHtml(question.grammar || "—")}</strong></div>
      <div><span>Skill</span><strong>${escapeHtml(question.skill || "Context reasoning")}</strong></div>
      <div><span>Difficulty</span><strong aria-label="Difficulty ${Number(question.difficulty) || 1} out of 3">${difficultyStars(question.difficulty)}</strong></div>
      <div class="literacy-teacher-answer"><span>Answer</span><strong>${String.fromCharCode(65 + question.answer)}. ${escapeHtml(correctChoice(question))}</strong><small>${escapeHtml(question.explanation)}</small></div>
    </aside>`;
  }

  function renderLanding() {
    currentIndex = 0;
    state = freshState();
    const actualCount = expandQuestions(bank.questions).length;
    const typeCount = new Set(bank.questions.map((item) => item.type)).size;
    elements.stage.innerHTML = `<section class="literacy-landing">
      <div class="literacy-landing-copy">
        <span class="literacy-pill">CONTEXT · CLUES · REASONING</span>
        <p class="eyebrow">${escapeHtml(bank.title)}</p>
        <h2>讀懂情境，再選答案。</h2>
        <p>${escapeHtml(bank.scope)}</p>
        <div class="literacy-landing-stats"><span><strong>${actualCount}</strong> 題</span><span><strong>${typeCount}</strong> 種題型</span><span><strong>1</strong> 題一頁</span></div>
      </div>
      <div class="literacy-landing-actions">
        <label><input type="checkbox" data-literacy-shuffle ${shuffleQuestions ? "checked" : ""}> Random order</label>
        <button class="button button-primary" type="button" data-literacy-start>Start Practice</button>
      </div>
    </section>
    <section class="literacy-type-grid">
      ${Object.entries(TYPE_LABELS).map(([key, label]) => `<div><span>${escapeHtml(label)}</span><small>${escapeHtml(key.replaceAll("-", " "))}</small></div>`).join("")}
    </section>`;
  }

  function renderBankPicker() {
    const banks = window.LITERACY_BANKS || [];
    elements.stage.innerHTML = `<section class="literacy-bank-picker">
      <header><p class="eyebrow">LITERACY PRACTICE</p><h2>Choose a unit</h2><p>新增題庫資料後，這裡會自動出現新的 Unit。</p></header>
      <div class="literacy-bank-grid">${banks.map((item) => `<button type="button" data-literacy-bank="${escapeHtml(item.id)}" class="${item.id === bank.id ? "is-current" : ""}"><span>${escapeHtml(item.title)}</span><strong>${escapeHtml(item.subtitle)}</strong><small>${escapeHtml(item.scope)}</small></button>`).join("")}</div>
    </section>`;
  }

  function progressMarkup() {
    const percent = ((currentIndex + 1) / questions.length) * 100;
    return `<div class="literacy-progress"><span style="width:${percent}%"></span></div><strong>${currentIndex + 1} / ${questions.length}</strong>`;
  }

  function revealMarkup(question) {
    if (!state.revealed) return "";
    return `<section class="literacy-answer-panel">
      <p>Correct Answer: <strong>${String.fromCharCode(65 + question.answer)}. ${escapeHtml(correctChoice(question))}</strong></p>
      <h3>Why?</h3>
      <p>${escapeHtml(question.explanation)}</p>
      ${question.reasoning?.length ? `<div class="literacy-reasoning">${question.reasoning.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</div>` : ""}
    </section>`;
  }

  function choiceClass(index, question) {
    if (state.revealed && index === question.answer) return " is-correct";
    if (state.selected === index && state.correct) return " is-correct";
    if (state.selected === index && !state.correct) return " is-wrong";
    return "";
  }

  function renderQuestion() {
    const question = questions[currentIndex];
    const canContinue = state.correct || state.revealed;
    const feedback = state.correct ? "Correct!" : state.attempts ? "Try again!" : "";
    elements.stage.innerHTML = `<section class="literacy-question-shell">
      <header class="literacy-question-top">
        <button class="literacy-back-button" type="button" data-literacy-landing>← Practice Home</button>
        <div>${progressMarkup()}</div>
      </header>
      <div class="literacy-question-layout${teacherMode ? " has-teacher" : ""}">
        <article class="literacy-question-card">
          <div class="literacy-question-heading"><span>${escapeHtml(typeLabel(question.sourceType))}</span><small>${escapeHtml(question.skill || "Read the clues")}</small></div>
          ${question.image ? `<figure class="literacy-picture"><img src="${escapeHtml(question.image)}" alt="${escapeHtml(question.imageAlt || "Question picture")}"></figure>` : ""}
          ${question.passage ? `<section class="literacy-passage"><h3>${escapeHtml(question.passageTitle || "Read")}</h3>${lineBlock(question.passage, "literacy-passage-lines")}</section>` : ""}
          ${lineBlock(question.context, "literacy-context")}
          ${lineBlock(question.dialogue, "literacy-dialogue")}
          <h2>${escapeHtml(question.question)}</h2>
          <div class="literacy-choices">
            ${question.choices.map((choice, index) => `<button class="literacy-choice${choiceClass(index, question)}" type="button" data-literacy-answer="${index}" ${state.revealed || state.correct ? "disabled" : ""}><span>${String.fromCharCode(65 + index)}</span><strong>${escapeHtml(choice)}</strong></button>`).join("")}
          </div>
          <p class="literacy-feedback${state.correct ? " is-correct" : state.attempts ? " is-wrong" : ""}" aria-live="polite">${feedback}</p>
          ${revealMarkup(question)}
          <div class="literacy-question-actions">
            <button class="button button-secondary" type="button" data-literacy-reset>↻ Reset</button>
            ${!state.revealed ? `<button class="button button-secondary" type="button" data-literacy-show>Show Answer</button>` : ""}
            ${canContinue ? `<button class="button button-primary" type="button" data-literacy-next>${currentIndex === questions.length - 1 ? "See Summary" : "Next Question"}</button>` : ""}
          </div>
        </article>
        ${teacherPanel(question)}
      </div>
    </section>`;
  }

  function renderSummary() {
    elements.stage.innerHTML = `<section class="literacy-summary">
      <span>★</span><p class="eyebrow">PRACTICE COMPLETE</p><h2>Great thinking!</h2>
      <p>你完成了 ${questions.length} 題情境式素養練習。</p>
      <div><button class="button button-primary" type="button" data-literacy-restart>Practice Again</button><button class="button button-secondary" type="button" data-literacy-landing>Practice Home</button></div>
    </section>`;
  }

  function startPractice() {
    const all = expandQuestions(bank.questions);
    questions = shuffleQuestions ? shuffled(all) : all;
    currentIndex = 0;
    state = freshState();
    renderQuestion();
  }

  function answerQuestion(index) {
    if (state.revealed) return;
    const question = questions[currentIndex];
    state.selected = index;
    state.attempts += 1;
    state.correct = index === question.answer;
    if (state.correct) state.completed.add(question.id);
    renderQuestion();
  }

  function resetQuestion() {
    const completed = state.completed;
    state = freshState();
    state.completed = completed;
    renderQuestion();
  }

  function nextQuestion() {
    if (currentIndex >= questions.length - 1) return renderSummary();
    const completed = state.completed;
    currentIndex += 1;
    state = freshState();
    state.completed = completed;
    renderQuestion();
  }

  function toggleTeacherMode() {
    teacherMode = !teacherMode;
    elements.teacher.classList.toggle("is-active", teacherMode);
    elements.teacher.textContent = teacherMode ? "✓ Teacher Mode" : "Teacher Mode";
    if (questions.length && elements.stage.querySelector(".literacy-question-card")) renderQuestion();
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else elements.view.requestFullscreen?.();
  }

  function handleClick(event) {
    const answer = event.target.closest("[data-literacy-answer]");
    if (answer) return answerQuestion(Number(answer.dataset.literacyAnswer));
    const bankButton = event.target.closest("[data-literacy-bank]");
    if (bankButton) {
      const selected = (window.LITERACY_BANKS || []).find((item) => item.id === bankButton.dataset.literacyBank);
      if (!selected) return;
      window.LessonRoutes.navigate(window.LessonRoutes.literacyPathFor(selected.bookId, selected.unitId));
      return open(selected.id);
    }
    if (event.target.closest("[data-literacy-start]")) return startPractice();
    if (event.target.closest("[data-literacy-reset]")) return resetQuestion();
    if (event.target.closest("[data-literacy-show]")) { state.revealed = true; state.correct = false; return renderQuestion(); }
    if (event.target.closest("[data-literacy-next]")) return nextQuestion();
    if (event.target.closest("[data-literacy-restart]")) return startPractice();
    if (event.target.closest("[data-literacy-landing]")) return renderLanding();
  }

  function open(bankId = "book1-unit4") {
    bank = (window.LITERACY_BANKS || []).find((item) => item.id === bankId) || window.LITERACY_BANKS?.[0];
    if (!bank) return;
    questions = [];
    elements.homeView.hidden = true;
    elements.playerView.hidden = true;
    elements.phonicsView.hidden = true;
    elements.view.hidden = false;
    document.body.classList.add("is-literacy");
    elements.title.textContent = bank.title;
    renderLanding();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function close() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    elements.view.hidden = true;
    elements.homeView.hidden = false;
    document.body.classList.remove("is-literacy");
    if (typeof onExit === "function") onExit();
  }

  function init(options = {}) {
    cacheElements();
    onExit = options.onExit;
    elements.home.addEventListener("click", close);
    elements.banks.addEventListener("click", renderBankPicker);
    elements.teacher.addEventListener("click", toggleTeacherMode);
    elements.fullscreen.addEventListener("click", toggleFullscreen);
    elements.stage.addEventListener("click", handleClick);
    elements.stage.addEventListener("change", (event) => {
      if (event.target.matches("[data-literacy-shuffle]")) shuffleQuestions = event.target.checked;
    });
    document.addEventListener("fullscreenchange", () => {
      elements.fullscreen.textContent = document.fullscreenElement ? "Exit Fullscreen" : "⛶ Fullscreen";
    });
  }

  window.LiteracyQuestion = { renderQuestion };
  window.ContextQuestion = window.LiteracyQuestion;
  window.LiteracyPractice = { init, open, close };
})();

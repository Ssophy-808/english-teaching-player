(function () {
  "use strict";

  let lesson = null;
  let activeTool = "random";
  let currentWord = null;
  let wordVisible = true;
  let timerSeconds = 60;
  let timerRemaining = 60;
  let timerId = null;
  const scores = { blue: 0, red: 0 };
  const elements = {};

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function words() {
    return lesson?.curriculum?.vocabulary || [];
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function pictureMarkup(item, className = "tool-picture") {
    if (!item) return `<span class="tool-emoji">?</span>`;
    if (item.image) return `<img class="${className}" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.word)}">`;
    if (item.sprite) {
      const cols = Number(item.sprite.cols) || 5;
      const rows = Number(item.sprite.rows) || 2;
      const x = cols > 1 ? Number(item.sprite.col) * 100 / (cols - 1) : 0;
      const y = rows > 1 ? Number(item.sprite.row) * 100 / (rows - 1) : 0;
      const src = item.sprite.src || "assets/images/family-sprite.png";
      return `<span class="tool-sprite ${className}" role="img" aria-label="${escapeHtml(item.word)}" style="background-image:url('${escapeHtml(src)}');background-size:${cols * 100}% ${rows * 100}%;background-position:${x}% ${y}%"></span>`;
    }
    return `<span class="tool-emoji" role="img" aria-label="${escapeHtml(item.word)}">${escapeHtml(item.visual || "🖼️")}</span>`;
  }

  function pickWord() {
    const available = words();
    if (!available.length) return null;
    if (available.length === 1) return available[0];
    let next = randomItem(available);
    while (next === currentWord) next = randomItem(available);
    currentWord = next;
    return next;
  }

  function renderRandom(shouldPick = false) {
    if (shouldPick || !currentWord) pickWord();
    if (!currentWord) {
      elements.stage.innerHTML = `<p class="tool-empty">This lesson has no vocabulary cards yet.</p>`;
      return;
    }
    elements.stage.innerHTML = `
      <article class="random-tool">
        <p class="tool-label">RANDOM VOCABULARY</p>
        <div class="tool-picture-frame">${pictureMarkup(currentWord)}</div>
        <h3 class="random-word ${wordVisible ? "" : "is-hidden"}">${wordVisible ? escapeHtml(currentWord.word) : "? ? ?"}</h3>
        <div class="tool-actions">
          <button type="button" data-tool-action="toggle-word">${wordVisible ? "Hide Word" : "Show Word"}</button>
          <button class="tool-primary" type="button" data-tool-action="random-word">🔀 Next Word</button>
        </div>
      </article>`;
  }

  function renderReveal(shouldPick = false) {
    if (shouldPick || !currentWord) pickWord();
    const covers = Array.from({ length: 9 }, (_, index) => `<button type="button" class="reveal-tile" data-reveal-tile="${index}" aria-label="Reveal tile ${index + 1}">${index + 1}</button>`).join("");
    elements.stage.innerHTML = `
      <article class="reveal-tool">
        <p class="tool-label">WHAT IS IT?</p>
        <div class="reveal-board">
          <div class="reveal-picture">${pictureMarkup(currentWord)}</div>
          <div class="reveal-grid">${covers}</div>
        </div>
        <div class="reveal-answer" hidden>${escapeHtml(currentWord?.word || "")}</div>
        <div class="tool-actions">
          <button type="button" data-tool-action="reveal-all">Reveal All</button>
          <button type="button" data-tool-action="show-reveal-answer">Show Answer</button>
          <button class="tool-primary" type="button" data-tool-action="new-reveal">New Picture</button>
        </div>
      </article>`;
  }

  function renderMemory() {
    const selected = [...words()].sort(() => Math.random() - 0.5).slice(0, 6);
    const cards = selected.flatMap((item, index) => [
      { pair: index, kind: "picture", item },
      { pair: index, kind: "word", item }
    ]).sort(() => Math.random() - 0.5);
    elements.stage.innerHTML = `
      <article class="memory-tool">
        <div class="tool-heading-row"><p class="tool-label">MEMORY MATCH</p><button type="button" data-tool-action="reset-memory">New Game</button></div>
        <p class="memory-status">Match each picture with its word.</p>
        <div class="memory-grid">${cards.map((card, index) => `
          <button type="button" class="memory-card" data-memory-card="${index}" data-pair="${card.pair}">
            <span class="memory-back">?</span>
            <span class="memory-front">${card.kind === "picture" ? pictureMarkup(card.item, "memory-picture") : `<strong>${escapeHtml(card.item.word)}</strong>`}</span>
          </button>`).join("")}</div>
      </article>`;
  }

  function renderDice(value = 1) {
    const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    elements.stage.innerHTML = `
      <article class="dice-tool">
        <p class="tool-label">VIRTUAL DICE</p>
        <div class="dice-face" aria-label="Dice rolled ${value}">${faces[value - 1]}</div>
        <p class="dice-number">${value}</p>
        <button class="tool-primary tool-big-button" type="button" data-tool-action="roll-dice">🎲 Roll the Dice</button>
      </article>`;
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function renderTimer() {
    elements.stage.innerHTML = `
      <article class="timer-tool">
        <p class="tool-label">CLASSROOM TIMER</p>
        <div class="timer-display ${timerRemaining === 0 ? "is-finished" : ""}">${formatTime(timerRemaining)}</div>
        <div class="timer-presets">
          <button type="button" data-timer="30">30 sec</button><button type="button" data-timer="60">1 min</button>
          <button type="button" data-timer="180">3 min</button><button type="button" data-timer="300">5 min</button>
        </div>
        <div class="tool-actions">
          <button class="tool-primary" type="button" data-tool-action="timer-toggle">${timerId ? "Pause" : "Start"}</button>
          <button type="button" data-tool-action="timer-reset">Reset</button>
        </div>
      </article>`;
  }

  function renderScore() {
    elements.stage.innerHTML = `
      <article class="score-tool">
        <p class="tool-label">TEAM SCOREBOARD</p>
        <div class="score-board">
          <section class="team-card team-blue"><h3>BLUE TEAM</h3><strong>${scores.blue}</strong><div><button type="button" data-score="blue:-1">−</button><button type="button" data-score="blue:1">＋</button></div></section>
          <section class="team-card team-red"><h3>RED TEAM</h3><strong>${scores.red}</strong><div><button type="button" data-score="red:-1">−</button><button type="button" data-score="red:1">＋</button></div></section>
        </div>
        <button type="button" data-tool-action="score-reset">Reset Scores</button>
      </article>`;
  }

  function renderActiveTool() {
    elements.tabs.forEach((button) => button.classList.toggle("is-active", button.dataset.tool === activeTool));
    if (activeTool === "random") renderRandom();
    if (activeTool === "reveal") renderReveal();
    if (activeTool === "memory") renderMemory();
    if (activeTool === "dice") renderDice();
    if (activeTool === "timer") renderTimer();
    if (activeTool === "score") renderScore();
  }

  function stopTimer() {
    clearInterval(timerId);
    timerId = null;
  }

  function handleClick(event) {
    const tab = event.target.closest("[data-tool]");
    if (tab) {
      activeTool = tab.dataset.tool;
      renderActiveTool();
      return;
    }

    const action = event.target.closest("[data-tool-action]")?.dataset.toolAction;
    if (action === "random-word") renderRandom(true);
    if (action === "toggle-word") { wordVisible = !wordVisible; renderRandom(); }
    if (action === "new-reveal") renderReveal(true);
    if (action === "reveal-all") elements.stage.querySelectorAll(".reveal-tile").forEach((tile) => tile.classList.add("is-open"));
    if (action === "show-reveal-answer") elements.stage.querySelector(".reveal-answer").hidden = false;
    if (action === "reset-memory") renderMemory();
    if (action === "roll-dice") renderDice(Math.floor(Math.random() * 6) + 1);
    if (action === "timer-reset") { stopTimer(); timerRemaining = timerSeconds; renderTimer(); }
    if (action === "score-reset") { scores.blue = 0; scores.red = 0; renderScore(); }
    if (action === "timer-toggle") {
      if (timerId) stopTimer();
      else if (timerRemaining > 0) timerId = setInterval(() => {
        timerRemaining = Math.max(0, timerRemaining - 1);
        renderTimer();
        if (timerRemaining === 0) stopTimer();
      }, 1000);
      renderTimer();
    }

    const preset = event.target.closest("[data-timer]");
    if (preset) {
      stopTimer();
      timerSeconds = Number(preset.dataset.timer);
      timerRemaining = timerSeconds;
      renderTimer();
    }

    const score = event.target.closest("[data-score]");
    if (score) {
      const [team, change] = score.dataset.score.split(":");
      scores[team] = Math.max(0, scores[team] + Number(change));
      renderScore();
    }

    const tile = event.target.closest("[data-reveal-tile]");
    if (tile) tile.classList.add("is-open");

    const card = event.target.closest("[data-memory-card]");
    if (card && !card.classList.contains("is-matched") && !card.classList.contains("is-open")) {
      const openCards = [...elements.stage.querySelectorAll(".memory-card.is-open:not(.is-matched)")];
      if (openCards.length >= 2) return;
      card.classList.add("is-open");
      if (openCards.length === 1) {
        const first = openCards[0];
        if (first.dataset.pair === card.dataset.pair) {
          first.classList.add("is-matched");
          card.classList.add("is-matched");
        } else {
          setTimeout(() => { first.classList.remove("is-open"); card.classList.remove("is-open"); }, 750);
        }
      }
    }
  }

  function setLesson(nextLesson) {
    lesson = nextLesson;
    currentWord = null;
    wordVisible = true;
  }

  function open() {
    elements.modal.hidden = false;
    document.body.classList.add("toolbox-open");
    renderActiveTool();
    elements.close.focus();
  }

  function close() {
    elements.modal.hidden = true;
    document.body.classList.remove("toolbox-open");
    document.getElementById("toolbox-button")?.focus();
  }

  function init() {
    elements.modal = document.getElementById("toolbox-modal");
    elements.close = document.getElementById("toolbox-close");
    elements.stage = document.getElementById("toolbox-stage");
    elements.tabs = [...document.querySelectorAll("[data-tool]")];
    elements.close.addEventListener("click", close);
    elements.modal.addEventListener("click", handleClick);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !elements.modal.hidden) close();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
  window.ClassroomTools = { open, close, setLesson };
})();

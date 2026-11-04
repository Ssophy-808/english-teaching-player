(function () {
  "use strict";

  const SETTINGS_KEY = "englishTeachingPlayer.phonics.settings.v1";
  const MASTERY_KEY = "englishTeachingPlayer.phonics.mastery.v1";
  const DEFAULT_SETTINGS = {
    mode: "practice",
    questionCount: 14,
    include: ["recognition", "pattern", "listening", "odd"],
    shuffle: true,
    showProgress: true
  };
  function levels() {
    return [
      { id: 1, title: "See the Sound", subtitle: unit.classificationSummary, category: "recognition" },
      { id: 2, title: "Spot the Pattern", subtitle: unit.patternSummary, category: "pattern" },
      { id: 3, title: "Hear the Contrast", subtitle: "Choose between two words", category: "contrast" },
      { id: 4, title: "Listening Choice", subtitle: "Listen and choose from three", category: "listening" },
      { id: 5, title: "Exam Challenge", subtitle: "Same / Different · Odd One Out", category: "challenge" }
    ];
  }

  let onExit = null;
  let course = null;
  let unit = null;
  let settings = loadJson(SETTINGS_KEY, DEFAULT_SETTINGS);
  let mastery = loadJson(MASTERY_KEY, {});
  let session = null;
  let study = null;
  const elements = {};

  function loadJson(key, fallback) {
    try { return { ...fallback, ...JSON.parse(localStorage.getItem(key) || "{}") }; }
    catch (_error) { return { ...fallback }; }
  }

  function saveJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }
  function shuffled(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function take(items, count) {
    if (!items.length || count <= 0) return [];
    const result = [];
    while (result.length < count) result.push(...shuffled(items));
    return result.slice(0, count);
  }
  function wordFor(value) { return unit.words.find((item) => item.word === value); }
  function soundLabel(word) { return unit.soundLabels[word.vowelType] || word.vowelType; }
  function soundIds() { return [...new Set(unit.words.map((word) => word.vowelType))]; }
  function soundChoices() { return soundIds().map((id) => unit.soundLabels[id] || id); }
  function patternFor(id) { return unit.patterns.find((item) => item.id === id); }
  function patternLabel(id) { return patternFor(id)?.display || id; }
  function sessionId(prefix, index) { return `${prefix}-${Date.now()}-${index}`; }

  function cacheElements() {
    elements.homeView = document.getElementById("home-view");
    elements.playerView = document.getElementById("player-view");
    elements.view = document.getElementById("phonics-view");
    elements.stage = document.getElementById("phonics-stage");
    elements.home = document.getElementById("phonics-home-button");
    elements.units = document.getElementById("phonics-units-button");
    elements.settings = document.getElementById("phonics-settings-button");
    elements.courseLabel = document.getElementById("phonics-course-label");
    elements.unitTitle = document.getElementById("phonics-unit-title");
    elements.modal = document.getElementById("phonics-settings-modal");
    elements.form = document.getElementById("phonics-settings-form");
    elements.modalClose = document.getElementById("phonics-settings-close");
  }

  function masteryKey() { return `${course.id}.${unit.id}`; }
  function completedLevel() { return Number(mastery[masteryKey()]?.completedLevel || 0); }
  function setCompletedLevel(level) {
    mastery[masteryKey()] = { ...(mastery[masteryKey()] || {}), completedLevel: Math.max(completedLevel(), level) };
    saveJson(MASTERY_KEY, mastery);
  }

  function renderUnitPicker() {
    session = null;
    study = null;
    elements.stage.innerHTML = `
      <section class="phonics-unit-picker">
        <header><p class="eyebrow">SOUND IT OUT 2</p><h2>Choose a unit</h2><p>每次可選一課，使用五個階段練習該課的發音組合。</p></header>
        <div class="phonics-unit-grid">
          ${course.units.map((item) => `<button class="phonics-unit-card${item.id === unit.id ? " is-current" : ""}" type="button" data-phonics-unit="${escapeHtml(item.id)}">
            <span>UNIT ${item.number}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.classificationSummary)}</small>
          </button>`).join("")}
        </div>
      </section>`;
  }

  function renderHome() {
    session = null;
    study = null;
    const complete = completedLevel();
    const modeLabel = settings.mode === "quiz" ? "Quiz Mode" : "Practice Mode";
    const unitLevels = levels();
    elements.stage.innerHTML = `
      <div class="phonics-unit-switcher"><p>Unit ${unit.number} · ${escapeHtml(unit.title)}</p><button type="button" data-choose-unit>Change Unit</button></div>
      <section class="phonics-welcome">
        <div>
          <span class="phonics-mode-pill">${escapeHtml(modeLabel)}</span>
          <p class="eyebrow">SEE → SORT → HEAR → CHOOSE → CHALLENGE</p>
          <h2>Build the sound one small step at a time.</h2>
          <p>One question at a time. Finish a level to unlock the next one.</p>
        </div>
        <button class="button button-primary phonics-quiz-start" type="button" data-start-quiz>${settings.mode === "quiz" ? "Start Quiz" : "Start Mixed Practice"}</button>
      </section>
      <section class="phonics-level-grid" aria-label="Practice levels">
        ${unitLevels.map((level) => {
          const locked = level.id > complete + 1;
          const done = level.id <= complete;
          return `<article class="phonics-level-card${locked ? " is-locked" : ""}${done ? " is-done" : ""}">
            <span class="phonics-level-number">${done ? "✓" : level.id}</span>
            <div><p>LEVEL ${level.id}</p><h3>${escapeHtml(level.title)}</h3><small>${escapeHtml(level.subtitle)}</small></div>
            <button type="button" data-start-level="${level.id}" ${locked ? "disabled" : ""}>${locked ? "Locked" : done ? "Practice Again" : "Start"}</button>
          </article>`;
        }).join("")}
      </section>
      <section class="phonics-extra-panel">
        <div><p class="eyebrow">MORE WAYS TO PRACTICE</p><h2>Low-pressure activities</h2></div>
        <div class="phonics-extra-actions">
          <button type="button" data-extra="sound-sort">Sound Group Sort</button>
          <button type="button" data-extra="pattern-sort">Pattern Sort</button>
          <button type="button" data-extra="flip">Flip Cards</button>
          <button type="button" data-extra="read">Read First</button>
          <button type="button" data-extra="mystery">Mystery Word</button>
        </div>
      </section>
      ${unit.wordwall.url ? `<a class="phonics-wordwall" href="${escapeHtml(unit.wordwall.url)}" target="_blank" rel="noopener">${escapeHtml(unit.wordwall.label)}</a>` : `<p class="phonics-placeholder-note">Wordwall link placeholder — add the URL in <code>data/phonics-data.js</code>.</p>`}
    `;
  }

  function recognitionQuestions(count, prefix = "recognition") {
    const groups = soundIds();
    const perGroup = Math.max(1, Math.ceil(count / groups.length));
    const pool = groups.flatMap((id) => take(unit.words.filter((word) => word.vowelType === id), perGroup));
    return take(pool, count).map((word, index) => ({
      id: sessionId(prefix, index), category: "recognition", type: "choice", prompt: unit.recognitionPrompt, displayWord: word.word,
      answer: soundLabel(word), choices: soundChoices(), word,
      hint: "Look at the spelling and say the target sound slowly."
    }));
  }

  function patternQuestions(count, prefix = "pattern") {
    return take(unit.words.filter((word) => word.core), count).map((word, index) => ({
      id: sessionId(prefix, index), category: "pattern", type: "choice", prompt: "Which pattern?", displayWord: word.word,
      answer: patternLabel(word.pattern), choices: unit.patterns.map((pattern) => pattern.display), word,
      hint: "Look for the letters making the target sound."
    }));
  }

  function contrastQuestions(count) {
    return take(unit.contrastPairs, count).map((pair, index) => {
      const answer = pair[Math.floor(Math.random() * pair.length)];
      return { id: sessionId("contrast", index), category: "listening", type: "audio-choice", prompt: "Listen. Which word do you hear?",
        audioWord: wordFor(answer), answer, choices: pair, hint: "Listen to the middle vowel sound." };
    });
  }

  function listeningQuestions(count) {
    const pool = unit.words;
    return take(pool, count).map((answerWord, index) => {
      const otherSound = pool.filter((word) => word.vowelType !== answerWord.vowelType && word.word !== answerWord.word);
      const sameSound = pool.filter((word) => word.vowelType === answerWord.vowelType && word.word !== answerWord.word);
      const distractors = shuffled([...otherSound, ...sameSound]).filter((word, position, all) => all.findIndex((item) => item.word === word.word) === position);
      const choices = shuffled([answerWord.word, ...take(distractors, 2).map((word) => word.word)]);
      return { id: sessionId("listening", index), category: "listening", type: "audio-choice", prompt: "Listen and choose.",
        audioWord: answerWord, answer: answerWord.word, choices, hint: "Replay the sound, then compare the vowel." };
    });
  }

  function sameDifferentQuestions(count) {
    const pool = unit.words;
    return take(pool, count).map((displayWord, index) => {
      const same = Math.random() >= 0.5;
      const candidates = pool.filter((word) => word.word !== displayWord.word && (same ? word.vowelType === displayWord.vowelType : word.vowelType !== displayWord.vowelType));
      const audioWord = take(candidates.length ? candidates : pool.filter((word) => word.word !== displayWord.word), 1)[0];
      return { id: sessionId("same-different", index), category: "same-different", type: "audio-choice",
        prompt: "Does the audio have the same target sound?", displayWord: displayWord.word, audioWord,
        answer: same ? "Same" : "Different", choices: ["Same", "Different"], word: displayWord,
        hint: "Compare the target sound, not the whole word." };
    });
  }

  function oddQuestions(count) {
    const groups = soundIds().map((id) => unit.words.filter((word) => word.vowelType === id)).filter((items) => items.length);
    return Array.from({ length: count }, (_unused, index) => {
      const pairGroup = groups[index % groups.length];
      const oddGroup = groups[(index + 1) % groups.length] || groups[0];
      const pair = take(pairGroup, 2);
      const odd = take(oddGroup, 1)[0];
      return { id: sessionId("odd", index), category: "odd", type: "choice", prompt: "Which word has a different target sound?",
        answer: odd.word, choices: shuffled([...pair.map((word) => word.word), odd.word]), word: odd,
        explanationWords: [...pair, odd], hint: "Read each word and compare its vowel sound." };
    });
  }

  function mysteryQuestions(count) {
    return take(unit.words.filter((word) => word.core), count).map((word, index) => ({
      id: sessionId("mystery", index), category: "pattern", type: "choice", prompt: "Find the mystery word.",
      displayHtml: `<span>${escapeHtml(unit.focus)}</span><span>${escapeHtml(patternLabel(word.pattern))}</span><span>${escapeHtml(word.clue)}</span>`,
      answer: word.word, choices: shuffled([word.word, ...take(unit.words.filter((item) => item.core && item.word !== word.word), 3).map((item) => item.word)]),
      word, hint: "Use the sound, pattern, and first-letter clue."
    }));
  }

  function questionsForLevel(level) {
    if (level === 1) return recognitionQuestions(8);
    if (level === 2) return patternQuestions(8);
    if (level === 3) return contrastQuestions(6);
    if (level === 4) return listeningQuestions(6);
    return [...sameDifferentQuestions(4), ...oddQuestions(2)];
  }

  function quizQuestions() {
    const total = Number(settings.questionCount) || 14;
    const enabled = settings.include.length ? settings.include : DEFAULT_SETTINGS.include;
    const plan = total === 14 && enabled.length === 4
      ? { recognition: 4, pattern: 4, listening: 4, odd: 2 }
      : enabled.reduce((map, key, index) => ({ ...map, [key]: Math.floor(total / enabled.length) + (index < total % enabled.length ? 1 : 0) }), {});
    const generators = { recognition: recognitionQuestions, pattern: patternQuestions, listening: listeningQuestions, odd: oddQuestions };
    return enabled.flatMap((key) => generators[key](plan[key] || 0));
  }

  function startSession(title, questions, options = {}) {
    session = {
      title, questions: settings.shuffle ? shuffled(questions).map((q) => ({ ...q, choices: settings.shuffle ? shuffled(q.choices) : q.choices })) : questions,
      index: 0, mode: options.mode || settings.mode, level: options.level || 0, answers: [], wrongIds: new Set(), attempts: 0,
      answered: false, feedback: "", showHint: false, retrySource: options.retrySource || null
    };
    study = null;
    renderQuestion();
  }

  function progressMarkup() {
    if (!settings.showProgress) return "";
    const current = session.index + 1;
    const total = session.questions.length;
    return `<div class="phonics-progress"><span style="width:${(current / total) * 100}%"></span></div><p class="phonics-progress-label">${current} / ${total}</p>`;
  }

  function renderQuestion() {
    const question = session.questions[session.index];
    const canNext = session.answered;
    const isPractice = session.mode === "practice";
    elements.stage.innerHTML = `
      <section class="phonics-question-shell">
        <header><button type="button" class="phonics-back-link" data-phonics-home>← Levels</button><div><p>${escapeHtml(session.title)}</p>${progressMarkup()}</div></header>
        <article class="phonics-question-card">
          <p class="phonics-question-type">${escapeHtml(question.category.replaceAll("-", " "))}</p>
          <h2>${escapeHtml(question.prompt)}</h2>
          ${question.audioWord ? `<button class="phonics-audio-button" type="button" data-play-word="${escapeHtml(question.audioWord.word)}">▶ Play Sound <small>${question.audioWord.audio ? "Recorded audio" : "Browser voice fallback"}</small></button>` : ""}
          ${question.displayWord ? `<div class="phonics-focus-word">${escapeHtml(question.displayWord)}</div>` : ""}
          ${question.displayHtml ? `<div class="phonics-mystery-clues">${question.displayHtml}</div>` : ""}
          <div class="phonics-choice-grid ${question.choices.length > 2 ? "has-many" : ""}">
            ${question.choices.map((choice) => `<button type="button" data-answer="${escapeHtml(choice)}" ${session.mode === "quiz" && session.answered ? "disabled" : ""}>${escapeHtml(choice)}</button>`).join("")}
          </div>
          <div class="phonics-feedback ${session.feedback.startsWith("Correct") ? "is-correct" : session.feedback ? "is-try" : ""}" aria-live="polite">
            ${session.feedback ? `<strong>${escapeHtml(session.feedback)}</strong>` : ""}
            ${session.feedback.startsWith("Correct") ? `<span>${escapeHtml(explanation(question))}</span>` : ""}
            ${session.showHint && !session.answered ? `<span>${escapeHtml(question.hint)}</span>` : ""}
          </div>
          <div class="phonics-question-actions">
            ${isPractice && session.attempts >= 2 && !session.answered && !session.showHint ? `<button type="button" class="button button-secondary" data-show-hint>Show Hint</button>` : ""}
            ${canNext ? `<button type="button" class="button button-primary" data-next-question>${session.index === session.questions.length - 1 ? "See Results" : "Next"}</button>` : ""}
          </div>
        </article>
      </section>`;
  }

  function explanation(question) {
    const item = question.word || question.audioWord;
    if (question.category === "odd") return question.explanationWords.map((word) => `${word.word} → ${soundLabel(word)}`).join(" · ");
    if (!item) return question.answer;
    return item.core ? `${soundLabel(item)} · ${patternLabel(item.pattern)}` : soundLabel(item);
  }

  function answerQuestion(value) {
    if (!session || session.answered) return;
    const question = session.questions[session.index];
    const correct = value === question.answer;
    if (session.mode === "quiz") {
      session.answered = true;
      session.answers.push({ question, value, correct, firstTry: correct });
      if (!correct) session.wrongIds.add(question.id);
      session.feedback = "Answer saved.";
      renderQuestion();
      return;
    }
    session.attempts += 1;
    if (!correct) {
      session.wrongIds.add(question.id);
      session.feedback = "Try again.";
      renderQuestion();
      return;
    }
    session.answered = true;
    const firstTry = session.attempts === 1;
    session.answers.push({ question, value, correct: firstTry, firstTry });
    session.feedback = "Correct!";
    renderQuestion();
  }

  function nextQuestion() {
    if (session.index >= session.questions.length - 1) { renderResults(); return; }
    session.index += 1;
    session.attempts = 0;
    session.answered = false;
    session.feedback = "";
    session.showHint = false;
    renderQuestion();
  }

  function categoryLabel(category) {
    return ({ recognition: "Sound Groups", pattern: "Pattern", listening: "Listening", "same-different": "Same / Different", odd: "Odd One Out" })[category] || category;
  }

  function resultRows() {
    const groups = {};
    session.answers.forEach((answer) => {
      const key = answer.question.category;
      groups[key] ||= { correct: 0, total: 0 };
      groups[key].total += 1;
      if (answer.correct) groups[key].correct += 1;
    });
    return Object.entries(groups).map(([key, result]) => `<li><span>${escapeHtml(categoryLabel(key))}</span><strong>${result.correct} / ${result.total}</strong></li>`).join("");
  }

  function patternMastery() {
    return unit.patterns.map((pattern) => {
      const answers = session.answers.filter((answer) => (answer.question.word || answer.question.audioWord)?.pattern === pattern.id);
      const correct = answers.filter((answer) => answer.correct).length;
      const symbol = !answers.length ? "—" : correct === answers.length ? "✓" : correct >= Math.ceil(answers.length / 2) ? "△" : "○";
      return `<li><span>${escapeHtml(pattern.display)}</span><strong>${symbol}</strong></li>`;
    }).join("");
  }

  function commonDifficulty() {
    const wrong = session.answers.filter((answer) => !answer.correct);
    if (!wrong.length) return "No common difficulty yet.";
    const counts = {};
    wrong.forEach((answer) => {
      const item = answer.question.word || answer.question.audioWord;
      const key = item?.pattern && patternFor(item.pattern) ? patternLabel(item.pattern) : categoryLabel(answer.question.category);
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  function renderResults() {
    if (session.level) setCompletedLevel(session.level);
    const correct = session.answers.filter((answer) => answer.correct).length;
    const total = session.answers.length;
    const wrongQuestions = session.questions.filter((question) => session.wrongIds.has(question.id));
    elements.stage.innerHTML = `
      <section class="phonics-results">
        <div class="phonics-results-hero"><span>★</span><p>Great job!</p><h2>${escapeHtml(unit.resultTitle)}</h2><strong>${correct} / ${total} correct</strong></div>
        <div class="phonics-results-grid">
          <section><h3>Skill breakdown</h3><ul>${resultRows()}</ul></section>
          <section><h3>Patterns</h3><ul>${patternMastery()}</ul></section>
        </div>
        <p class="phonics-difficulty"><span>Common difficulty</span><strong>${escapeHtml(commonDifficulty())}</strong></p>
        <div class="phonics-result-actions">
          ${wrongQuestions.length ? `<button class="button button-primary" type="button" data-retry-wrong>Practice Wrong Answers (${wrongQuestions.length})</button>` : ""}
          <button class="button button-secondary" type="button" data-phonics-home>Back to Levels</button>
        </div>
      </section>`;
    session.resultWrongQuestions = wrongQuestions;
  }

  function playWord(value) {
    const item = wordFor(value);
    if (!item) return;
    if (item.audio) {
      new Audio(item.audio).play().catch(() => speak(item.word));
      return;
    }
    speak(item.word);
  }

  function speak(value) {
    if (!unit.audioPolicy.useBrowserTtsFallback || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = unit.audioPolicy.locale || "en-US";
    utterance.rate = 0.78;
    window.speechSynthesis.speak(utterance);
  }

  function startStudy(type) {
    if (type === "sound-sort") return startSession("Sound Group Sort", recognitionQuestions(10, "sound-sort"), { mode: "practice" });
    if (type === "pattern-sort") return startSession("Pattern Sort", patternQuestions(8, "pattern-sort"), { mode: "practice" });
    if (type === "mystery") return startSession("Mystery Word", mysteryQuestions(6), { mode: "practice" });
    study = { type, words: shuffled(unit.words.filter((word) => word.core)), index: 0, revealed: false };
    session = null;
    renderStudy();
  }

  function renderStudy() {
    const word = study.words[study.index];
    const isFlip = study.type === "flip";
    elements.stage.innerHTML = `
      <section class="phonics-question-shell">
        <header><button type="button" class="phonics-back-link" data-phonics-home>← Levels</button><div><p>${isFlip ? "Flip Cards" : "Read First"}</p><p class="phonics-progress-label">${study.index + 1} / ${study.words.length}</p></div></header>
        <article class="phonics-question-card phonics-study-card ${study.revealed ? "is-revealed" : ""}">
          <p class="phonics-question-type">${isFlip ? "READ · THINK · FLIP" : "SAY IT BEFORE YOU CHECK"}</p>
          <div class="phonics-focus-word">${escapeHtml(word.word)}</div>
          ${study.revealed ? `<div class="phonics-card-answer"><strong>${escapeHtml(soundLabel(word))}</strong><span>${escapeHtml(patternLabel(word.pattern))}</span><button type="button" data-play-word="${escapeHtml(word.word)}">▶ Play Sound</button></div>` : ""}
          <div class="phonics-question-actions">
            ${!study.revealed ? `<button class="button button-primary" type="button" data-study-reveal>${isFlip ? "Check" : "Show Sound"}</button>` : `<button class="button button-primary" type="button" data-study-next>${study.index === study.words.length - 1 ? "Finish" : "Next"}</button>`}
          </div>
        </article>
      </section>`;
  }

  function openSettings() {
    const form = elements.form;
    form.elements["phonics-mode"].value = settings.mode;
    form.elements.questionCount.value = String(settings.questionCount);
    form.querySelectorAll('[name="include"]').forEach((input) => { input.checked = settings.include.includes(input.value); });
    form.elements.shuffle.checked = settings.shuffle;
    form.elements.showProgress.checked = settings.showProgress;
    elements.modal.hidden = false;
  }
  function closeSettings() { elements.modal.hidden = true; }
  function saveSettings(event) {
    event.preventDefault();
    const data = new FormData(elements.form);
    settings = {
      mode: data.get("phonics-mode") || "practice",
      questionCount: Number(data.get("questionCount")) || 14,
      include: data.getAll("include"),
      shuffle: data.has("shuffle"), showProgress: data.has("showProgress")
    };
    if (!settings.include.length) settings.include = [...DEFAULT_SETTINGS.include];
    saveJson(SETTINGS_KEY, settings);
    closeSettings();
    renderHome();
  }

  function handleStageClick(event) {
    const answer = event.target.closest("[data-answer]");
    if (answer) return answerQuestion(answer.dataset.answer);
    const level = event.target.closest("[data-start-level]");
    if (level) {
      const number = Number(level.dataset.startLevel);
      return startSession(`Level ${number} · ${levels()[number - 1].title}`, questionsForLevel(number), { mode: "practice", level: number });
    }
    const unitButton = event.target.closest("[data-phonics-unit]");
    if (unitButton) {
      const unitId = unitButton.dataset.phonicsUnit;
      window.LessonRoutes.navigate(window.LessonRoutes.phonicsPathFor(course.id, unitId));
      return open(course.id, unitId);
    }
    if (event.target.closest("[data-choose-unit]")) return renderUnitPicker();
    const extra = event.target.closest("[data-extra]");
    if (extra) return startStudy(extra.dataset.extra);
    const play = event.target.closest("[data-play-word]");
    if (play) return playWord(play.dataset.playWord);
    if (event.target.closest("[data-next-question]")) return nextQuestion();
    if (event.target.closest("[data-show-hint]")) { session.showHint = true; return renderQuestion(); }
    if (event.target.closest("[data-start-quiz]")) return startSession(settings.mode === "quiz" ? `Unit ${unit.number} · Quick Quiz` : `Unit ${unit.number} · Mixed Practice`, quizQuestions(), { mode: settings.mode });
    if (event.target.closest("[data-retry-wrong]")) return startSession("Practice Wrong Answers", session.resultWrongQuestions, { mode: "practice", retrySource: session });
    if (event.target.closest("[data-study-reveal]")) { study.revealed = true; return renderStudy(); }
    if (event.target.closest("[data-study-next]")) {
      if (study.index >= study.words.length - 1) return renderHome();
      study.index += 1; study.revealed = false; return renderStudy();
    }
    if (event.target.closest("[data-phonics-home]")) renderHome();
  }

  function open(courseId = "sio2", unitId = "unit1") {
    course = (window.PHONICS_COURSES || []).find((item) => item.id === courseId) || window.PHONICS_COURSES?.[0];
    unit = course?.units.find((item) => item.id === unitId) || course?.units[0];
    if (!course || !unit) return;
    elements.homeView.hidden = true;
    elements.playerView.hidden = true;
    elements.view.hidden = false;
    document.body.classList.add("is-phonics");
    elements.courseLabel.textContent = `${course.title} · ${course.subtitle}`;
    elements.unitTitle.textContent = `Unit ${unit.number} · ${unit.title}`;
    renderHome();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function close() {
    window.speechSynthesis?.cancel();
    elements.view.hidden = true;
    elements.homeView.hidden = false;
    document.body.classList.remove("is-phonics");
    closeSettings();
    if (typeof onExit === "function") onExit();
  }

  function showUnits() {
    if (course && unit) renderUnitPicker();
  }

  function init(options = {}) {
    cacheElements();
    onExit = options.onExit;
    elements.home.addEventListener("click", close);
    elements.units.addEventListener("click", renderUnitPicker);
    elements.settings.addEventListener("click", openSettings);
    elements.modalClose.addEventListener("click", closeSettings);
    elements.modal.addEventListener("click", (event) => { if (event.target === elements.modal) closeSettings(); });
    elements.form.addEventListener("submit", saveSettings);
    elements.stage.addEventListener("click", handleStageClick);
  }

  window.PhonicsPractice = { init, open, close, showUnits };
})();

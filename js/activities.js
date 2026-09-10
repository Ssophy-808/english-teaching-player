(function () {
  "use strict";

  const TYPE_LABELS = {
    warmup: "Warm Up",
    presentation: "Presentation",
    vocabulary: "Vocabulary",
    practice: "Practice",
    grammar: "Sentence Pattern",
    speaking: "Speaking",
    game: "Game",
    phonics: "Phonics",
    break: "Break Time",
    showbook: "Show Book",
    quiz: "Quiz",
    writing: "Writing",
    check: "Check",
    homework: "Homework"
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getTypeLabel(type) {
    return TYPE_LABELS[type] || "Lesson Step";
  }

  function renderPictureAsset(asset, imageClass, visualClass) {
    if (asset.image) return `<img class="${imageClass}" src="${escapeHtml(asset.image)}" alt="${escapeHtml(asset.word || "Teaching picture")}">`;
    if (asset.sprite) {
      const cols = Number(asset.sprite.cols) || 5;
      const rows = Number(asset.sprite.rows) || 2;
      const x = cols > 1 ? Number(asset.sprite.col) * 100 / (cols - 1) : 0;
      const y = rows > 1 ? Number(asset.sprite.row) * 100 / (rows - 1) : 0;
      const src = asset.sprite.src || "assets/images/family-sprite.png";
      return `<span class="image-sprite" role="img" aria-label="${escapeHtml(asset.word || "Teaching picture")}" style="background-image:url('${escapeHtml(src)}');background-size:${cols * 100}% ${rows * 100}%;background-position:${x}% ${y}%"></span>`;
    }
    return `<span class="${visualClass}" role="img" aria-label="${escapeHtml(asset.word || "Teaching picture")}">${escapeHtml(asset.visual || "🖼️")}</span>`;
  }

  function renderVocabularyStep(step, duration) {
    const word = step.word || step.vocabulary?.[0] || {};
    const image = renderPictureAsset(word, "word-image", "word-visual");
    const meaning = word.meaning
      ? `<p class="word-meaning">${escapeHtml(word.meaning)}</p>`
      : "";

    return `
      <article class="step-card vocabulary-card" data-step-type="vocabulary">
        <div class="step-meta">
          <span class="phase-badge">${escapeHtml(step.phaseTitle || "Vocabulary")} · ${escapeHtml(step.wordIndex)} / ${escapeHtml(step.wordTotal)}</span>
          ${duration}
        </div>
        <div class="word-picture">${image}</div>
        <h2 class="word-title">${escapeHtml(word.word)}</h2>
        ${meaning}
        ${word.audio
          ? `<button class="audio-play-button" type="button" data-audio-src="${escapeHtml(word.audio)}">▶ Play audio</button>`
          : `<p class="word-prompt">Repeat after your teacher.</p>`}
      </article>
    `;
  }

  function renderWordSpellingStep(step, duration) {
    const word = step.word || {};
    const image = renderPictureAsset(word, "word-spelling-image", "word-spelling-visual");
    const syllables = (step.spellingSyllables || []).map((syllable) => `
      <span class="spelling-syllable">
        ${syllable.map((part) => part.blank
          ? `<span class="spelling-blank" aria-label="missing letter"></span>`
          : `<span class="spelling-given">${escapeHtml(part.text)}</span>`
        ).join("")}
      </span>
    `).join('<span class="syllable-divider" aria-hidden="true">|</span>');

    return `
      <article class="step-card word-spelling-card" data-step-type="spelling">
        <div class="step-meta">
          <span class="phase-badge">${escapeHtml(step.phaseTitle || "Spelling Focus")} · ${escapeHtml(step.promptIndex)} / ${escapeHtml(step.promptTotal)}</span>
          ${duration}
        </div>
        <div class="word-spelling-layout">
          <div class="word-spelling-picture">${image}</div>
          <div class="word-spelling-work">
            <p class="step-kicker">Listen · Sound it out · Write</p>
            <div class="spelling-pattern" role="img" aria-label="${escapeHtml(step.accessiblePattern || "Complete the missing letters")}">${syllables}</div>
            <p class="word-spelling-prompt">Say the syllables. Write the missing letters.</p>
          </div>
        </div>
      </article>
    `;
  }

  function flowGameContent(step) {
    const words = step.vocabulary || [];
    const sentences = step.mainSentences || [];
    const index = Number(step.gameRound || 0);
    const word = words[index % Math.max(words.length, 1)] || {};
    const sentence = sentences[index % Math.max(sentences.length, 1)] || "Use today’s sentence pattern.";
    if (step.gameScope === "vocabulary") {
      const picture = renderPictureAsset(word, "flow-game-image", "flow-game-visual");
      const isReveal = step.activeGame === "reveal";
      return `
        <div class="flow-game-play ${isReveal && !step.isRevealed ? "is-covered" : ""}">
          <div class="flow-game-picture">${picture}<button class="reveal-cover" type="button" data-game-reveal>?</button></div>
          <h3>${step.activeGame === "random" || step.isRevealed ? escapeHtml(word.word) : "Say the word!"}</h3>
          ${step.activeGame === "dice" ? `<p class="dice-result">🎲 ${(index % 6) + 1}</p>` : ""}
        </div>`;
    }
    const question = sentences.find((item) => item.includes("?")) || sentence;
    const answer = sentences.find((item) => !item.includes("?")) || sentence;
    const prompt = step.activeGame === "sentence-match" ? question
      : step.activeGame === "substitution" ? sentence.replace(/\b(boy|girl|man|woman|student|teacher)\b/i, "____")
        : step.activeGame === "dice-qa" ? `🎲 ${(index % 6) + 1} · ${question}`
          : step.activeGame === "quick-response" ? question : sentence;
    return `
      <div class="flow-game-play grammar-game-play">
        <p class="game-mode-label">${escapeHtml(step.suggestedGames.find((game) => game.id === step.activeGame)?.title || "Grammar Game")}</p>
        <h3>${escapeHtml(prompt)}</h3>
        <button class="button button-secondary" type="button" data-game-reveal>${step.isRevealed ? "Hide answer" : "Show answer"}</button>
        ${step.isRevealed ? `<p class="grammar-model-answer">${escapeHtml(answer)}</p>` : ""}
      </div>`;
  }

  function renderFlowGamesStep(step, duration) {
    const words = (step.vocabulary || []).map((item) => `<span>${escapeHtml(item.word)}</span>`).join("");
    const gameButtons = (step.suggestedGames || []).map((game) => `
      <button class="flow-game-choice ${step.activeGame === game.id ? "is-active" : ""}" type="button" data-flow-game="${escapeHtml(game.id)}">
        <strong>${escapeHtml(game.title)}</strong>
      </button>`).join("");
    const ideas = (step.activityIdeas || []).slice(0, 4).map((idea) => `
      <article class="activity-idea"><img src="${escapeHtml(idea.image)}" alt=""><span>${escapeHtml(idea.title)}</span></article>`).join("");
    return `
      <article class="step-card flow-games-card" data-step-type="game">
        <div class="step-meta"><span class="phase-badge">${escapeHtml(step.phaseTitle)}</span>${duration}</div>
        <div class="flow-games-heading">
          <div><p class="step-kicker">TEACH → PLAY → CHECK</p><h2>${escapeHtml(step.title)}</h2></div>
          <span class="game-status ${step.completed ? "is-complete" : ""}">${step.completed ? "✓ 已完成" : "尚未標記"}</span>
        </div>
        ${step.gameScope === "vocabulary" ? `<div class="taught-word-list"><strong>已教單字</strong>${words}</div>` : `<div class="taught-word-list"><strong>本課句型</strong>${(step.mainSentences || []).slice(0, 6).map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</div>`}
        <div class="flow-game-layout">
          <div class="flow-game-menu">${gameButtons}</div>
          <div class="flow-game-stage">${step.activeGame ? flowGameContent(step) : `<div class="game-empty"><span>🎮</span><p>選一個遊戲開始</p></div>`}</div>
        </div>
        ${ideas ? `<div class="activity-ideas"><strong>教材活動建議</strong><div>${ideas}</div></div>` : ""}
        <div class="flow-game-actions">
          <button class="button button-secondary" type="button" data-game-replay ${step.activeGame ? "" : "disabled"}>↻ 重新玩</button>
          <button class="button button-primary" type="button" data-game-complete>✓ 標記完成</button>
          <button class="button button-quiet" type="button" data-game-skip>跳過這一階段</button>
        </div>
      </article>`;
  }

  function renderGrammarCheck(step, duration) {
    const sentences = step.mainSentences || [];
    const index = Number(step.checkIndex || 0) % Math.max(sentences.length, 1);
    const prompt = sentences[index] || "Say one complete sentence.";
    return `
      <article class="step-card grammar-check-card" data-step-type="check">
        <div class="step-meta"><span class="phase-badge">Grammar Check</span>${duration}</div>
        <p class="step-kicker">READY TO MOVE ON?</p><h2>口說／理解檢核</h2>
        <p class="grammar-check-prompt">${escapeHtml(prompt)}</p>
        <button class="button button-secondary" type="button" data-check-answer>${step.checkRevealed ? "Hide model answer" : "Show model answer"}</button>
        ${step.checkRevealed ? `<p class="grammar-model-answer">${escapeHtml(prompt)}</p>` : ""}
        <button class="button button-primary" type="button" data-check-next>Next prompt</button>
      </article>`;
  }

  function renderGrammarMap(step, duration) {
    const focus = step.grammarFocus || {};
    const patterns = (focus.patterns || []).slice(0, 6);
    const map = [];
    patterns.forEach((sentence) => {
      const match = String(sentence).match(/^(I|You|He|She|It|We|They|There|These|Those)\s+(am|are|is|do|does|can|have|has|like|likes)\b/i);
      if (match && !map.some((item) => item[0].toLowerCase() === match[1].toLowerCase())) map.push([match[1], match[2]]);
    });
    return `<article class="step-card grammar-map-card" data-step-type="grammar">
      <div class="step-meta"><span class="phase-badge">Grammar Focus · Step 1–2</span>${duration}</div>
      <p class="step-kicker">CONCEPT → PATTERN</p><h2>${escapeHtml(focus.concept || step.title)}</h2>
      ${map.length ? `<div class="grammar-map">${map.map(([subject, verb]) => `<span><strong>${escapeHtml(subject)}</strong><i>→</i><b>${escapeHtml(verb)}</b></span>`).join("")}</div>` : ""}
      <div class="grammar-pattern-board"><h3>Sentence patterns</h3>${patterns.map((pattern) => `<p>${escapeHtml(pattern)}</p>`).join("")}</div>
      <p class="question-rule">先確認概念與句型骨架，再進入 Guided Practice 和 Passport Sentences。</p>
    </article>`;
  }

  function renderBookResource(step, duration) {
    const page = Math.max(1, Number(step.bookPage) || 1);
    const source = step.embedUrl ? `${step.embedUrl}${String(step.embedUrl).includes("#") ? "&" : "#"}page=${page}` : "";
    return `<article class="step-card show-book-card" data-step-type="showbook">
      <div class="step-meta"><span class="phase-badge">Show Book</span>${duration}</div>
      <div class="show-book-heading"><div><p class="step-kicker">ORIGINAL LIVE MATERIAL</p><h2>${escapeHtml(step.title || "Show Book")}</h2></div><strong>Page ${page}</strong></div>
      ${source ? `<iframe class="show-book-frame" src="${escapeHtml(source)}" title="Show Book material"></iframe>` : `<div class="show-book-empty"><span>📖</span><h3>Show Book</h3><p>尚未提供本 Unit 的電子教材網址。</p></div>`}
      <div class="show-book-controls"><button class="button button-secondary" type="button" data-book-prev>← Previous Page</button><button class="button button-secondary" type="button" data-book-next>Next Page →</button><button class="button button-primary" type="button" data-book-back>Back to Lesson</button></div>
    </article>`;
  }

  function renderTopicConversation(step, duration) {
    const labels = { intro: "主題導入", "teacher-question": "教師提問", pair: "Pair Practice", challenge: "綜合口說活動" };
    return `
      <article class="step-card topic-card" data-step-type="speaking">
        <div class="step-meta"><span class="phase-badge">Topic Conversation · ${escapeHtml(step.phaseStepIndex)} / ${escapeHtml(step.phaseStepTotal)}</span>${duration}</div>
        <p class="step-kicker">${escapeHtml(labels[step.topicRole] || "CONVERSATION")}</p>
        <h2>${escapeHtml(step.title)}</h2>
        <p class="topic-prompt">${escapeHtml(step.instruction)}</p>
        ${step.modelAnswer ? `<details class="model-answer"><summary>Show model answer</summary><p>${escapeHtml(step.modelAnswer)}</p></details>` : ""}
      </article>`;
  }

  function renderGuidedPractice(step, duration) {
    const practice = step.practice || {};
    const picture = practice.image || practice.sprite || practice.visual
      ? `<div class="guided-picture">${renderPictureAsset(practice, "guided-image", "guided-visual")}</div>`
      : "";
    const choices = (practice.choices || []).map((choice) => `
      <button class="quiz-choice" type="button" data-practice-choice="${escapeHtml(choice)}">${escapeHtml(choice)}</button>
    `).join("");
    return `
      <article class="step-card guided-practice-card" data-step-type="check">
        <div class="step-meta"><span class="phase-badge">${escapeHtml(step.phaseTitle)}</span>${duration}</div>
        <h2>${escapeHtml(step.title)}</h2>
        ${picture}
        <p class="guided-prompt">${escapeHtml(practice.prompt)}</p>
        <p class="quiz-feedback" role="status" aria-live="polite"></p>
        ${choices ? `<div class="guided-options quiz-options">${choices}</div>` : `
          <button class="button button-secondary" type="button" data-practice-answer>${step.practiceRevealed ? "Hide answer" : "Show answer"}</button>
          ${step.practiceRevealed ? `<p class="grammar-model-answer">${escapeHtml(practice.modelAnswer)}</p>` : ""}`}
      </article>`;
  }

  function renderPracticeLoop(step, duration) {
    const loop = step.practiceLoop || {};
    const questions = loop.questions || [];
    if (!step.loopOrder || step.loopOrder.length !== questions.length) {
      step.loopOrder = questions.map((_, index) => index);
      step.loopIndex = 0;
    }
    const position = Math.min(Number(step.loopIndex) || 0, Math.max(questions.length - 1, 0));
    const questionIndex = step.loopOrder[position] ?? 0;
    const question = questions[questionIndex] || {};
    const picture = question.image || question.sprite || question.visual
      ? `<div class="guided-picture">${renderPictureAsset(question, "guided-image", "guided-visual")}</div>`
      : "";
    const choices = (question.choices || []).map((choice) => {
      const isCorrect = step.loopAnswered && choice === question.answer;
      return `<button class="quiz-choice ${isCorrect ? "is-correct" : ""}" type="button" data-loop-choice="${escapeHtml(choice)}" ${step.loopAnswered ? "disabled" : ""}>${escapeHtml(choice)}</button>`;
    }).join("");
    const feedbackClass = step.loopFeedback === "Correct!" ? "is-correct" : step.loopFeedback ? "is-wrong" : "";
    const taskLabels = {
      picture: "LOOK & SAY",
      choice: "CHOOSE",
      error: "FIND & FIX",
      reorder: "PUT IN ORDER",
      fill: "COMPLETE",
      dialogue: "PAIR RESPONSE",
      rewrite: "ANSWER IN A COMPLETE SENTENCE"
    };
    return `
      <article class="step-card practice-loop-card" data-step-type="practice">
        <div class="step-meta"><span class="phase-badge">${escapeHtml(step.phaseTitle || "Practice Loop")}</span>${duration}</div>
        <div class="practice-loop-heading">
          <div><p class="step-kicker">${escapeHtml(loop.kicker || "CONTINUOUS PRACTICE")}</p><h2>${escapeHtml(loop.title || step.title)}</h2></div>
          <strong>${position + 1} / ${questions.length}</strong>
        </div>
        ${loop.instruction ? `<p class="practice-loop-instruction">${escapeHtml(loop.instruction)}</p>` : ""}
        ${picture}
        <p class="practice-loop-task">${escapeHtml(taskLabels[question.type] || "THINK & ANSWER")}</p>
        ${question.instruction ? `<p class="question-rule">💡 ${escapeHtml(question.instruction)}</p>` : ""}
        <p class="guided-prompt">${escapeHtml(question.prompt || "")}</p>
        <p class="quiz-feedback ${feedbackClass}" role="status" aria-live="polite">${escapeHtml(step.loopFeedback || "")}</p>
        ${choices ? `<div class="guided-options quiz-options">${choices}</div>` : `
          <button class="button button-secondary" type="button" data-loop-answer>${step.loopRevealed ? "Hide answer" : "Show answer"}</button>
          ${step.loopRevealed ? `<p class="grammar-model-answer">${escapeHtml(question.modelAnswer || question.answer || "")}</p>` : ""}
        `}
        <div class="practice-loop-actions">
          <button class="button button-primary" type="button" data-loop-next>${position === questions.length - 1 ? "Start again" : "Next question"}</button>
          <button class="button button-secondary" type="button" data-loop-random>🔀 Random question</button>
          <button class="button button-quiet" type="button" data-loop-restart>↻ Restart</button>
        </div>
      </article>`;
  }

  function renderPictureFlash(step, duration) {
    const activity = step.pictureFlash || {};
    const items = activity.items || [];
    const index = Math.min(Number(step.flashIndex) || 0, Math.max(items.length - 1, 0));
    const item = items[index] || {};
    const picture = step.flashHidden
      ? `<div class="picture-flash-cover" aria-label="Picture hidden">?</div>`
      : renderPictureAsset(item, "picture-flash-image", "picture-flash-visual");
    return `
      <article class="step-card picture-flash-card" data-step-type="game">
        <div class="step-meta"><span class="phase-badge">${escapeHtml(step.phaseTitle || "Quick Picture Game")}</span>${duration}</div>
        <div class="practice-loop-heading">
          <div><p class="step-kicker">LOOK · HIDE · SAY</p><h2>${escapeHtml(activity.title || step.title)}</h2></div>
          <strong>${index + 1} / ${items.length}</strong>
        </div>
        <p class="practice-loop-instruction">${escapeHtml(activity.instruction || "")}</p>
        <div class="picture-flash-stage">${picture}</div>
        <p class="picture-flash-prompt">${escapeHtml(item.prompt || "Say the complete sentence.")}</p>
        ${step.flashRevealed ? `<p class="grammar-model-answer">${escapeHtml(item.answer || item.word || "")}</p>` : ""}
        <div class="practice-loop-actions">
          <button class="button button-primary" type="button" data-flash-hide>${step.flashHidden ? "Show picture" : "Hide picture"}</button>
          <button class="button button-secondary" type="button" data-flash-answer>${step.flashRevealed ? "Hide answer" : "Show answer"}</button>
          <button class="button button-secondary" type="button" data-flash-next>Next picture</button>
          <button class="button button-quiet" type="button" data-flash-random>🔀 Random</button>
        </div>
      </article>`;
  }

  function renderBossBattle(step, duration) {
    const battle = step.bossBattle || {};
    const questions = battle.questions || [];
    const maxHp = Math.max(20, Number(battle.maxHp) || 100);
    const hp = Number.isFinite(step.bossHp) ? step.bossHp : maxHp;
    const index = Math.min(Number(step.bossIndex) || 0, Math.max(questions.length - 1, 0));
    const question = questions[index] || {};
    const defeated = hp <= 0;
    const picture = question.image || question.sprite || question.visual
      ? `<div class="guided-picture">${renderPictureAsset(question, "guided-image", "guided-visual")}</div>`
      : "";
    const choices = (question.choices || []).map((choice) => {
      const correct = step.bossAnswered && choice === question.answer;
      return `<button class="quiz-choice ${correct ? "is-correct" : ""}" type="button" data-boss-choice="${escapeHtml(choice)}" ${step.bossAnswered ? "disabled" : ""}>${escapeHtml(choice)}</button>`;
    }).join("");
    if (defeated) {
      return `
        <article class="step-card boss-battle-card is-defeated" data-step-type="game">
          <div class="step-meta"><span class="phase-badge">${escapeHtml(step.phaseTitle || "Boss Battle")}</span>${duration}</div>
          <p class="boss-icon" aria-hidden="true">🏆</p>
          <h2>Boss defeated!</h2>
          <p class="boss-victory">全班完成了 What／Do 與 You／We 挑戰！</p>
          <button class="button button-primary" type="button" data-boss-reset>Play again</button>
        </article>`;
    }
    return `
      <article class="step-card boss-battle-card" data-step-type="game">
        <div class="step-meta"><span class="phase-badge">${escapeHtml(step.phaseTitle || "Boss Battle")}</span>${duration}</div>
        <div class="boss-topline">
          <div><p class="step-kicker">FINAL TEAM CHALLENGE</p><h2>${escapeHtml(battle.title || step.title)}</h2></div>
          <strong>Boss HP ${hp} / ${maxHp}</strong>
        </div>
        <div class="boss-health" aria-label="Boss health"><i style="width:${Math.max(0, Math.min(100, hp / maxHp * 100))}%"></i></div>
        <p class="practice-loop-instruction">${escapeHtml(battle.instruction || "")}</p>
        ${picture}
        ${question.instruction ? `<p class="question-rule">💡 ${escapeHtml(question.instruction)}</p>` : ""}
        <p class="boss-question">${escapeHtml(question.prompt || "")}</p>
        <p class="quiz-feedback ${step.bossFeedback ? (step.bossAnswered ? "is-correct" : "is-wrong") : ""}" role="status" aria-live="polite">${escapeHtml(step.bossFeedback || "")}</p>
        ${choices ? `<div class="guided-options quiz-options">${choices}</div>` : `
          <button class="button button-secondary" type="button" data-boss-answer>${step.bossRevealed ? "Hide answer" : "Show answer"}</button>
          ${step.bossRevealed ? `<p class="grammar-model-answer">${escapeHtml(question.modelAnswer || question.answer || "")}</p>` : ""}
          <button class="button button-primary" type="button" data-boss-correct>✓ Correct · Attack</button>
        `}
        <div class="boss-actions">
          <button class="button button-secondary" type="button" data-boss-next>Next challenge</button>
          <button class="button button-quiet" type="button" data-boss-reset>↻ Reset battle</button>
        </div>
      </article>`;
  }

  function writeClock(step) {
    const total = Math.max(1, Number(step.writeMinutes) || 10) * 60;
    const remaining = Number.isFinite(step.writeRemaining) ? step.writeRemaining : total;
    const minutes = Math.floor(Math.max(remaining, 0) / 60);
    const seconds = Math.max(remaining, 0) % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function renderWriteTime(step, duration) {
    return `
      <article class="step-card write-time-card" data-step-type="writing">
        <div class="step-meta"><span class="phase-badge">${escapeHtml(step.phaseTitle || "Write Time")}</span>${duration}</div>
        <p class="step-kicker">PLAY → WRITE → CHECK</p>
        <h2>✏ Write Time · Part ${escapeHtml(step.worksheetPart)}</h2>
        <p class="write-time-instruction">${escapeHtml(step.instruction)}</p>
        <div class="write-clock" data-write-clock>${writeClock(step)}</div>
        <div class="write-time-actions">
          <button class="button button-primary" type="button" data-write-toggle>${step.writeRunning ? "Pause" : "Start timer"}</button>
          <button class="button button-secondary" type="button" data-write-reset>↻ Reset</button>
          <button class="button button-secondary" type="button" data-open-worksheet>📝 Open worksheet</button>
        </div>
      </article>`;
  }

  function renderSentenceTransformer(step, duration) {
    const transformer = step.transformer || {};
    const modes = [["affirmative", "Affirmative"], ["negative", "Negative"], ["question", "Question"]];
    const picture = transformer.image || transformer.sprite || transformer.visual
      ? `<div class="guided-picture">${renderPictureAsset(transformer, "guided-image", "guided-visual")}</div>`
      : "";
    const activeLabel = modes.find(([mode]) => mode === step.transformMode)?.[1] || "";
    const answer = step.transformMode ? transformer.forms?.[step.transformMode] : "";
    return `
      <article class="step-card sentence-transformer-card" data-step-type="practice">
        <div class="step-meta"><span class="phase-badge">${escapeHtml(step.phaseTitle || "Sentence Transformer")}</span>${duration}</div>
        <p class="step-kicker">SENTENCE TRANSFORMER</p>
        <h2>${escapeHtml(transformer.source || step.title)}</h2>
        ${picture}
        <div class="transform-mode-buttons">
          ${modes.map(([mode, label]) => `<button class="button ${step.transformMode === mode ? "button-primary" : "button-secondary"}" type="button" data-transform-mode="${mode}">${label}</button>`).join("")}
        </div>
        ${step.transformMode ? `
          <p class="transform-task">Change it to: <strong>${escapeHtml(activeLabel)}</strong></p>
          <button class="button button-secondary" type="button" data-transform-answer>${step.transformRevealed ? "Hide answer" : "Show answer"}</button>
          ${step.transformRevealed ? `<p class="grammar-model-answer">${escapeHtml(answer)}</p>` : ""}
        ` : `<p class="transform-task">Choose a sentence form.</p>`}
      </article>`;
  }

  function renderQuizStep(step, duration) {
    const question = step.question;
    const promptText = String(question.prompt || "");
    const parts = promptText.split("____");
    const prompt = promptText.includes("____")
      ? `${escapeHtml(parts[0])}<span class="quiz-blank" aria-label="blank"></span>${escapeHtml(parts.slice(1).join("____"))}`
      : escapeHtml(promptText);
    const picture = renderPictureAsset(question, "quiz-image", "quiz-visual");
    const choices = question.choices.map((choice) => `
      <button class="quiz-choice" type="button" data-quiz-choice="${escapeHtml(choice)}">${escapeHtml(choice)}</button>
    `).join("");

    return `
      <article class="step-card quiz-card" data-step-type="quiz">
        <div class="quiz-topline">
          <div class="step-meta">
            <span class="phase-badge">${escapeHtml(step.phaseTitle || "Check")} · ${escapeHtml(step.questionIndex || 1)} / ${escapeHtml(step.questionTotal || 1)}</span>
            ${duration}
          </div>
          <span class="quiz-mini-progress" aria-hidden="true"><i style="width:${((step.questionIndex || 1) / (step.questionTotal || 1)) * 100}%"></i></span>
        </div>
        <div class="quiz-picture">${picture}</div>
        <p class="quiz-question">${prompt}</p>
        <p class="quiz-feedback" role="status" aria-live="polite"></p>
        <div class="quiz-options">${choices}</div>
      </article>
    `;
  }

  function renderDialogueChoiceStep(step, duration) {
    const activity = step.dialogueChoice;
    const picture = renderPictureAsset(activity, "dialogue-image", "dialogue-visual");
    const choices = activity.choices.map((choice) => `
      <button class="dialogue-choice" type="button" data-dialogue-choice="${escapeHtml(choice.label)}">
        <span class="dialogue-choice-label">${escapeHtml(choice.label)}</span>
        <span>${choice.lines.map((line) => escapeHtml(line)).join("<br>")}</span>
      </button>
    `).join("");

    return `
      <article class="step-card dialogue-choice-card" data-step-type="practice">
        <div class="quiz-topline">
          <div class="step-meta">
            <span class="phase-badge">${escapeHtml(step.phaseTitle || "Presentation")} · ${escapeHtml(step.questionIndex)} / ${escapeHtml(step.questionTotal)}</span>
            ${duration}
          </div>
          <span class="quiz-mini-progress" aria-hidden="true"><i style="width:${((step.questionIndex || 1) / (step.questionTotal || 1)) * 100}%"></i></span>
        </div>
        <div class="dialogue-choice-layout">
          <div class="dialogue-prompt-panel">
            <div class="dialogue-picture">${picture}</div>
            <p class="dialogue-instruction">${escapeHtml(activity.instruction)}</p>
            <p class="dialogue-prompt">${escapeHtml(activity.prompt)}</p>
            <p class="dialogue-feedback" role="status" aria-live="polite"></p>
          </div>
          <div class="dialogue-options">${choices}</div>
        </div>
      </article>
    `;
  }

  function renderSentenceCardStep(step, duration) {
    const card = step.sentenceCard;
    const picture = renderPictureAsset(card, "sentence-card-image", "sentence-card-visual");
    const sentences = card.sentences.map((sentence) => `
      <div class="sentence-card-text">
        <p class="sentence-card-line">
          ${escapeHtml(sentence.before)} <strong>${escapeHtml(sentence.word)}</strong>${escapeHtml(sentence.after)}
        </p>
        ${sentence.translation ? `<p class="sentence-card-translation">${escapeHtml(sentence.translation)}</p>` : ""}
      </div>
    `).join("");

    return `
      <article class="step-card sentence-pattern-card" data-step-type="grammar">
        <div class="quiz-topline">
          <div class="step-meta">
            <span class="phase-badge">${escapeHtml(step.phaseTitle || "Sentence Practice")} · ${escapeHtml(step.questionIndex)} / ${escapeHtml(step.questionTotal)}</span>
            ${duration}
          </div>
          <span class="quiz-mini-progress" aria-hidden="true"><i style="width:${((step.questionIndex || 1) / (step.questionTotal || 1)) * 100}%"></i></span>
        </div>
        <div class="sentence-pattern-layout">
          <div class="sentence-card-picture">${picture}</div>
          <div class="sentence-card-copy">
            <p class="sentence-card-label">${escapeHtml(card.label)}</p>
            <div class="sentence-card-lines">${sentences}</div>
          </div>
        </div>
      </article>
    `;
  }

  function renderPassportSentenceStep(step, duration) {
    const sentence = step.passportSentence;
    const picture = renderPictureAsset(sentence, "passport-sentence-image", "passport-sentence-visual");
    const hidden = Boolean(step.passportHidden);
    return `
      <article class="step-card passport-sentence-card" data-step-type="grammar">
        <div class="quiz-topline">
          <div class="step-meta">
            <span class="phase-badge">${escapeHtml(step.phaseTitle || "Passport Review")} · ${escapeHtml(step.questionIndex)} / ${escapeHtml(step.questionTotal)}</span>
            ${duration}
          </div>
          <span class="quiz-mini-progress" aria-hidden="true"><i style="width:${((step.questionIndex || 1) / (step.questionTotal || 1)) * 100}%"></i></span>
        </div>
        <div class="passport-sentence-layout">
          <div class="passport-sentence-picture">${picture}</div>
          <div class="passport-sentence-copy">
            <p class="passport-sentence-kicker">PASSPORT ${escapeHtml(step.questionIndex)} / ${escapeHtml(step.questionTotal)}</p>
            <h2 class="${hidden ? "is-passport-hidden" : ""}">${hidden ? "Tap Show to reveal the sentence" : escapeHtml(sentence.text)}</h2>
            <p class="passport-sentence-translation">${hidden ? "先自己朗讀，再檢查。" : escapeHtml(sentence.translation)}</p>
            <div class="passport-controls">
              <button class="button button-secondary" type="button" data-passport-toggle>${hidden ? "Show" : "Hide"}</button>
              <button class="button button-primary" type="button" data-passport-read>▶ Read Aloud</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderActivityImageStep(step, duration) {
    return `
      <article class="step-card activity-image-card" data-step-type="${escapeHtml(step.type)}">
        <div class="step-meta">
          <span class="phase-badge">${escapeHtml(step.phaseTitle || getTypeLabel(step.type))}</span>
          ${duration}
        </div>
        <h2>${escapeHtml(step.title)}</h2>
        <img class="activity-main-image" src="${escapeHtml(step.activityImage)}" alt="${escapeHtml(step.imageAlt || step.title)}">
      </article>
    `;
  }

  function parseWordwallUrl(value) {
    const input = String(value || "").trim();
    const iframeSource = input.match(/src\s*=\s*["']([^"']+)["']/i)?.[1];
    const candidate = iframeSource || input;

    try {
      const url = new URL(candidate);
      const isWordwall = url.hostname === "wordwall.net" || url.hostname.endsWith(".wordwall.net");
      return isWordwall && ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch (error) {
      return "";
    }
  }

  function savedEmbedUrl(step) {
    try {
      return localStorage.getItem(step.embedStorageKey) || "";
    } catch (error) {
      return "";
    }
  }

  function renderEmbedStep(step, duration) {
    const currentUrl = step.forceEmbedSetup ? "" : (savedEmbedUrl(step) || step.embedUrl || "");

    if (currentUrl) {
      return `
        <article class="step-card wordwall-card" data-step-type="embed">
          <div class="wordwall-toolbar">
            <div class="step-meta">
              <span class="phase-badge">Wordwall Game</span>
              ${duration}
            </div>
            <div class="wordwall-actions">
              <button class="wordwall-link wordwall-change" type="button" data-change-wordwall>Change Wordwall</button>
              <a class="wordwall-link wordwall-external" href="${escapeHtml(currentUrl)}" target="_blank" rel="noopener noreferrer">Open externally ↗</a>
            </div>
          </div>
          <iframe class="wordwall-frame" src="${escapeHtml(currentUrl)}" title="Wordwall activity" allow="fullscreen; autoplay" allowfullscreen loading="eager"></iframe>
        </article>
      `;
    }

    return `
      <article class="step-card wordwall-card wordwall-setup-card" data-step-type="embed">
        <div class="step-meta">
          <span class="phase-badge">Wordwall Game</span>
          ${duration}
        </div>
        <div class="wordwall-setup">
          <p class="step-kicker">ADD AN ACTIVITY</p>
          <h2>Paste your Wordwall</h2>
          <p class="wordwall-help">在 Wordwall 選擇 Share → Embed，貼上 Embed URL 或整段 iframe 程式碼。</p>
          <form class="wordwall-form" data-wordwall-form>
            <label for="wordwall-input">Wordwall Embed URL / iframe</label>
            <textarea id="wordwall-input" name="wordwall" rows="3" placeholder="https://wordwall.net/embed/..." required></textarea>
            <p class="wordwall-error" role="status" aria-live="polite"></p>
            <button class="button button-primary wordwall-load" type="submit">Load Wordwall</button>
          </form>
        </div>
      </article>
    `;
  }

  function renderStep(step) {
    const minutes = Number(step.phaseDuration) > 0 ? step.phaseDuration : step.duration;
    const duration = Number(minutes) > 0
      ? `<span class="duration-badge">◷ ${escapeHtml(minutes)} min</span>`
      : `<span class="duration-badge is-flexible">彈性</span>`;

    if (step.activity === "flow-games") return renderFlowGamesStep(step, duration);
    if (step.activity === "grammar-check") return renderGrammarCheck(step, duration);
    if (step.activity === "grammar-map") return renderGrammarMap(step, duration);
    if (step.activity === "book-resource") return renderBookResource(step, duration);
    if (step.activity === "topic-conversation") return renderTopicConversation(step, duration);
    if (step.activity === "sentence-transformer") return renderSentenceTransformer(step, duration);
    if (step.activity === "practice-loop") return renderPracticeLoop(step, duration);
    if (step.activity === "picture-flash") return renderPictureFlash(step, duration);
    if (step.activity === "boss-battle") return renderBossBattle(step, duration);
    if (step.activity === "write-time") return renderWriteTime(step, duration);
    if (step.activity === "guided-practice") return renderGuidedPractice(step, duration);
    if (step.activity === "word-spelling") return renderWordSpellingStep(step, duration);

    if (step.type === "vocabulary" && step.word) {
      return renderVocabularyStep(step, duration);
    }

    if (step.type === "quiz" && step.question) {
      return renderQuizStep(step, duration);
    }

    if (step.dialogueChoice) {
      return renderDialogueChoiceStep(step, duration);
    }

    if (step.activityImage) {
      return renderActivityImageStep(step, duration);
    }

    if (step.sentenceCard) {
      return renderSentenceCardStep(step, duration);
    }

    if (step.passportSentence) {
      return renderPassportSentenceStep(step, duration);
    }

    if (step.activity === "book-resource") {
      container.onclick = (event) => {
        if (event.target.closest("[data-book-prev]")) step.bookPage = Math.max(1, (Number(step.bookPage) || 1) - 1);
        else if (event.target.closest("[data-book-next]")) step.bookPage = (Number(step.bookPage) || 1) + 1;
        else if (event.target.closest("[data-book-back]")) { document.dispatchEvent(new CustomEvent("lesson:next")); return; }
        else return;
        container.innerHTML = renderStep(step); activateStep(container, step);
      };
      return;
    }

    if (step.type === "embed") {
      return renderEmbedStep(step, duration);
    }

    return `
      <article class="step-card" data-step-type="${escapeHtml(step.type)}">
        <div class="step-meta">
          <span class="phase-badge">${escapeHtml(step.phaseTitle || getTypeLabel(step.type))}</span>
          ${duration}
        </div>
        <p class="step-kicker">Today’s teaching step</p>
        <h2>${escapeHtml(step.title)}</h2>
        <p class="step-instruction">${escapeHtml(step.instruction)}</p>
      </article>
    `;
  }

  function activateStep(container, step) {
    container.onclick = null;
    container.onsubmit = null;

    const audioButton = container.querySelector("[data-audio-src]");
    if (audioButton) {
      audioButton.addEventListener("click", () => {
        const audio = new Audio(audioButton.dataset.audioSrc);
        audio.play().catch(() => { audioButton.textContent = "Audio unavailable"; });
      });
    }

    if (step.passportSentence) {
      container.onclick = (event) => {
        if (event.target.closest("[data-passport-toggle]")) {
          step.passportHidden = !step.passportHidden;
          container.innerHTML = renderStep(step);
          activateStep(container, step);
          return;
        }
        if (event.target.closest("[data-passport-read]")) {
          if (step.passportSentence.audio) new Audio(step.passportSentence.audio).play().catch(() => {});
          else if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(step.passportSentence.text));
          }
        }
      };
      return;
    }

    if (step.activity === "flow-games") {
      container.onclick = (event) => {
        const game = event.target.closest("[data-flow-game]");
        if (game) {
          step.activeGame = game.dataset.flowGame;
          step.gameRound = (Number(step.gameRound) || 0) + 1;
          step.isRevealed = false;
          document.dispatchEvent(new CustomEvent("lesson:trail", { detail: { title: step.suggestedGames.find((item) => item.id === step.activeGame)?.title || "" } }));
        } else if (event.target.closest("[data-game-replay]")) {
          step.gameRound = (Number(step.gameRound) || 0) + 1;
          step.isRevealed = false;
        } else if (event.target.closest("[data-game-reveal]")) {
          step.isRevealed = !step.isRevealed;
        } else if (event.target.closest("[data-game-complete]")) {
          step.completed = true;
        } else if (event.target.closest("[data-game-skip]")) {
          step.completed = false;
          step.skipped = true;
        } else return;
        container.innerHTML = renderStep(step);
        activateStep(container, step);
      };
      return;
    }

    if (step.activity === "grammar-check") {
      container.onclick = (event) => {
        if (event.target.closest("[data-check-answer]")) step.checkRevealed = !step.checkRevealed;
        else if (event.target.closest("[data-check-next]")) {
          step.checkIndex = (Number(step.checkIndex) || 0) + 1;
          step.checkRevealed = false;
        } else return;
        container.innerHTML = renderStep(step);
        activateStep(container, step);
      };
      return;
    }

    if (step.activity === "guided-practice") {
      container.onclick = (event) => {
        const choice = event.target.closest("[data-practice-choice]");
        if (choice) {
          const feedback = container.querySelector(".quiz-feedback");
          const isCorrect = choice.dataset.practiceChoice === step.practice.answer;
          choice.classList.toggle("is-correct", isCorrect);
          choice.classList.toggle("is-wrong", !isCorrect);
          feedback.textContent = isCorrect ? "Correct!" : "Try again!";
          feedback.className = `quiz-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
          if (isCorrect) container.querySelectorAll("[data-practice-choice]").forEach((button) => { button.disabled = true; });
          return;
        }
        if (!event.target.closest("[data-practice-answer]")) return;
        step.practiceRevealed = !step.practiceRevealed;
        container.innerHTML = renderStep(step);
        activateStep(container, step);
      };
      return;
    }

    if (step.activity === "practice-loop") {
      const resetQuestion = () => {
        step.loopRevealed = false;
        step.loopAnswered = false;
        step.loopFeedback = "";
      };
      container.onclick = (event) => {
        const questions = step.practiceLoop?.questions || [];
        const position = Number(step.loopIndex) || 0;
        const questionIndex = step.loopOrder?.[position] ?? 0;
        const question = questions[questionIndex] || {};
        const choice = event.target.closest("[data-loop-choice]");
        if (choice) {
          const isCorrect = choice.dataset.loopChoice === question.answer;
          step.loopFeedback = isCorrect ? "Correct!" : "Try again!";
          step.loopAnswered = isCorrect;
        } else if (event.target.closest("[data-loop-answer]")) {
          step.loopRevealed = !step.loopRevealed;
        } else if (event.target.closest("[data-loop-next]")) {
          step.loopIndex = position >= questions.length - 1 ? 0 : position + 1;
          resetQuestion();
        } else if (event.target.closest("[data-loop-random]")) {
          if (questions.length > 1) {
            let next = position;
            while (next === position) next = Math.floor(Math.random() * questions.length);
            const target = step.loopOrder.indexOf(next);
            step.loopIndex = target >= 0 ? target : next;
          }
          resetQuestion();
        } else if (event.target.closest("[data-loop-restart]")) {
          step.loopOrder = questions.map((_, index) => index);
          step.loopIndex = 0;
          resetQuestion();
        } else return;
        container.innerHTML = renderStep(step);
        activateStep(container, step);
      };
      return;
    }

    if (step.activity === "picture-flash") {
      container.onclick = (event) => {
        const items = step.pictureFlash?.items || [];
        const current = Number(step.flashIndex) || 0;
        if (event.target.closest("[data-flash-hide]")) {
          step.flashHidden = !step.flashHidden;
        } else if (event.target.closest("[data-flash-answer]")) {
          step.flashRevealed = !step.flashRevealed;
        } else if (event.target.closest("[data-flash-next]")) {
          step.flashIndex = items.length ? (current + 1) % items.length : 0;
          step.flashHidden = false;
          step.flashRevealed = false;
        } else if (event.target.closest("[data-flash-random]")) {
          if (items.length > 1) {
            let next = current;
            while (next === current) next = Math.floor(Math.random() * items.length);
            step.flashIndex = next;
          }
          step.flashHidden = false;
          step.flashRevealed = false;
        } else return;
        container.innerHTML = renderStep(step);
        activateStep(container, step);
      };
      return;
    }

    if (step.activity === "boss-battle") {
      const battle = step.bossBattle || {};
      const questions = battle.questions || [];
      const maxHp = Math.max(20, Number(battle.maxHp) || 100);
      const damage = Math.max(1, Number(battle.damage) || 20);
      if (!Number.isFinite(step.bossHp)) step.bossHp = maxHp;
      const resetRound = () => {
        step.bossAnswered = false;
        step.bossRevealed = false;
        step.bossFeedback = "";
      };
      const attack = () => {
        if (step.bossAnswered) return;
        step.bossAnswered = true;
        step.bossHp = Math.max(0, step.bossHp - damage);
        step.bossFeedback = `Great! Boss -${damage} HP`;
      };
      container.onclick = (event) => {
        const current = Number(step.bossIndex) || 0;
        const question = questions[current] || {};
        const choice = event.target.closest("[data-boss-choice]");
        if (choice) {
          if (choice.dataset.bossChoice === question.answer) attack();
          else step.bossFeedback = "Try again — first decide: information or Yes/No?";
        } else if (event.target.closest("[data-boss-answer]")) {
          step.bossRevealed = !step.bossRevealed;
        } else if (event.target.closest("[data-boss-correct]")) {
          attack();
        } else if (event.target.closest("[data-boss-next]")) {
          step.bossIndex = questions.length ? (current + 1) % questions.length : 0;
          resetRound();
        } else if (event.target.closest("[data-boss-reset]")) {
          step.bossHp = maxHp;
          step.bossIndex = 0;
          resetRound();
        } else return;
        container.innerHTML = renderStep(step);
        activateStep(container, step);
      };
      return;
    }

    if (step.activity === "write-time") {
      const totalSeconds = Math.max(1, Number(step.writeMinutes) || 10) * 60;
      if (!Number.isFinite(step.writeRemaining)) step.writeRemaining = totalSeconds;

      const startClock = () => {
        if (!step.writeRunning) return;
        const clock = container.querySelector("[data-write-clock]");
        const interval = window.setInterval(() => {
          if (!container.isConnected || !step.writeRunning) {
            window.clearInterval(interval);
            return;
          }
          const next = Math.max(0, Math.ceil((step.writeEndsAt - Date.now()) / 1000));
          step.writeRemaining = next;
          if (clock) clock.textContent = writeClock(step);
          if (next === 0) {
            step.writeRunning = false;
            window.clearInterval(interval);
            container.innerHTML = renderStep(step);
            activateStep(container, step);
          }
        }, 250);
      };

      container.onclick = (event) => {
        if (event.target.closest("[data-write-toggle]")) {
          if (step.writeRunning) {
            step.writeRemaining = Math.max(0, Math.ceil((step.writeEndsAt - Date.now()) / 1000));
            step.writeRunning = false;
          } else {
            step.writeRunning = true;
            step.writeEndsAt = Date.now() + step.writeRemaining * 1000;
          }
        } else if (event.target.closest("[data-write-reset]")) {
          step.writeRunning = false;
          step.writeRemaining = totalSeconds;
        } else if (event.target.closest("[data-open-worksheet]")) {
          window.WorksheetBuilder?.open(step.worksheetPart);
          return;
        } else return;
        container.innerHTML = renderStep(step);
        activateStep(container, step);
      };
      startClock();
      return;
    }

    if (step.activity === "sentence-transformer") {
      container.onclick = (event) => {
        const mode = event.target.closest("[data-transform-mode]");
        if (mode) {
          step.transformMode = mode.dataset.transformMode;
          step.transformRevealed = false;
        } else if (event.target.closest("[data-transform-answer]")) {
          step.transformRevealed = !step.transformRevealed;
        } else return;
        container.innerHTML = renderStep(step);
        activateStep(container, step);
      };
      return;
    }

    if (step.type === "embed") {
      container.onclick = (event) => {
        const changeButton = event.target.closest("[data-change-wordwall]");
        if (!changeButton) return;
        step.forceEmbedSetup = true;
        container.innerHTML = renderStep(step);
        activateStep(container, step);
      };

      container.onsubmit = (event) => {
        const form = event.target.closest("[data-wordwall-form]");
        if (!form) return;
        event.preventDefault();
        const input = form.elements.wordwall.value;
        const url = parseWordwallUrl(input);
        const error = form.querySelector(".wordwall-error");

        if (!url) {
          error.textContent = "請貼上有效的 Wordwall Embed URL 或 iframe 程式碼。";
          return;
        }

        try {
          localStorage.setItem(step.embedStorageKey, url);
        } catch (storageError) {
          step.embedUrl = url;
        }
        step.forceEmbedSetup = false;
        container.innerHTML = renderStep(step);
        activateStep(container, step);
      };
      return;
    }

    if (step.dialogueChoice) {
      container.onclick = (event) => {
        const button = event.target.closest("[data-dialogue-choice]");
        if (!button || button.disabled) return;

        const feedback = container.querySelector(".dialogue-feedback");
        const isCorrect = button.dataset.dialogueChoice === step.dialogueChoice.answer;
        button.classList.remove("is-wrong");

        if (isCorrect) {
          button.classList.add("is-correct");
          container.querySelectorAll(".dialogue-choice").forEach((choice) => { choice.disabled = true; });
          feedback.textContent = "Correct!";
          feedback.className = "dialogue-feedback is-correct";
        } else {
          button.classList.add("is-wrong");
          feedback.textContent = "Try again!";
          feedback.className = "dialogue-feedback is-wrong";
        }
      };
      return;
    }

    if (step.type !== "quiz" || !step.question) return;

    container.onclick = (event) => {
      const button = event.target.closest("[data-quiz-choice]");
      if (!button || button.disabled) return;

      const feedback = container.querySelector(".quiz-feedback");
      const isCorrect = button.dataset.quizChoice === step.question.answer;
      button.classList.remove("is-wrong");

      if (isCorrect) {
        button.classList.add("is-correct");
        container.querySelectorAll(".quiz-choice").forEach((choice) => { choice.disabled = true; });
        feedback.textContent = "Correct!";
        feedback.className = "quiz-feedback is-correct";
      } else {
        button.classList.add("is-wrong");
        feedback.textContent = "Try again!";
        feedback.className = "quiz-feedback is-wrong";
      }
    };
  }

  window.Activities = { getTypeLabel, renderStep, activateStep };
})();

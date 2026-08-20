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
    const picture = practice.image
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
            <p class="passport-sentence-kicker">READ ALOUD</p>
            <h2>${escapeHtml(sentence.text)}</h2>
            <p class="passport-sentence-translation">${escapeHtml(sentence.translation)}</p>
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
    if (step.activity === "topic-conversation") return renderTopicConversation(step, duration);
    if (step.activity === "guided-practice") return renderGuidedPractice(step, duration);

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

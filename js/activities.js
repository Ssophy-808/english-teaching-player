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
        <p class="word-prompt">Listen and repeat.</p>
      </article>
    `;
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
            <span class="phase-badge">Presentation · ${escapeHtml(step.questionIndex)} / ${escapeHtml(step.questionTotal)}</span>
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
            <span class="phase-badge">Sentence Practice · ${escapeHtml(step.questionIndex)} / ${escapeHtml(step.questionTotal)}</span>
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
    const duration = Number(step.duration) > 0
      ? `<span class="duration-badge">◷ ${escapeHtml(step.duration)} min</span>`
      : "";

    if (step.type === "vocabulary" && step.word) {
      return renderVocabularyStep(step, duration);
    }

    if (step.type === "quiz" && step.question) {
      return renderQuizStep(step, duration);
    }

    if (step.dialogueChoice) {
      return renderDialogueChoiceStep(step, duration);
    }

    if (step.sentenceCard) {
      return renderSentenceCardStep(step, duration);
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

(function () {
  "use strict";

  const STORAGE_KEY = "englishTeachingPlayer.testBuilder.v1";
  const TYPES = [
    ["vocab-image", "看圖寫單字", 2], ["image-sentence", "看圖寫句子", 2],
    ["choice", "選擇題", 3], ["fill", "填空題", 2], ["error", "改錯題", 2],
    ["reorder", "句子重組", 2], ["transform", "句型轉換", 1], ["dialogue", "對話填空", 0]
  ];
  const catalog = window.COURSE_CATALOG || [];
  const modal = document.getElementById("test-builder-modal");
  const preview = document.getElementById("test-preview");
  const empty = document.getElementById("test-builder-empty");
  const bookSelect = document.getElementById("test-book");
  const unitList = document.getElementById("test-units");
  const typeList = document.getElementById("test-types");
  let mode = "student";
  let questions = [];
  let pools = {};
  let serial = 0;

  const esc = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const shuffle = (items) => { const copy = [...items]; for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; };
  const curriculum = (unit) => unit.lessons?.[0]?.curriculum || { vocabulary: [], mainSentences: [] };

  function assetMarkup(asset = {}) {
    if (asset.image) return `<img class="test-question-image" src="${esc(asset.image)}" alt="Question picture">`;
    if (asset.sprite) {
      const cols = Number(asset.sprite.cols) || 5, rows = Number(asset.sprite.rows) || 2;
      const x = cols > 1 ? Number(asset.sprite.col) * 100 / (cols - 1) : 0;
      const y = rows > 1 ? Number(asset.sprite.row) * 100 / (rows - 1) : 0;
      return `<span class="test-question-sprite" style="background-image:url('${esc(asset.sprite.src || "assets/images/family-sprite.png")}');background-size:${cols * 100}% ${rows * 100}%;background-position:${x}% ${y}%"></span>`;
    }
    return asset.visual ? `<span class="test-question-emoji">${esc(asset.visual)}</span>` : "";
  }

  function selectedBook() { return catalog.find((book) => book.id === bookSelect.value) || catalog[0]; }
  function selectedUnits() {
    const book = selectedBook();
    const selected = [...unitList.querySelectorAll("input:checked")].map((input) => input.value);
    let units = book.units.filter((unit) => selected.includes(unit.id));
    if (document.getElementById("test-spiral").checked && units.length) {
      const last = Math.max(...units.map((unit) => book.units.indexOf(unit)));
      units = book.units.slice(0, last + 1);
    }
    return units;
  }

  function distractors(answer, words, count = 2) { return shuffle(words.filter((word) => word !== answer)).slice(0, count); }
  function tagged(unit, unitIndex, data) { return { ...data, id: `q-${++serial}`, unitLabel: `Unit ${unitIndex + 1}`, points: 2 }; }

  function negativeOrQuestion(sentence) {
    const clean = sentence.trim();
    let match = clean.match(/^(I|You|We|They|He|She|It) (am|are|is) (.+)\.$/i);
    if (match) return { prompt: `Change to negative: ${clean}`, answer: `${match[1]} ${match[2]} not ${match[3]}.` };
    match = clean.match(/^There is (.+)\.$/i);
    if (match) return { prompt: `Change to a question: ${clean}`, answer: `Is there ${match[1]}?` };
    match = clean.match(/^(I|You|We|They) like (.+)\.$/i);
    if (match) return { prompt: `Change to a Yes/No question: ${clean}`, answer: `Do ${match[1].toLowerCase()} like ${match[2]}?` };
    return null;
  }

  function wrongSentence(sentence) {
    const rules = [[" am ", " are "], [" are ", " is "], [" is ", " are "], [" like ", " likes "], ["There is ", "There are "]];
    const rule = rules.find(([from]) => sentence.includes(from));
    return rule ? sentence.replace(rule[0], rule[1]) : "";
  }

  function imageSentenceCue(sentence) {
    const clean = sentence.trim();
    const colors = "red|yellow|green|blue|pink|black|white|brown|orange|purple";
    let match;

    if (/^Is there\b/i.test(clean)) return { question: "What question can you ask about the picture?", starter: "Is there..." };
    if (/^There (?:is|isn't|is not)\b/i.test(clean)) return { question: "What is in the classroom?", starter: /^There isn't/i.test(clean) ? "There isn't..." : /^There is not/i.test(clean) ? "There is not..." : "There is..." };
    if (/^There (?:are|aren't|are not)\b/i.test(clean)) return { question: "What can you see?", starter: /^There aren't/i.test(clean) ? "There aren't..." : /^There are not/i.test(clean) ? "There are not..." : "There are..." };

    match = clean.match(/^(I am|He is|She is) (?:not )?\w+ years? old\./i);
    if (match) return { question: /^I am/i.test(clean) ? "How old are you?" : /^He is/i.test(clean) ? "How old is he?" : "How old is she?", starter: `${match[1]}...` };
    if (/^He is my\b/i.test(clean)) return { question: "Who is he?", starter: "He is my..." };
    if (/^She is my\b/i.test(clean)) return { question: "Who is she?", starter: "She is my..." };
    if (new RegExp(`^It is (?:not )?(?:${colors})\\.$`, "i").test(clean)) return { question: "What color is it?", starter: /^It is not/i.test(clean) ? "It is not..." : "It is..." };
    if (/^It is (?:not )?(?:an? )/i.test(clean)) return { question: "What is it?", starter: /^It is not/i.test(clean) ? "It is not..." : "It is..." };
    if (/^This is\b/i.test(clean)) return { question: "What is this?", starter: /^This is not/i.test(clean) ? "This is not..." : "This is..." };
    if (/^That is\b/i.test(clean)) return { question: "What is that?", starter: /^That is not/i.test(clean) ? "That is not..." : "That is..." };
    if (/^These are\b/i.test(clean)) return { question: "What are these?", starter: "These are..." };
    if (/^Those are\b/i.test(clean)) return { question: "What are those?", starter: "Those are..." };
    if (/^They are\b/i.test(clean)) return { question: "How do they feel?", starter: /^They are not/i.test(clean) ? "They are not..." : "They are..." };
    if (/^I like\b/i.test(clean)) return { question: "What do you like?", starter: "I like..." };
    if (/^You like\b/i.test(clean)) return { question: "What do you like?", starter: "You like..." };
    if (/^We like\b/i.test(clean)) return { question: "What do you and your classmates like?", starter: "We like..." };
    if (/^They like\b/i.test(clean)) return { question: "What do they like?", starter: "They like..." };
    if (/^What do you like\?/i.test(clean)) return { question: "What question asks a person what they like?", starter: "What do you..." };
    if (/^What do they like\?/i.test(clean)) return { question: "What question asks what they like?", starter: "What do they..." };
    if (/^Do you like\b/i.test(clean)) return { question: "Write a Yes/No question about the picture.", starter: "Do you like..." };
    if (/^Do they like\b/i.test(clean)) return { question: "Write a Yes/No question about the picture.", starter: "Do they like..." };

    match = clean.match(/^(I am|You are|He is|She is|It is) (not )?/i);
    if (match) {
      const subject = match[1].split(" ")[0].toLowerCase();
      const question = subject === "i" || subject === "you" ? "What can you say about the person?" : `What can you say about ${subject}?`;
      return { question, starter: match[2] ? `${match[1]} ${match[2].trim()}...` : `${match[1]}...` };
    }
    if (clean.endsWith("?")) return { question: "What question can you ask about the picture?", starter: `${clean.split(/\s+/).slice(0, 3).join(" ").replace(/[?]$/, "")}...` };
    return { question: "What do you see in the picture?", starter: `${clean.split(/\s+/).slice(0, 2).join(" ")}...` };
  }

  function imageSentencePrompt(sentence) {
    const cue = imageSentenceCue(sentence);
    const instruction = sentence.trim().endsWith("?") ? "Write the complete question." : "Answer in a complete sentence.";
    return `Question: ${cue.question}\n${instruction}\nStart with: ${cue.starter}`;
  }

  function buildPools(units) {
    const allWords = units.flatMap((unit) => curriculum(unit).vocabulary || []).map((item) => item.word);
    const result = Object.fromEntries(TYPES.map(([id]) => [id, []]));
    units.forEach((unit) => {
      const book = selectedBook();
      const unitIndex = book.units.indexOf(unit);
      const data = curriculum(unit);
      const words = data.vocabulary || [];
      const sentences = (data.mainSentences || []).filter(Boolean);
      words.forEach((word) => {
        result["vocab-image"].push(tagged(unit, unitIndex, { type: "vocab-image", label: "看圖寫單字", prompt: "Look and write the word.", answer: word.word, asset: word, lines: 1, difficulty: 1 }));
        result.choice.push(tagged(unit, unitIndex, { type: "choice", label: "選擇題", prompt: "Choose the correct word.", answer: word.word, choices: shuffle([word.word, ...distractors(word.word, allWords)]), asset: word, lines: 0, difficulty: 1 }));
      });
      sentences.forEach((sentence, sentenceIndex) => {
        const word = words.find((item) => sentence.toLowerCase().includes(item.word.toLowerCase().replace("(s)", "")));
        if (word) result["image-sentence"].push(tagged(unit, unitIndex, { type: "image-sentence", label: "看圖寫句子", prompt: imageSentencePrompt(sentence), answer: sentence, asset: word, lines: 2, difficulty: 2 }));
        const tokens = sentence.replace(/[?.!,]/g, "").split(/\s+/).filter((token) => token.length > 1);
        const target = (word?.word || tokens[Math.max(0, tokens.length - 1)] || "").replace("(s)", "");
        if (target && sentence.toLowerCase().includes(target.toLowerCase())) result.fill.push(tagged(unit, unitIndex, { type: "fill", label: "填空題", prompt: sentence.replace(new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "________"), answer: target, lines: 1, difficulty: 1 }));
        const wrong = wrongSentence(sentence);
        if (wrong) result.error.push(tagged(unit, unitIndex, { type: "error", label: "改錯題", prompt: `Correct the sentence: ${wrong}`, answer: sentence, lines: 2, difficulty: 2 }));
        const ordered = sentence.replace(/([?.!,])/g, " $1").split(/\s+/).filter(Boolean);
        result.reorder.push(tagged(unit, unitIndex, { type: "reorder", label: "句子重組", prompt: `Put in order: ${shuffle(ordered).join(" / ")}`, answer: sentence, lines: 2, difficulty: 2 }));
        const transformed = negativeOrQuestion(sentence);
        if (transformed) result.transform.push(tagged(unit, unitIndex, { type: "transform", label: "句型轉換", ...transformed, lines: 2, difficulty: 3 }));
        if (sentence.endsWith("?") && sentences[sentenceIndex + 1]) result.dialogue.push(tagged(unit, unitIndex, { type: "dialogue", label: "對話填空", prompt: `A: ${sentence}\nB: ____________________`, answer: sentences[sentenceIndex + 1], lines: 2, difficulty: 3 }));
      });
    });
    return result;
  }

  function config() {
    return {
      title: document.getElementById("test-title").value.trim() || "English Review Test",
      bookId: bookSelect.value,
      units: [...unitList.querySelectorAll("input:checked")].map((input) => input.value),
      difficulty: document.getElementById("test-difficulty").value,
      spiral: document.getElementById("test-spiral").checked,
      counts: Object.fromEntries(TYPES.map(([id]) => [id, Math.max(0, Number(document.querySelector(`[data-type-count="${id}"]`).value) || 0)]))
    };
  }

  function generate() {
    const settings = config();
    const units = selectedUnits();
    if (!units.length) { empty.textContent = "請至少選擇一個 Unit。"; return; }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    pools = buildPools(units);
    questions = [];
    TYPES.forEach(([type]) => {
      const wanted = settings.counts[type];
      let candidates = pools[type] || [];
      if (settings.difficulty === "easy") candidates = candidates.filter((q) => q.difficulty <= 1);
      if (settings.difficulty === "challenge") candidates = candidates.filter((q) => q.difficulty >= 2);
      if (!candidates.length) candidates = pools[type] || [];
      const shuffled = shuffle(candidates);
      for (let index = 0; index < wanted && shuffled.length; index += 1) questions.push({ ...shuffled[index % shuffled.length], id: `exam-${type}-${index}-${Date.now()}` });
    });
    questions = shuffle(questions);
    mode = "student";
    render();
  }

  function lines(count) { return Array.from({ length: count || 0 }, () => `<span class="worksheet-answer-line" aria-hidden="true"></span>`).join(""); }
  function questionMarkup(question, index) {
    const choices = question.choices?.length ? `<div class="test-question-choices">${question.choices.map((choice, i) => `<span>(${String.fromCharCode(65 + i)}) ${esc(choice)}</span>`).join("")}</div>` : "";
    return `<article class="test-question" data-question-id="${esc(question.id)}">
      <div class="test-question-number">${index + 1}</div><div class="test-question-content"><small>${esc(question.label)} · ${esc(question.unitLabel)}</small>${assetMarkup(question.asset)}<p>${esc(question.prompt)}</p>${choices}${lines(question.lines)}</div>
      <label class="test-points no-print"><input data-points type="number" min="1" max="20" value="${question.points}"> 分</label>
      <div class="test-question-actions no-print"><button data-replace type="button">換一題</button><button data-remove type="button">刪除</button></div>
    </article>`;
  }

  function examPage(items, page, startIndex, pageTotal) {
    const settings = config();
    const total = questions.reduce((sum, q) => sum + Number(q.points || 0), 0);
    const unitNames = selectedUnits().map((unit) => unit.title).join(" · ");
    return `<section class="test-page">
      <header class="test-page-header"><div><span>${esc(selectedBook().title)} · ${esc(unitNames)}</span><h1>${esc(settings.title)}</h1></div><strong>${page} / ${pageTotal}</strong></header>
      <div class="worksheet-name-row"><span>Name 姓名：________________</span><span>Class 班級：____________</span><span>Score 成績：____ / ${total}</span></div>
      <div class="test-question-list">${items.map((q, i) => questionMarkup(q, startIndex + i)).join("")}</div>
      <footer><span>English Teaching Player · Test Bank</span><span>Check your answers carefully.</span></footer>
    </section>`;
  }

  function answerPage(items, page, startIndex, pageTotal) {
    const total = questions.reduce((sum, q) => sum + Number(q.points || 0), 0);
    return `<section class="test-page test-answer-page"><header class="test-page-header"><div><span>TEACHER ANSWER KEY · ${page} / ${pageTotal}</span><h1>${esc(config().title)}</h1></div><strong>${total} pts</strong></header><div class="test-answer-grid">${items.map((q, i) => `<article><b>${startIndex + i + 1}. ${esc(q.answer)}</b><small>${esc(q.label)} · ${q.points} 分</small></article>`).join("")}</div></section>`;
  }

  function render() {
    empty.hidden = Boolean(questions.length);
    document.getElementById("test-student-mode").classList.toggle("is-active", mode === "student");
    document.getElementById("test-answer-mode").classList.toggle("is-active", mode === "answer");
    if (!questions.length) { preview.innerHTML = ""; return; }
    const pages = [];
    for (let index = 0; index < questions.length; index += 8) pages.push(questions.slice(index, index + 8));
    const answerPages = [];
    for (let index = 0; index < questions.length; index += 24) answerPages.push(questions.slice(index, index + 24));
    document.getElementById("test-student-mode").textContent = `學生考卷 · ${pages.length} pages`;
    document.getElementById("test-answer-mode").textContent = `教師答案 · ${answerPages.length} pages`;
    preview.innerHTML = mode === "student"
      ? pages.map((items, index) => examPage(items, index + 1, index * 8, pages.length)).join("")
      : answerPages.map((items, index) => answerPage(items, index + 1, index * 24, answerPages.length)).join("");
  }

  async function exportWord() {
    if (!questions.length) { empty.hidden = false; empty.textContent = "請先產生考卷，再下載 Word。"; return; }
    const button = document.getElementById("test-word");
    const original = button.textContent;
    button.disabled = true;
    button.textContent = "正在建立 Word...";
    try {
      const blob = await window.WordExamExporter.createBlob({
        mode,
        title: config().title,
        bookTitle: selectedBook().title,
        unitNames: selectedUnits().map((unit) => unit.title).join(" · "),
        questions
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${config().title.replace(/[\\/:*?"<>|]/g, "-")}-${mode === "answer" ? "Answer-Key" : "Student"}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (error) {
      console.error(error);
      window.alert("Word 檔建立失敗，請重新整理後再試一次。");
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  }

  function renderUnits(saved = []) {
    const book = selectedBook();
    unitList.innerHTML = book.units.map((unit, index) => `<label><input type="checkbox" value="${esc(unit.id)}" ${saved.includes(unit.id) || (!saved.length && index === 0) ? "checked" : ""}> Unit ${index + 1} · ${esc(unit.topic)}</label>`).join("");
  }

  function init() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {};
    bookSelect.innerHTML = catalog.map((book) => `<option value="${esc(book.id)}">${esc(book.title)}</option>`).join("");
    if (catalog.some((book) => book.id === saved.bookId)) bookSelect.value = saved.bookId;
    renderUnits(saved.units || []);
    typeList.innerHTML = TYPES.map(([id, label, defaultCount]) => `<label><span>${label}</span><input data-type-count="${id}" type="number" min="0" max="10" value="${saved.counts?.[id] ?? defaultCount}"></label>`).join("");
    if (saved.title) document.getElementById("test-title").value = saved.title;
    if (saved.difficulty) document.getElementById("test-difficulty").value = saved.difficulty;
    document.getElementById("test-spiral").checked = saved.spiral ?? true;
  }

  document.getElementById("test-builder-button").addEventListener("click", () => { modal.hidden = false; document.body.classList.add("test-builder-open"); });
  document.getElementById("test-builder-close").addEventListener("click", () => { modal.hidden = true; document.body.classList.remove("test-builder-open"); });
  modal.addEventListener("click", (event) => { if (event.target === modal) { modal.hidden = true; document.body.classList.remove("test-builder-open"); } });
  bookSelect.addEventListener("change", () => renderUnits());
  document.getElementById("test-generate").addEventListener("click", generate);
  document.getElementById("test-regenerate").addEventListener("click", generate);
  document.getElementById("test-shuffle").addEventListener("click", () => { questions = shuffle(questions); render(); });
  document.getElementById("test-student-mode").addEventListener("click", () => { mode = "student"; render(); });
  document.getElementById("test-answer-mode").addEventListener("click", () => { mode = "answer"; render(); });
  document.getElementById("test-word").addEventListener("click", exportWord);
  document.getElementById("test-print").addEventListener("click", () => { document.body.classList.add("printing-exam"); window.print(); });
  window.addEventListener("afterprint", () => document.body.classList.remove("printing-exam"));
  preview.addEventListener("click", (event) => {
    const card = event.target.closest("[data-question-id]"); if (!card) return;
    const index = questions.findIndex((q) => q.id === card.dataset.questionId); if (index < 0) return;
    if (event.target.closest("[data-remove]")) questions.splice(index, 1);
    if (event.target.closest("[data-replace]")) {
      const alternatives = (pools[questions[index].type] || []).filter((q) => !questions.some((current) => current.answer === q.answer));
      if (alternatives.length) questions[index] = { ...alternatives[Math.floor(Math.random() * alternatives.length)], id: `replacement-${Date.now()}` };
    }
    render();
  });
  preview.addEventListener("change", (event) => { if (!event.target.matches("[data-points]")) return; const card = event.target.closest("[data-question-id]"); const q = questions.find((item) => item.id === card?.dataset.questionId); if (q) { q.points = Math.max(1, Number(event.target.value) || 1); render(); } });
  init();
})();

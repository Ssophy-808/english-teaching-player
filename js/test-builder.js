(function () {
  "use strict";

  const STORAGE_KEY = "englishTeachingPlayer.testBuilder.v3";
  const TYPES = [
    ["vocab-image", "看圖寫單字", 2], ["image-sentence", "看圖問答", 2],
    ["choice", "文法選擇題", 2], ["sentence-choice", "選出正確句", 2],
    ["error", "改錯題", 2], ["reorder", "句子重組", 2], ["transform", "句型轉換", 2],
    ["reading", "短文閱讀", 1], ["grammar-circle", "圈選文法", 2],
    ["read-write-clues", "看圖寫句", 2], ["guided-reading", "圖文閱讀", 1], ["word-path", "選字組句", 2],
    ["listening-context", "情境聽力", 1], ["phonics-listening", "Sound It Out 聽辨", 10]
  ];
  const SECTION_META = {
    "vocab-image": { title: "Look and Write", instruction: "Look at each picture. Write the word." },
    "image-sentence": { title: "Look and Write", instruction: "Look at the picture. If you see a question, answer it. If you see an answer, write the question." },
    choice: { title: "Choose the Answer", instruction: "Choose the best answer." },
    "sentence-choice": { title: "Choose the Correct Sentence", instruction: "Choose the correct complete sentence." },
    error: { title: "Find the Mistake", instruction: "Find the mistake and rewrite the whole sentence." },
    reorder: { title: "Put the Words in Order", instruction: "Put the words in the correct order." },
    transform: { title: "Change the Sentence", instruction: "Rewrite each sentence as directed." },
    reading: { title: "Read and Answer", instruction: "Read the passage. Answer each question." },
    "grammar-circle": { title: "Look and Circle", instruction: "Circle the correct grammar word." },
    "read-write-clues": { title: "Look, Count, and Write", instruction: "Use the picture and number to write a complete sentence." },
    "guided-reading": { title: "Read, Look, and Write", instruction: "Read the short text and answer each question." },
    "word-path": { title: "Read and Circle the Correct Words", instruction: "Circle the words that make the correct sentence." },
    "listening-context": { title: "Listen and Choose", instruction: "Scan the QR code. Listen to each track and choose the best answer." },
    "phonics-listening": { title: "Sound It Out Listening", instruction: "Scan the QR code. Listen to each track and choose the word or word pair you hear." }
  };
  const CHINESE_NUMBERS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
  const catalog = window.COURSE_CATALOG || [];
  const phonicsCourses = window.PHONICS_COURSES || [];
  const modal = document.getElementById("test-builder-modal");
  const preview = document.getElementById("test-preview");
  const empty = document.getElementById("test-builder-empty");
  const bookSelect = document.getElementById("test-book");
  const unitList = document.getElementById("test-units");
  const phonicsUnitList = document.getElementById("test-phonics-units");
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

  function selectedPhonicsUnits() {
    const selected = new Set([...phonicsUnitList.querySelectorAll("input:checked")].map((input) => input.value));
    return phonicsCourses.flatMap((course) => course.units
      .filter((unit) => selected.has(`${course.id}/${unit.id}`))
      .map((unit) => ({ ...unit, courseId: course.id, courseTitle: course.title })));
  }

  function tagged(unit, unitIndex, data) { return { ...data, id: `q-${++serial}`, unitLabel: `Unit ${unitIndex + 1}`, points: 2 }; }

  function grammarChoice(sentence) {
    const clean = sentence.trim();
    const modalMatch = clean.match(/\b(can't|can)\b/i);
    if (modalMatch) {
      const startsSentence = modalMatch.index === 0;
      const answer = modalMatch[0].toLowerCase();
      let choices;
      if (answer === "can't") choices = ["can't", "aren't", "don't"];
      else if (/^Yes,/i.test(clean)) choices = ["can", "am", "do"];
      else if (startsSentence) choices = ["can", "are", "is"];
      else choices = ["can", "am", "is"];
      const format = (word) => startsSentence ? word.charAt(0).toUpperCase() + word.slice(1) : word;
      return {
        prompt: `Choose the correct modal verb.\n${clean.slice(0, modalMatch.index)}___${clean.slice(modalMatch.index + modalMatch[0].length)}`,
        answer: format(answer),
        choices: shuffle(choices.map(format)),
        difficulty: 1
      };
    }
    const groups = [
      { pattern: /\b(am|are|is)\b/i, choices: ["am", "are", "is"], difficulty: 1 },
      { pattern: /\b(do|does)\b/i, choices: ["do", "does", "are"], difficulty: 2 },
      { pattern: /\b(don't|doesn't)\b/i, choices: ["don't", "doesn't", "isn't"], difficulty: 2 },
      { pattern: /\b(like|likes)\b/i, choices: ["like", "likes", "liking"], difficulty: 2 },
      { pattern: /\b(want|wants)\b/i, choices: ["want", "wants", "wanting"], difficulty: 2 },
      { pattern: /\b(have|has)\b/i, choices: ["have", "has", "having"], difficulty: 2 },
      { pattern: /\b(some|any)\b/i, choices: ["some", "any", "a"], difficulty: 2 },
      { pattern: /\b(on)\b/i, choices: ["on", "in", "at"], difficulty: 2 }
    ];
    const group = groups.find((item) => item.pattern.test(clean));
    if (!group) return null;
    const match = clean.match(group.pattern);
    const startsSentence = match.index === 0;
    const format = (word) => startsSentence ? word.charAt(0).toUpperCase() + word.slice(1) : word.toLowerCase();
    return {
      prompt: `Choose the correct grammar word.\n${clean.slice(0, match.index)}___${clean.slice(match.index + match[0].length)}`,
      answer: format(match[0].toLowerCase()),
      choices: shuffle(group.choices.map(format)),
      difficulty: group.difficulty
    };
  }

  function negativeOrQuestion(sentence) {
    const clean = sentence.trim();
    let match = clean.match(/^(I|You|We|They|He|She|It) (am|are|is) (.+)\.$/i);
    if (match) return { prompt: `Change to negative: ${clean}`, answer: `${match[1]} ${match[2]} not ${match[3]}.` };
    match = clean.match(/^There is (.+)\.$/i);
    if (match) return { prompt: `Change to a question: ${clean}`, answer: `Is there ${match[1]}?` };
    match = clean.match(/^(I|You|We|They) like (.+)\.$/i);
    if (match) return { prompt: `Change to a Yes/No question: ${clean}`, answer: `Do ${match[1].toLowerCase()} like ${match[2]}?` };
    match = clean.match(/^(I|You|We|They) (want|have) (.+)\.$/i);
    if (match) return { prompt: `Change to a Yes/No question: ${clean}`, answer: `Do ${match[1].toLowerCase()} ${match[2].toLowerCase()} ${match[3]}?` };
    match = clean.match(/^(He|She|Ludi|Lumi) (likes|wants|has) (.+)\.$/i);
    if (match) {
      const baseVerb = match[2].toLowerCase() === "has" ? "have" : match[2].toLowerCase().replace(/s$/, "");
      return { prompt: `Change to a Yes/No question: ${clean}`, answer: `Does ${match[1].toLowerCase()} ${baseVerb} ${match[3]}?` };
    }
    return null;
  }

  function wrongSentence(sentence) {
    if (/^No, there (?:is|are) not\.$/i.test(sentence.trim())) return "No, there not.";
    if (/^No, there (?:isn't|aren't)\.$/i.test(sentence.trim())) return "No, there not.";
    if (/^Yes, there (?:is|are)\.$/i.test(sentence.trim())) return "Yes, there.";
    const rules = [[" am ", " are "], [" are ", " is "], [" is ", " are "], [" like ", " likes "], [" likes ", " like "], [" want ", " wants "], [" wants ", " want "], [" have ", " has "], [" has ", " have "], [" some ", " any "], [" any ", " some "], [" on ", " in "], ["There is ", "There are "]];
    const rule = rules.find(([from]) => sentence.includes(from));
    return rule ? sentence.replace(rule[0], rule[1]) : "";
  }

  function wrongVariants(sentence) {
    const clean = sentence.trim();
    const variants = new Set();
    const add = (value) => { if (value && value !== clean) variants.add(value); };
    add(wrongSentence(clean));
    const rules = [
      [/^I am\b/i, "I are"], [/^You are\b/i, "You am"], [/^(He|She|It) is\b/i, "$1 are"],
      [/^(We|They) are\b/i, "$1 is"], [/^There is\b/i, "There are"], [/^Is there\b/i, "Are there"],
      [/^What do (you|they)\b/i, "What does $1"], [/^Do (you|they)\b/i, "Does $1"],
      [/^What does (he|she|Ludi|Lumi)\b/i, "What do $1"], [/^Does (he|she|Ludi|Lumi)\b/i, "Do $1"],
      [/\b(I|You|We|They) like\b/i, "$1 likes"], [/\b(He|She|Ludi|Lumi) likes\b/i, "$1 like"],
      [/\b(I|You|We|They) want\b/i, "$1 wants"], [/\b(He|She|Ludi|Lumi) wants\b/i, "$1 want"],
      [/\b(I|You|We|They) have\b/i, "$1 has"], [/\b(He|She|Ludi|Lumi) has\b/i, "$1 have"],
      [/\ba ([aeiou])/i, "an $1"], [/\ban ([^aeiou\W])/i, "a $1"]
    ];
    rules.forEach(([pattern, replacement]) => { if (pattern.test(clean)) add(clean.replace(pattern, replacement)); });
    if (clean.endsWith("?")) add(clean.replace(/\?$/, "."));
    else if (clean.endsWith(".")) add(clean.replace(/\.$/, "?"));
    return [...variants];
  }

  function sentenceChoice(sentence) {
    const wrong = shuffle(wrongVariants(sentence)).slice(0, 2);
    if (wrong.length < 2) return null;
    return {
      prompt: "Choose the only correct complete sentence.",
      answer: sentence,
      choices: shuffle([sentence, ...wrong]),
      difficulty: 2
    };
  }

  function imageSentenceCue(sentence) {
    const clean = sentence.trim();
    const colors = "red|yellow|green|blue|pink|black|white|brown|orange|purple";
    const feelings = "happy|sad|hungry|thirsty|angry|sleepy|tired";
    const descriptions = "chubby|thin|young|old|short|tall|cute|lazy|noisy|quiet";
    const locationStart = "in|on|under|behind|beside|near|inside|outside|next to|in front of";
    let match;

    if (/^Is there\b/i.test(clean)) return { question: "What question can you ask about the picture?", starter: "Is there..." };
    if (/^There (?:is|isn't|is not)\b/i.test(clean)) return { question: "What is in the classroom?", starter: /^There isn't/i.test(clean) ? "There isn't..." : /^There is not/i.test(clean) ? "There is not..." : "There is..." };
    if (/^There (?:are|aren't|are not)\b/i.test(clean)) return { question: "What can you see?", starter: /^There aren't/i.test(clean) ? "There aren't..." : /^There are not/i.test(clean) ? "There are not..." : "There are..." };

    match = clean.match(/^(I am|He is|She is) (?:not )?\w+ years? old\./i);
    if (match) return { question: /^I am/i.test(clean) ? "How old are you?" : /^He is/i.test(clean) ? "How old is he?" : "How old is she?", starter: `${match[1]}...` };
    if (/^He is my\b/i.test(clean)) return { question: "Who is he?", starter: "He is my..." };
    if (/^She is my\b/i.test(clean)) return { question: "Who is she?", starter: "She is my..." };
    match = clean.match(/^(I am|You are|He is|She is) (?:not )?(.+?)\.$/i);
    if (match && new RegExp(`^(?:${feelings})$`, "i").test(match[2])) {
      const question = /^He is/i.test(clean) ? "How does he feel?" : /^She is/i.test(clean) ? "How does she feel?" : "How do you feel?";
      return { question, starter: `${match[1]}...` };
    }
    if (match && new RegExp(`^(?:${descriptions})$`, "i").test(match[2])) {
      const question = /^He is/i.test(clean) ? "What is he like?" : /^She is/i.test(clean) ? "What is she like?" : "What are you like?";
      return { question, starter: `${match[1]}...` };
    }
    if (match && new RegExp(`^(?:${locationStart})\\b`, "i").test(match[2])) {
      const question = /^He is/i.test(clean) ? "Where is he?" : /^She is/i.test(clean) ? "Where is she?" : "Where are you?";
      return { question, starter: `${match[1]}...` };
    }
    match = clean.match(/^(I|You|He|She|We|They) can (.+)\.$/i);
    if (match) {
      const subject = match[1].toLowerCase();
      const question = subject === "he" ? "What can he do?" : subject === "she" ? "What can she do?" : subject === "they" ? "What can they do?" : "What can you do?";
      return { question, starter: `${match[1]} can...` };
    }
    if (new RegExp(`^It is (?:not )?(?:${colors})\\.$`, "i").test(clean)) return { question: "What color is it?", starter: /^It is not/i.test(clean) ? "It is not..." : "It is..." };
    if (/^It is (?:not )?(?:an? )/i.test(clean)) return { question: "What is it?", starter: /^It is not/i.test(clean) ? "It is not..." : "It is..." };
    if (/^This is\b/i.test(clean)) return { question: "What is this?", starter: /^This is not/i.test(clean) ? "This is not..." : "This is..." };
    if (/^That is\b/i.test(clean)) return { question: "What is that?", starter: /^That is not/i.test(clean) ? "That is not..." : "That is..." };
    if (/^These are\b/i.test(clean)) return { question: "What are these?", starter: "These are..." };
    if (/^Those are\b/i.test(clean)) return { question: "What are those?", starter: "Those are..." };
    if (new RegExp(`^They are (?:not )?(?:${feelings})\\.`, "i").test(clean)) return { question: "How do they feel?", starter: /^They are not/i.test(clean) ? "They are not..." : "They are..." };
    if (new RegExp(`^They are (?:not )?(?:${descriptions})\\.`, "i").test(clean)) return { question: "What are they like?", starter: /^They are not/i.test(clean) ? "They are not..." : "They are..." };
    if (new RegExp(`^They are (?:${locationStart})\\b`, "i").test(clean)) return { question: "Where are they?", starter: "They are..." };
    if (/^They are\b/i.test(clean)) return { question: "What are they?", starter: /^They are not/i.test(clean) ? "They are not..." : "They are..." };
    if (/^I like\b/i.test(clean)) return { question: "What do you like?", starter: "I like..." };
    if (/^You like\b/i.test(clean)) return { question: "What do you like?", starter: "You like..." };
    if (/^We like\b/i.test(clean)) return { question: "What do you and your classmates like?", starter: "We like..." };
    if (/^They like\b/i.test(clean)) return { question: "What do they like?", starter: "They like..." };
    if (/^I don't like\b/i.test(clean)) return { question: "What don't you like?", starter: "I don't like..." };
    if (/^We don't like\b/i.test(clean)) return { question: "What don't you and your classmates like?", starter: "We don't like..." };
    if (/^They don't like\b/i.test(clean)) return { question: "What don't they like?", starter: "They don't like..." };
    if (/^What do you like\?/i.test(clean)) return { question: "What question asks a person what they like?", starter: "What do you..." };
    if (/^What do they like\?/i.test(clean)) return { question: "What question asks what they like?", starter: "What do they..." };
    if (/^Do you like\b/i.test(clean)) return { question: "Write a Yes/No question about the picture.", starter: "Do you like..." };
    if (/^Do they like\b/i.test(clean)) return { question: "Write a Yes/No question about the picture.", starter: "Do they like..." };

    match = clean.match(/^(I am|You are|He is|She is|It is) (not )?/i);
    if (match) {
      const subject = match[1].split(" ")[0].toLowerCase();
      const objectPronoun = subject === "he" ? "him" : subject === "she" ? "her" : subject;
      const question = subject === "i" || subject === "you" ? "What can you say about the person?" : `What can you say about ${objectPronoun}?`;
      return { question, starter: match[2] ? `${match[1]} ${match[2].trim()}...` : `${match[1]}...` };
    }
    if (clean.endsWith("?")) return { question: "What question can you ask about the picture?", starter: `${clean.split(/\s+/).slice(0, 3).join(" ").replace(/[?]$/, "")}...` };
    return { question: "What do you see in the picture?", starter: `${clean.split(/\s+/).slice(0, 2).join(" ")}...` };
  }

  function vocabularyAsset(words, text) {
    const clean = text.toLowerCase();
    return words.find((item) => {
      const forms = [item.word, ...(item.aliases || [])]
        .map((form) => String(form).toLowerCase().replace(/\(s\)|\(es\)/g, "").trim())
        .filter(Boolean);
      return forms.some((form) => clean.includes(form));
    });
  }

  function questionAnswerPair(sentence, nextSentence = "") {
    const combined = sentence.trim().match(/^(.+?\?)\s+(.+)$/);
    if (combined) return { question: combined[1], answer: combined[2], consumesNext: false };
    if (sentence.trim().endsWith("?") && nextSentence && !nextSentence.includes("?")) {
      return { question: sentence.trim(), answer: nextSentence.trim(), consumesNext: true };
    }
    return null;
  }

  function addPhonicsQuestions(result, units) {
    units.forEach((unit) => {
      const unitLabel = `${unit.courseTitle || "Sound It Out"} · Unit ${unit.number}`;
      Object.entries(window.LISTENING_ITEMS || {})
        .filter(([, item]) => item.source === `${unit.courseId}/${unit.id}` && item.kind === "phonics-word")
        .forEach(([listeningId, listening]) => result["phonics-listening"].push({
          id: `q-${++serial}`, type: "phonics-listening", label: "Sound It Out Listening", unitLabel,
          listeningId, prompt: listening.question, answer: listening.answer,
          choices: shuffle([...listening.choices]), transcript: [...listening.transcript],
          audio: listening.audio, points: 2, difficulty: 1, lines: 0
        }));
    });
  }

  function buildPools(units, phonicsUnits = []) {
    const result = Object.fromEntries(TYPES.map(([id]) => [id, []]));
    units.forEach((unit) => {
      const book = selectedBook();
      const unitIndex = book.units.indexOf(unit);
      const data = curriculum(unit);
      const words = data.vocabulary || [];
      const sentences = (data.mainSentences || []).filter(Boolean);
      const pairedAnswerIndexes = new Set();
      const pack = window.UNIT_PACKS?.[`${book.id}/${unit.id}`];
      const reading = pack?.reading;
      const pictureGroup = (asset) => pack?.useWorksheetPictureQuestions && asset?.word
        ? `${book.id}/${unit.id}/${asset.word}`
        : undefined;
      Object.entries(window.LISTENING_ITEMS || {})
        .filter(([, item]) => item.source === `${book.id}/${unit.id}` && item.kind === "context")
        .forEach(([listeningId, item]) => {
          result["listening-context"].push(tagged(unit, unitIndex, {
            type: "listening-context", label: "情境聽力", listeningId,
            prompt: item.question, answer: item.answer, choices: [...item.choices],
            transcript: [...item.transcript], audio: item.audio, lines: 0, difficulty: 2
          }));
        });
      (reading?.questions || []).forEach((question) => {
        result.reading.push(tagged(unit, unitIndex, {
          type: "reading", label: "短文閱讀",
          prompt: `${reading.title}\n${reading.lines.join(" ")}\n\n${question.q}`,
          answer: question.a, lines: 2, difficulty: 2
        }));
      });
      const reviewTypeMap = {
        grammar_circle: ["grammar-circle", "圈選文法", 0],
        read_write_clues: ["read-write-clues", "看圖寫句", 2],
        story_cloze: ["guided-reading", "圖文閱讀", 2],
        word_path: ["word-path", "選字組句", 0]
      };
      unit.lessons?.flatMap((lesson) => lesson.worksheet?.pages || [])
        .filter((page) => reviewTypeMap[page.type])
        .forEach((page) => {
          const [type, label, lines] = reviewTypeMap[page.type];
          page.items.forEach((item) => result[type].push(tagged(unit, unitIndex, {
            type,
            label,
            prompt: page.type === "story_cloze"
              ? (page.introLines || []).join(" ") + "\n\n" + item.question
              : item.prompt,
            answer: item.expectedAnswer,
            asset: item.asset,
            lines,
            difficulty: page.type === "story_cloze" ? 2 : 1
          })));
        });
      words.forEach((word) => {
        result["vocab-image"].push(tagged(unit, unitIndex, { type: "vocab-image", label: "看圖寫單字", prompt: "Look and write the word.", answer: word.word, asset: word, pictureGroup: pictureGroup(word), lines: 1, difficulty: 1 }));
      });
      if (pack?.useWorksheetPictureQuestions) {
        unit.lessons?.flatMap((lesson) => lesson.worksheet?.pages || [])
          .filter((page) => page.type === "template_picture_answer")
          .flatMap((page) => page.items)
          .filter((item) => item.asset?.image || item.asset?.sprite?.src)
          .forEach((item) => {
            const shared = { type: "image-sentence", asset: item.asset, pictureGroup: pictureGroup(item.asset), lines: 2, difficulty: 2 };
            result["image-sentence"].push(tagged(unit, unitIndex, { ...shared, label: "看圖回答", prompt: item.prompt, answer: item.expectedAnswer }));
            // The affirmative answer supplies the same object and color, so it points back to one question.
            if (/^Is /i.test(item.prompt) && /^Yes,/i.test(item.expectedAnswer)) {
              result["image-sentence"].push(tagged(unit, unitIndex, { ...shared, label: "看圖寫問句", prompt: "", givenAnswer: item.expectedAnswer, answer: item.prompt }));
            }
          });
      }
      sentences.forEach((sentence, sentenceIndex) => {
        const pair = questionAnswerPair(sentence, sentences[sentenceIndex + 1]);
        if (pair) {
          const pairAsset = vocabularyAsset(words, `${pair.question} ${pair.answer}`);
          if (pairAsset && !pack?.useWorksheetPictureQuestions) {
            result["image-sentence"].push(tagged(unit, unitIndex, { type: "image-sentence", label: "看圖回答", prompt: `Question: ${pair.question}`, answer: pair.answer, asset: pairAsset, lines: 2, difficulty: 2 }));
            result["image-sentence"].push(tagged(unit, unitIndex, { type: "image-sentence", label: "看圖寫問句", prompt: "", givenAnswer: pair.answer, answer: pair.question, asset: pairAsset, lines: 2, difficulty: 2 }));
          }
          if (pair.consumesNext) pairedAnswerIndexes.add(sentenceIndex + 1);
        } else if (!pack?.useWorksheetPictureQuestions && !pairedAnswerIndexes.has(sentenceIndex) && !sentence.includes("?")) {
          const word = vocabularyAsset(words, sentence);
          if (word) {
            const cue = imageSentenceCue(sentence);
            result["image-sentence"].push(tagged(unit, unitIndex, { type: "image-sentence", label: "看圖回答", prompt: `Question: ${cue.question}`, answer: sentence, asset: word, lines: 2, difficulty: 2 }));
          }
        }
        const word = vocabularyAsset(words, sentence);
        const grammar = grammarChoice(sentence);
        if (grammar) result.choice.push(tagged(unit, unitIndex, { type: "choice", label: "文法選擇題", ...grammar, lines: 0 }));
        const completeChoice = sentenceChoice(sentence);
        if (completeChoice) result["sentence-choice"].push(tagged(unit, unitIndex, { type: "sentence-choice", label: "選出正確句", ...completeChoice, lines: 0 }));
        wrongVariants(sentence).slice(0, 2).forEach((wrong) => result.error.push(tagged(unit, unitIndex, { type: "error", label: "改錯題", prompt: `Find the mistake and rewrite the whole sentence: ${wrong}`, answer: sentence, lines: 2, difficulty: 2 })));
        const ordered = sentence.replace(/([?.!,])/g, " $1").split(/\s+/).filter(Boolean);
        result.reorder.push(tagged(unit, unitIndex, { type: "reorder", label: "句子重組", prompt: `Put in order: ${shuffle(ordered).join(" / ")}`, answer: sentence, lines: 2, difficulty: 2 }));
        const transformed = negativeOrQuestion(sentence);
        if (transformed) result.transform.push(tagged(unit, unitIndex, { type: "transform", label: "句型轉換", ...transformed, lines: 2, difficulty: 3 }));
      });
    });
    addPhonicsQuestions(result, phonicsUnits);
    Object.keys(result).forEach((type) => {
      const seen = new Set();
      result[type] = result[type].filter((question) => {
        const key = `${question.type}|${question.prompt}|${question.answer}|${question.asset?.word || ""}`.toLowerCase().replace(/\s+/g, " ");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
    return result;
  }

  function selectDiverse(candidates, wanted, selected) {
    const remaining = shuffle(candidates);
    const picked = [];
    const normalized = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    while (picked.length < wanted && remaining.length) {
      const usage = new Map();
      [...selected, ...picked].forEach((question) => {
        const answer = normalized(question.answer);
        const unit = question.unitLabel || "";
        usage.set(`a:${answer}`, (usage.get(`a:${answer}`) || 0) + 1);
        usage.set(`u:${unit}`, (usage.get(`u:${unit}`) || 0) + 1);
        if (question.pictureGroup) {
          usage.set(`p:${question.pictureGroup}`, (usage.get(`p:${question.pictureGroup}`) || 0) + 1);
          usage.set(`k:${question.label}`, (usage.get(`k:${question.label}`) || 0) + 1);
        }
      });
      remaining.sort((a, b) => {
        const score = (q) => (usage.get(`a:${normalized(q.answer)}`) || 0) * 6
          + (usage.get(`u:${q.unitLabel}`) || 0)
          + (q.pictureGroup ? (usage.get(`p:${q.pictureGroup}`) || 0) * 12 + (usage.get(`k:${q.label}`) || 0) : 0);
        return score(a) - score(b);
      });
      picked.push(remaining.shift());
    }
    return picked;
  }

  function config() {
    return {
      title: document.getElementById("test-title").value.trim() || "English Review Test",
      bookId: bookSelect.value,
      units: [...unitList.querySelectorAll("input:checked")].map((input) => input.value),
      difficulty: document.getElementById("test-difficulty").value,
      spiral: document.getElementById("test-spiral").checked,
      phonicsUnits: [...phonicsUnitList.querySelectorAll("input:checked")].map((input) => input.value),
      counts: Object.fromEntries(TYPES.map(([id]) => [id, Math.max(0, Number(document.querySelector(`[data-type-count="${id}"]`).value) || 0)]))
    };
  }

  function generate() {
    const settings = config();
    const units = selectedUnits();
    const phonicsUnits = selectedPhonicsUnits();
    if (!units.length && !phonicsUnits.length) { empty.textContent = "請至少選擇一個 Come to Live 或 Sound It Out Unit。"; return; }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    pools = buildPools(units, phonicsUnits);
    questions = [];
    TYPES.forEach(([type]) => {
      const wanted = settings.counts[type];
      let candidates = pools[type] || [];
      if (settings.difficulty === "easy") candidates = candidates.filter((q) => q.difficulty <= 1);
      if (settings.difficulty === "challenge") candidates = candidates.filter((q) => q.difficulty >= 2);
      selectDiverse(candidates, wanted, questions).forEach((question, index) => questions.push({ ...question, id: `exam-${type}-${index}-${Date.now()}-${serial++}` }));
    });
    mode = "student";
    render();
  }

  function displayPrompt(question) {
    const prompt = String(question.prompt || "");
    if (question.type === "vocab-image") return "";
    if (question.type === "image-sentence") return prompt.replace(/^Question:\s*/i, "");
    if (question.type === "error") return prompt.replace(/^Find the mistake and rewrite the whole sentence:\s*/i, "");
    if (question.type === "reorder") return prompt.replace(/^Put in order:\s*/i, "");
    if (question.type === "sentence-choice") return prompt.replace(/^Choose the only correct complete sentence\.?\s*/i, "");
    if (question.type === "choice") return prompt.replace(/^Choose the correct grammar word\.?\s*/i, "");
    return prompt;
  }

  function groupedSections(list = questions) {
    let sectionIndex = 0;
    return TYPES.map(([type]) => {
      const items = list.filter((question) => question.type === type);
      if (!items.length) return null;
      const meta = SECTION_META[type] || { title: type, instruction: "" };
      const listeningItems = items.filter((question) => question.listeningId);
      const playerBase = window.LISTENING_CONFIG?.publicPlayerUrl || "";
      const playbackUrl = listeningItems.length && playerBase
        ? `${playerBase}?items=${encodeURIComponent(listeningItems.map((question) => question.listeningId).join(","))}`
        : "";
      const section = {
        type,
        number: CHINESE_NUMBERS[sectionIndex] || String(sectionIndex + 1),
        title: meta.title,
        instruction: meta.instruction,
        playbackUrl,
        items: items.map((question, itemIndex) => ({
          ...question,
          displayPrompt: `${question.listeningId ? `Track ${itemIndex + 1}. ` : ""}${displayPrompt(question)}`,
          itemNumber: itemIndex + 1
        }))
      };
      sectionIndex += 1;
      return section;
    }).filter(Boolean);
  }

  function paginateSections(sections, capacity = 4) {
    const pages = [];
    let page = { sections: [], count: 0 };
    sections.forEach((section) => {
      let offset = 0;
      while (offset < section.items.length) {
        if (page.count >= capacity) { pages.push(page); page = { sections: [], count: 0 }; }
        const available = capacity - page.count;
        const take = Math.min(available, section.items.length - offset);
        page.sections.push({ ...section, continued: offset > 0, items: section.items.slice(offset, offset + take) });
        page.count += take;
        offset += take;
      }
    });
    if (page.sections.length) pages.push(page);
    return pages;
  }

  function lines(count) { return Array.from({ length: count || 0 }, () => `<span class="worksheet-answer-line" aria-hidden="true"></span>`).join(""); }
  function questionMarkup(question) {
    const choices = question.choices?.length ? `<div class="test-question-choices">${question.choices.map((choice, i) => `<span>(${String.fromCharCode(65 + i)}) ${esc(choice)}</span>`).join("")}</div>` : "";
    const prompt = question.displayPrompt ? `<p>${esc(question.displayPrompt)}</p>` : "";
    const givenAnswer = question.givenAnswer ? `<p class="test-given-answer"><strong>Answer:</strong> ${esc(question.givenAnswer)}</p>` : "";
    return `<article class="test-question" data-question-id="${esc(question.id)}">
      <div class="test-question-number">${question.itemNumber}.</div><div class="test-question-content"><div class="test-question-top">${assetMarkup(question.asset)}<div class="test-question-text">${prompt}${choices}${givenAnswer}</div></div>${lines(question.lines)}</div>
      <label class="test-points no-print"><input data-points type="number" min="1" max="20" value="${question.points}"> 分</label>
      <div class="test-question-actions no-print"><button data-replace type="button">換一題</button><button data-remove type="button">刪除</button></div>
    </article>`;
  }

  function sectionMarkup(section) {
    const qr = section.playbackUrl && !section.continued
      ? `<a class="test-listening-qr" href="${esc(section.playbackUrl)}" target="_blank" rel="noopener"><img src="${esc(qrImageUrl(section.playbackUrl))}" alt="Listening QR code"><span>Scan to listen</span></a>`
      : "";
    return `<section class="test-exam-section"><header class="test-section-heading${qr ? " has-qr" : ""}"><div><h2>${esc(section.number)}、${esc(section.title)}${section.continued ? "（續）" : ""}</h2>${section.continued ? "" : `<p>${esc(section.instruction)}</p>`}</div>${qr}</header>${section.items.map(questionMarkup).join("")}</section>`;
  }

  function qrImageUrl(value) {
    return `https://quickchart.io/qr?size=180&margin=1&text=${encodeURIComponent(value)}`;
  }

  function examPage(pageData, page, pageTotal) {
    const settings = config();
    const total = questions.reduce((sum, q) => sum + Number(q.points || 0), 0);
    const unitNames = [
      ...selectedUnits().map((unit) => unit.title),
      ...selectedPhonicsUnits().map((unit) => `${unit.courseTitle} Unit ${unit.number} ${unit.title}`)
    ].join(" · ");
    return `<section class="test-page">
      <header class="test-page-header"><span>${esc(selectedBook().title)} · ${esc(unitNames)} · ${page}/${pageTotal}</span><h1>${esc(settings.title)}</h1><strong>Name: __________________</strong></header>
      <div class="worksheet-name-row"><span>Class 班級：____________</span><span>Score 成績：____ / ${total}</span></div>
      <div class="test-question-list">${pageData.sections.map(sectionMarkup).join("")}</div>
      <footer><span>English Worksheet Builder</span><span>Check your answers carefully.</span></footer>
    </section>`;
  }

  function answerPage(pageSections, page, pageTotal) {
    const total = questions.reduce((sum, q) => sum + Number(q.points || 0), 0);
    return `<section class="test-page test-answer-page"><header class="test-page-header"><span>TEACHER ANSWER KEY · ${page}/${pageTotal}</span><h1>${esc(config().title)}</h1><strong>${total} pts</strong></header><div class="test-answer-sections">${pageSections.map((section) => `<section><h2>${esc(section.number)}、${esc(section.title)}</h2><div class="test-answer-grid">${section.items.map((q) => `<article><b>${q.itemNumber}. ${esc(q.answer)}</b>${q.transcript?.length ? `<p><strong>Transcript:</strong> ${esc(q.transcript.join(" "))}</p>` : ""}</article>`).join("")}</div></section>`).join("")}</div></section>`;
  }

  function render() {
    empty.hidden = Boolean(questions.length);
    document.getElementById("test-student-mode").classList.toggle("is-active", mode === "student");
    document.getElementById("test-answer-mode").classList.toggle("is-active", mode === "answer");
    if (!questions.length) { preview.innerHTML = ""; return; }
    const sections = groupedSections();
    const pages = paginateSections(sections, 4);
    const answerPages = paginateSections(sections, 20);
    document.getElementById("test-student-mode").textContent = `學生考卷 · ${pages.length} pages`;
    document.getElementById("test-answer-mode").textContent = `教師答案 · ${answerPages.length} pages`;
    preview.innerHTML = mode === "student"
      ? pages.map((pageData, index) => examPage(pageData, index + 1, pages.length)).join("")
      : answerPages.map((pageData, index) => answerPage(pageData.sections, index + 1, answerPages.length)).join("");
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
        unitNames: [
          ...selectedUnits().map((unit) => unit.title),
          ...selectedPhonicsUnits().map((unit) => `${unit.courseTitle} Unit ${unit.number} ${unit.title}`)
        ].join(" · "),
        questions,
        sections: groupedSections()
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

  function renderPhonicsUnits(saved = []) {
    phonicsUnitList.innerHTML = phonicsCourses.map((course) => `<div class="test-phonics-course"><strong>${esc(course.title)}</strong>${course.units.map((unit) => {
      const value = `${course.id}/${unit.id}`;
      return `<label><input type="checkbox" value="${esc(value)}" ${saved.includes(value) ? "checked" : ""}> Unit ${unit.number} · ${esc(unit.title)}</label>`;
    }).join("")}</div>`).join("");
  }

  function init() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {};
    bookSelect.innerHTML = catalog.map((book) => `<option value="${esc(book.id)}">${esc(book.title)}</option>`).join("");
    if (catalog.some((book) => book.id === saved.bookId)) bookSelect.value = saved.bookId;
    renderUnits(saved.units || []);
    renderPhonicsUnits(saved.phonicsUnits || []);
    typeList.innerHTML = TYPES.map(([id, label, defaultCount]) => `<label><span>${label}</span><input data-type-count="${id}" type="number" min="0" max="30" value="${saved.counts?.[id] ?? defaultCount}"></label>`).join("");
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
  document.getElementById("test-shuffle").addEventListener("click", () => { questions = groupedSections().flatMap((section) => shuffle(section.items).map(({ displayPrompt: _displayPrompt, itemNumber: _itemNumber, ...question }) => question)); render(); });
  document.getElementById("test-student-mode").addEventListener("click", () => { mode = "student"; render(); });
  document.getElementById("test-answer-mode").addEventListener("click", () => { mode = "answer"; render(); });
  document.getElementById("test-word").addEventListener("click", exportWord);
  preview.addEventListener("click", (event) => {
    const card = event.target.closest("[data-question-id]"); if (!card) return;
    const index = questions.findIndex((q) => q.id === card.dataset.questionId); if (index < 0) return;
    if (event.target.closest("[data-remove]")) questions.splice(index, 1);
    if (event.target.closest("[data-replace]")) {
      const alternatives = (pools[questions[index].type] || []).filter((q) => !questions.some((current) => current.answer === q.answer));
      const candidate = questions[index].pictureGroup
        ? selectDiverse(alternatives, 1, questions)[0]
        : alternatives[Math.floor(Math.random() * alternatives.length)];
      if (candidate) questions[index] = { ...candidate, id: `replacement-${Date.now()}` };
    }
    render();
  });
  preview.addEventListener("change", (event) => { if (!event.target.matches("[data-points]")) return; const card = event.target.closest("[data-question-id]"); const q = questions.find((item) => item.id === card?.dataset.questionId); if (q) { q.points = Math.max(1, Number(event.target.value) || 1); render(); } });
  init();
})();

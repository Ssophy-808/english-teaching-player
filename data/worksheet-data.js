(function () {
  "use strict";

  const DAY_TYPES = {
    1: ["picture_sentence", "matching", "write_answer", "sentence_transform"],
    2: ["picture_sentence", "matching", "write_question", "write_answer"],
    3: ["sentence_transform", "fix_mistakes", "unscramble", "write_question"],
    4: ["fix_mistakes", "unscramble", "write_question", "big_picture"]
  };
  const TITLES = {
    picture_sentence: "Picture Sentence Practice",
    matching: "Question and Answer Matching",
    fix_mistakes: "Fix the Mistakes",
    unscramble: "Unscramble the Sentences",
    write_question: "Write the Question",
    write_answer: "Write the Answer",
    big_picture: "Big Picture Challenge",
    sentence_transform: "Sentence Transformer"
  };
  const INSTRUCTIONS = {
    picture_sentence: "Look at each picture. Use the grammar cue and write a complete sentence.",
    matching: "Draw a line from each question to its correct answer.",
    fix_mistakes: "Find the mistake and rewrite the whole sentence correctly.",
    unscramble: "Put the words in order. Write the complete sentence.",
    write_question: "Read the answer. Write the matching question.",
    write_answer: "Look carefully. Read the question and write a complete answer.",
    big_picture: "Study the whole picture board. Answer every question in a complete sentence.",
    sentence_transform: "Change each sentence as directed. Write the complete new sentence."
  };
  const BOOK_PROFILES = {
    "book-1": { sentenceWords: 6, scrambleChunks: 5, answerSentences: 1, readingLines: 0 },
    "book-2": { sentenceWords: 8, scrambleChunks: 6, answerSentences: 2, readingLines: 4 },
    "book-3": { sentenceWords: 10, scrambleChunks: 8, answerSentences: 2, readingLines: 6 },
    "book-4": { sentenceWords: 12, scrambleChunks: 9, answerSentences: 2, readingLines: 8 },
    "book-5": { sentenceWords: 14, scrambleChunks: 9, answerSentences: 2, readingLines: 10 },
    "book-6": { sentenceWords: 15, scrambleChunks: 9, answerSentences: 2, readingLines: 12 }
  };

  function vocabularyItems(unit) {
    if (window.TeachingFlow?.vocabularyItems) return window.TeachingFlow.vocabularyItems(unit.vocabulary || []);
    return (unit.vocabulary || []).map((item) => typeof item === "string" ? { word: item, visual: "🖼️" } : item);
  }

  function passportLines(unit) {
    const source = unit.passportSentences?.length ? unit.passportSentences : (window.BOOK1_PASSPORT_SENTENCES?.[unit.id] || []);
    return source.map((entry) => Array.isArray(entry) ? entry[0] : entry.text || entry).filter(Boolean);
  }

  function sentencePool(unit) {
    const lines = [...(unit.mainSentences || []), ...passportLines(unit)];
    const sentences = lines.flatMap((line) => String(line)
      .replace(/([.!?])\s+(?=[A-Z])/g, "$1|||WORKSHEET_SENTENCE|||")
      .split("|||WORKSHEET_SENTENCE|||")
      .map((sentence) => sentence.trim())
      .filter(Boolean));
    return [...new Set(sentences)];
  }

  function pairs(unit) {
    const lines = passportLines(unit);
    const result = [];
    lines.forEach((line, index) => {
      if (!line.includes("?")) return;
      const answer = lines.slice(index + 1).find((candidate) => candidate && !candidate.includes("?"));
      if (answer) result.push({ question: line, answer });
    });
    if (!result.length) {
      const questions = sentencePool(unit).filter((line) => line.includes("?"));
      const answers = sentencePool(unit).filter((line) => !line.includes("?"));
      questions.forEach((question, index) => result.push({ question, answer: answers[index % Math.max(answers.length, 1)] || "Answer in a complete sentence." }));
      if (!questions.length) answers.slice(0, 6).forEach((answer) => {
        const subject = answer.match(/^(I|You|He|She|It|We|They)\b/i)?.[0]?.toLowerCase();
        const question = subject === "i" ? "Who are you?" : subject === "you" ? "Who am I?"
          : subject === "he" ? "Who is he?" : subject === "she" ? "Who is she?"
            : subject === "it" ? "What is it?" : subject === "we" ? "Who are we?" : "Who are they?";
        result.push({ question, answer });
      });
    }
    return result;
  }

  function assetFor(sentence, vocabulary, index) {
    const lower = String(sentence).toLowerCase();
    const match = vocabulary.find((item) => lower.includes(String(item.word || "").replace(/\(s\)|\(es\)/gi, "").toLowerCase()));
    return match || vocabulary[index % Math.max(vocabulary.length, 1)] || {};
  }

  function cueFor(sentence) {
    const subject = String(sentence).match(/^(I|You|He|She|It|We|They|There|These|Those)\b/i)?.[0];
    return subject ? `Use “${subject}”.` : "Use today’s sentence pattern.";
  }

  function wrongSentence(sentence) {
    const rules = [
      [/\bI am\b/i, "I is"], [/\bYou are\b/i, "You is"], [/\bHe is\b/i, "He are"],
      [/\bShe is\b/i, "She are"], [/\bThey are\b/i, "They is"], [/\bThere is\b/i, "There are"],
      [/\bThere are\b/i, "There is"], [/\bDoes\b/i, "Do"], [/\bDo\b/i, "Does"],
      [/\blikes\b/i, "like"], [/\blike\b/i, "likes"], [/\bhas\b/i, "have"], [/\bhave\b/i, "has"]
    ];
    const rule = rules.find(([pattern]) => pattern.test(sentence));
    return rule ? sentence.replace(rule[0], rule[1]) : sentence.replace(/\.$/, "").concat(" ?");
  }

  function firstSentence(text) {
    return String(text || "").trim().match(/^.*?[.!?](?=\s|$)/)?.[0] || String(text || "").trim();
  }

  function oneSentenceAnswer(text) {
    const value = String(text || "").trim();
    const marker = value.match(/^(Yes|No),/i)?.[1];
    const sentences = value.match(/[^.!?]+[.!?]/g)?.map((sentence) => sentence.trim()) || [value];
    if (sentences.length < 2) return value;
    const last = sentences.at(-1);
    return marker ? `${marker}, ${last.charAt(0).toLowerCase()}${last.slice(1)}` : last;
  }

  function scramble(sentence, bookId = "book-6") {
    const source = firstSentence(sentence);
    const punctuation = source.match(/[?.!]$/)?.[0] || "";
    const words = source.replace(/[?.!]$/, "").trim().split(/\s+/).filter(Boolean);
    const maxChunks = BOOK_PROFILES[bookId]?.scrambleChunks || BOOK_PROFILES["book-6"].scrambleChunks;
    const wordChunkLimit = Math.max(1, maxChunks - (punctuation ? 1 : 0));
    const chunks = [];
    for (let index = 0; index < words.length;) {
      const slotsLeft = Math.min(wordChunkLimit - chunks.length, words.length - index);
      const take = Math.ceil((words.length - index) / Math.max(1, slotsLeft));
      chunks.push(words.slice(index, index + take).join(" "));
      index += take;
    }
    let seed = [...source].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 2166136261);
    const shuffled = chunks.slice();
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      seed = ((seed * 1664525) + 1013904223) >>> 0;
      const target = seed % (index + 1);
      [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
    }
    if (shuffled.length > 1 && shuffled.every((chunk, index) => chunk === chunks[index])) shuffled.push(shuffled.shift());
    return [...shuffled, punctuation].filter(Boolean).join(" / ");
  }

  function negative(sentence) {
    if (/\b(am|is|are)\b/i.test(sentence)) return sentence.replace(/\b(am|is|are)\b/i, "$1 not");
    if (/\bcan\b/i.test(sentence)) return sentence.replace(/\bcan\b/i, "cannot");
    if (/\b(likes|wants|has|goes|does)\b/i.test(sentence)) {
      return sentence.replace(/\b(likes|wants|has|goes|does)\b/i, (verb) => {
        const base = { likes: "like", wants: "want", has: "have", goes: "go", does: "do" }[verb.toLowerCase()];
        return `does not ${base}`;
      });
    }
    return sentence.replace(/\b(like|want|have|go|do)\b/i, "do not $1");
  }

  function positive(sentence) {
    if (/\b(am|is|are) not\b/i.test(sentence)) return sentence.replace(/\b(am|is|are) not\b/i, "$1");
    if (/\b(cannot|can't)\b/i.test(sentence)) return sentence.replace(/\b(cannot|can't)\b/i, "can");
    if (/\b(does not|doesn't)\s+(like|want|have|go|do)\b/i.test(sentence)) {
      return sentence.replace(/\b(does not|doesn't)\s+(like|want|have|go|do)\b/i, (_, __, verb) => {
        const thirdPerson = { like: "likes", want: "wants", have: "has", go: "goes", do: "does" }[verb.toLowerCase()];
        return thirdPerson;
      });
    }
    return sentence.replace(/\b(do not|don't)\s+(like|want|have|go|do)\b/i, "$2");
  }

  function isNegative(sentence) {
    return /\b(?:am|is|are) not\b|\b(?:cannot|can't|do not|don't|does not|doesn't)\b/i.test(sentence);
  }

  function canTransform(sentence) {
    return /\b(?:am|is|are|can|cannot|can't|like|likes|want|wants|have|has|go|goes|do|does)(?:\s+not)?\b/i.test(sentence);
  }

  function statements(unit) {
    const values = sentencePool(unit).filter((line) => !line.includes("?") && !/^(Yes|No),/i.test(line));
    return values.length ? values : sentencePool(unit);
  }

  function makeItems(type, unit) {
    const vocabulary = vocabularyItems(unit);
    const sentenceValues = statements(unit);
    const qa = pairs(unit);
    if (type === "picture_sentence") return sentenceValues.slice(0, 4).map((sentence, index) => ({ asset: assetFor(sentence, vocabulary, index), subjectCue: cueFor(sentence), starter: `${sentence.match(/^(I|You|He|She|It|We|They|There|These|Those)\b/i)?.[0] || ""} `, expectedAnswer: sentence }));
    if (type === "matching") {
      const chosen = qa.slice(0, 4);
      const rotated = chosen.map((item) => item.answer).slice(1).concat(chosen.length ? chosen[0].answer : []);
      return chosen.map((item, index) => ({ asset: assetFor(item.answer, vocabulary, index), left: item.question, right: rotated[index], expectedAnswer: `${item.question} → ${item.answer}` }));
    }
    if (type === "write_question") return qa.slice(0, 4).map((item, index) => ({ asset: assetFor(item.answer, vocabulary, index), prompt: item.answer, expectedAnswer: item.question, lines: 2 }));
    if (type === "write_answer") return qa.slice(0, 4).map((item, index) => ({ asset: assetFor(item.answer, vocabulary, index), subjectCue: item.question, starter: "", expectedAnswer: item.answer, lines: 1 }));
    if (type === "fix_mistakes") return sentenceValues.slice(0, 4).map((sentence, index) => ({ asset: assetFor(sentence, vocabulary, index), prompt: wrongSentence(sentence), expectedAnswer: sentence, lines: 2 }));
    if (type === "unscramble") return sentencePool(unit).slice(0, 4).map((sentence, index) => ({ asset: assetFor(sentence, vocabulary, index), prompt: scramble(sentence, unit.bookId), expectedAnswer: firstSentence(sentence), lines: 2 }));
    if (type === "sentence_transform") return sentenceValues.filter(canTransform).slice(0, 4).map((sentence, index) => {
      const direction = isNegative(sentence) ? "affirmative" : "negative";
      return { asset: assetFor(sentence, vocabulary, index), prompt: `${sentence}  →  Change to ${direction}.`, expectedAnswer: direction === "negative" ? negative(sentence) : positive(sentence), lines: 2 };
    });
    if (type === "big_picture") return qa.slice(0, 4).map((item, index) => ({ asset: assetFor(item.answer, vocabulary, index), prompt: item.question, expectedAnswer: item.answer, lines: 1 }));
    return qa.slice(0, 4).map((item, index) => ({ asset: assetFor(item.answer, vocabulary, index), prompt: item.question, expectedAnswer: item.answer, lines: 1 }));
  }

  function buildPages(unit, day) {
    const vocabulary = vocabularyItems(unit);
    return DAY_TYPES[day].map((type) => ({
      type,
      title: TITLES[type],
      instruction: INSTRUCTIONS[type],
      skill: type.replaceAll("_", " "),
      sceneAssets: type === "big_picture" ? vocabulary.slice(0, 8) : [],
      items: makeItems(type, unit)
    }));
  }

  function book3Unit4Day1Pages() {
    const image = (name) => ({ image: `assets/images/book3/unit4/${name}.png` });
    const toys = {
      car: image("model-car"),
      rope: image("jump-rope"),
      animal: image("stuffed-animal"),
      computer: image("computer"),
      figure: image("action-figure"),
      skateboard: image("skateboard"),
      puzzle: image("puzzle"),
      kite: image("kite"),
      bicycle: image("bicycle")
    };
    const page = (type, title, instruction, skill, items) => ({
      type,
      layout: "locked_template",
      title,
      instruction,
      skill,
      items
    });
    return [
      page("template_picture_answer", "Look and Answer", "Look at each picture. Write a complete answer.", "Do / Does ... want?", [
        { prompt: "What do you want?", asset: toys.car, expectedAnswer: "I want a model car." },
        { prompt: "What does he want?", asset: toys.rope, expectedAnswer: "He wants a jump rope." },
        { prompt: "What does she want?", asset: toys.animal, expectedAnswer: "She wants a stuffed animal." },
        { prompt: "What do they want?", asset: toys.computer, expectedAnswer: "They want a computer." },
        { prompt: "What does Lumi want?", asset: toys.figure, expectedAnswer: "She wants an action figure." },
        { prompt: "Does she want a skateboard?", asset: toys.skateboard, expectedAnswer: "Yes, she does." },
        { prompt: "Do they want a kite?", asset: toys.kite, expectedAnswer: "Yes, they do." },
        { prompt: "Does Lumi want a bicycle?", asset: toys.bicycle, expectedAnswer: "No, she doesn't." }
      ]),
      {
        type: "matching",
        title: "Look and Match",
        instruction: "Draw a line from each question to the correct answer.",
        skill: "question and answer matching",
        items: [
          { left: "What does he want?", right: "They want a computer.", asset: toys.rope, expectedAnswer: "What does he want? → He wants a jump rope." },
          { left: "What does she want?", right: "He wants a jump rope.", asset: toys.animal, expectedAnswer: "What does she want? → She wants a stuffed animal." },
          { left: "What do they want?", right: "Lumi wants an action figure.", asset: toys.computer, expectedAnswer: "What do they want? → They want a computer." },
          { left: "What does Lumi want?", right: "She wants a stuffed animal.", asset: toys.figure, expectedAnswer: "What does Lumi want? → Lumi wants an action figure." }
        ]
      },
      {
        type: "multiple_choice",
        title: "Choose the Answer",
        instruction: "Look at each picture. Circle the correct answer.",
        skill: "do / does · want / wants",
        items: [
          { prompt: "What does he want?", choices: ["He want a jump rope.", "He wants a jump rope.", "He wants jump rope."], asset: toys.rope, expectedAnswer: "He wants a jump rope." },
          { prompt: "What does she want?", choices: ["She wants a stuffed animal.", "She want a stuffed animal.", "She wants an stuffed animal."], asset: toys.animal, expectedAnswer: "She wants a stuffed animal." },
          { prompt: "What do they want?", choices: ["They wants a computer.", "They want a computer.", "They want computer."], asset: toys.computer, expectedAnswer: "They want a computer." },
          { prompt: "What does Lumi want?", choices: ["Lumi want an action figure.", "Lumi wants a action figure.", "Lumi wants an action figure."], asset: toys.figure, expectedAnswer: "Lumi wants an action figure." },
          { prompt: "Does she want a skateboard?", choices: ["Yes, she does.", "Yes, she do.", "Yes, she wants."], asset: toys.skateboard, expectedAnswer: "Yes, she does." },
          { prompt: "Do they want a model car?", choices: ["No, they doesn't.", "No, they don't.", "No, they do not wants."], asset: toys.car, expectedAnswer: "No, they don't." }
        ]
      },
      page("template_fix_mistakes", "Fix the Mistakes", "Find the mistake. Rewrite the whole sentence correctly.", "do / does · want / wants", [
        { prompt: "What does you want?", asset: toys.car, expectedAnswer: "What do you want?" },
        { prompt: "What do he want?", asset: toys.rope, expectedAnswer: "What does he want?" },
        { prompt: "He want a jump rope.", asset: toys.rope, expectedAnswer: "He wants a jump rope." },
        { prompt: "She wants an stuffed animal.", asset: toys.animal, expectedAnswer: "She wants a stuffed animal." },
        { prompt: "Does he wants an action figure?", asset: toys.figure, expectedAnswer: "Does he want an action figure?" },
        { prompt: "Do Lumi want a skateboard?", asset: toys.skateboard, expectedAnswer: "Does Lumi want a skateboard?" },
        { prompt: "They wants a computer.", asset: toys.computer, expectedAnswer: "They want a computer." },
        { prompt: "Does they want a model car?", asset: toys.car, expectedAnswer: "Do they want a model car?" }
      ])
    ];
  }

  function book3Unit4Assets() {
    const image = (name) => ({ image: `assets/images/book3/unit4/${name}.png` });
    return {
      car: image("model-car"), rope: image("jump-rope"), animal: image("stuffed-animal"),
      computer: image("computer"), figure: image("action-figure"), skateboard: image("skateboard"),
      puzzle: image("puzzle"), kite: image("kite"), bicycle: image("bicycle")
    };
  }

  function lockedUnit4Page(type, title, instruction, skill, items, showPictures = false) {
    return { type, layout: "locked_template", title, instruction, skill, items, showPictures };
  }

  function book3Unit4Day2Pages() {
    const toys = book3Unit4Assets();
    return [
      lockedUnit4Page("template_picture_question", "Make the Question", "Look at the picture and answer cue. Write the matching question.", "What do / does ... want?", [
        { prompt: "Answer: I want a kite.", asset: toys.kite, expectedAnswer: "What do you want?" },
        { prompt: "Answer: He wants a puzzle.", asset: toys.puzzle, expectedAnswer: "What does he want?" },
        { prompt: "Answer: Lumi wants a bicycle.", asset: toys.bicycle, expectedAnswer: "What does Lumi want?" },
        { prompt: "Answer: They want a computer.", asset: toys.computer, expectedAnswer: "What do they want?" },
        { prompt: "Answer: Ludi wants a model car.", asset: toys.car, expectedAnswer: "What does Ludi want?" },
        { prompt: "Answer: She wants a stuffed animal.", asset: toys.animal, expectedAnswer: "What does she want?" },
        { prompt: "Answer: Yes, Lumi does.", asset: toys.skateboard, expectedAnswer: "Does Lumi want a skateboard?" },
        { prompt: "Answer: No, Ludi doesn't.", asset: toys.computer, expectedAnswer: "Does Ludi want a computer?" }
      ], true),
      {
        type: "matching", title: "Match Questions and Answers", instruction: "Draw a line from each answer to its matching question.", skill: "question building",
        items: [
          { left: "I want a puzzle.", right: "What does Lumi want?", asset: toys.puzzle, expectedAnswer: "What do you want? → I want a puzzle." },
          { left: "He wants a kite.", right: "What do they want?", asset: toys.kite, expectedAnswer: "What does he want? → He wants a kite." },
          { left: "Lumi wants a bicycle.", right: "What do you want?", asset: toys.bicycle, expectedAnswer: "What does Lumi want? → Lumi wants a bicycle." },
          { left: "They want jump ropes.", right: "What does he want?", asset: toys.rope, expectedAnswer: "What do they want? → They want jump ropes." }
        ]
      },
      {
        type: "multiple_choice", title: "Choose the Question", instruction: "Read the answer. Circle the question that matches.", skill: "do / does questions",
        items: [
          { prompt: "Lumi wants a model car.", choices: ["What do Lumi want?", "What does Lumi want?", "Does Lumi wants?"], asset: toys.car, expectedAnswer: "What does Lumi want?" },
          { prompt: "Ludi wants a skateboard.", choices: ["What does Ludi want?", "What do Ludi wants?", "What Ludi want?"], asset: toys.skateboard, expectedAnswer: "What does Ludi want?" },
          { prompt: "They want an action figure.", choices: ["What does they want?", "What do they want?", "Do they wants?"], asset: toys.figure, expectedAnswer: "What do they want?" },
          { prompt: "Yes, she does. She wants a computer.", choices: ["Do she want a computer?", "Does she want a computer?", "Does she wants a computer?"], asset: toys.computer, expectedAnswer: "Does she want a computer?" },
          { prompt: "No, he doesn't. He wants a jump rope.", choices: ["Does he want a stuffed animal?", "Do he want a stuffed animal?", "Does he wants a stuffed animal?"], asset: toys.animal, expectedAnswer: "Does he want a stuffed animal?" },
          { prompt: "I want an action figure.", choices: ["What do you want?", "What does you want?", "Do you wants?"], asset: toys.figure, expectedAnswer: "What do you want?" }
        ]
      },
      lockedUnit4Page("template_question_order", "Build the Question", "Put the words in order. Write the complete question.", "question word order", [
        { prompt: "you / do / What / want / ?", asset: toys.car, expectedAnswer: "What do you want?" },
        { prompt: "want / does / What / Lumi / ?", asset: toys.rope, expectedAnswer: "What does Lumi want?" },
        { prompt: "Ludi / a skateboard / want / Does / ?", asset: toys.skateboard, expectedAnswer: "Does Ludi want a skateboard?" },
        { prompt: "they / Do / a computer / want / ?", asset: toys.computer, expectedAnswer: "Do they want a computer?" },
        { prompt: "does / he / want / What / ?", asset: toys.figure, expectedAnswer: "What does he want?" },
        { prompt: "a stuffed animal / she / Does / want / ?", asset: toys.animal, expectedAnswer: "Does she want a stuffed animal?" },
        { prompt: "want / the children / What / do / ?", asset: toys.rope, expectedAnswer: "What do the children want?" },
        { prompt: "Lumi / an action figure / Does / want / ?", asset: toys.figure, expectedAnswer: "Does Lumi want an action figure?" }
      ])
    ];
  }

  function book3Unit4Day3Pages() {
    const toys = book3Unit4Assets();
    return [
      lockedUnit4Page("template_guided_question", "Write Your Question", "Read the answer. Look at the picture and write its question.", "What / Do / Does", [
        { prompt: "Answer: Ludi wants a computer.", asset: toys.computer, expectedAnswer: "What does Ludi want?" },
        { prompt: "Answer: Today, Lumi wants a model car.", asset: toys.car, expectedAnswer: "What does Lumi want today?" },
        { prompt: "Answer: I want a jump rope.", asset: toys.rope, expectedAnswer: "What do you want?" },
        { prompt: "Answer: Yes, Ludi does. He wants a computer.", asset: toys.computer, expectedAnswer: "Does Ludi want a computer?" },
        { prompt: "Answer: Yes, Lumi does. She wants a model car.", asset: toys.car, expectedAnswer: "Does Lumi want a model car?" },
        { prompt: "Answer: Yes, they do. They want jump ropes.", asset: toys.rope, expectedAnswer: "Do they want jump ropes?" },
        { prompt: "Answer: The girl wants a stuffed animal.", asset: toys.animal, expectedAnswer: "What does the girl want?" },
        { prompt: "Answer: The boys want action figures.", asset: toys.figure, expectedAnswer: "What do the boys want?" }
      ], true),
      {
        type: "matching", title: "Match the Helpers", instruction: "Match each question beginning to the correct ending.", skill: "do / does agreement",
        items: [
          { left: "What does Lumi", right: "want a skateboard?", asset: toys.animal, expectedAnswer: "What does Lumi want?" },
          { left: "What do the boys", right: "want?", asset: toys.figure, expectedAnswer: "What do the boys want?" },
          { left: "Does Ludi", right: "want a computer?", asset: toys.computer, expectedAnswer: "Does Ludi want a computer?" },
          { left: "Do the girls", right: "want model cars?", asset: toys.car, expectedAnswer: "Do the girls want model cars?" }
        ]
      },
      {
        type: "multiple_choice", title: "Choose Do or Does", instruction: "Circle the correct complete sentence.", skill: "subject + do / does",
        items: [
          { prompt: "Lumi / stuffed animal", choices: ["What do Lumi want?", "What does Lumi want?", "What does Lumi wants?"], asset: toys.animal, expectedAnswer: "What does Lumi want?" },
          { prompt: "Ludi / action figure", choices: ["Does Ludi want an action figure?", "Do Ludi want an action figure?", "Does Ludi wants an action figure?"], asset: toys.figure, expectedAnswer: "Does Ludi want an action figure?" },
          { prompt: "the children / computer", choices: ["What does the children want?", "What do the children want?", "What the children do want?"], asset: toys.computer, expectedAnswer: "What do the children want?" },
          { prompt: "the girl / jump rope", choices: ["Do the girl want a jump rope?", "Does the girl want a jump rope?", "Does the girl wants a jump rope?"], asset: toys.rope, expectedAnswer: "Does the girl want a jump rope?" },
          { prompt: "you / skateboard", choices: ["What do you want?", "What does you want?", "What do you wants?"], asset: toys.skateboard, expectedAnswer: "What do you want?" },
          { prompt: "they / model car", choices: ["Does they want a model car?", "Do they want a model car?", "Do they wants a model car?"], asset: toys.car, expectedAnswer: "Do they want a model car?" }
        ]
      },
      lockedUnit4Page("template_mixed_correction", "Fix the Questions", "Find the mistake. Rewrite each question correctly.", "mixed question correction", [
        { prompt: "What do Lumi wants?", asset: toys.animal, expectedAnswer: "What does Lumi want?" },
        { prompt: "Does Ludi wants a model car?", asset: toys.car, expectedAnswer: "Does Ludi want a model car?" },
        { prompt: "What does the boys want?", asset: toys.figure, expectedAnswer: "What do the boys want?" },
        { prompt: "Do the girl want a computer?", asset: toys.computer, expectedAnswer: "Does the girl want a computer?" },
        { prompt: "What they do want?", asset: toys.rope, expectedAnswer: "What do they want?" },
        { prompt: "Does you want a skateboard?", asset: toys.skateboard, expectedAnswer: "Do you want a skateboard?" },
        { prompt: "What does Ludi wants?", asset: toys.figure, expectedAnswer: "What does Ludi want?" },
        { prompt: "Do Lumi want an action figure?", asset: toys.figure, expectedAnswer: "Does Lumi want an action figure?" }
      ])
    ];
  }

  function book3Unit4Day4Pages() {
    const toys = book3Unit4Assets();
    return [
      lockedUnit4Page("template_independent_picture", "Picture Question Challenge", "Read the answer. Look at the picture and write its question.", "question writing", [
        { prompt: "Answer: Lumi wants a skateboard.", asset: toys.skateboard, expectedAnswer: "What does Lumi want?" },
        { prompt: "Answer: Ludi wants a stuffed animal.", asset: toys.animal, expectedAnswer: "What does Ludi want?" },
        { prompt: "Answer: The twins want a computer.", asset: toys.computer, expectedAnswer: "What do the twins want?" },
        { prompt: "Answer: Yes, your friend does. Your friend wants a model car.", asset: toys.car, expectedAnswer: "Does your friend want a model car?" },
        { prompt: "Answer: Yes, the girls do. They want jump ropes.", asset: toys.rope, expectedAnswer: "Do the girls want jump ropes?" },
        { prompt: "Answer: Yes, Ludi does. He wants an action figure.", asset: toys.figure, expectedAnswer: "Does Ludi want an action figure?" },
        { prompt: "Answer: Your classmates want skateboards.", asset: toys.skateboard, expectedAnswer: "What do your classmates want?" },
        { prompt: "Answer: Yes, Lumi does. She wants a computer.", asset: toys.computer, expectedAnswer: "Does Lumi want a computer?" }
      ], true),
      {
        type: "matching", title: "Complete the Dialogue", instruction: "Match each new question to the best complete answer.", skill: "question and answer fluency",
        items: [
          { left: "Does Lumi want a jump rope?", right: "They want two model cars.", asset: toys.rope, expectedAnswer: "Does Lumi want a jump rope? → Yes, she does." },
          { left: "What does Ludi want today?", right: "Yes, she does.", asset: toys.skateboard, expectedAnswer: "What does Ludi want today? → He wants a skateboard." },
          { left: "Do the twins want a computer?", right: "He wants a skateboard.", asset: toys.computer, expectedAnswer: "Do the twins want a computer? → No, they don't." },
          { left: "What do the children want?", right: "No, they don't.", asset: toys.car, expectedAnswer: "What do the children want? → They want two model cars." }
        ]
      },
      {
        type: "multiple_choice", title: "Final Grammar Check", instruction: "Circle the only correct question or answer.", skill: "cumulative do / does review",
        items: [
          { prompt: "Ask about Lumi and the computer.", choices: ["Does Lumi want a computer?", "Do Lumi wants a computer?", "What Lumi does want?"], asset: toys.computer, expectedAnswer: "Does Lumi want a computer?" },
          { prompt: "Ask what Ludi wants today.", choices: ["What do Ludi want today?", "What does Ludi want today?", "Does Ludi wants today?"], asset: toys.skateboard, expectedAnswer: "What does Ludi want today?" },
          { prompt: "Answer: The twins want model cars.", choices: ["What do the twins want?", "What does the twins want?", "Do the twins wants?"], asset: toys.car, expectedAnswer: "What do the twins want?" },
          { prompt: "Answer: No, the girl doesn't.", choices: ["Do the girl want a jump rope?", "Does the girl want a jump rope?", "Does the girl wants a jump rope?"], asset: toys.rope, expectedAnswer: "Does the girl want a jump rope?" },
          { prompt: "Choose the complete answer for an action figure.", choices: ["He want an action figure.", "He wants an action figure.", "He does wants an action figure."], asset: toys.figure, expectedAnswer: "He wants an action figure." },
          { prompt: "Choose the complete negative answer.", choices: ["No, they doesn't.", "No, they don't.", "No, they not."], asset: toys.animal, expectedAnswer: "No, they don't." }
        ]
      },
      lockedUnit4Page("template_final_output", "Question Writing Review", "Read each answer and write its question.", "question writing review", [
        { prompt: "Answer: Lumi wants a model car.", asset: toys.car, expectedAnswer: "What does Lumi want?" },
        { prompt: "Answer: Yes, Ludi does. He wants a skateboard.", asset: toys.skateboard, expectedAnswer: "Does Ludi want a skateboard?" },
        { prompt: "Answer: The children want jump ropes.", asset: toys.rope, expectedAnswer: "What do the children want?" },
        { prompt: "Answer: Yes, the twins do. They want a computer.", asset: toys.computer, expectedAnswer: "Do the twins want a computer?" },
        { prompt: "Answer: Yes, the girl does. She wants a stuffed animal.", asset: toys.animal, expectedAnswer: "Does the girl want a stuffed animal?" },
        { prompt: "Answer: The boy wants an action figure.", asset: toys.figure, expectedAnswer: "What does the boy want?" },
        { prompt: "Answer: Yes, your friends do. They want model cars.", asset: toys.car, expectedAnswer: "Do your friends want model cars?" },
        { prompt: "Answer: I want a computer.", asset: toys.computer, expectedAnswer: "What do you want?" }
      ])
    ];
  }

  const BOOK3_PROGRESSIVE_PROFILES = {
    "unit-1": {
      words: ["birds", "frogs", "puppies", "fish", "bunnies", "turtles", "hamsters", "spiders"],
      contexts: ["", " today", " in the pet shop", " on the class poster"],
      pair(word, index, context, day) {
        const slot = index + day - 1;
        const variant = index >= 4;
        const patterns = [
          [`What do you like${variant ? " best" : ""}${context}?`, `I like ${word}.`, `you + ${word} + What${context}`],
          [`What do they like${variant ? " best" : ""}${context}?`, `They like ${word}.`, `they + ${word} + What${context}`],
          [`Do your friends like ${word}${variant ? " too" : ""}${context}?`, "Yes, they do.", `your friends + ${word} + Do${context}`],
          [`Do the children like ${word}${variant ? " too" : ""}${context}?`, "No, they don't.", `the children + ${word} + Do${context}`]
        ];
        return patterns[slot % patterns.length];
      },
      skill: "do + like"
    },
    "unit-2": {
      words: ["hamburger", "french fries", "chicken nuggets", "onion rings", "fried chicken", "salad", "hot dog", "soda", "cola", "pizza"],
      contexts: ["", " today", " for lunch", " at the party"],
      pair(word, index, context, day) {
        const slot = index + day - 1;
        const variant = index >= 4;
        const patterns = [
          [`What does Lumi like${variant ? " best" : ""}${context}?`, `Lumi likes ${word}.`, `Lumi + ${word} + What${context}`],
          [`Does Ludi ${variant ? "also " : ""}like ${word}${context}?`, "Yes, he does.", `Ludi + ${word} + Does${context}`],
          [`What does she like${variant ? " best" : ""}${context}?`, `She likes ${word}.`, `she + ${word} + What${context}`],
          [`Does he ${variant ? "also " : ""}like ${word}${context}?`, "No, he doesn't.", `he + ${word} + Does${context}`]
        ];
        return patterns[slot % patterns.length];
      },
      skill: "does + like · likes"
    },
    "unit-3": {
      words: ["milk", "bread", "cake", "popcorn", "cookies", "ice cream", "juice", "potato chips", "tea", "coffee"],
      contexts: ["", " today", " for a snack", " at the picnic"],
      pair(word, index, context, day) {
        const slot = index + day - 1;
        const variant = index >= 4;
        const patterns = [
          [`Do you ${variant ? "also " : ""}want some ${word}${context}?`, "Yes, I do.", `you + ${word} + Do${context}`],
          [`What${variant ? " else" : ""} do they want${context}?`, `They want some ${word}.`, `they + ${word} + What${context}`],
          [`Does Lumi ${variant ? "also " : ""}want some ${word}${context}?`, "No, she doesn't.", `Lumi + ${word} + Does${context}`],
          [`What${variant ? " else" : ""} does Ludi want${context}?`, `He wants some ${word}.`, `Ludi + ${word} + What${context}`]
        ];
        return patterns[slot % patterns.length];
      },
      skill: "some / any · want / wants"
    }
  };

  function book3ProgressivePairs(unit, day) {
    const profile = BOOK3_PROGRESSIVE_PROFILES[unit.id];
    const vocabulary = vocabularyItems(unit);
    const context = profile.contexts[day - 1];
    return profile.words.slice(0, 8).map((word, index) => {
      const rotatedWord = profile.words[(index + ((day - 1) * 2)) % profile.words.length];
      const [question, answer, cue] = profile.pair(rotatedWord, index, context, day);
      const asset = vocabulary.find((item) => item.word === rotatedWord) || {};
      return { word: rotatedWord, question, answer, cue: `Answer: ${answer}`, asset };
    });
  }

  function grammarError(text) {
    const shortAnswer = text.match(/^(Yes|No),\s+(I|you|he|she|we|they)\s+(do|does|don't|doesn't)\.$/i);
    if (shortAnswer) {
      const [, yesNo, subject, helper] = shortAnswer;
      const wrongHelper = /does/i.test(helper) ? (helper.includes("n't") ? "don't" : "do") : (helper.includes("n't") ? "doesn't" : "does");
      return `${yesNo}, ${subject} ${wrongHelper}.`;
    }
    const rules = [
      [/\bI am\b/i, "I is"], [/\bI'm\b/i, "I is"], [/\bam I\b/i, "is I"],
      [/\bare (you|we|they|these|those)\b/i, "is $1"],
      [/\bis (he|she|it|this|that|my|your|the)\b/i, "are $1"],
      [/\b(You|We|They|These|Those) are\b/i, "$1 is"],
      [/\b(He|She|It|This|That) is\b/i, "$1 are"],
      [/\bThere is\b/i, "There are"], [/\bThere are\b/i, "There is"],
      [/\bdoes\b/i, "do"], [/\bdo\b/i, "does"],
      [/\blikes\b/i, "like"], [/\blike\b/i, "likes"],
      [/\bwants\b/i, "want"], [/\bwant\b/i, "wants"],
      [/\bsome\b/i, "any"]
    ];
    const rule = rules.find(([pattern]) => pattern.test(text));
    if (rule) return text.replace(rule[0], rule[1]);
    if (/\ban\b/i.test(text)) return text.replace(/\ban\b/i, "a");
    if (/\ba\b/i.test(text)) return text.replace(/\ba\b/i, "an");
    return text.replace(/\b([A-Za-z]+)([?.!]?)$/, (_, word, mark) => `${/s$/i.test(word) ? word.slice(0, -1) : `${word}s`}${mark}`);
  }

  function secondGrammarError(text) {
    if (/^Is there\b/i.test(text)) return text.replace(/^Is there\b/i, "Are there");
    if (/^What is it\b/i.test(text)) return text.replace(/^What is it\b/i, "What are it");
    if (/\bI am\b/i.test(text)) return text.replace(/\bI am\b/i, "I are");
    if (/\bI'm\b/i.test(text)) return text.replace(/\bI'm\b/i, "I are");
    if (/\bam I\b/i.test(text)) return text.replace(/\bam I\b/i, "are I");
    if (/\bare (you|we|they|these|those)\b/i.test(text)) return text.replace(/\bare (you|we|they|these|those)\b/i, "am $1");
    if (/\bis (he|she|it|this|that|my|your|the)\b/i.test(text)) return text.replace(/\bis (he|she|it|this|that|my|your|the)\b/i, "am $1");
    if (/\b(You|We|They|These|Those) are\b/i.test(text)) return text.replace(/\b(You|We|They|These|Those) are\b/i, "$1 am");
    if (/\b(He|She|It|This|That) is\b/i.test(text)) return text.replace(/\b(He|She|It|This|That) is\b/i, "$1 am");
    if (/\bdoes\b/i.test(text)) return text.replace(/\bdoes\b/i, "do").replace(/\b(like|want)\b/i, "$1s");
    if (/\bdo\b/i.test(text)) return text.replace(/\bdo\b/i, "does").replace(/\b(like|want)\b/i, "$1s");
    if (/\blikes\b/i.test(text)) return text.replace(/\blikes\b/i, "does like");
    if (/\bwants\b/i.test(text)) return text.replace(/\bwants\b/i, "does want");
    if (/\bThere is\b/i.test(text)) return text.replace(/\bThere is\b/gi, "There are");
    if (/\bThere are\b/i.test(text)) return text.replace(/\bThere are\b/gi, "There is");
    if (/\ban\b/i.test(text)) return text.replace(/\ban\b/i, "a");
    if (/\ba\b/i.test(text)) return text.replace(/\ba\b/i, "an");
    return text.replace(/\b([A-Za-z]+)([?.!]?)$/, (_, word, mark) => `${/s$/i.test(word) ? word.slice(0, -1) : `${word}s`}${mark}`);
  }

  function choicesFor(correct) {
    const shortAnswer = correct.match(/^(Yes|No),\s+(I|you|he|she|we|they)\s+(do|does|don't|doesn't)\.$/i);
    if (shortAnswer) {
      const [, yesNo, subject, helper] = shortAnswer;
      const wrongHelper = /does/i.test(helper) ? (helper.includes("n't") ? "don't" : "do") : (helper.includes("n't") ? "doesn't" : "does");
      return [correct, `${yesNo}, ${subject} ${wrongHelper}.`, `${yesNo}, ${subject} not.`];
    }
    const normalized = (value) => String(value).toLowerCase().replace(/[^a-z0-9']+/g, " ").trim();
    const candidates = [
      correct,
      grammarError(correct),
      secondGrammarError(correct),
      correct.replace(/\b(is|am|are)\b/i, (verb) => ({ is: "are", am: "is", are: "is" })[verb.toLowerCase()]),
      correct.replace(/\b(has|have)\b/i, (verb) => /has/i.test(verb) ? "have" : "has"),
      correct.replace(/\b(do|does)\b/i, (verb) => /does/i.test(verb) ? "do" : "does"),
      correct.replace(/\b(a|an)\b/i, (article) => /an/i.test(article) ? "a" : "an"),
      correct.replace(/\b([A-Za-z]+)([?.!]?)$/, (_, word, mark) => `${/s$/i.test(word) ? word.slice(0, -1) : `${word}s`}${mark}`),
      correct.replace(/\b(I|you|he|she|we|they)\b/i, (subject) => ({ i: "he", you: "she", he: "they", she: "we", we: "he", they: "she" })[subject.toLowerCase()])
    ];
    const seen = new Set();
    const unique = candidates.filter((value) => {
      const key = normalized(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.slice(0, 3);
  }

  function rotateAnswers(pairsToMatch) {
    const answers = pairsToMatch.map((pair) => pair.answer);
    return answers.slice(1).concat(answers[0]);
  }

  function progressivePage(type, title, instruction, skill, items, options = {}) {
    return { type, title, instruction, skill, items, ...options };
  }

  function distributeMultipleChoiceAnswers(pages) {
    (pages || []).filter((page) => page.type === "multiple_choice").forEach((page) => {
      (page.items || []).forEach((item, index) => {
        if (!Array.isArray(item.choices) || item.choices.length < 2) return;
        const correctIndex = item.choices.indexOf(item.expectedAnswer);
        if (correctIndex < 0) return;
        const targetIndex = index % item.choices.length;
        const choices = item.choices.slice();
        const [correct] = choices.splice(correctIndex, 1);
        choices.splice(targetIndex, 0, correct);
        item.choices = choices;
      });
    });
  }

  function book3ProgressivePages(unit, day) {
    const profile = BOOK3_PROGRESSIVE_PROFILES[unit.id];
    const pairsForDay = book3ProgressivePairs(unit, day);
    const matchPairs = pairsForDay.slice(0, 4);
    const rotated = rotateAnswers(matchPairs);
    const matchingItems = matchPairs.map((pair, index) => ({
      left: pair.question,
      right: rotated[index],
      asset: pair.asset,
      expectedAnswer: `${pair.question} → ${pair.answer}`
    }));
    const questionChoices = pairsForDay.slice(0, 6).map((pair) => ({
      prompt: `Answer: ${pair.answer}`,
      choices: choicesFor(pair.question),
      asset: pair.asset,
      expectedAnswer: pair.question
    }));
    const answerChoices = pairsForDay.slice(0, 6).map((pair) => ({
      prompt: pair.question,
      choices: choicesFor(pair.answer),
      asset: pair.asset,
      expectedAnswer: pair.answer
    }));
    const locked = (type, title, instruction, items, showPictures = false) => progressivePage(
      type, title, instruction, profile.skill, items,
      { layout: "locked_template", showPictures }
    );

    if (day === 1) return [
      locked("template_picture_answer", "Look and Answer", "Look at each picture. Write a complete answer.", pairsForDay.map((pair) => ({ prompt: pair.question, asset: pair.asset, expectedAnswer: pair.answer })), true),
      progressivePage("matching", "Look and Match", "Draw a line from each question to the correct answer.", profile.skill, matchingItems),
      progressivePage("multiple_choice", "Choose the Answer", "Look at the picture. Circle the correct complete answer.", profile.skill, answerChoices),
      locked("template_fix_mistakes", "Fix the Mistakes", "Find the mistake. Rewrite the whole sentence correctly.", pairsForDay.map((pair) => ({ prompt: grammarError(pair.answer), asset: pair.asset, expectedAnswer: pair.answer })))
    ];

    if (day === 2) return [
      locked("template_picture_question", "Make the Question", "Look at the picture and answer cue. Write the matching question.", pairsForDay.map((pair) => ({ prompt: `Answer: ${pair.answer}`, asset: pair.asset, expectedAnswer: pair.question })), true),
      progressivePage("matching", "Match Questions and Answers", "Draw a line from each answer to its matching question.", profile.skill, matchingItems),
      progressivePage("multiple_choice", "Choose the Question", "Read the answer. Circle the question that matches.", profile.skill, questionChoices),
      locked("template_question_order", "Build the Question", "Put the words in order. Write the complete question.", pairsForDay.map((pair) => ({ prompt: scramble(pair.question, "book-3"), asset: pair.asset, expectedAnswer: firstSentence(pair.question) })))
    ];

    if (day === 3) return [
      locked("template_guided_question", "Write Your Question", "Read the answer. Look at the picture and write its question.", pairsForDay.map((pair) => ({ prompt: `Answer: ${pair.answer}`, asset: pair.asset, expectedAnswer: pair.question })), true),
      progressivePage("matching", "Match the Dialogue", "Match each question to the best complete answer.", profile.skill, matchingItems),
      progressivePage("multiple_choice", "Choose Do or Does", "Circle the only correct complete question.", profile.skill, questionChoices),
      locked("template_mixed_correction", "Fix the Questions", "Find the mistake. Rewrite each question correctly.", pairsForDay.map((pair) => ({ prompt: grammarError(pair.question), asset: pair.asset, expectedAnswer: pair.question })))
    ];

    return [
      locked("template_independent_picture", "Picture Question Challenge", "Read the answer. Look at the picture and write its question.", pairsForDay.map((pair) => ({ prompt: `Answer: ${pair.answer}`, asset: pair.asset, expectedAnswer: pair.question })), true),
      progressivePage("matching", "Complete the Dialogue", "Match each question to the best complete answer.", profile.skill, matchingItems),
      progressivePage("multiple_choice", "Final Grammar Check", "Circle the only correct question.", profile.skill, questionChoices),
      locked("template_final_output", "Question Writing Review", "Read each answer and write its question.", pairsForDay.map((pair) => ({ prompt: `Answer: ${pair.answer}`, asset: pair.asset, expectedAnswer: pair.question })))
    ];
  }

  function worksheetWord(asset) {
    return reviewWord(asset).split(/\s*\/\s*/)[0].trim();
  }

  function worksheetPlural(asset) {
    const parts = reviewWord(asset).split(/\s*\/\s*/).map((value) => value.trim()).filter(Boolean);
    if (parts.length > 1) return parts[1];
    const word = parts[0] || "items";
    return ({ foot: "feet", tooth: "teeth", child: "children", person: "people" })[word.toLowerCase()] || pluralReviewWord(word);
  }

  function differentFruitPlural(plural, index) {
    const options = ["apples", "bananas", "oranges", "peaches", "strawberries", "kiwis", "mangoes", "tomatoes", "cherries"];
    return options.find((value, optionIndex) => optionIndex >= index % options.length && value.toLowerCase() !== plural.toLowerCase())
      || options.find((value) => value.toLowerCase() !== plural.toLowerCase())
      || "apples";
  }

  function unitPairForVocabulary(bookId, unitId, asset, index, day) {
    const key = `${bookId}/${unitId}`;
    const word = worksheetWord(asset) || "picture";
    const plural = worksheetPlural(asset);
    const article = reviewArticle(word);
    const slot = (index + day - 1) % 4;
    const pick = (values) => ({ question: values[slot][0], answer: values[slot][1] });

    if (key === "book-1/unit-1") {
      const contrasts = { boy: "girl", girl: "boy", man: "woman", woman: "man", student: "teacher", teacher: "student" };
      const positive = slot % 2 === 0;
      const questionWord = positive ? word : (contrasts[word.toLowerCase()] || word);
      const questionArticle = reviewArticle(questionWord);
      return {
        question: `Are you ${questionArticle} ${questionWord}?`,
        answer: positive ? `Yes, I am ${article} ${word}.` : `No, I am ${article} ${word}.`
      };
    }
    if (key === "book-1/unit-2") {
      if (/^me$/i.test(word)) return { question: "Who is this?", answer: "This is me." };
      const female = /^(grandmother|mother|aunt|sister)$/i.test(word);
      return { question: `Who is ${female ? "she" : "he"}?`, answer: `${female ? "She" : "He"} is my ${word}.` };
    }
    if (key === "book-1/unit-3") {
      const age = `${word} ${/^one$/i.test(word) ? "year" : "years"} old`;
      return pick([
        ["How old are you?", `I am ${age}.`], ["How old is he?", `He is ${age}.`],
        ["How old is she?", `She is ${age}.`], ["How old are you?", `I am ${age}.`]
      ]);
    }
    if (key === "book-1/unit-4") {
      const adjectives = ["sad", "happy", "chubby", "thin", "young", "old", "short", "tall", "cute"];
      const wordIndex = Math.max(0, adjectives.indexOf(word.toLowerCase()));
      const differentWord = adjectives[(wordIndex + 3) % adjectives.length];
      return [
        { question: `Are you ${word}?`, answer: `Yes, I am. I am ${word}.` },
        { question: `Is she ${word}?`, answer: `Yes, she is. She is ${word}.` },
        { question: `Is he ${differentWord}?`, answer: `No, he is not. He is ${word}.` },
        { question: `Is she ${differentWord}?`, answer: `No, she is not. She is ${word}.` }
      ][slot];
    }
    if (key === "book-1/unit-5") return slot % 2
      ? { question: `Is it ${article} ${word}?`, answer: `Yes, it is. It is ${article} ${word}.` }
      : { question: "What is it?", answer: `It is ${article} ${word}.` };
    if (key === "book-1/unit-6") return { question: "What color is it?", answer: `It is ${word}.` };
    if (key === "book-1/unit-7") {
      const near = slot % 2 === 0;
      return { question: `What is ${near ? "this" : "that"}?`, answer: `${near ? "This" : "That"} is ${article} ${word}.` };
    }
    if (key === "book-1/unit-8") {
      const near = slot % 2 === 0;
      return { question: `Is ${near ? "this" : "that"} ${article} ${word}?`, answer: `Yes, it is. It is ${article} ${word}.` };
    }
    if (key === "book-1/unit-9") return pick([
      [`Is he ${word}?`, `Yes, he is. He is ${word}.`], [`Is she ${word}?`, `Yes, she is. She is ${word}.`],
      [`Are they ${word}?`, `Yes, they are. They are ${word}.`], [`Are we ${word}?`, `Yes, we are. We are ${word}.`]
    ]);

    if (key === "book-2/unit-1") {
      const classroomWords = ["door", "window", "television", "speaker", "whiteboard", "trash can", "table", "fan", "telephone", "blackboard"];
      const wordIndex = Math.max(0, classroomWords.indexOf(word.toLowerCase()));
      const differentWord = classroomWords[(wordIndex + 3) % classroomWords.length];
      const differentArticle = reviewArticle(differentWord);
      return [
        { question: `Is there ${article} ${word}?`, answer: `Yes, there is. There is ${article} ${word}.` },
        { question: "What is it?", answer: `It is ${article} ${word}.` },
        { question: `Is there ${differentArticle} ${differentWord}?`, answer: `No, there is not. There is ${article} ${word}.` },
        { question: `Is there ${article} ${word}?`, answer: `Yes, there is. There is ${article} ${word}.` }
      ][slot];
    }
    if (key === "book-2/unit-2") {
      const numberWords = ["eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
      const wordIndex = Math.max(0, numberWords.indexOf(word.toLowerCase()));
      const differentWord = numberWords[(wordIndex + 2) % numberWords.length];
      return slot % 2 === 0
        ? { question: `Are there ${word} books?`, answer: `Yes, there are. There are ${word} books.` }
        : { question: `Are there ${differentWord} books?`, answer: `No, there are not. There are ${word} books.` };
    }
    if (key === "book-2/unit-3") {
      const count = ((index + day) % 9) + 2;
      return { question: `How many ${plural} are there?`, answer: `There are ${count} ${plural}.` };
    }
    if (key === "book-2/unit-4") return [
      { question: "What are these?", answer: `These are ${plural}.` },
      { question: "What are those?", answer: `Those are ${plural}.` },
      { question: `Are these ${differentFruitPlural(plural, index)}?`, answer: `No, they aren't. They are ${plural}.` },
      { question: `Are those ${plural}?`, answer: `Yes, they are. They are ${plural}.` }
    ][slot];
    if (key === "book-2/unit-5") return [
      { question: `Are these ${plural}?`, answer: `Yes, they are. They are ${plural}.` },
      { question: `Are those ${differentFruitPlural(plural, index + 1)}?`, answer: `No, they aren't. They are ${plural}.` },
      { question: "What are these?", answer: `These are ${plural}.` },
      { question: "What are those?", answer: `Those are ${plural}.` }
    ][slot];
    if (key === "book-2/unit-6") {
      const actions = ["jump", "read", "write", "type", "dance", "sing", "run", "swim"];
      const wordIndex = Math.max(0, actions.indexOf(word.toLowerCase()));
      const differentWord = actions[(wordIndex + 3) % actions.length];
      return [
        { question: `Can you ${word}?`, answer: `Yes, I can. I can ${word}.` },
        { question: `Can you ${differentWord}?`, answer: `No, I can't. I can ${word}.` },
        { question: `Can he ${word}?`, answer: `Yes, he can. He can ${word}.` },
        { question: `Can she ${differentWord}?`, answer: `No, she can't. She can ${word}.` }
      ][slot];
    }
    if (key === "book-2/unit-7") return { question: "Where is the book?", answer: `It is ${/^between$/i.test(word) ? "between the desk and the chair" : `${word} the desk`}.` };
    if (key === "book-2/unit-8") return pick([
      ["Where are you?", `I am in the ${word}.`], ["Where is he?", `He is in the ${word}.`],
      ["Where is she?", `She is in the ${word}.`], ["Where are they?", `They are in the ${word}.`]
    ]);
    if (key === "book-2/unit-9") return slot % 2
      ? { question: `Do you like ${plural}?`, answer: `Yes, I do. I like ${plural}.` }
      : { question: "What do you like?", answer: `I like ${plural}.` };

    if (["unit-1", "unit-2", "unit-3"].includes(unitId) && bookId === "book-3") {
      const profile = BOOK3_PROGRESSIVE_PROFILES[unitId];
      const [question, answer, cue] = profile.pair(word, index, profile.contexts[day - 1] || "", day);
      return { question, answer, cue };
    }
    if (key === "book-3/unit-4") return pick([
      ["What do you want?", `I want ${article} ${word}.`], ["What does he want?", `He wants ${article} ${word}.`],
      ["What does she want?", `She wants ${article} ${word}.`], ["What does Lumi want?", `Lumi wants ${article} ${word}.`]
    ]);
    if (key === "book-3/unit-5") {
      const quantity = /^(eye|ear|leg|hand|arm|foot|tooth)$/i.test(word) ? `two ${plural}` : `${article} ${word}`;
      const owner = slot % 2 ? "Lumi" : "Ludi";
      return { question: `Who has ${quantity}?`, answer: `${owner} has ${quantity}.` };
    }
    if (key === "book-3/unit-6") {
      const description = /^hair$/i.test(word) ? "long hair" : `${word} hair`;
      const wrongDescription = description === "short hair" ? "long hair" : "short hair";
      const hairSlot = (index + day - 1) % 8;
      return [
        { question: `Do you have ${description}?`, answer: `Yes, I do. I have ${description}.` },
        { question: `Does she have ${description}?`, answer: `Yes, she does. She has ${description}.` },
        { question: `Does he have ${description}?`, answer: `Yes, he does. He has ${description}.` },
        { question: `Do they have ${description}?`, answer: `Yes, they do. They have ${description}.` },
        { question: `Does Lumi have ${description}?`, answer: `Yes, she does. Lumi has ${description}.` },
        { question: `Does Ludi have ${wrongDescription}?`, answer: `No, he doesn't. Ludi has ${description}.` },
        { question: `Who has ${description}?`, answer: `Lumi has ${description}.` },
        { question: "What kind of hair does she have?", answer: `She has ${description}.` }
      ][hairSlot];
    }
    if (key === "book-3/unit-7") return { question: `Do you like to play ${word}?`, answer: `Yes, I do. I like to play ${word}.` };
    if (key === "book-3/unit-8") return /day$/i.test(word)
      ? { question: "What day is today?", answer: `It is ${word}.` }
      : { question: "What do you like to do on Sundays?", answer: `I like to ${word}.` };
    if (key === "book-3/unit-9") {
      if (!/^go\s/i.test(word)) return { question: "How is the weather today?", answer: `It is ${word}.` };
      const weather = ["sunny", "rainy", "snowy", "windy", "cloudy"][(index + day - 1) % 5];
      return { question: `What do you like to do on ${weather} days?`, answer: `I like to ${word}.` };
    }
    return null;
  }

  function standardProgressivePairs(unit, day, bookId) {
    const vocabulary = vocabularyItems(unit);
    const offset = (day - 1) * 2;
    const sourceUnit = { ...unit, bookId };
    const candidates = Array.from({ length: Math.min(8, vocabulary.length) }, (_, index) => {
      const asset = vocabulary[(index + offset) % Math.max(vocabulary.length, 1)] || {};
      const pair = window.UNIT_PACKS?.[`${bookId}/${unit.id}`]?.pairForVocabulary?.(worksheetWord(asset), index, day, vocabulary.map(worksheetWord))
        || unitPairForVocabulary(bookId, unit.id, asset, index + offset, day)
        || reviewPairForVocabulary(sourceUnit, unit, asset, index + offset);
      return {
        ...pair,
        answer: bookId === "book-1" ? oneSentenceAnswer(pair.answer) : pair.answer,
        asset: pair.sprite ? { ...asset, image: "", sprite: pair.sprite } : asset,
        cue: `Answer: ${bookId === "book-1" ? oneSentenceAnswer(pair.answer) : pair.answer}`
      };
    });
    const prompts = new Set();
    const answers = new Set();
    return candidates.filter((pair) => {
      const promptKey = String(pair.question || "").trim().toLowerCase();
      const answerKey = String(pair.answer || "").trim().toLowerCase();
      if (!promptKey || !answerKey || prompts.has(promptKey) || answers.has(answerKey)) return false;
      prompts.add(promptKey);
      answers.add(answerKey);
      return true;
    });
  }

  function isFruitQuestionUnit(bookId, unitId) {
    return bookId === "book-2" && (unitId === "unit-4" || unitId === "unit-5");
  }

  function pictureQuestionPrompt(pair, bookId, unitId) {
    if (!isFruitQuestionUnit(bookId, unitId)) return `Answer: ${pair.answer}`;
    return /^What are\b/i.test(pair.question)
      ? "Look at the picture. Write a What question."
      : "Look at the picture. Write a Yes/No question.";
  }

  function pictureQuestionAnswer(pair, bookId, unitId) {
    if (!isFruitQuestionUnit(bookId, unitId) || !/^Are (?:these|those)\b/i.test(pair.question) || !/^No,/i.test(pair.answer)) {
      return pair.question;
    }
    const pointer = /^Are those\b/i.test(pair.question) ? "those" : "these";
    return `Are ${pointer} ${worksheetPlural(pair.asset)}?`;
  }

  function mixedCorrectionItems(pairsForDay, bookId, unitId) {
    const mixed = pairsForDay.map((pair, index) => {
      const firstAnswer = pair.answer.match(/^[^.!?]+[.!?]/)?.[0] || pair.answer;
      const modes = [
        { prompt: `Fix the answer: ${grammarError(pair.answer)}`, expectedAnswer: pair.answer },
        { prompt: `Put the question in order: ${scramble(pair.question, bookId)}`, expectedAnswer: firstSentence(pair.question) },
        { prompt: `Fix the question: ${secondGrammarError(pair.question)}`, expectedAnswer: pair.question },
        { prompt: `Put the answer in order: ${scramble(firstAnswer, bookId)}`, expectedAnswer: firstSentence(firstAnswer) }
      ];
      return { ...modes[index % modes.length], asset: pair.asset };
    });
    if (!isFruitQuestionUnit(bookId, unitId)) return mixed;
    const pluralPair = pairsForDay.at(-2);
    const singularPair = pairsForDay.at(-1);
    if (pluralPair) mixed[mixed.length - 2] = { prompt: `Change to plural: ${worksheetWord(pluralPair.asset)} → __________`, asset: pluralPair.asset, expectedAnswer: worksheetPlural(pluralPair.asset) };
    if (singularPair) mixed[mixed.length - 1] = { prompt: `Change to singular: ${worksheetPlural(singularPair.asset)} → __________`, asset: singularPair.asset, expectedAnswer: worksheetWord(singularPair.asset) };
    return mixed;
  }

  function grammarBlank(sentence, index = 0) {
    const value = String(sentence);
    const matches = [...value.matchAll(/\b(there|is|are|am|not|do|does|has|have|can|want|wants|like|likes)\b/gi)];
    if (!matches.length) return value;
    const match = matches[index % matches.length];
    return `${value.slice(0, match.index)}________${value.slice(match.index + match[0].length)}`;
  }

  function articleFor(word) {
    return /^[aeiou]/i.test(String(word).trim()) ? "an" : "a";
  }

  function finalAnswerNoun(answer, fallback) {
    const matches = [...String(answer).matchAll(/\b(?:is|are)\s+([^.!?]+)/gi)];
    return (matches.at(-1)?.[1] || worksheetWord(fallback) || "fruit").trim();
  }

  function unitReadingPage(unit, bookId, pairsForDay) {
    const reading = window.UNIT_PACKS?.[`${bookId}/${unit.id}`]?.reading;
    if (!reading) return null;
    const heroAssets = (reading.heroWords || []).map((heroWord) => pairsForDay.find((pair) => {
      const word = worksheetWord(pair.asset).toLowerCase();
      const target = String(heroWord).toLowerCase();
      return word === target || word.startsWith(target) || target.startsWith(word);
    })?.asset).filter(Boolean);
    if (!heroAssets.length && pairsForDay[0]?.asset) heroAssets.push(pairsForDay[0].asset);
    return {
      type: "reading_comprehension",
      layout: "locked_template",
      title: reading.title,
      instruction: "Read the passage. Answer each question with a complete sentence.",
      skill: reading.skill,
      passageLines: reading.lines.slice(),
      heroAssets,
      items: reading.questions.map((question) => ({ prompt: question.q, expectedAnswer: question.a }))
    };
  }

  function answerQuestionCandidates(bookId, sections, day) {
    return [0, 1, 2, 3].flatMap((offset) => sections.flatMap((section) =>
      vocabularyItems(section).map((asset, index) => {
        const pair = unitPairForVocabulary(bookId, section.id, asset, index, day + offset);
        if (!pair) return null;
        return { ...pair, asset, answer: bookId === "book-1" ? oneSentenceAnswer(pair.answer) : pair.answer };
      }).filter(Boolean)
    ));
  }

  function selectAnswerQuestions(candidates, limit) {
    const prompts = new Set();
    const answers = new Set();
    const items = [];
    for (const { question, answer, asset } of candidates) {
      const promptKey = String(question || "").trim().toLowerCase();
      const answerKey = String(answer || "").trim().toLowerCase();
      if (!promptKey || !answerKey || prompts.has(promptKey) || answers.has(answerKey)) continue;
      if (!asset?.image && !asset?.sprite?.src && !asset?.visual) continue;
      prompts.add(promptKey);
      answers.add(answerKey);
      items.push({ prompt: question, asset, expectedAnswer: answer, alt: "Picture clue" });
      if (items.length === limit) break;
    }
    return items;
  }

  function questionChainPage(pairsForDay, unit, bookId, day) {
    return {
      type: "answer_questions",
      layout: "locked_template",
      title: "Answer the Questions",
      instruction: "Read each question. Write a complete answer.",
      skill: "questions and complete answers",
      showPictures: true,
      items: selectAnswerQuestions([...pairsForDay, ...answerQuestionCandidates(bookId, [unit], day)], 8)
    };
  }

  function fillAnswerQuestionReview(pages, book, unit, day) {
    const page = pages.find((entry) => entry.type === "answer_questions" && entry.title === "Answer the Questions");
    if (!page || page.items.length >= 8 || unit.isReview || day !== 4) return;
    const teachingUnits = book.units.filter((entry) => !entry.isReview);
    const earlierUnits = teachingUnits.slice(0, teachingUnits.indexOf(unit)).reverse();
    const currentItems = page.items.map((item) => ({
      question: item.prompt, answer: item.expectedAnswer, asset: item.asset
    }));
    page.items = selectAnswerQuestions([...currentItems, ...answerQuestionCandidates(book.id, earlierUnits, day)], 8);
  }

  function unitSkillLabel(unit) {
    return [unit.grammarFocus, unit.topic, unit.title].find((value) => typeof value === "string" && value.trim()) || "English practice";
  }

  function unitApplicationPage(unit, bookId, pairsForDay) {
    if (bookId === "book-2" && unit.id === "unit-1") {
      return {
        type: "template_classroom_checklist",
        layout: "locked_template",
        title: "Read the Classroom Checklist",
        instruction: "Read each checklist mark. Write a complete There is or There is not sentence.",
        skill: "turning visual information into affirmative and negative statements",
        items: pairsForDay.map((pair, index) => {
          const word = worksheetWord(pair.asset);
          const present = index % 2 === 0;
          return {
            prompt: `${word} ${present ? "✓" : "✗"} — Write a complete sentence.`,
            asset: pair.asset,
            expectedAnswer: `There is${present ? "" : " not"} ${articleFor(word)} ${word}.`
          };
        })
      };
    }
    return progressivePage(
      "template_situation_response",
      "Situation Response",
      "Read each situation. Write the best complete response.",
      unitSkillLabel(unit),
      pairsForDay.map((pair) => ({
        prompt: `Lumi asks, “${pair.question}” What should Ludi say?`,
        asset: pair.asset,
        expectedAnswer: pair.answer
      })),
      { layout: "locked_template", showPictures: true }
    );
  }

  function standardProgressivePages(unit, day, bookId) {
    const pairsForDay = standardProgressivePairs(unit, day, bookId);
    const matchPairs = pairsForDay.slice(0, 4);
    const rotated = rotateAnswers(matchPairs);
    const skill = unitSkillLabel(unit);
    const matchingItems = matchPairs.map((pair, index) => ({
      left: pair.question,
      right: rotated[index],
      asset: pair.asset,
      expectedAnswer: `${pair.question} → ${pair.answer}`
    }));
    const questionChoices = pairsForDay.slice(0, 6).map((pair) => ({
      prompt: `Answer: ${pair.answer}`,
      choices: choicesFor(pair.question),
      asset: pair.asset,
      expectedAnswer: pair.question
    }));
    const answerChoices = pairsForDay.slice(0, 6).map((pair) => ({
      prompt: pair.question,
      choices: choicesFor(pair.answer),
      asset: pair.asset,
      expectedAnswer: pair.answer
    }));
    const pictureSentenceChoices = pairsForDay.slice(0, 6).map((pair) => {
      if (window.UNIT_PACKS?.[`${bookId}/${unit.id}`]?.pictureQuestionAnswers) {
        return { prompt: pair.question, choices: choicesFor(pair.answer), asset: pair.asset, expectedAnswer: pair.answer };
      }
      const normalized = (value) => String(value).toLowerCase().replace(/[^a-z0-9']+/g, " ").trim();
      const seen = new Set();
      const choices = [
        pair.answer,
        ...pairsForDay.filter((other) => other !== pair).map((other) => other.answer),
        ...choicesFor(pair.answer)
      ].filter((choice) => {
        const key = normalized(choice);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 3);
      const word = worksheetWord(pair.asset);
      return {
        prompt: `Choose the complete sentence for ${reviewArticle(word)} ${word}.`,
        choices,
        asset: pair.asset,
        expectedAnswer: pair.answer
      };
    });
    const page = (type, title, instruction, items, options = {}) => progressivePage(
      type, title, instruction, skill, items, options
    );
    const locked = (type, title, instruction, items, showPictures = false) => page(
      type, title, instruction, items, { layout: "locked_template", showPictures }
    );

    if (day === 1) return [
      locked("template_picture_answer", "Look and Answer", "Look at each picture. Write a complete answer.", pairsForDay.map((pair) => ({ prompt: pair.question, asset: pair.asset, expectedAnswer: pair.answer })), true),
      page("matching", "Look and Match", "Draw a line from each question to the correct answer.", matchingItems),
      page("multiple_choice", "Choose the Answer", "Look at the picture. Circle the correct complete answer.", answerChoices),
      locked(
        "template_fix_mistakes",
        "Mixed Language Practice",
        "Follow each direction. Fix mistakes, reorder words, or change the word form.",
        mixedCorrectionItems(pairsForDay, bookId, unit.id)
      )
    ];

    if (day === 2) return [
      unitReadingPage(unit, bookId, pairsForDay) || locked("template_picture_answer", "Look and Answer", "Look at each picture. Write a complete answer.", pairsForDay.map((pair) => ({ prompt: pair.question, asset: pair.asset, expectedAnswer: pair.answer })), true),
      locked("template_picture_question", "Make the Question", "Read each answer. Write the matching question.", pairsForDay.map((pair) => ({ prompt: pair.answer, asset: pair.asset, expectedAnswer: pictureQuestionAnswer(pair, bookId, unit.id) })), true),
      page("multiple_choice", "Choose the Picture Sentence", "Look at each picture. Circle the complete sentence that matches.", pictureSentenceChoices),
      locked("template_question_order", "Build the Question", "Put the words in order. Write the complete question.", pairsForDay.map((pair) => ({ prompt: scramble(pair.question, bookId), asset: pair.asset, expectedAnswer: firstSentence(pair.question) })))
    ];

    if (day === 3) return [
      locked("template_guided_question", "Write Your Question", "Read each answer. Write the matching question.", pairsForDay.map((pair) => ({ prompt: pair.answer, asset: pair.asset, expectedAnswer: pictureQuestionAnswer(pair, bookId, unit.id) })), true),
      page("multiple_choice", "Choose the Correct Grammar", "Look at the picture. Circle the only grammatically correct complete sentence.", answerChoices),
      locked("template_mixed_correction", "Fix the Questions", "Find the mistake. Rewrite each question correctly.", pairsForDay.map((pair) => ({ prompt: secondGrammarError(pair.question), asset: pair.asset, expectedAnswer: pair.question }))),
      locked("template_answer_order", "Build the Answer", "Put the words in order. Write the complete sentence.", pairsForDay.map((pair) => {
        const first = firstSentence(pair.answer);
        const repeatedShortAnswer = /^(?:Yes|No),/i.test(first)
          && pairsForDay.some((other) => other !== pair && firstSentence(other.answer) === first);
        const answer = repeatedShortAnswer ? firstSentence(pair.answer.slice(first.length).trim()) || first : first;
        return { prompt: scramble(answer, bookId), asset: pair.asset, expectedAnswer: answer };
      }))
    ];

    return [
      locked("template_independent_picture", "Picture Question Challenge", "Read each answer. Write the matching question.", pairsForDay.map((pair) => ({ prompt: pair.answer, asset: pair.asset, expectedAnswer: pictureQuestionAnswer(pair, bookId, unit.id) })), true),
      questionChainPage(pairsForDay, unit, bookId, day),
      unitApplicationPage(unit, bookId, pairsForDay),
      page("multiple_choice", "Mixed Choice Review", "Look at each picture. Circle the best complete sentence.", pictureSentenceChoices)
    ];
  }

  function cumulativeMixedAnswerPage(book, currentUnit) {
    const teachingUnits = book.units.filter((item) => !item.isReview);
    const currentIndex = teachingUnits.findIndex((item) => item.id === currentUnit.id);
    const availableUnits = teachingUnits.slice(0, currentIndex + 1);
    const sourceUnits = availableUnits.length <= 8
      ? Array.from({ length: 8 }, (_, index) => availableUnits[index % availableUnits.length])
      : Array.from({ length: 8 }, (_, index) => availableUnits[Math.round(index * (availableUnits.length - 1) / 7)]);
    const usage = new Map();
    const items = sourceUnits.map((sourceUnit, index) => {
      const used = usage.get(sourceUnit.id) || 0;
      usage.set(sourceUnit.id, used + 1);
      const vocabulary = vocabularyItems(sourceUnit)
        .slice()
        .sort((a, b) => worksheetWord(b).replace(/[^A-Za-z]/g, "").length - worksheetWord(a).replace(/[^A-Za-z]/g, "").length);
      const asset = vocabulary[(used + currentIndex) % Math.max(vocabulary.length, 1)] || {};
      const pair = unitPairForVocabulary(book.id, sourceUnit.id, asset, index + currentIndex + used, 1)
        || reviewPairForVocabulary({ ...currentUnit, bookId: book.id }, sourceUnit, asset, index);
      return { prompt: pair.question, asset, expectedAnswer: book.id === "book-1" ? oneSentenceAnswer(pair.answer) : pair.answer };
    });
    return progressivePage(
      "template_mixed_answer_review",
      "Mixed Question and Answer Review",
      "Read each question. Look at the picture and write a complete answer.",
      "mixed question and answer review",
      items,
      { layout: "locked_template", showPictures: true }
    );
  }

  function book3Unit5Pages(unit, day, book) {
    const asset = (unitId, word) => {
      const source = book.units.find((item) => item.id === unitId);
      return vocabularyItems(source).find((item) => String(item.word || "").toLowerCase() === word.toLowerCase()) || {};
    };
    const pictures = {
      bunny: asset("unit-1", "bunnies"), spider: asset("unit-1", "spiders"), fish: asset("unit-1", "fish"),
      popcorn: asset("unit-3", "popcorn"), bicycle: asset("unit-4", "bicycle"), puzzle: asset("unit-4", "puzzle"),
      head: asset("unit-5", "head"), eyes: asset("unit-5", "eye(s)"), ears: asset("unit-5", "ear(s)"),
      nose: asset("unit-5", "nose"), legs: asset("unit-5", "leg(s)"), hands: asset("unit-5", "hand(s)"),
      arms: asset("unit-5", "arm(s)"), teeth: asset("unit-5", "tooth / teeth"), mouth: asset("unit-5", "mouth"),
      feet: asset("unit-5", "foot / feet")
    };
    const whoPairs = [
      { question: "Who has two long ears?", answer: "The bunny has two long ears.", asset: pictures.bunny },
      { question: "Who has eight legs?", answer: "The spider has eight legs.", asset: pictures.spider },
      { question: "Who has no legs?", answer: "The fish has no legs.", asset: pictures.fish },
      { question: "Who has a bicycle?", answer: "Ludi has a bicycle.", asset: pictures.bicycle },
      { question: "Who has some popcorn?", answer: "Lumi has some popcorn.", asset: pictures.popcorn },
      { question: "Who has two hands?", answer: "Ludi has two hands.", asset: pictures.hands },
      { question: "Who has two feet?", answer: "Lumi has two feet.", asset: pictures.feet },
      { question: "Who has a big head?", answer: "Ludi has a big head.", asset: pictures.head },
      { question: "Who has two eyes?", answer: "Lumi has two eyes.", asset: pictures.eyes },
      { question: "Who has one mouth?", answer: "Ludi has one mouth.", asset: pictures.mouth }
    ];
    const offset = ((day - 1) * 2) % whoPairs.length;
    const dailyPairs = [...whoPairs.slice(offset), ...whoPairs.slice(0, offset)].slice(0, 8);
    const matchPairs = dailyPairs.slice(0, 4);
    const rotatedAnswers = rotateAnswers(matchPairs);
    const matchingItems = matchPairs.map((pair, index) => ({
      left: pair.question,
      right: rotatedAnswers[index],
      asset: pair.asset,
      expectedAnswer: `${pair.question} → ${pair.answer}`
    }));
    const allGrammarChoices = [
      { prompt: "My little sister ______ three teeth.", choices: ["has", "have", "doesn't"], expectedAnswer: "has", asset: pictures.teeth },
      { prompt: "She ______ have short legs.", choices: ["doesn't", "don't", "has"], expectedAnswer: "doesn't", asset: pictures.legs },
      { prompt: "I ______ have a big nose.", choices: ["don't", "doesn't", "has"], expectedAnswer: "don't", asset: pictures.nose },
      { prompt: "Lumi doesn't ______ a big head.", choices: ["have", "has", "having"], expectedAnswer: "have", asset: pictures.head },
      { prompt: "We ______ two arms.", choices: ["have", "has", "doesn't"], expectedAnswer: "have", asset: pictures.arms },
      { prompt: "The spider ______ eight legs.", choices: ["has", "have", "don't"], expectedAnswer: "has", asset: pictures.spider },
      { prompt: "The bunny ______ two long ears.", choices: ["has", "have", "don't"], expectedAnswer: "has", asset: pictures.bunny },
      { prompt: "They ______ have a puzzle.", choices: ["don't", "doesn't", "has"], expectedAnswer: "don't", asset: pictures.puzzle },
      { prompt: "Ludi ______ a bicycle.", choices: ["has", "have", "doesn't"], expectedAnswer: "has", asset: pictures.bicycle },
      { prompt: "We ______ some popcorn.", choices: ["have", "has", "doesn't"], expectedAnswer: "have", asset: pictures.popcorn },
      { prompt: "The fish ______ have legs.", choices: ["doesn't", "don't", "has"], expectedAnswer: "doesn't", asset: pictures.fish },
      { prompt: "I ______ two hands.", choices: ["have", "has", "doesn't"], expectedAnswer: "have", asset: pictures.hands }
    ];
    const grammarOffset = ((day - 1) * 3) % allGrammarChoices.length;
    const dailyGrammarChoices = [...allGrammarChoices.slice(grammarOffset), ...allGrammarChoices.slice(0, grammarOffset)];
    const correctionItems = [
      { prompt: "My little sister has three tooth.", expectedAnswer: "My little sister has three teeth.", asset: pictures.teeth },
      { prompt: "She don't have short legs.", expectedAnswer: "She doesn't have short legs.", asset: pictures.legs },
      { prompt: "I doesn't have a big nose.", expectedAnswer: "I don't have a big nose.", asset: pictures.nose },
      { prompt: "Lumi doesn't has a big head.", expectedAnswer: "Lumi doesn't have a big head.", asset: pictures.head },
      { prompt: "We has two arms.", expectedAnswer: "We have two arms.", asset: pictures.arms },
      { prompt: "Change to plural: one tooth → three ______", expectedAnswer: "teeth", asset: pictures.teeth },
      { prompt: "Change to plural: one ear → six ______", expectedAnswer: "ears", asset: pictures.ears },
      { prompt: "Put in order: ears / has / The bunny / long / .", expectedAnswer: "The bunny has long ears.", asset: pictures.bunny }
    ];
    const laterCorrectionItems = [
      { prompt: "The bunny have two long ears.", expectedAnswer: "The bunny has two long ears.", asset: pictures.bunny },
      { prompt: "They doesn't have a puzzle.", expectedAnswer: "They don't have a puzzle.", asset: pictures.puzzle },
      { prompt: "Ludi don't have bicycle.", expectedAnswer: "Ludi doesn't have a bicycle.", asset: pictures.bicycle },
      { prompt: "We has some popcorn.", expectedAnswer: "We have some popcorn.", asset: pictures.popcorn },
      { prompt: "The spider have eight legs.", expectedAnswer: "The spider has eight legs.", asset: pictures.spider },
      { prompt: "Change to plural: one eye → four ______", expectedAnswer: "eyes", asset: pictures.eyes },
      { prompt: "Change to plural: one foot → two ______", expectedAnswer: "feet", asset: pictures.feet },
      { prompt: "Put in order: has / Who / a puzzle / ?", expectedAnswer: "Who has a puzzle?", asset: pictures.puzzle }
    ];
    const unscrambleItems = [
      { prompt: "head. / has / a / Patrick / big", expectedAnswer: "Patrick has a big head.", asset: pictures.head },
      { prompt: "has / short / Who / arms / ?", expectedAnswer: "Who has short arms?", asset: pictures.arms },
      { prompt: "have / hands. / eight / small / don't / They", expectedAnswer: "They don't have eight small hands.", asset: pictures.hands },
      { prompt: "have / one / Suzy / doesn't / foot / .", expectedAnswer: "Suzy doesn't have one foot.", asset: pictures.feet },
      { prompt: "ears. / two / long / has / The bunny", expectedAnswer: "The bunny has two long ears.", asset: pictures.bunny },
      { prompt: "a / Who / bicycle / has / ?", expectedAnswer: "Who has a bicycle?", asset: pictures.bicycle },
      { prompt: "some / has / Lumi / popcorn / .", expectedAnswer: "Lumi has some popcorn.", asset: pictures.popcorn },
      { prompt: "legs. / doesn't / The fish / have", expectedAnswer: "The fish doesn't have legs.", asset: pictures.fish }
    ];
    const sentenceCues = [
      { prompt: "The bunny / two long ears", expectedAnswer: "The bunny has two long ears.", asset: pictures.bunny },
      { prompt: "The spider / eight legs", expectedAnswer: "The spider has eight legs.", asset: pictures.spider },
      { prompt: "The fish / no legs", expectedAnswer: "The fish doesn't have legs.", asset: pictures.fish },
      { prompt: "Ludi / a bicycle", expectedAnswer: "Ludi has a bicycle.", asset: pictures.bicycle },
      { prompt: "Lumi / some popcorn", expectedAnswer: "Lumi has some popcorn.", asset: pictures.popcorn },
      { prompt: "We / two arms", expectedAnswer: "We have two arms.", asset: pictures.arms },
      { prompt: "I / not / six teeth", expectedAnswer: "I don't have six teeth.", asset: pictures.teeth },
      { prompt: "Lumi / not / a big head", expectedAnswer: "Lumi doesn't have a big head.", asset: pictures.head }
    ];
    const page = (type, title, instruction, items, options = {}) => progressivePage(
      type, title, instruction, "Who has · has/have · don't/doesn't · body-part plurals", items, options
    );
    const locked = (type, title, instruction, items, showPictures = false) => page(
      type, title, instruction, items, { layout: "locked_template", showPictures }
    );
    const answerItems = dailyPairs.map((pair) => ({ prompt: pair.question, asset: pair.asset, expectedAnswer: pair.answer }));
    const answerChoices = dailyGrammarChoices.slice(0, 6).map((item) => ({ ...item }));

    if (day === 1) return [
      locked("template_picture_answer", "Look and Answer", "Look at each picture. Answer the Who has question in a complete sentence.", answerItems, true),
      page("matching", "Who Has It?", "Match each Who has question to the correct answer.", matchingItems),
      page("multiple_choice", "Choose the Correct Word", "Circle has, have, don't, or doesn't to complete each sentence.", answerChoices),
      locked("template_mixed_correction", "Correct, Change, and Reorder", "Correct Sentences 1–5. Then change the plural forms and reorder the last sentence.", correctionItems)
    ];
    if (day === 2) return [
      locked("template_grammar_choice", "Choose and Write", "Choose has, have, don't, or doesn't. Write the complete sentence.", dailyGrammarChoices.slice(0, 8).map((item) => ({ prompt: `${item.prompt} (${item.choices.join(" / ")})`, asset: item.asset, expectedAnswer: item.prompt.replace("______", item.expectedAnswer) })), true),
      page("matching", "Read and Match", "Match each Who has question to the correct complete answer.", matchingItems),
      page("multiple_choice", "Grammar Check", "Choose the correct word for each sentence.", answerChoices),
      locked("template_question_order", "Unscramble Different Sentences", "Unscramble the affirmative sentence, negative sentence, or Who has question.", unscrambleItems)
    ];
    if (day === 3) return [
      locked("template_picture_answer", "Look, Think, and Answer", "Use the pictures from this lesson and earlier lessons. Answer each Who has question.", answerItems, true),
      page("matching", "Question and Answer Match", "Match the Who has questions and complete answers.", matchingItems),
      page("multiple_choice", "Mixed Grammar Check", "Choose the correct has, have, don't, or doesn't.", answerChoices),
      locked("template_mixed_correction", "Correct the Sentences", "Correct the grammar or plural form in every sentence.", laterCorrectionItems)
    ];
    return [
      locked("template_independent_picture", "Build Complete Sentences", "Use each picture and cue. Write a complete sentence with has, have, don't, or doesn't.", sentenceCues, true),
      page("matching", "Final Who Has Match", "Match each Who has question to its complete answer.", matchingItems),
      page("multiple_choice", "Final Grammar Check", "Choose the correct has, have, don't, doesn't, or plural form.", answerChoices),
      locked("template_final_output", "Mixed Sentence Review", "Write complete sentences using words from this lesson and earlier lessons.", sentenceCues, true)
    ];
  }

  function reviewWord(asset) {
    return String(asset?.word || "").replace(/\(s\)|\(es\)/gi, "").trim();
  }

  function reviewWordLength(asset) {
    return reviewWord(asset).replace(/[^A-Za-z]/g, "").length;
  }

  function pluralReviewWord(word) {
    if (/s$/i.test(word)) return word;
    if (/[^aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
    if (/(?:ch|sh|x|z|o)$/i.test(word)) return `${word}es`;
    return `${word}s`;
  }

  function reviewArticle(word) {
    return /^[aeiou]/i.test(word) ? "an" : "a";
  }

  function reviewVocabularyTerms(asset) {
    return [...new Set([reviewWord(asset), ...(asset?.aliases || [])].map((term) => String(term).trim()).filter(Boolean))]
      .sort((a, b) => b.length - a.length);
  }

  function replaceReviewTerm(text, term, target) {
    if (!term) return text;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return String(text).replace(new RegExp(`\\b${escaped}\\b`, "gi"), (matched) => {
      const value = /s$/i.test(matched) ? pluralReviewWord(target) : target;
      return /^[A-Z]/.test(matched) ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
    });
  }

  function fixReviewArticles(text) {
    return String(text).replace(/\ba\s+([aeiou])/gi, "an $1").replace(/\ban\s+([^aeiou\W])/gi, "a $1");
  }

  function reviewPairForVocabulary(unit, section, asset, index) {
    const directPair = unitPairForVocabulary(unit.bookId, section.id, asset, index, (index % 4) + 1);
    if (directPair) {
      return {
        ...directPair,
        answer: unit.bookId === "book-1" ? oneSentenceAnswer(directPair.answer) : directPair.answer,
        asset,
        section: section.title,
        cue: `Answer: ${directPair.answer}`
      };
    }
    const vocabulary = vocabularyItems(section);
    const allowedPairs = pairs(section).filter((item) => {
      const earlyBook1 = unit.bookId === "book-1"
        && (unit.reviewRange === "1–3" || ["unit-1", "unit-2", "unit-3"].includes(unit.id));
      if (!earlyBook1) return true;
      return !/\b(?:we|they|them|their|these|those|parents|cousins)\b/i.test(`${item.question} ${item.answer}`);
    });
    const template = allowedPairs[index % Math.max(allowedPairs.length, 1)] || {};
    const anchors = vocabulary.flatMap((item) => reviewVocabularyTerms(item).map((term) => ({ item, term })))
      .sort((a, b) => b.term.length - a.term.length);
    const anchorIn = (text) => anchors.find(({ term }) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text));
    const questionAnchor = anchorIn(template.question || "");
    const answerAnchor = anchorIn(template.answer || "");
    const word = reviewWord(asset) || "picture";
    let question = template.question || "";
    let answer = template.answer || "";

    if (questionAnchor || answerAnchor) {
      if (questionAnchor) question = replaceReviewTerm(question, questionAnchor.term, word);
      if (answerAnchor) answer = replaceReviewTerm(answer, answerAnchor.term, word);
    } else if (/^Is there\b/i.test(question)) {
      question = `Is there ${reviewArticle(word)} ${word}?`;
      answer = `Yes, there is. There is ${reviewArticle(word)} ${word}.`;
    } else if (/^Are there\b/i.test(question)) {
      if (/^(?:eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|\d+)$/i.test(word)) {
        question = `Are there ${word} books?`;
        answer = `Yes, there are. There are ${word} books.`;
      } else {
        question = `Are there ${pluralReviewWord(word)}?`;
        answer = `Yes, there are. There are ${pluralReviewWord(word)}.`;
      }
    } else if (/^How many\b/i.test(question)) {
      const count = (index % 9) + 2;
      question = `How many ${pluralReviewWord(word)} are there?`;
      answer = `There are ${count} ${pluralReviewWord(word)}.`;
    } else if (/^What are (?:these|those)\b/i.test(question)) {
      const pointer = index % 2 ? "those" : "these";
      question = `What are ${pointer}?`;
      answer = `${pointer === "these" ? "These" : "Those"} are ${pluralReviewWord(word)}.`;
    } else if (/^Are (?:these|those)\b/i.test(question)) {
      const pointer = index % 2 ? "those" : "these";
      question = `Are ${pointer} ${pluralReviewWord(word)}?`;
      answer = `Yes, they are. They are ${pluralReviewWord(word)}.`;
    } else if (/^Who is\b/i.test(question)) {
      const female = /^(?:mother|grandmother|aunt|sister|girl|woman|teacher)$/i.test(word);
      question = `Who is ${female ? "she" : "he"}?`;
      answer = `${female ? "She" : "He"} is my ${word}.`;
    } else if (/^How old\b/i.test(question) && /^(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+)$/i.test(word)) {
      const subject = index % 2 ? "she" : "he";
      question = `How old is ${subject}?`;
      answer = `${subject === "she" ? "She" : "He"} is ${word} years old.`;
    } else {
      question = "What is in the picture?";
      answer = `It is ${reviewArticle(word)} ${word}.`;
    }

    return {
      question: fixReviewArticles(question),
      answer: fixReviewArticles(answer),
      asset,
      section: section.title,
      cue: `Answer: ${fixReviewArticles(answer)}`
    };
  }

  function reviewWorksheetPairs(unit, day, count = 24) {
    const sections = unit.reviewSections || [];
    const sectionWords = sections.map((section) => vocabularyItems(section)
      .filter((asset) => !(unit.bookId === "book-1" && unit.reviewRange === "1–3" && /\(s\)|\b(?:parents|cousins)\b/i.test(String(asset.word || ""))))
      .sort((a, b) => reviewWordLength(b) - reviewWordLength(a) || reviewWord(a).localeCompare(reviewWord(b))));
    const schedule = [];
    const maxWords = Math.max(0, ...sectionWords.map((items) => items.length));
    for (let rank = 0; rank < maxWords; rank += 1) {
      sections.forEach((section, sectionIndex) => {
        const asset = sectionWords[sectionIndex]?.[rank];
        if (asset) schedule.push({ section, asset });
      });
    }
    if (!schedule.length) return [];
    const dayStride = Math.max(1, Math.ceil(schedule.length / Math.max(4, unit.days?.length || 4)));
    const start = ((day - 1) * dayStride) % schedule.length;
    return Array.from({ length: count }, (_, index) => {
      const scheduled = schedule[(start + index) % schedule.length];
      return reviewPairForVocabulary(unit, scheduled.section, scheduled.asset, start + index);
    });
  }

  function clozeItem(item, index) {
    const answer = String(item.answer || "");
    const vocabularyTerms = reviewVocabularyTerms(item.asset)
      .flatMap((term) => [term, pluralReviewWord(term)])
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    const preferredMatch = vocabularyTerms.map((term) => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return answer.match(new RegExp(`\\b${escaped}\\b`, "i"));
    }).find(Boolean);
    const stopWords = new Set(["a", "an", "am", "are", "at", "can", "do", "does", "he", "her", "his", "i", "in", "is", "it", "my", "no", "not", "on", "she", "the", "they", "to", "we", "yes", "you", "your"]);
    const words = answer.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [];
    const candidates = words.filter((word) => !stopWords.has(word.toLowerCase()));
    const missing = preferredMatch?.[0] || candidates[index % Math.max(candidates.length, 1)] || words.at(-1) || "word";
    const prompt = answer.replace(new RegExp(`\\b${missing.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), "________");
    return { question: item.question, prompt, asset: item.asset, missing, expectedAnswer: `${missing} — ${answer}` };
  }

  function storyAsset(unit, word) {
    const wanted = String(word || "").toLowerCase();
    const assets = unit.vocabulary || [];
    return assets.find((asset) => {
      const terms = reviewVocabularyTerms(asset).flatMap((term) => [term, pluralReviewWord(term)]);
      return terms.some((term) => term.toLowerCase() === wanted);
    }) || assets[0] || null;
  }

  function activeReviewRange(unit, day) {
    if (unit.reviewRange !== "1–9") return unit.reviewRange;
    const ranges = ["1–3", "4–6", "7–9"];
    return ranges[(Math.max(1, day) - 1) % ranges.length];
  }

  function reviewSelectionPage(type, title, instruction, skill, items, showPictures = false) {
    return {
      type,
      layout: "locked_template",
      title,
      instruction,
      skill,
      showPictures,
      items
    };
  }

  function reviewStoryPage(title, instruction, skill, introLines, items, heroAssets = []) {
    return {
      type: "story_cloze",
      layout: "locked_template",
      title,
      instruction,
      skill,
      introLines,
      heroAssets,
      endingLines: [],
      items
    };
  }

  const REVIEW_FOCUS_BUILDERS = {
    "book-1:1–3": (unit) => reviewSelectionPage(
      "grammar_circle",
      "Look and Circle",
      "Circle the correct word in each sentence.",
      "am / is / are · identity and age",
      [
        { prompt: "I [ am / is / are ] Lumi.", expectedAnswer: "I am Lumi." },
        { prompt: "Lumi [ am / is / are ] a girl.", expectedAnswer: "Lumi is a girl." },
        { prompt: "Ludi [ am / is / are ] a boy.", expectedAnswer: "Ludi is a boy." },
        { prompt: "How old [ am / is / are ] you?", expectedAnswer: "How old are you?" }
      ]
    ),
    "book-1:4–6": (unit) => reviewSelectionPage(
      "word_path",
      "Read and Circle the Correct Words",
      "Read the question. Circle the words that make the correct answer.",
      "It is · articles · school things",
      [
        {
          prompt: "What is it?  [ It / They ] [ is / are ] [ a / an ] [ pencil / pencils ].",
          asset: storyAsset(unit, "pencil"),
          expectedAnswer: "It is a pencil."
        },
        {
          prompt: "Is it an eraser?  [ Yes, / No, ] [ it / they ] [ is / are ].",
          asset: storyAsset(unit, "eraser"),
          expectedAnswer: "Yes, it is."
        },
        {
          prompt: "Is it a pencil?  [ Yes, / No, ] [ it / they ] [ is / are ] [ not / no ].",
          asset: storyAsset(unit, "eraser"),
          expectedAnswer: "No, it is not."
        }
      ],
      true
    ),
    "book-1:7–9": (unit) => reviewSelectionPage(
      "word_path",
      "Read and Circle the Correct Words",
      "Look at the picture. Circle the words that make the correct answer.",
      "this / that · singular answers",
      [
        {
          prompt: "What is this?  [ It / They ] [ is / are ] [ a / an ] [ hat / hats ].",
          asset: storyAsset(unit, "hat"),
          expectedAnswer: "It is a hat."
        },
        {
          prompt: "What is that?  [ It / They ] [ is / are ] [ a / an ] [ dog / dogs ].",
          asset: storyAsset(unit, "dog"),
          expectedAnswer: "It is a dog."
        },
        {
          prompt: "Is this a cat?  [ Yes, / No, ] [ it / they ] [ is / are ] [ not / no ].",
          asset: storyAsset(unit, "dog"),
          expectedAnswer: "No, it is not."
        }
      ],
      true
    ),
    "book-2:1–3": (unit, day) => {
      const unusedPool = reviewWorksheetPairs(unit, day, 24).slice(19, 24);
      const numberWord = /^(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)$/i;
      const numberPair = unusedPool.find((pair) => numberWord.test(worksheetWord(pair.asset)));
      const unusedPairs = [numberPair, ...unusedPool.filter((pair) => pair !== numberPair && !numberWord.test(worksheetWord(pair.asset)))].filter(Boolean).slice(0, 4);
      return reviewSelectionPage(
        "read_write_clues",
        "Look, Count, and Write",
        "Look at each picture and number. Write one complete sentence.",
        "There is / There are · numbers",
        unusedPairs.map((pair) => {
          const numberOnly = numberWord.test(worksheetWord(pair.asset));
          const bookPicture = { image: "assets/images/book1/unit5/book.png" };
          const sentences = String(pair.answer).match(/There (?:is|are)[^.!?]*[.!?]/g) || [];
          return {
            prompt: "",
            asset: numberOnly ? { image: bookPicture.image, sprite: bookPicture.sprite, visual: bookPicture.visual } : pair.asset,
            expectedAnswer: sentences.at(-1) || firstSentence(pair.answer)
          };
        }),
        true
      );
    },
    "book-2:4–6": (unit) => reviewSelectionPage(
      "word_path",
      "Read and Circle the Correct Words",
      "Look at the picture. Circle the words that make the correct answer.",
      "these / those · can / can't",
      [
        {
          prompt: "What are these?  [ They / It ] [ are / is ] [ bananas / banana ].",
          asset: storyAsset(unit, "bananas"),
          expectedAnswer: "They are bananas."
        },
        {
          prompt: "What are those?  [ They / It ] [ are / is ] [ mangoes / mango ].",
          asset: storyAsset(unit, "mangoes"),
          expectedAnswer: "They are mangoes."
        },
        {
          prompt: "Are these tomatoes?  [ Yes, / No, ] [ they / it ] [ are / aren't ].",
          asset: storyAsset(unit, "oranges"),
          expectedAnswer: "No, they aren't."
        },
        {
          prompt: "Can she read?  [ Yes, / No, ] [ she / he ] [ can / can't ].",
          asset: storyAsset(unit, "read"),
          expectedAnswer: "Yes, she can."
        }
      ],
      true
    ),
    "book-2:7–9": (unit) => reviewStoryPage(
      "Read, Look, and Write",
      "Read the short text. Answer each question with a complete sentence.",
      "where · place words · like",
      [
        "Lumi is in the kitchen.",
        "A tiger is in the garden.",
        "Lumi likes tigers."
      ],
      [
        { question: "Where is Lumi?", asset: storyAsset(unit, "kitchen"), expectedAnswer: "She is in the kitchen." },
        { question: "Where is the tiger?", asset: storyAsset(unit, "tiger"), expectedAnswer: "It is in the garden." },
        { question: "Does Lumi like tigers?", asset: storyAsset(unit, "tiger"), expectedAnswer: "Yes, she does." }
      ]
    ),
    "book-3:1–3": (unit) => reviewSelectionPage(
      "grammar_circle",
      "Look and Circle",
      "Circle the correct grammar word or words.",
      "has / have · do / does",
      [
        { prompt: "Lumi [ have / has ] two hamsters.", expectedAnswer: "Lumi has two hamsters." },
        { prompt: "They [ have / has ] chicken nuggets.", expectedAnswer: "They have chicken nuggets." },
        { prompt: "He [ don't / doesn't ] like potato chips.", expectedAnswer: "He doesn't like potato chips." },
        { prompt: "[ Do / Does ] Lumi like hamsters?", expectedAnswer: "Does Lumi like hamsters?" },
        { prompt: "Yes, she [ do / does ].", expectedAnswer: "Yes, she does." }
      ]
    ),
    "book-3:4–6": (unit) => reviewSelectionPage(
      "read_write_clues",
      "Look and Write",
      "Look at each picture and number. Write one complete sentence.",
      "has / have · body and appearance",
      [
        { prompt: "Hands:", asset: storyAsset(unit, "hand"), expectedAnswer: "He has two hands." },
        { prompt: "Eyes:", asset: storyAsset(unit, "eye"), expectedAnswer: "She has two eyes." },
        { prompt: "Hair:", asset: storyAsset(unit, "curly"), expectedAnswer: "Lumi has curly hair." },
        { prompt: "Bicycle:", asset: storyAsset(unit, "bicycle"), expectedAnswer: "Ludi has a bicycle." }
      ],
      true
    ),
    "book-3:7–9": (unit) => reviewStoryPage(
      "Read, Look, and Write",
      "Read the short text. Answer each question with a complete sentence.",
      "days · weather · activities",
      [
        "Today is Sunday.",
        "It is sunny.",
        "Lumi and Ludi play baseball.",
        "They like baseball."
      ],
      [
        { question: "What day is today?", asset: storyAsset(unit, "Sunday"), expectedAnswer: "It is Sunday." },
        { question: "How's the weather?", asset: storyAsset(unit, "sunny"), expectedAnswer: "It is sunny." },
        { question: "What do they play?", asset: storyAsset(unit, "baseball"), expectedAnswer: "They play baseball." },
        { question: "Do they like baseball?", asset: storyAsset(unit, "baseball"), expectedAnswer: "Yes, they do." }
      ]
    )
  };

  function reviewFocusPage(unit, day) {
    const range = activeReviewRange(unit, day);
    const builder = REVIEW_FOCUS_BUILDERS[unit.bookId + ":" + range];
    if (!builder) throw new Error("Missing review focus builder for " + unit.bookId + ":" + range);
    return builder(unit, day);
  }
  function connectedChainPage(reviewPairs, day) {
    const items = selectAnswerQuestions(reviewPairs, day >= 4 ? 6 : 8);
    return {
      type: "answer_questions",
      layout: "locked_template",
      title: day >= 4 ? "Question and Answer Review" : "Answer the Questions",
      instruction: "Read each question. Write a complete answer.",
      skill: "questions and complete answers",
      showPictures: true,
      items
    };
  }

  function book2Review13ContextPage(unit) {
    return reviewStoryPage(
      "Read, Look, and Answer",
      "Read the short text. Look at the pictures. Write a complete answer.",
      "There is / There are · numbers",
      [
        "Lumi and Ludi are in the classroom.",
        "They look at some books and robots.",
        "There is a table, too."
      ],
      [
        { question: "Are there thirteen books?", asset: { image: "assets/images/book1/unit5/book.png" }, expectedAnswer: "No, there aren't; there are sixteen books." },
        { question: "How many robots are there?", asset: storyAsset(unit, "robot"), expectedAnswer: "There are two robots." },
        { question: "Is there a table?", asset: storyAsset(unit, "table"), expectedAnswer: "Yes, there is." },
        { question: "Are there fifteen books?", asset: { image: "assets/images/book1/unit5/book.png" }, expectedAnswer: "No, there aren't. There are sixteen books." }
      ],
      [
        { image: "assets/images/book1/unit5/book.png" },
        storyAsset(unit, "robot"),
        storyAsset(unit, "table")
      ]
    );
  }

  function bookReviewPages(unit, day) {
    const reviewPairs = reviewWorksheetPairs(unit, day, 24);
    const storySource = day === 2 ? reviewPairs.slice(18, 24) : day === 3 ? reviewPairs.slice(14, 20) : reviewPairs.slice(0, 6);
    const matchingSource = day === 2 ? reviewPairs.slice(8, 12) : day === 3 ? reviewPairs.slice(4, 8) : reviewPairs.slice(3, 7);
    const choiceSource = day === 2 ? reviewPairs.slice(12, 18) : day === 3 ? reviewPairs.slice(8, 14) : reviewPairs.slice(7, 13);
    const chainOffset = day === 2 ? 16 : day === 3 ? 0 : day >= 4 ? 13 : 12;
    const chainSource = day >= 4
      ? reviewPairs.slice(chainOffset, chainOffset + 6)
      : reviewPairs.slice(chainOffset).concat(reviewPairs.slice(0, chainOffset),
        answerQuestionCandidates(unit.bookId, unit.reviewSections || [], day));
    const writingSource = reviewPairs.slice(0, 8);
    const rotatedAnswers = matchingSource.map((item) => item.answer).slice(1).concat(matchingSource[0]?.answer || []);
    const matchingItems = matchingSource.map((item, index) => ({
      left: item.question,
      right: rotatedAnswers[index],
      asset: item.asset,
      expectedAnswer: `${item.question} → ${item.answer}`
    }));
    const questionChoices = choiceSource.map((item) => ({
      prompt: `Answer: ${item.answer}`,
      choices: choicesFor(item.question),
      asset: item.asset,
      expectedAnswer: item.question
    }));
    const answerChoices = choiceSource.map((item) => ({
      prompt: item.question,
      choices: choicesFor(item.answer),
      asset: item.asset,
      expectedAnswer: item.answer
    }));
    const skill = "cumulative connected review";
    const standard = (type, title, instruction, items) => progressivePage(type, title, instruction, skill, items);
    const locked = (type, title, instruction, items, showPictures = false) => progressivePage(
      type, title, instruction, skill, items,
      { layout: "locked_template", showPictures }
    );

    if (day === 1) return [
      reviewFocusPage(unit, day),
      standard("matching", "Review Matching", "Match each question to the answer that keeps the conversation correct.", matchingItems),
      standard("multiple_choice", "Review Choice Check", "Circle the correct complete answer.", answerChoices),
      unit.bookId === "book-2" && activeReviewRange(unit, day) === "1–3"
        ? book2Review13ContextPage(unit)
        : connectedChainPage(chainSource, day)
    ];

    if (day === 2) return [
      locked("template_picture_question", "Review: Make the Question", "Read each answer and write its question.", writingSource.map((item) => ({ prompt: `Answer: ${item.answer}`, asset: item.asset, expectedAnswer: item.question })), true),
      standard("matching", "Review Question Match", "Match each question to its complete answer.", matchingItems),
      standard("multiple_choice", "Choose the Review Question", "Circle the question that matches the answer.", questionChoices),
      reviewFocusPage(unit, day)
    ];

    if (day === 3) return [
      connectedChainPage(chainSource, day),
      standard("matching", "Mixed Review Dialogue", "Match questions and answers to complete the dialogue.", matchingItems),
      standard("multiple_choice", "Mixed Grammar Check", "Circle the only correct complete question.", questionChoices),
      reviewFocusPage(unit, day)
    ];

    if (day === 5) return [
      reviewFocusPage(unit, day),
      standard("matching", "Final Question and Answer Match", "Match every question to its complete answer.", matchingItems),
      standard("multiple_choice", "Final Mixed Check", "Circle the correct complete answer.", answerChoices),
      connectedChainPage(reviewPairs.slice(13, 19), day)
    ];

    return [
      reviewFocusPage(unit, day),
      standard("matching", "Cumulative Dialogue", "Match each question to the best complete answer.", matchingItems),
      standard("multiple_choice", "Final Cumulative Check", "Circle the only correct question.", questionChoices),
      connectedChainPage(chainSource, day)
    ];
  }

  function applyRepresentativeQuestionTypes(bookId, unitId, day, pages) {
    if (bookId === "book-1" && unitId === "unit-1" && day === 2) {
      pages[2] = {
        type: "which_sentence_not_fit",
        layout: "locked_template",
        title: "Which Sentence Does Not Fit?",
        instruction: "Read the situation. Choose the sentence that does not belong.",
        skill: "am / is / are · identity and context",
        items: [
          {
            situationLines: ["Ludi: “Hello. I am Ludi.”", "Ludi: “I am a boy and a student.”"],
            choices: ["I am Ludi.", "I am a student.", "I am a teacher."],
            expectedAnswer: "I am a teacher."
          },
          {
            situationLines: ["Lumi: “Hello. I am Lumi.”", "Lumi: “I am a girl and a student.”"],
            choices: ["I am Lumi.", "I am a girl.", "I am a man."],
            expectedAnswer: "I am a man."
          },
          {
            situationLines: ["Ms. Wang: “Hello. I am Ms. Wang.”", "Ms. Wang: “I am a woman and a teacher.”"],
            choices: ["I am Ms. Wang.", "I am a teacher.", "I am a boy."],
            expectedAnswer: "I am a boy."
          }
        ]
      };
    }

    if (bookId === "book-1" && unitId === "unit-3" && day === 2) {
      pages[2] = {
        type: "complete_information",
        layout: "locked_template",
        title: "Complete the Information",
        instruction: "Read the conversation. Complete the missing information on the card.",
        skill: "age questions · reading for details",
        dialogueLines: [
          "Ludi: Hello. I am Ludi. What is your name?",
          "Lumi: I am Lumi.",
          "Ludi: How old are you, Lumi?",
          "Lumi: I am eight years old. How old are you?",
          "Ludi: I am nine years old."
        ],
        cards: [
          { title: "Student 1", fields: [{ label: "Name", value: "Lumi" }, { label: "Age", value: "eight" }] },
          { title: "Student 2", fields: [{ label: "Name", value: "Ludi" }, { label: "Age", value: "nine" }] }
        ],
        items: [
          { prompt: "Student 1 — Name", expectedAnswer: "Lumi" },
          { prompt: "Student 1 — Age", expectedAnswer: "eight" },
          { prompt: "Student 2 — Name", expectedAnswer: "Ludi" },
          { prompt: "Student 2 — Age", expectedAnswer: "nine" }
        ]
      };
    }

    const dialogueOrder = window.UNIT_PACKS?.[`${bookId}/${unitId}`]?.dialogueOrder;
    if (dialogueOrder?.length && day === 2) {
      pages[2] = {
        type: "put_dialogue_in_order",
        layout: "locked_template",
        title: "Put the Dialogue in Order",
        instruction: "Put the sentences in the correct order to make a complete conversation.",
        skill: "color questions · dialogue sequence",
        orderOnly: true,
        items: dialogueOrder.map((item) => ({ ...item, lines: [...item.lines] }))
      };
    }

    if (bookId === "book-3" && unitId === "unit-2" && day === 2) {
      pages[2] = {
        type: "choose_next_line",
        layout: "locked_template",
        title: "Choose the Next Line",
        instruction: "Read the conversation. Choose the best next line.",
        skill: "do / does · likes and dialogue meaning",
        items: [
          {
            contextLines: ["Lumi: Do you like pizza?", "Ludi: No, I don't. I like hamburgers."],
            choices: ["I like hamburgers, too.", "She likes pizza.", "Does he like tea?"],
            expectedAnswer: "I like hamburgers, too."
          },
          {
            contextLines: ["Ludi: Does Lumi like tea?", "Nova: No, she doesn't. She likes juice."],
            choices: ["I like juice, too.", "Yes, he does.", "They like pizza."],
            expectedAnswer: "I like juice, too."
          },
          {
            contextLines: ["Nova: Does Milo like sandwiches?", "Lumi: Yes, he does."],
            choices: ["He likes sandwiches.", "No, I don't.", "She likes milk."],
            expectedAnswer: "He likes sandwiches."
          },
          {
            contextLines: ["Lumi: Do you like tea?", "Nova: Yes, I do."],
            choices: ["I like tea, too.", "He likes pizza.", "No, she doesn't."],
            expectedAnswer: "I like tea, too."
          },
          {
            contextLines: ["Nova: Does Ludi like milk?", "Lumi: No, he doesn't. He likes juice."],
            choices: ["He likes juice.", "I don't like pizza.", "She likes milk."],
            expectedAnswer: "He likes juice."
          },
          {
            contextLines: ["Ludi: Do Lumi and Nova like pizza?", "Milo: Yes, they do."],
            choices: ["They like pizza.", "He doesn't like tea.", "I like hamburgers."],
            expectedAnswer: "They like pizza."
          }
        ]
      };
    }

    if (bookId === "book-3" && unitId === "unit-5" && day === 3) {
      pages[2] = {
        type: "read_find_mistake",
        layout: "locked_template",
        title: "Read and Find the Mistake",
        instruction: "Read the conversation. Find the sentence with a mistake and rewrite it correctly.",
        skill: "has / have · Who has...?",
        items: [
          {
            dialogueLines: ["Lumi: Who has two long arms?", "Ludi: Milo have two long arms.", "Lumi: Thank you."],
            expectedAnswer: "Milo has two long arms."
          },
          {
            dialogueLines: ["Lumi: Who has one tooth?", "Ludi: Nova has one teeth.", "Lumi: I see Nova."],
            expectedAnswer: "Nova has one tooth."
          },
          {
            dialogueLines: ["Lumi: Who has six ears?", "Ludi: Willa have six ears.", "Lumi: Willa is over there."],
            expectedAnswer: "Willa has six ears."
          }
        ]
      };
    }

    if (bookId === "book-2" && unitId === "unit-1" && day === 4) {
      pages[2] = {
        type: "use_information",
        layout: "locked_template",
        title: "Use the Information",
        instruction: "Read the information. Answer each question with a complete sentence.",
        skill: "There is / There is not · shared classroom information",
        informationTitle: "Mia's Classroom List",
        information: [
          { label: "door", value: "✓" },
          { label: "fan", value: "✓" },
          { label: "television", value: "✓" },
          { label: "telephone", value: "✗" },
          { label: "trash can", value: "✗" }
        ],
        items: [
          { prompt: "Is there a door in Mia's classroom?", expectedAnswer: "Yes, there is." },
          { prompt: "Is there a fan in Mia's classroom?", expectedAnswer: "Yes, there is." },
          { prompt: "Is there a telephone in Mia's classroom?", expectedAnswer: "No, there is not." },
          { prompt: "Is there a trash can in Mia's classroom?", expectedAnswer: "No, there is not." }
        ]
      };
    }

    if (bookId === "book-2" && unitId === "unit-2" && day === 3) {
      pages[2] = {
        type: "change_one_part",
        layout: "locked_template",
        title: "Change One Part",
        instruction: "Change the sentence as directed. Make all necessary changes.",
        skill: "There is / There are · number and plural agreement",
        items: [
          { source: "There is one book.", directive: "Change ‘one book’ to ‘fifteen books.’", expectedAnswer: "There are fifteen books." },
          { source: "There are twelve pens.", directive: "Change ‘twelve pens’ to ‘one pen.’", expectedAnswer: "There is one pen." },
          { source: "Are there thirteen erasers?", directive: "Change ‘thirteen erasers’ to ‘one eraser.’", expectedAnswer: "Is there one eraser?" },
          { source: "Is there one ruler?", directive: "Change ‘one ruler’ to ‘twenty rulers.’", expectedAnswer: "Are there twenty rulers?" }
        ]
      };
    }
  }

  function normalizeQuestionWritingPages(pages) {
    const writingTypes = new Set([
      "write_question",
      "template_picture_question",
      "template_guided_question",
      "template_independent_picture",
      "template_final_output"
    ]);
    pages.forEach((page) => {
      const writesQuestions = writingTypes.has(page.type)
        && page.items.length > 0
        && page.items.every((item) => /\?$/.test(String(item.expectedAnswer || "").trim()));
      if (!writesQuestions) return;
      page.instruction = "Read each answer. Write the matching question.";
      page.items.forEach((item) => {
        item.prompt = String(item.prompt || "").replace(/^Answer:\s*/i, "").trim();
      });
    });
  }

  function removeRepeatedPageItems(pages) {
    pages.forEach((page) => {
      const prompts = new Set();
      const answers = new Set();
      page.items = (page.items || []).filter((item) => {
        const prompt = String(item.prompt || item.left || "").trim().toLowerCase();
        const answer = String(item.expectedAnswer || "").trim().toLowerCase();
        if ((prompt && prompts.has(prompt)) || (answer && answers.has(answer))) return false;
        if (prompt) prompts.add(prompt);
        if (answer) answers.add(answer);
        return true;
      });
      if (page.type === "matching" && page.items.every((item) => String(item.expectedAnswer || "").includes(" → "))) {
        const oppositeSides = page.items.map((item) => {
          const [first, ...rest] = String(item.expectedAnswer).split(" → ");
          const second = rest.join(" → ");
          return String(item.left) === first ? second : first;
        });
        const displayedSides = oppositeSides.slice(1).concat(oppositeSides.slice(0, 1));
        page.items.forEach((item, index) => { item.right = displayedSides[index]; });
      }
    });
  }

  function attach(catalog) {
    (catalog || []).forEach((book) => book.units.forEach((unit) => unit.lessons.forEach((lesson, lessonIndex) => {
      const day = Number(String(lesson.day || lessonIndex + 1).match(/\d+/)?.[0]) || lessonIndex + 1;
      const pages = unit.isReview
        ? bookReviewPages(unit, day)
        : book.id === "book-3" && unit.id === "unit-4"
        ? [book3Unit4Day1Pages, book3Unit4Day2Pages, book3Unit4Day3Pages, book3Unit4Day4Pages][day - 1]()
        : book.id === "book-3" && unit.id === "unit-5"
          ? book3Unit5Pages(unit, day, book)
        : book.id === "book-3" && BOOK3_PROGRESSIVE_PROFILES[unit.id]
          ? book3ProgressivePages(unit, day)
          : standardProgressivePages(unit, day, book.id);
      const teachingUnitIndex = book.units.filter((item) => !item.isReview).findIndex((item) => item.id === unit.id);
      if (!unit.isReview && teachingUnitIndex > 0 && day === 4) {
        pages[3] = cumulativeMixedAnswerPage(book, unit);
      }
      applyRepresentativeQuestionTypes(book.id, unit.id, day, pages);
      removeRepeatedPageItems(pages);
      fillAnswerQuestionReview(pages, book, unit, day);
      normalizeQuestionWritingPages(pages);
      distributeMultipleChoiceAnswers(pages);
      lesson.worksheet = { ...(lesson.worksheet || {}), day, unitTitle: unit.title, pages };
    })));
  }

  window.WorksheetData = { DAY_TYPES, attach, buildPages };
  if (Array.isArray(window.COURSE_CATALOG)) attach(window.COURSE_CATALOG);
})(window);

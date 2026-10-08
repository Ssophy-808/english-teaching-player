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

  function scramble(sentence) {
    const punctuation = sentence.match(/[?.!]$/)?.[0] || "";
    const words = sentence.replace(/[?.!]$/, "").split(/\s+/);
    const pivot = Math.max(1, Math.floor(words.length / 2));
    return [...words.slice(pivot), ...words.slice(0, pivot), punctuation].filter(Boolean).join(" / ");
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
    if (type === "write_question") return qa.slice(0, 4).map((item, index) => ({ asset: assetFor(item.answer, vocabulary, index), prompt: `Answer: ${item.answer}`, expectedAnswer: item.question, lines: 2 }));
    if (type === "write_answer") return qa.slice(0, 4).map((item, index) => ({ asset: assetFor(item.answer, vocabulary, index), subjectCue: item.question, starter: "", expectedAnswer: item.answer, lines: 1 }));
    if (type === "fix_mistakes") return sentenceValues.slice(0, 4).map((sentence, index) => ({ asset: assetFor(sentence, vocabulary, index), prompt: wrongSentence(sentence), expectedAnswer: sentence, lines: 2 }));
    if (type === "unscramble") return sentencePool(unit).slice(0, 4).map((sentence, index) => ({ asset: assetFor(sentence, vocabulary, index), prompt: scramble(sentence), expectedAnswer: sentence, lines: 2 }));
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
    return rule ? text.replace(rule[0], rule[1]) : text.replace(/[?.!]$/, " ?");
  }

  function secondGrammarError(text) {
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
    return text.replace(/[?.!]$/, "");
  }

  function choicesFor(correct) {
    const shortAnswer = correct.match(/^(Yes|No),\s+(I|you|he|she|we|they)\s+(do|does|don't|doesn't)\.$/i);
    if (shortAnswer) {
      const [, yesNo, subject, helper] = shortAnswer;
      const wrongHelper = /does/i.test(helper) ? (helper.includes("n't") ? "don't" : "do") : (helper.includes("n't") ? "doesn't" : "does");
      return [correct, `${yesNo}, ${subject} ${wrongHelper}.`, `${yesNo}, ${subject} not.`];
    }
    const values = [correct, grammarError(correct), secondGrammarError(correct)];
    const unique = [...new Set(values)];
    if (unique.length < 3) unique.push(correct.replace(/[?.!]$/, "s."));
    return unique.slice(0, 3);
  }

  function rotateAnswers(pairsToMatch) {
    const answers = pairsToMatch.map((pair) => pair.answer);
    return answers.slice(1).concat(answers[0]);
  }

  function progressivePage(type, title, instruction, skill, items, options = {}) {
    return { type, title, instruction, skill, items, ...options };
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
      locked("template_question_order", "Build the Question", "Put the words in order. Write the complete question.", pairsForDay.map((pair) => ({ prompt: scramble(pair.question), asset: pair.asset, expectedAnswer: pair.question })))
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

  function unitPairForVocabulary(bookId, unitId, asset, index, day) {
    const key = `${bookId}/${unitId}`;
    const word = worksheetWord(asset) || "picture";
    const plural = worksheetPlural(asset);
    const article = reviewArticle(word);
    const slot = (index + day - 1) % 4;
    const pick = (values) => ({ question: values[slot][0], answer: values[slot][1] });

    if (key === "book-1/unit-1") return pick([
      ["Who are you?", `I am ${article} ${word}.`], [`Are you ${article} ${word}?`, `Yes, I am. I am ${article} ${word}.`],
      ["Who am I?", `You are ${article} ${word}.`], [`Am I ${article} ${word}?`, `Yes, you are. You are ${article} ${word}.`]
    ]);
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
    if (key === "book-1/unit-4") return pick([
      [`Are you ${word}?`, `Yes, I am. I am ${word}.`], [`Is she ${word}?`, `Yes, she is. She is ${word}.`],
      [`Is he ${word}?`, `Yes, he is. He is ${word}.`], [`Are you ${word}?`, `Yes, I am. I am ${word}.`]
    ]);
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

    if (key === "book-2/unit-1") return { question: `Is there ${article} ${word}?`, answer: `Yes, there is. There is ${article} ${word}.` };
    if (key === "book-2/unit-2") return { question: `Are there ${word} books?`, answer: `Yes, there are. There are ${word} books.` };
    if (key === "book-2/unit-3") {
      const count = ((index + day) % 9) + 2;
      return { question: `How many ${plural} are there?`, answer: `There are ${count} ${plural}.` };
    }
    if (key === "book-2/unit-4") {
      const near = slot % 2 === 0;
      return { question: `What are ${near ? "these" : "those"}?`, answer: `${near ? "These" : "Those"} are ${plural}.` };
    }
    if (key === "book-2/unit-5") {
      const near = slot % 2 === 0;
      return { question: `Are ${near ? "these" : "those"} ${plural}?`, answer: `Yes, they are. They are ${plural}.` };
    }
    if (key === "book-2/unit-6") return { question: `Can you ${word}?`, answer: `Yes, I can. I can ${word}.` };
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
      return { question: `Do you have ${description}?`, answer: `Yes, I do. I have ${description}.` };
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
    return Array.from({ length: 8 }, (_, index) => {
      const asset = vocabulary[(index + offset) % Math.max(vocabulary.length, 1)] || {};
      const pair = unitPairForVocabulary(bookId, unit.id, asset, index + offset, day)
        || reviewPairForVocabulary(sourceUnit, unit, asset, index + offset);
      return {
        ...pair,
        asset,
        cue: `Answer: ${pair.answer}`
      };
    });
  }

  function standardProgressivePages(unit, day, bookId) {
    const pairsForDay = standardProgressivePairs(unit, day, bookId);
    const matchPairs = pairsForDay.slice(0, 4);
    const rotated = rotateAnswers(matchPairs);
    const skill = unit.grammarFocus || unit.topic || unit.title;
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
      locked("template_fix_mistakes", "Fix the Mistakes", "Find the mistake. Rewrite the whole sentence correctly.", pairsForDay.map((pair) => ({ prompt: grammarError(pair.answer), asset: pair.asset, expectedAnswer: pair.answer })))
    ];

    if (day === 2) return [
      locked("template_picture_question", "Make the Question", "Look at the picture and answer cue. Write the matching question.", pairsForDay.map((pair) => ({ prompt: `Answer: ${pair.answer}`, asset: pair.asset, expectedAnswer: pair.question })), true),
      page("matching", "Match Questions and Answers", "Draw a line from each answer to its matching question.", matchingItems),
      page("multiple_choice", "Choose the Question", "Read the answer. Circle the question that matches.", questionChoices),
      locked("template_question_order", "Build the Question", "Put the words in order. Write the complete question.", pairsForDay.map((pair) => ({ prompt: scramble(pair.question), asset: pair.asset, expectedAnswer: pair.question })))
    ];

    if (day === 3) return [
      locked("template_guided_question", "Write Your Question", "Read the answer. Look at the picture and write its question.", pairsForDay.map((pair) => ({ prompt: `Answer: ${pair.answer}`, asset: pair.asset, expectedAnswer: pair.question })), true),
      page("matching", "Match the Dialogue", "Match each question to the best complete answer.", matchingItems),
      page("multiple_choice", "Choose the Question", "Circle the only correct complete question.", questionChoices),
      locked("template_mixed_correction", "Fix the Questions", "Find the mistake. Rewrite each question correctly.", pairsForDay.map((pair) => ({ prompt: grammarError(pair.question), asset: pair.asset, expectedAnswer: pair.question })))
    ];

    return [
      locked("template_independent_picture", "Picture Question Challenge", "Read the answer. Look at the picture and write its question.", pairsForDay.map((pair) => ({ prompt: `Answer: ${pair.answer}`, asset: pair.asset, expectedAnswer: pair.question })), true),
      page("matching", "Complete the Dialogue", "Match each question to the best complete answer.", matchingItems),
      page("multiple_choice", "Final Grammar Check", "Circle the only correct question.", questionChoices),
      locked("template_final_output", "Question Writing Review", "Read each answer and write its question.", pairsForDay.map((pair) => ({ prompt: `Answer: ${pair.answer}`, asset: pair.asset, expectedAnswer: pair.question })))
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
      return { prompt: pair.question, asset, expectedAnswer: pair.answer };
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
    const preferred = String(item.asset?.word || "").replace(/\(s\)|\(es\)/gi, "").trim();
    const escaped = preferred.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const preferredMatch = preferred && answer.match(new RegExp(`\\b${escaped}`, "i"));
    const stopWords = new Set(["a", "an", "am", "are", "at", "can", "do", "does", "he", "her", "his", "i", "in", "is", "it", "my", "no", "not", "on", "she", "the", "they", "to", "we", "yes", "you", "your"]);
    const words = answer.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [];
    const candidates = words.filter((word) => !stopWords.has(word.toLowerCase()));
    const missing = preferredMatch?.[0] || candidates[index % Math.max(candidates.length, 1)] || words.at(-1) || "word";
    const prompt = answer.replace(new RegExp(`\\b${missing.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), "________");
    return { question: item.question, prompt, asset: item.asset, missing, expectedAnswer: `${missing} — ${answer}` };
  }

  function connectedClozePage(reviewPairs, day) {
    const items = reviewPairs.slice(0, 3).map(clozeItem);
    return {
      type: "story_cloze",
      layout: "locked_template",
      title: day >= 4 ? (day === 5 ? "Final Review Story" : "Lumi and Ludi's Review Story") : "A Connected Review Story",
      instruction: day === 1
        ? "Read the story. Look at the pictures and answer each question in a complete sentence."
        : "Follow the whole story. Answer every question, then read the passage aloud.",
      skill: "connected reading and complete answers",
      introLines: day >= 4
        ? ["Hi, I'm Lumi.", "Today is the final review challenge.", "Look at the pictures and answer the questions."]
        : ["Hi, I'm Lumi.", "Today is review day.", "Look at the pictures and answer the questions."],
      endingLines: ["Check every complete sentence.", "Great job today!"],
      heroAssets: items.slice(0, 3).map((item) => item.asset),
      wordBank: [...new Set(items.map((item) => item.missing))],
      items
    };
  }

  function connectedChainPage(reviewPairs, day) {
    const items = reviewPairs.slice(0, day >= 4 ? 6 : 4).map((item, index) => ({
      prompt: item.question,
      lead: index === 0 ? "Start the conversation." : "Use the last answer and continue.",
      asset: item.asset,
      expectedAnswer: item.answer
    }));
    return {
      type: "chain_questions",
      layout: "locked_template",
      title: day >= 4 ? (day === 5 ? "Final Question and Answer Challenge" : "Independent Chain Challenge") : "Follow the Question Chain",
      instruction: day >= 4
        ? "Answer in complete sentences. Then write one new question that keeps the conversation going."
        : "Read from top to bottom. Each answer helps the conversation continue.",
      skill: "connected questions and complete answers",
      intro: "Lumi asks the first question. Ludi answers, then they keep the same conversation going.",
      items
    };
  }

  function bookReviewPages(unit, day) {
    const reviewPairs = reviewWorksheetPairs(unit, day, 24);
    const storySource = day === 2 ? reviewPairs.slice(18, 21) : day === 3 ? reviewPairs.slice(14, 17) : reviewPairs.slice(0, 3);
    const matchingSource = day === 2 ? reviewPairs.slice(8, 12) : day === 3 ? reviewPairs.slice(4, 8) : reviewPairs.slice(3, 7);
    const choiceSource = day === 2 ? reviewPairs.slice(12, 18) : day === 3 ? reviewPairs.slice(8, 14) : reviewPairs.slice(7, 13);
    const chainSource = day === 2 ? reviewPairs.slice(18, 22) : day === 3 ? reviewPairs.slice(0, 4) : reviewPairs.slice(13, 19);
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
      connectedClozePage(storySource, day),
      standard("matching", "Review Matching", "Match each question to the answer that keeps the conversation correct.", matchingItems),
      standard("multiple_choice", "Review Choice Check", "Circle the correct complete answer.", answerChoices),
      connectedChainPage(chainSource, day)
    ];

    if (day === 2) return [
      locked("template_picture_question", "Review: Make the Question", "Read each answer and write its question.", writingSource.map((item) => ({ prompt: `Answer: ${item.answer}`, asset: item.asset, expectedAnswer: item.question })), true),
      standard("matching", "Review Question Match", "Match each question to its complete answer.", matchingItems),
      standard("multiple_choice", "Choose the Review Question", "Circle the question that matches the answer.", questionChoices),
      connectedClozePage(storySource, day)
    ];

    if (day === 3) return [
      connectedChainPage(chainSource, day),
      standard("matching", "Mixed Review Dialogue", "Match questions and answers to complete the dialogue.", matchingItems),
      standard("multiple_choice", "Mixed Grammar Check", "Circle the only correct complete question.", questionChoices),
      connectedClozePage(storySource, day)
    ];

    if (day === 5) return [
      connectedClozePage(reviewPairs.slice(0, 3), day),
      standard("matching", "Final Question and Answer Match", "Match every question to its complete answer.", matchingItems),
      standard("multiple_choice", "Final Mixed Check", "Circle the correct complete answer.", answerChoices),
      connectedChainPage(reviewPairs.slice(13, 19), day)
    ];

    return [
      connectedClozePage(storySource, day),
      standard("matching", "Cumulative Dialogue", "Match each question to the best complete answer.", matchingItems),
      standard("multiple_choice", "Final Cumulative Check", "Circle the only correct question.", questionChoices),
      connectedChainPage(chainSource, day)
    ];
  }

  function attach(catalog) {
    (catalog || []).forEach((book) => book.units.forEach((unit) => unit.lessons.forEach((lesson, lessonIndex) => {
      const day = Number(String(lesson.day || lessonIndex + 1).match(/\d+/)?.[0]) || lessonIndex + 1;
      const pages = unit.isReview
        ? bookReviewPages(unit, day)
        : book.id === "book-3" && unit.id === "unit-4"
        ? [book3Unit4Day1Pages, book3Unit4Day2Pages, book3Unit4Day3Pages, book3Unit4Day4Pages][day - 1]()
        : book.id === "book-3" && BOOK3_PROGRESSIVE_PROFILES[unit.id]
          ? book3ProgressivePages(unit, day)
          : standardProgressivePages(unit, day, book.id);
      const teachingUnitIndex = book.units.filter((item) => !item.isReview).findIndex((item) => item.id === unit.id);
      if (!unit.isReview && teachingUnitIndex > 0 && day === 4) {
        pages[3] = cumulativeMixedAnswerPage(book, unit);
      }
      lesson.worksheet = { ...(lesson.worksheet || {}), day, unitTitle: unit.title, pages };
    })));
  }

  window.WorksheetData = { DAY_TYPES, attach, buildPages };
  if (Array.isArray(window.COURSE_CATALOG)) attach(window.COURSE_CATALOG);
})(window);

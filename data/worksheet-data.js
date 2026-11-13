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
        { prompt: `Put the question in order: ${scramble(pair.question)}`, expectedAnswer: pair.question },
        { prompt: `Fix the question: ${secondGrammarError(pair.question)}`, expectedAnswer: pair.question },
        { prompt: `Put the answer in order: ${scramble(firstAnswer)}`, expectedAnswer: firstAnswer }
      ];
      return { ...modes[index % modes.length], asset: pair.asset };
    });
    if (!isFruitQuestionUnit(bookId, unitId)) return mixed;
    const seventh = pairsForDay[6];
    const eighth = pairsForDay[7];
    mixed[6] = { prompt: `Change to plural: ${worksheetWord(seventh.asset)} → __________`, asset: seventh.asset, expectedAnswer: worksheetPlural(seventh.asset) };
    mixed[7] = { prompt: `Change to singular: ${worksheetPlural(eighth.asset)} → __________`, asset: eighth.asset, expectedAnswer: worksheetWord(eighth.asset) };
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

  function unitReadingPage(unit, bookId, pairsForDay) {
    if (bookId === "book-2" && unit.id === "unit-1") {
      return {
        type: "reading_comprehension",
        layout: "locked_template",
        title: "Read About Mia's Classroom",
        instruction: "Read the whole passage. Answer each question in a complete sentence.",
        skill: "reading for details and making an inference",
        passageLines: [
          "This is Mia's classroom.",
          "There is a door next to the whiteboard, and there is a television in front of the tables.",
          "It is hot today, but the classroom is cool because there is a fan.",
          "Mia wants to call her mom, but there is not a telephone in the classroom.",
          "She can watch a video, but she cannot make a phone call."
        ],
        heroAssets: [pairsForDay.find((pair) => worksheetWord(pair.asset) === "television")?.asset || pairsForDay[0].asset],
        items: [
          { prompt: "What is next to the whiteboard?", expectedAnswer: "There is a door next to the whiteboard." },
          { prompt: "Is there a telephone in Mia's classroom?", expectedAnswer: "No, there is not." },
          { prompt: "Why is the classroom cool?", expectedAnswer: "It is cool because there is a fan." },
          { prompt: "What can Mia use to watch a video?", expectedAnswer: "She can use the television." }
        ]
      };
    }
    const first = pairsForDay[0];
    const second = pairsForDay[1];
    return {
      type: "reading_comprehension",
      layout: "locked_template",
      title: "Read the Classroom Conversation",
      instruction: "Read the connected conversation. Answer in complete sentences.",
      skill: "reading for details and dialogue meaning",
      passageLines: [
        "Lumi and Ludi are talking in class.",
        `Lumi asks, “${first.question}”`,
        `Ludi answers, “${first.answer}”`,
        `Then Lumi asks, “${second.question}”`,
        `Ludi answers, “${second.answer}”`
      ],
      heroAssets: [first.asset],
      items: [
        { prompt: "Who asks the questions?", expectedAnswer: "Lumi asks the questions." },
        { prompt: "What is Lumi's first question?", expectedAnswer: first.question },
        { prompt: "What is Ludi's second answer?", expectedAnswer: second.answer },
        { prompt: "Are Lumi and Ludi talking about the same lesson?", expectedAnswer: "Yes, they are." }
      ]
    };
  }

  function questionChainPage(pairsForDay) {
    return {
      type: "chain_questions",
      layout: "locked_template",
      title: "Keep the Conversation Going",
      instruction: "Answer from top to bottom. Use each answer to continue the same conversation.",
      skill: "connected questions and complete answers",
      intro: "Lumi and Ludi are talking about the lesson. Keep their conversation going.",
      items: pairsForDay.slice(0, 4).map((pair, index) => ({
        prompt: pair.question,
        lead: index === 0 ? "Lumi starts." : "Continue the conversation.",
        asset: pair.asset,
        expectedAnswer: pair.answer
      }))
    };
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
      unit.grammarFocus || unit.topic || unit.title,
      pairsForDay.map((pair) => ({
        prompt: `Lumi asks, “${pair.question}” What should Ludi say?`,
        asset: pair.asset,
        expectedAnswer: pair.answer
      })),
      { layout: "locked_template" }
    );
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
      locked(
        "template_fix_mistakes",
        "Mixed Language Practice",
        "Follow each direction. Fix mistakes, reorder words, or change the word form.",
        mixedCorrectionItems(pairsForDay, bookId, unit.id)
      )
    ];

    if (day === 2) return [
      unitReadingPage(unit, bookId, pairsForDay),
      locked("template_picture_question", "Make the Question", "Look at the picture and write the matching question.", pairsForDay.map((pair) => ({ prompt: pictureQuestionPrompt(pair, bookId, unit.id), asset: pair.asset, expectedAnswer: pictureQuestionAnswer(pair, bookId, unit.id) })), true),
      locked("template_dialogue_completion", "Complete the Dialogue", "Read each question. Write the missing complete answer.", pairsForDay.map((pair) => ({ prompt: `A: ${pair.question}  B: ____________________`, asset: pair.asset, expectedAnswer: pair.answer }))),
      locked("template_question_order", "Build the Question", "Put the words in order. Write the complete question.", pairsForDay.map((pair) => ({ prompt: scramble(pair.question), asset: pair.asset, expectedAnswer: pair.question })))
    ];

    if (day === 3) return [
      locked("template_guided_question", "Write Your Question", "Look at the picture. Write a What question or a Yes/No question.", pairsForDay.map((pair) => ({ prompt: pictureQuestionPrompt(pair, bookId, unit.id), asset: pair.asset, expectedAnswer: pictureQuestionAnswer(pair, bookId, unit.id) })), true),
      locked("template_sentence_completion", "Complete the Sentence", "Use the context to fill in the missing grammar word. Rewrite the complete sentence.", pairsForDay.map((pair, index) => ({ prompt: grammarBlank(pair.answer, index), asset: pair.asset, expectedAnswer: pair.answer }))),
      locked("template_mixed_correction", "Fix the Questions", "Find the mistake. Rewrite each question correctly.", pairsForDay.map((pair) => ({ prompt: secondGrammarError(pair.question), asset: pair.asset, expectedAnswer: pair.question }))),
      locked("template_answer_order", "Build the Answer", "Put the words in order. Write the complete answer.", pairsForDay.map((pair) => ({ prompt: scramble(pair.answer), asset: pair.asset, expectedAnswer: pair.answer })))
    ];

    return [
      locked("template_independent_picture", "Picture Question Challenge", "Look at the picture. Write a What question or a Yes/No question.", pairsForDay.map((pair) => ({ prompt: pictureQuestionPrompt(pair, bookId, unit.id), asset: pair.asset, expectedAnswer: pictureQuestionAnswer(pair, bookId, unit.id) })), true),
      questionChainPage(pairsForDay),
      unitApplicationPage(unit, bookId, pairsForDay),
      locked("template_independent_sentence", "Picture Sentence Writing", "Look at each picture. Use the cue word to write one complete sentence.", pairsForDay.map((pair) => ({ prompt: `Use “${worksheetWord(pair.asset)}” in one complete sentence.`, asset: pair.asset, expectedAnswer: pair.answer })), true)
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

  function clozeStory(title, heroWord, passageLines, answers) {
    return { title, heroWord, passageLines, answers };
  }

  function storyChoice(options, day) {
    return options[(Math.max(1, day) - 1) % options.length];
  }

  const REVIEW_CLOZE_BUILDERS = {
    "book-1:1–3": (day) => {
      const c = storyChoice([
        { relative: "mother", relation: "She is Lumi's father's wife.", person: "student", personClue: "This child goes to school every day.", age: "six", number: 6 },
        { relative: "father", relation: "He is Lumi's mother's husband.", person: "teacher", personClue: "This woman teaches children at school.", age: "eight", number: 8 },
        { relative: "grandmother", relation: "She is Lumi's mother's mother.", person: "girl", personClue: "This child is Lumi. She is not a boy.", age: "seven", number: 7 },
        { relative: "grandfather", relation: "He is Lumi's father's father.", person: "boy", personClue: "This child is Ludi. He is not a girl.", age: "nine", number: 9 }
      ], day);
      return clozeStory("A Family Birthday Dinner", c.relative, [
        "Today Lumi's family has a birthday dinner.",
        `${c.relation} The person beside Lumi is her ________.`,
        `${c.personClue} The guest is a ________.`,
        `The cake has ${c.number} candles, so the birthday child is ________ years old.`,
        "Everyone ________ and talks together.",
        "It is a happy family night."
      ], [c.relative, c.person, c.age, "eats"]);
    },
    "book-1:4–6": (day) => {
      const c = storyChoice([
        { item: "pencil", itemClue: "Lumi wants to write her name, so she takes out a", color: "red", colorClue: "an apple", feeling: "happy", feelingClue: "She smiles when her work is done" },
        { item: "eraser", itemClue: "Lumi makes a pencil mistake, so she uses an", color: "blue", colorClue: "the sky", feeling: "sad", feelingClue: "She cannot find her book, and her face goes down" },
        { item: "ruler", itemClue: "Lumi wants to measure her book, so she uses a", color: "green", colorClue: "the grass", feeling: "happy", feelingClue: "Her friend finds the book, so Lumi smiles" },
        { item: "book", itemClue: "Lumi wants to read a story, so she opens her", color: "yellow", colorClue: "the sun", feeling: "sad", feelingClue: "The story ends, and Lumi does not want it to stop" }
      ], day);
      return clozeStory("Lumi's Classroom Morning", "school bag", [
        "Lumi gets ready for class in the morning.",
        `${c.itemClue} ________.`,
        `Her school bag is ________. It is the same color as ${c.colorClue}.`,
        "She ________ her things on the desk and starts her work.",
        `${c.feelingClue}. She is ________.`,
        "Her teacher comes over to help her.",
        "Lumi is ready to learn again."
      ], [c.item, c.color, "puts", c.feeling]);
    },
    "book-1:7–9": (day) => {
      const c = storyChoice([
        { clothes: "hat", clothesClue: "It goes on his head and keeps the sun away", animal: "rabbit", animalClue: "It has long ears and hops", state: "hungry", stateClue: "His stomach is empty, and he wants lunch" },
        { clothes: "cap", clothesClue: "It is a small hat with a front", animal: "dog", animalClue: "It barks and wags its tail", state: "thirsty", stateClue: "He wants a big glass of water" },
        { clothes: "coat", clothesClue: "It is long and covers his shirt and arms", animal: "cow", animalClue: "It is big and gives milk", state: "sleepy", stateClue: "He closes his eyes and wants to sleep" },
        { clothes: "jacket", clothesClue: "It is a short coat over his shirt", animal: "duck", animalClue: "It has a bill and swims", state: "tired", stateClue: "He walks all day and needs to sit down" }
      ], day);
      return clozeStory("A Day at the Farm", c.animal, [
        "Lumi and Ludi visit a farm with their family.",
        `${c.clothesClue}, so Ludi wears a ________.`,
        "They ________ to a small animal house.",
        `${c.animalClue}, so the animal is a ________.`,
        "Ludi watches the animal for a long time.",
        `${c.stateClue}. He is ________.`,
        "The family takes a break before going home."
      ], [c.clothes, "walk", c.animal, c.state]);
    },
    "book-2:1–3": (day) => {
      const c = storyChoice([
        { roomItem: "whiteboard", roomClue: "The teacher writes the first clue on it at the front of the room", toy: "blocks", toyClue: "small pieces for building a tower", count: "fifteen", number: 15 },
        { roomItem: "television", roomClue: "The class watches a short video on it", toy: "robots", toyClue: "toy machines that can move", count: "twelve", number: 12 },
        { roomItem: "fan", roomClue: "It moves the air and keeps the room cool", toy: "balls", toyClue: "round toys that can roll", count: "eighteen", number: 18 },
        { roomItem: "window", roomClue: "The children look through it to see outside", toy: "dolls", toyClue: "small toy people", count: "eleven", number: 11 }
      ], day);
      return clozeStory("The Classroom Toy Game", c.toy, [
        "The class ________ a counting game today.",
        `${c.roomClue}. It is the ________.`,
        "Next, the teacher puts a box of toys on the table.",
        `There are ${c.number} toys, so the children write ________.`,
        `The toys are ${c.toyClue}. They are ________.`,
        "Lumi and Ludi count them one more time.",
        "Their team gets the answer right."
      ], ["plays", c.roomItem, c.count, c.toy]);
    },
    "book-2:4–6": (day) => {
      const c = storyChoice([
        { fruit1: "bananas", clue1: "yellow and long", fruit2: "strawberries", clue2: "small and red", action: "sing", actionClue: "uses her voice for a song" },
        { fruit1: "watermelons", clue1: "big, green outside, and red inside", fruit2: "kiwis", clue2: "brown outside and green inside", action: "dance", actionClue: "moves her body with the music" },
        { fruit1: "lemons", clue1: "yellow and sour", fruit2: "mangoes", clue2: "sweet with orange-yellow skin", action: "read", actionClue: "looks at the fruit card and says the words" },
        { fruit1: "pears", clue1: "green and smaller at the top", fruit2: "papayas", clue2: "long with orange fruit inside", action: "write", actionClue: "makes the fruit names on a poster" }
      ], day);
      return clozeStory("Fruit Day at School", c.fruit1, [
        "Today is Fruit Day in Lumi's classroom.",
        `The first fruit is ${c.clue1}. These are ________.`,
        "Ludi ________ another plate next to it.",
        `Those fruits are ${c.clue2}. They are ________.`,
        "The class talks about the colors and tastes.",
        `After the fruit show, Lumi ${c.actionClue}. She can ________.`,
        "Everyone claps for her."
      ], [c.fruit1, "puts", c.fruit2, c.action]);
    },
    "book-2:7–9": (day) => {
      const c = storyChoice([
        { room: "garden", roomClue: "the place outside where flowers grow", place: "behind", placeClue: "The tree is in front of the card", animal: "tiger", animalClue: "an animal with black stripes" },
        { room: "living room", roomClue: "the room where the family sits and watches TV", place: "next to", placeClue: "The card is beside the sofa", animal: "lion", animalClue: "a big animal with a mane" },
        { room: "kitchen", roomClue: "the room where the family cooks", place: "under", placeClue: "Lumi must look below a chair", animal: "zebra", animalClue: "a black-and-white animal with stripes" },
        { room: "bedroom", roomClue: "the room where Ludi sleeps", place: "in front of", placeClue: "The card is before the bed, not behind it", animal: "monkey", animalClue: "an animal that climbs and has a long tail" }
      ], day);
      return clozeStory("The Animal Card Hunt", c.animal, [
        "Lumi and Ludi ________ an animal-card hunt at home.",
        `They go to ${c.roomClue}. They are in the ________.`,
        `${c.placeClue}. The card is ________ it.`,
        "Lumi finds the card and turns it over.",
        `It shows ${c.animalClue}. It is a ________.`,
        "Lumi says she likes this animal.",
        "Now it is Ludi's turn to hide a card."
      ], ["play", c.room, c.place, c.animal]);
    },
    "book-3:1–3": (day) => {
      const c = storyChoice([
        { pet: "hamsters", petClue: "small pets that run on a wheel", food: "chicken nuggets", foodClue: "small pieces of chicken", hero: "hamsters" },
        { pet: "bunnies", petClue: "small pets with long ears that hop", food: "pizza", foodClue: "a round lunch with cheese", hero: "bunnies" },
        { pet: "turtles", petClue: "quiet pets with hard shells", food: "salad", foodClue: "a bowl of vegetables", hero: "turtles" },
        { pet: "birds", petClue: "pets with wings that can sing", food: "hot dogs", foodClue: "long bread with meat inside", hero: "birds" }
      ], day);
      return clozeStory("Lumi's Pet Day", c.hero, [
        "Lumi has two small pets at home.",
        `They are ${c.petClue}, so they are ________.`,
        "Today ________ Pet Day at school, and Lumi brings them to class.",
        "Her friend Ludi thinks the pets are very cute.",
        `At lunch, they share ${c.foodClue}. They eat ________.`,
        `Ludi asks, “Do you like ${c.food}?” Lumi says, “Yes, I ________.”`,
        "They have a fun day at school."
      ], [c.pet, "is", c.food, "do"]);
    },
    "book-3:4–6": (day) => {
      const c = storyChoice([
        { gift: "bicycle", giftClue: "a new gift with two wheels", body: "eyes", bodySentence: "He looks at the gift with his two ________.", hair: "curly", hairClue: "makes soft circles", hero: "bicycle" },
        { gift: "computer", giftClue: "a new gift with a screen and keyboard", body: "ears", bodySentence: "He hears the birthday song with his two ________.", hair: "long", hairClue: "reaches past her shoulders", hero: "computer" },
        { gift: "kite", giftClue: "a new gift that can fly in the sky", body: "nose", bodySentence: "He smells the birthday cake with his ________.", hair: "braided", hairClue: "has two neat braids", hero: "kite" },
        { gift: "model car", giftClue: "a small toy car for his desk", body: "mouth", bodySentence: "He opens his ________ to smile for the picture.", hair: "short", hairClue: "does not reach his ears", hero: "model car" }
      ], day);
      return clozeStory("Ludi's Birthday Photo", c.hero, [
        "Today ________ Ludi's birthday, and his family has a party.",
        `Ludi wants ${c.giftClue}. He wants a ________.`,
        "He opens the gift and smiles.",
        c.bodySentence,
        "Lumi helps everyone get ready for a photo.",
        `Her hair ${c.hairClue}, so it is ________.`,
        "The family takes a happy birthday picture."
      ], ["is", c.gift, c.body, c.hair]);
    },
    "book-3:7–9": (day) => {
      const c = storyChoice([
        { day: "Saturday", dayClue: "the day after Friday", weather: "sunny", weatherClue: "There are no clouds, and the sun is bright", sport: "baseball", sportClue: "Ludi hits a ball with a bat", activity: "go swimming", activityClue: "they cool down in the pool", hero: "baseball" },
        { day: "Sunday", dayClue: "the day after Saturday", weather: "windy", weatherClue: "The trees move from side to side", sport: "soccer", sportClue: "They kick a ball toward a goal", activity: "fly a kite", activityClue: "the strong wind lifts it into the sky", hero: "soccer" },
        { day: "Monday", dayClue: "the day after Sunday", weather: "rainy", weatherClue: "Rain falls, and everyone has an umbrella", sport: "ping-pong", sportClue: "They hit a small ball across a table", activity: "watch TV", activityClue: "they stay inside and look at a show", hero: "ping-pong" },
        { day: "Friday", dayClue: "the day before Saturday", weather: "cloudy", weatherClue: "The sky is gray, but there is no rain", sport: "badminton", sportClue: "They hit a small shuttle over a net", activity: "listen to music", activityClue: "they sit down and enjoy songs", hero: "badminton" }
      ], day);
      return clozeStory("Lumi and Ludi's Weekend Plan", c.hero, [
        `Today is ${c.dayClue}. It is ________.`,
        `${c.weatherClue}. The weather is ________.`,
        "Lumi and Ludi ________ at the park.",
        `${c.sportClue}, so they play ________.`,
        "They have fun together for an hour.",
        `After that, ${c.activityClue}. They ________.`,
        "It is a great day for both friends."
      ], [c.day, c.weather, "meet", c.sport, c.activity]);
    }
  };

  function storyAsset(unit, word) {
    const wanted = String(word || "").toLowerCase();
    const assets = unit.vocabulary || [];
    return assets.find((asset) => {
      const terms = reviewVocabularyTerms(asset).flatMap((term) => [term, pluralReviewWord(term)]);
      return terms.some((term) => term.toLowerCase() === wanted);
    }) || assets[0] || null;
  }

  function coherentReviewStory(unit, day) {
    const ranges = unit.reviewRange === "1–9" ? ["1–3", "4–6", "7–9"] : [unit.reviewRange];
    const range = ranges[(Math.max(1, day) - 1) % ranges.length];
    const builder = REVIEW_CLOZE_BUILDERS[`${unit.bookId}:${range}`];
    return builder ? builder(day) : clozeStory("A Review Day", reviewWord(unit.vocabulary?.[0]), [
      "Lumi and Ludi work together on one review story.",
      "They read every sentence and use the context clues.",
      "The first missing word is ________.",
      "They check the story from beginning to end.",
      "Now the whole passage makes sense."
    ], [reviewWord(unit.vocabulary?.[0])]);
  }

  function clozeWordBank(unit, story, day) {
    const answerKeys = new Set(story.answers.map((answer) => String(answer).toLowerCase()));
    const grammarPairs = {
      am: "is", are: "is", do: "does", does: "do", eat: "eats", eats: "eat",
      have: "has", has: "have", is: "are", like: "likes", likes: "like",
      meet: "meets", meets: "meet", play: "plays", plays: "play", put: "puts",
      puts: "put", visit: "visits", visits: "visit", walk: "walks", walks: "walk",
      want: "wants", wants: "want",
      "fly a kite": "flies a kite", "go swimming": "goes swimming",
      "listen to music": "listens to music", "watch TV": "watches TV"
    };
    const singularForm = (answer) => {
      const words = String(answer).split(" ");
      const last = words.pop();
      const singular = /ies$/i.test(last) ? `${last.slice(0, -3)}y`
        : /(?:ches|shes|xes|zes|oes)$/i.test(last) ? last.slice(0, -2)
          : /s$/i.test(last) && !/ss$/i.test(last) ? last.slice(0, -1) : "";
      return singular ? [...words, singular].join(" ") : "";
    };
    const grammarForms = story.answers.map((answer) => grammarPairs[String(answer).toLowerCase()]).filter(Boolean);
    const numberForms = story.answers.flatMap((answer) => {
      const key = String(answer).toLowerCase();
      if (grammarPairs[key]) return [];
      const singular = singularForm(answer);
      if (singular) return [singular];
      const isVocabularyNoun = (unit.vocabulary || []).some((asset) => reviewVocabularyTerms(asset)
        .some((term) => term.toLowerCase() === key));
      return isVocabularyNoun && !/\s/.test(String(answer)) ? [pluralReviewWord(String(answer))] : [];
    });
    const confusingForms = [...grammarForms, ...numberForms];
    const candidates = (unit.vocabulary || [])
      .flatMap((asset) => reviewVocabularyTerms(asset))
      .map((word) => String(word).trim())
      .filter((word, index, words) => word && !answerKeys.has(word.toLowerCase())
        && words.findIndex((candidate) => candidate.toLowerCase() === word.toLowerCase()) === index);
    const offset = candidates.length ? (Math.max(1, day) - 1) % candidates.length : 0;
    const distractors = [...confusingForms, ...candidates.slice(offset), ...candidates.slice(0, offset)]
      .filter((word, index, words) => word && !answerKeys.has(word.toLowerCase())
        && words.findIndex((candidate) => candidate.toLowerCase() === word.toLowerCase()) === index)
      .slice(0, 3);
    const bank = [...story.answers, ...distractors];
    const rotateBy = bank.length ? Math.max(1, day) % bank.length : 0;
    return [...bank.slice(rotateBy), ...bank.slice(0, rotateBy)];
  }

  function connectedClozePage(unit, day) {
    const story = coherentReviewStory(unit, day);
    const wordBank = clozeWordBank(unit, story, day);
    const items = story.answers.map((answer, index) => ({
      prompt: `Blank ${index + 1}: ________`,
      expectedAnswer: `${index + 1}. ${answer}`,
      asset: null
    }));
    return {
      type: "reading_cloze",
      layout: "locked_template",
      title: story.title,
      instruction: "Read the whole passage. Choose from the Word Bank. Some words are not used.",
      skill: "reading cloze and sentence writing",
      passageLines: story.passageLines,
      answers: story.answers,
      wordBank,
      heroAssets: [],
      sceneAssets: [],
      endingLines: ["Choose one completed sentence and write it below."],
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
    const storySource = day === 2 ? reviewPairs.slice(18, 24) : day === 3 ? reviewPairs.slice(14, 20) : reviewPairs.slice(0, 6);
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
      connectedClozePage(unit, day),
      standard("matching", "Review Matching", "Match each question to the answer that keeps the conversation correct.", matchingItems),
      standard("multiple_choice", "Review Choice Check", "Circle the correct complete answer.", answerChoices),
      connectedChainPage(chainSource, day)
    ];

    if (day === 2) return [
      locked("template_picture_question", "Review: Make the Question", "Read each answer and write its question.", writingSource.map((item) => ({ prompt: `Answer: ${item.answer}`, asset: item.asset, expectedAnswer: item.question })), true),
      standard("matching", "Review Question Match", "Match each question to its complete answer.", matchingItems),
      standard("multiple_choice", "Choose the Review Question", "Circle the question that matches the answer.", questionChoices),
      connectedClozePage(unit, day)
    ];

    if (day === 3) return [
      connectedChainPage(chainSource, day),
      standard("matching", "Mixed Review Dialogue", "Match questions and answers to complete the dialogue.", matchingItems),
      standard("multiple_choice", "Mixed Grammar Check", "Circle the only correct complete question.", questionChoices),
      connectedClozePage(unit, day)
    ];

    if (day === 5) return [
      connectedClozePage(unit, day),
      standard("matching", "Final Question and Answer Match", "Match every question to its complete answer.", matchingItems),
      standard("multiple_choice", "Final Mixed Check", "Circle the correct complete answer.", answerChoices),
      connectedChainPage(reviewPairs.slice(13, 19), day)
    ];

    return [
      connectedClozePage(unit, day),
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
        : book.id === "book-3" && unit.id === "unit-5"
          ? book3Unit5Pages(unit, day, book)
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

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

  function attach(catalog) {
    (catalog || []).forEach((book) => book.units.forEach((unit) => unit.lessons.forEach((lesson, lessonIndex) => {
      const day = Number(String(lesson.day || lessonIndex + 1).match(/\d+/)?.[0]) || lessonIndex + 1;
      lesson.worksheet = { ...(lesson.worksheet || {}), day, unitTitle: unit.title, pages: buildPages(unit, day) };
    })));
  }

  window.WorksheetData = { DAY_TYPES, attach, buildPages };
  if (Array.isArray(window.COURSE_CATALOG)) attach(window.COURSE_CATALOG);
})(window);

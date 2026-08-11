(function () {
  "use strict";

  const DEFAULT_FLOW_TEMPLATE = [
    { id: "warm-up", type: "warmup", title: "Warm Up", duration: 5, activity: "review" },
    { id: "vocabulary", type: "vocabulary", title: "Vocabulary", duration: 8, activity: "flashcard" },
    { id: "sentence-pattern", type: "grammar", title: "Sentence Pattern", duration: 8, activity: "sentence-pattern" },
    { id: "practice", type: "practice", title: "Practice", duration: 6, activity: "random-prompt" },
    { id: "speaking", type: "speaking", title: "Speaking", duration: 6, activity: "speaking-prompt" },
    { id: "wordwall-game", type: "embed", title: "Wordwall Game", duration: 6, activity: "embed" },
    { id: "phonics", type: "phonics", title: "Phonics", duration: 7, activity: "phonics-drill" },
    { id: "show-book", type: "showbook", title: "Show Book", duration: 5, activity: "embed" },
    { id: "quiz", type: "quiz", title: "Quiz", duration: 3, activity: "multiple-choice" },
    { id: "homework", type: "homework", title: "Homework", duration: 2, activity: "homework" }
  ];

  const B1_DAY_PAGES = [
    [4, 10, 14, 18],
    [22, 28, 32, 36],
    [41, 47, 51, 54],
    [63, 69, 73, 77],
    [81, 87, 91, 95],
    [99, 104, 108, 112],
    [121, 127, 131, 134],
    [139, 144, 147, 151],
    [155, 160, 164, 168]
  ];
  const B1_SONG_UNITS = new Set([2, 4, 6, 8]);

  const WORD_VISUALS = {
    boy: "👦", man: "👨", student: "🧑‍🎓", girl: "👧", woman: "👩", teacher: "🧑‍🏫",
    grandfather: "👴", grandpa: "👴", grandmother: "👵", grandma: "👵", father: "👨", dad: "👨",
    mother: "👩", mom: "👩", aunt: "👩", uncle: "👨", sister: "👧", brother: "👦", me: "🙂", "cousin(s)": "🧒",
    one: "1️⃣", two: "2️⃣", three: "3️⃣", four: "4️⃣", five: "5️⃣", six: "6️⃣", seven: "7️⃣", eight: "8️⃣", nine: "9️⃣", ten: "🔟",
    sad: "😢", happy: "😄", chubby: "🙂", thin: "🧍", young: "🧒", old: "👴", short: "↕️", tall: "📏", cute: "🥰",
    hungry: "😋", thirsty: "🥤", angry: "😠", lazy: "🛋️", noisy: "📣", quiet: "🤫", sleepy: "😴", tired: "🥱",
    "school bag": "🎒", ruler: "📏", book: "📘", "pencil case": "👝", pencil: "✏️", pen: "🖊️", eraser: "🧽", desk: "🗄️", chair: "🪑",
    red: "🟥", yellow: "🟨", green: "🟩", blue: "🟦", pink: "💗", black: "⬛", white: "⬜", brown: "🟫", orange: "🟧", purple: "🟪",
    coat: "🧥", dress: "👗", jacket: "🧥", "t-shirt": "👕", shirt: "👔", cap: "🧢", hat: "🎩", skirt: "👗",
    cat: "🐈", horse: "🐎", rat: "🐀", pig: "🐖", sheep: "🐑", rabbit: "🐇", chicken: "🐓", cow: "🐄", duck: "🦆", dog: "🐕"
  };

  function vocabularyItems(words) {
    return words.map((entry) => {
      const item = typeof entry === "string" ? { word: entry } : entry;
      return {
        meaning: "",
        image: "",
        audio: "",
        visual: WORD_VISUALS[item.word.toLowerCase()] || "🖼️",
        ...item
      };
    });
  }

  function phonicsText(phonics) {
    if (phonics.review) return "Review previously learned short-vowel word families.";
    return phonics.groups.map((group) => `${group.family}\n${group.words.join("  ·  ")}`).join("\n\n");
  }

  function vocabularyText(unit) {
    return vocabularyItems(unit.vocabulary).map((item) => item.word).join("  ·  ");
  }

  function distributeDuration(totalDuration, count, index) {
    const available = Math.max(totalDuration, count);
    const base = Math.floor(available / count);
    return base + (index < available % count ? 1 : 0);
  }

  function step(id, type, title, duration, instruction, extra = {}) {
    return { id, type, title, duration, instruction, ...extra };
  }

  function wordwallStep(unit, bookId, lessonId, duration) {
    const configuredUrl = lessonId === "day-1"
      ? unit.materials?.wordwallDay1Url
      : unit.materials?.wordwallDay2Url;
    return step("wordwall-game", "embed", "Wordwall Game", duration, "Paste a Wordwall embed URL or iframe code to play inside the lesson.", {
      activity: "embed",
      embedUrl: configuredUrl || unit.materials?.wordwallUrl || "",
      embedStorageKey: `wordwall:${bookId}:${unit.id}:${lessonId}`
    });
  }

  function vocabularySteps(unit, totalDuration, idPrefix = "vocabulary", phaseTitle = "Let’s Learn") {
    const items = vocabularyItems(unit.vocabulary);
    return items.map((item, index) => ({
      id: `${idPrefix}-${index + 1}`,
      type: "vocabulary",
      title: item.word,
      phaseTitle,
      duration: distributeDuration(totalDuration, items.length, index),
      activity: "flashcard",
      instruction: "Show the picture, play or model the pronunciation, then have students repeat.",
      vocabulary: [item],
      word: item,
      wordIndex: index + 1,
      wordTotal: items.length
    }));
  }

  function quizSteps(unit, totalDuration) {
    const questions = unit.quiz || [];
    if (!questions.length) {
      return [step("vocabulary-quiz", "quiz", "Review Vocabulary & Quiz", totalDuration, "Review the vocabulary, then give a short quiz.", { activity: "multiple-choice", vocabulary: vocabularyItems(unit.vocabulary) })];
    }
    return questions.map((question, index) => step(
      `vocabulary-quiz-${index + 1}`,
      "quiz",
      "Read and Choose",
      distributeDuration(totalDuration, questions.length, index),
      "Look at the picture, read the sentence, and choose the missing word.",
      { activity: "multiple-choice", vocabulary: vocabularyItems(unit.vocabulary), question, questionIndex: index + 1, questionTotal: questions.length }
    ));
  }

  function vocabularyPracticeSteps(unit, totalDuration) {
    const items = vocabularyItems(unit.vocabulary);
    const words = items.map((item) => item.word);

    return items.map((item, index) => {
      const distractorOne = words[(index + 1) % words.length];
      const distractorTwo = words[(index + 2) % words.length];
      const choiceOrders = [
        [item.word, distractorOne, distractorTwo],
        [distractorOne, item.word, distractorTwo],
        [distractorOne, distractorTwo, item.word]
      ];
      const question = {
        prompt: "Which word is it?",
        answer: item.word,
        choices: choiceOrders[index % choiceOrders.length],
        image: item.image || "",
        sprite: item.sprite,
        visual: item.visual,
        word: item.word
      };

      return step(
        `vocabulary-practice-${index + 1}`,
        "quiz",
        "Vocabulary Practice",
        distributeDuration(totalDuration, items.length, index),
        "Look at the picture and choose the correct word.",
        {
          activity: "multiple-choice",
          phaseTitle: "Vocabulary Practice",
          vocabulary: items,
          question,
          questionIndex: index + 1,
          questionTotal: items.length
        }
      );
    });
  }

  function dialogueChoiceSteps(unit, totalDuration, sentences) {
    const questions = unit.dialogueChoices || [];
    if (!questions.length) {
      return [step("lets-practice", "practice", "Let’s Practice", totalDuration, `Present the target sentence patterns. Change the key word, repeat together, then complete the Student Book exercise.\n\n${sentences}`, { activity: "sentence-pattern", mainSentences: unit.mainSentences })];
    }
    return questions.map((dialogueChoice, index) => step(
      `lets-practice-${index + 1}`,
      "practice",
      "New Sentence",
      distributeDuration(totalDuration, questions.length, index),
      "Look at the person, make the question, and choose the complete answer.",
      { activity: "dialogue-choice", mainSentences: unit.mainSentences, dialogueChoice, questionIndex: index + 1, questionTotal: questions.length }
    ));
  }

  function sentencePatternSteps(unit, totalDuration, sentences) {
    const cards = unit.sentenceCards || [];
    if (!cards.length) return dialogueChoiceSteps(unit, totalDuration, sentences);

    const sentencePages = cards.flatMap((card) => card.sentences.map((sentence) => ({
      ...card,
      sentences: [sentence]
    })));

    return sentencePages.map((sentenceCard, index) => step(
      `sentence-practice-${index + 1}`,
      "grammar",
      "Sentence Practice",
      distributeDuration(totalDuration, sentencePages.length, index),
      "Look at the picture and read the sentence aloud.",
      {
        activity: "sentence-card",
        phaseTitle: "Let’s Practice",
        sentenceCard,
        questionIndex: index + 1,
        questionTotal: sentencePages.length
      }
    ));
  }

  function curriculumFor(unit) {
    return {
      topic: unit.topic,
      mainSentences: unit.mainSentences,
      vocabulary: vocabularyItems(unit.vocabulary),
      phonics: unit.phonics
    };
  }

  function b1WarmUp(day) {
    const homework = day === 1 ? "" : " Collect the previous homework and return corrected work.";
    return `Greet the class using a target sentence. Take attendance and check Communication Books.${homework}`;
  }

  function book1DaySteps(unit, unitNumber, day) {
    const sentences = unit.mainSentences.join("\n");
    const words = vocabularyText(unit);
    const phonics = phonicsText(unit.phonics);

    if (day === 1) {
      const warmUpInstruction = unitNumber === 1
        ? `1. Stand in a circle and throw a soft ball.
2. Catch the ball and say: “I am [name].”
3. Throw it to the next student.`
        : b1WarmUp(day);
      const letsTalkInstruction = unitNumber === 1
        ? `1. Walk around and find a classmate.
2. Ask: “I am [name]. How are you?” Answer: “I am fine, thank you.”
3. Circle the classmate’s name and find a new partner.`
        : `Play the dialogue once without stopping. Ask comprehension questions, then replay and repeat sentence by sentence.\n\n${sentences}`;
      const answerQuicklySteps = unitNumber === 1
        ? [step(
          "answer-quickly",
          "game",
          "Answer Quickly",
          5,
          `1. Divide the class into two teams.
2. Show a picture. The first student to say the word wins a point.
3. Change players and continue with all six words.`,
          { activity: "review", phaseTitle: "Let’s Learn", vocabulary: vocabularyItems(unit.vocabulary) }
        )]
        : [];
      const reviewVocabularyMatchSteps = unitNumber === 1
        ? [step(
          "review-vocabulary-match",
          "game",
          "Match!",
          5,
          `1. Put each vocabulary word twice in a 4 × 3 grid.
2. Teams take turns choosing two coordinates.
3. A matching pair wins one point.`,
          { activity: "matching", phaseTitle: "Review Vocabulary", vocabulary: vocabularyItems(unit.vocabulary) }
        )]
        : [];
      const afterVocabulary = unitNumber === 1
        ? step("live-grammar", "grammar", "Live Grammar", 10, "Introduce words and sentences. Focus on a capital letter, spaces, and a period.", { activity: "sentence-pattern" })
        : step("reader", "presentation", "Reader", 10, "Play the reader animation. Pause page by page, read together, and let students try reading independently.", { activity: "reader" });

      return [
        step("warm-up", "warmup", unitNumber === 1 ? "Throw and Catch" : "Warm Up", 10, warmUpInstruction, { activity: "review" }),
        step("lets-talk", "presentation", unitNumber === 1 ? "How Are You?" : "Let’s Talk", 15, letsTalkInstruction, { activity: "dialogue", phaseTitle: "Let’s Talk", mainSentences: unit.mainSentences }),
        ...vocabularySteps(unit, unitNumber === 1 ? 10 : 15),
        ...answerQuicklySteps,
        ...vocabularyPracticeSteps(unit, 15),
        afterVocabulary,
        step("break", "break", "Break Time", 10, "Take a ten-minute break.", { activity: "break" }),
        step("theme-song", "warmup", "Theme Song", 5, "Take attendance after the break and warm up with the LiveABC Theme Song.", { activity: "song" }),
        ...reviewVocabularyMatchSteps,
        { ...wordwallStep(unit, "book-1", "day-1", unitNumber === 1 ? 5 : 10), phaseTitle: "Review Vocabulary", title: "Wordwall Review" },
        step("review-dialogue", "speaking", "Review Dialogue", 10, `Replay the dialogue. Students listen, point to each sentence, repeat, and role-play.\n\n${sentences}`, { activity: "dialogue", mainSentences: unit.mainSentences }),
        step("sound-it-out", "phonics", "Sound It Out", 15, phonics, { activity: "phonics-drill", phonics: unit.phonics }),
        step("wrap-up", "homework", "Wrap Up", 5, "Assign homework, preview one or two questions, and return Communication Books.", { activity: "homework" })
      ];
    }

    if (day === 2) {
      const musicTitle = B1_SONG_UNITS.has(unitNumber) ? "Let's Sing" : "Let's Chant";
      const hasReadAndChoose = Boolean(unit.sentenceCards?.length);
      const warmUp = unitNumber === 1
        ? step(
          "warm-up",
          "warmup",
          "Dialogue Puzzles",
          10,
          `1. Cut two sets of dialogue word cards and put each set in a box.
2. One student draws a card. The team says the complete sentence.
3. Continue until all cards are used.

Hello, / I am / Ludi. / I am / a boy.
How / are / you? / I am / fine. / Thank / you.`,
          { activity: "review", phaseTitle: "Warm Up" }
        )
        : step("warm-up", "warmup", "Warm Up", 10, b1WarmUp(day), { activity: "review" });
      const stickyBallSteps = unitNumber === 1
        ? [step(
          "sticky-ball",
          "game",
          "Sticky Ball",
          10,
          "",
          {
            activity: "practice",
            phaseTitle: "Let’s Practice",
            vocabulary: vocabularyItems(unit.vocabulary),
            activityImage: "assets/images/sticky-ball-activity.png",
            imageAlt: "A sticky ball board divided into six vocabulary sections"
          }
        )]
        : [];
      const secondPatternReview = unitNumber === 1
        ? step(
          "review-patterns-2",
          "game",
          "Matching Game",
          15,
          `1. Draw a 4 × 4 grid with eight pairs of symbols.
2. Answer a sentence question, then choose two boxes.
3. A matching pair wins one point.`,
          { activity: "matching", phaseTitle: "Review Sentence Patterns", mainSentences: unit.mainSentences }
        )
        : step("review-patterns-2", "grammar", "Grammar Practice", 15, "Review the patterns with a team activity and complete the Live Grammar practice.", { activity: "matching", mainSentences: unit.mainSentences });
      const musicStep = unitNumber === 1
        ? step(
          "music",
          "game",
          "Word-Step Game",
          15,
          `1. Put boy, girl, man, and woman cards on the floor.
2. Play the chant. Students chant and step on each matching card.
3. Finish with “Hooray!” and keep chanting after sitting down.`,
          { activity: "song", phaseTitle: "Let’s Chant" }
        )
        : step("music", "game", musicTitle, 15, `Demonstrate the ${musicTitle === "Let’s Sing" ? "song" : "chant"}, practice line by line, then perform together.`, { activity: "song" });
      return [
        warmUp,
        ...(hasReadAndChoose ? [] : quizSteps(unit, 10)),
        { ...wordwallStep(unit, "book-1", "day-2", 10), phaseTitle: "Review Vocabulary & Quiz", title: "Vocabulary Quiz" },
        ...sentencePatternSteps(unit, hasReadAndChoose && unitNumber !== 1 ? 25 : 15, sentences),
        ...stickyBallSteps,
        step("review-patterns-1", "grammar", "Review Sentence Patterns", 15, `Replay and repeat the target patterns.\n\n${sentences}`, { activity: "sentence-pattern", mainSentences: unit.mainSentences }),
        step("break", "break", "Break Time", 10, "Take a ten-minute break.", { activity: "break" }),
        secondPatternReview,
        musicStep,
        step("sound-it-out", "phonics", "Sound It Out", 15, phonics, { activity: "phonics-drill", phonics: unit.phonics }),
        step("wrap-up", "homework", "Wrap Up", 5, "Assign homework, preview one or two questions, and return Communication Books.", { activity: "homework" })
      ];
    }

    if (day === 3) {
      return [
        step("warm-up", "warmup", "Warm Up", 10, b1WarmUp(day), { activity: "review" }),
        step("review-vocabulary", "vocabulary", "Review Vocabulary", 20, `Review pronunciation and spelling, then play the teacher-guide vocabulary activity.\n\n${words}`, { activity: "review", vocabulary: vocabularyItems(unit.vocabulary) }),
        step("lets-speak", "speaking", "Let’s Speak", 30, `Model the conversation, practice by changing roles, then have pairs speak using the target patterns.\n\n${sentences}`, { activity: "speaking-prompt", mainSentences: unit.mainSentences }),
        step("break", "break", "Break Time", 10, "Take a ten-minute break.", { activity: "break" }),
        step("lets-read", "presentation", "Let’s Read", 30, "Play or read the story, check understanding, practice sentence by sentence, and complete the reading exercise.", { activity: "reader" }),
        step("sound-it-out", "phonics", "Sound It Out", 15, phonics, { activity: "phonics-drill", phonics: unit.phonics }),
        step("wrap-up", "homework", "Wrap Up", 5, "Assign homework, preview one or two questions, and return Communication Books.", { activity: "homework" })
      ];
    }

    return [
      step("warm-up", "warmup", "Warm Up", 15, b1WarmUp(day), { activity: "review" }),
      step("lets-say", "phonics", "Let’s Say", 30, `Introduce each sound family and picture word. Model, blend, repeat, and complete the exercise.\n\n${phonics}`, { activity: "phonics-drill", phonics: unit.phonics }),
      step("lets-try", "practice", "Let’s Try", 15, "Complete the listening and writing checks from the Student Book.", { activity: "listening" }),
      step("break", "break", "Break Time", 10, "Take a ten-minute break.", { activity: "break" }),
      step("irs-test", "quiz", "IRS Test", 15, "Choose the Book and Unit in Smart Classroom and complete the IRS review together.", { activity: "multiple-choice" }),
      step("weekly-quiz", "quiz", "Weekly Quiz", 15, "Explain the test, let students complete it independently, then collect it for scoring.", { activity: "multiple-choice" }),
      step("sound-it-out", "phonics", "Sound It Out", 15, phonics, { activity: "phonics-drill", phonics: unit.phonics }),
      step("wrap-up", "homework", "Wrap Up", 5, "Assign homework, preview one or two questions, and return Communication Books.", { activity: "homework" })
    ];
  }

  function book1LessonsFromUnit(unit, unitIndex) {
    return [1, 2].map((day) => ({
      id: `day-${day}`,
      title: `${unit.title} · Day ${day}`,
      day: `Day ${day}`,
      source: {
        document: "B1_教學流程.pdf",
        page: B1_DAY_PAGES[unitIndex][day - 1]
      },
      curriculum: curriculumFor(unit),
      steps: book1DaySteps(unit, unitIndex + 1, day)
    }));
  }

  function defaultInstruction(template, unit, unitIndex) {
    const instructions = {
      "warm-up": unitIndex === 0 ? `Introduce today’s topic: ${unit.topic}.` : `Review the previous unit, then introduce ${unit.topic}.`,
      "sentence-pattern": unit.mainSentences.join("\n"),
      practice: "Use pictures or word prompts. Students listen, point, and answer.",
      speaking: "Students take turns asking and answering with today’s pattern.",
      "wordwall-game": "Paste a Wordwall embed URL or iframe code to play inside the lesson.",
      phonics: phonicsText(unit.phonics),
      "show-book": "Open the original e-book, Live material, or slides.",
      quiz: "Check the target vocabulary and one main sentence.",
      homework: "Review today’s vocabulary, sentence pattern, and phonics words."
    };
    return instructions[template.id];
  }

  function defaultLessonFromUnit(unit, unitIndex, bookId) {
    const steps = DEFAULT_FLOW_TEMPLATE.flatMap((template) => {
      if (template.id === "vocabulary") return vocabularySteps(unit, template.duration, "vocabulary", "Vocabulary");
      const extra = {};
      if (template.id === "sentence-pattern") extra.mainSentences = unit.mainSentences;
      if (["practice", "speaking", "quiz"].includes(template.id)) extra.vocabulary = vocabularyItems(unit.vocabulary);
      if (template.id === "wordwall-game") {
        extra.embedUrl = unit.materials?.wordwallUrl || unit.materials?.embedUrl || "";
        extra.embedStorageKey = `wordwall:${bookId}:${unit.id}:lesson-1`;
      }
      if (template.id === "phonics") extra.phonics = unit.phonics;
      if (template.id === "show-book") extra.embedUrl = unit.materials?.bookUrl || "";
      return [{ ...template, instruction: defaultInstruction(template, unit, unitIndex), ...extra }];
    });

    return [{ id: "lesson-1", title: unit.title, day: "Core Lesson", curriculum: curriculumFor(unit), steps }];
  }

  function buildCatalog(books) {
    return books.map((book) => ({
      ...book,
      units: book.units.map((unit, unitIndex) => ({
        id: unit.id,
        title: `Unit ${unitIndex + 1}`,
        topic: unit.title,
        lessons: book.id === "book-1" ? book1LessonsFromUnit(unit, unitIndex) : defaultLessonFromUnit(unit, unitIndex, book.id)
      }))
    }));
  }

  window.TeachingFlow = { FLOW_TEMPLATE: DEFAULT_FLOW_TEMPLATE, buildCatalog };
  window.COURSE_CATALOG = buildCatalog(window.CURRICULUM_BOOKS || []);
})();

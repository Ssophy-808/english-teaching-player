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

  const B1_CUSTOM_ACTIVITY_IMAGES = {
    "unit-1|day1|throw and catch": "assets/images/throw-and-catch-activity.png",
    "unit-1|day1|how are you": "assets/images/how-are-you-activity.png",
    "unit-1|day1|answer quickly": "assets/images/answer-quickly-activity.png",
    "unit-1|day1|match": "assets/images/vocabulary-match-activity.png",
    "unit-1|day2|dialogue puzzles": "assets/images/dialogue-puzzles-activity.png",
    "unit-1|day2|sticky ball": "assets/images/sticky-ball-activity.png",
    "unit-1|day2|matching game": "assets/images/matching-game-activity.png",
    "unit-1|day2|word step game": "assets/images/word-step-game-activity.png"
  };

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

  const GENERATED_WORD_SPRITES = {};
  const SCHOOL_ATLAS = "assets/images/vocabulary-people-school-clothes.png";
  const ANIMAL_ATLAS = "assets/images/vocabulary-colors-animals-feelings.png";

  [
    ["sad", 0, 0], ["happy", 1, 0], ["chubby", 2, 0], ["thin", 3, 0], ["young", 4, 0],
    ["old", 0, 1], ["short", 1, 1], ["tall", 2, 1], ["cute", 3, 1], ["school bag", 4, 1],
    ["ruler", 0, 2], ["book", 1, 2], ["pencil case", 2, 2], ["pencil", 3, 2], ["pen", 4, 2],
    ["eraser", 0, 3], ["desk", 1, 3], ["chair", 2, 3], ["coat", 3, 3], ["dress", 4, 3],
    ["jacket", 0, 4], ["t-shirt", 1, 4], ["cap", 2, 4], ["hat", 3, 4], ["skirt", 4, 4]
  ].forEach(([word, col, row]) => { GENERATED_WORD_SPRITES[word] = { src: SCHOOL_ATLAS, cols: 5, rows: 5, col, row }; });

  [
    ["red", 0, 0], ["yellow", 1, 0], ["green", 2, 0], ["blue", 3, 0], ["pink", 4, 0], ["black", 5, 0],
    ["white", 0, 1], ["brown", 1, 1], ["orange", 2, 1], ["purple", 3, 1], ["cat", 4, 1], ["horse", 5, 1],
    ["rat", 0, 2], ["pig", 1, 2], ["sheep", 2, 2], ["rabbit", 3, 2], ["chicken", 4, 2], ["cow", 5, 2],
    ["duck", 0, 3], ["dog", 1, 3], ["hungry", 2, 3], ["thirsty", 3, 3], ["angry", 4, 3], ["lazy", 5, 3],
    ["noisy", 0, 4], ["quiet", 1, 4], ["sleepy", 2, 4], ["tired", 3, 4]
  ].forEach(([word, col, row]) => { GENERATED_WORD_SPRITES[word] = { src: ANIMAL_ATLAS, cols: 6, rows: 5, col, row }; });

  function vocabularyItems(words) {
    return words.map((entry) => {
      const item = typeof entry === "string" ? { word: entry } : entry;
      return {
        meaning: "",
        image: "",
        audio: "",
        visual: WORD_VISUALS[item.word.toLowerCase()] || "🖼️",
        sprite: GENERATED_WORD_SPRITES[item.word.toLowerCase()],
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

  function normalizeActivityName(name) {
    return String(name).toLowerCase().replace(/[’'!?.,-]/g, " ").replace(/\s+/g, " ").trim();
  }

  function activityImageFor(unit, day, name) {
    const normalized = normalizeActivityName(name);
    const customKey = `${unit.id}|day${day}|${normalized}`;
    if (B1_CUSTOM_ACTIVITY_IMAGES[customKey]) return B1_CUSTOM_ACTIVITY_IMAGES[customKey];

    if (/survey|how are you/.test(normalized)) return "assets/images/activity-survey.png";
    if (/role|charade|dialogue|q and a|being an animal|says|talking/.test(normalized)) return "assets/images/activity-roleplay.png";
    if (/spell|write|draw|artist|word puzzle|circle the words|rewrite/.test(normalized)) return "assets/images/activity-spelling.png";
    if (/match|partner|puzzle|unscramble|memory|card|decoding/.test(normalized)) return "assets/images/activity-matching.png";
    if (/read|sentence|say exercise|spot the mistakes/.test(normalized)) return "assets/images/activity-reading.png";
    if (/dice|die|number|tic tac toe|lucky|countdown|21/.test(normalized)) return "assets/images/activity-dice.png";
    if (/chair|stand|walk|jump|step|march|move|wind|squat|frog|frontline/.test(normalized)) return "assets/images/activity-movement.png";
    if (/ball|slap|hit|throw|kick|toss|dunk|cowboy|blow|potato|bang/.test(normalized)) return "assets/images/activity-ball.png";
    return "assets/images/activity-roleplay.png";
  }

  function activityStep(unit, day, name, index) {
    const id = normalizeActivityName(name).replace(/[^a-z0-9]+/g, "-") || `activity-${index + 1}`;
    return step(`day-${day}-activity-${index + 1}-${id}`, "game", name, 0, "", {
      activity: "visual-activity",
      phaseTitle: `Day ${day} Activity`,
      activityImage: activityImageFor(unit, day, name),
      imageAlt: `${name} classroom activity`
    });
  }

  function addBook1Activities(unit, day, lessonSteps) {
    const names = window.BOOK1_ACTIVITIES?.[unit.id]?.[`day${day}`] || [];
    const existing = new Set(lessonSteps.map((item) => normalizeActivityName(item.title)));
    const additions = names
      .filter((name) => !existing.has(normalizeActivityName(name)))
      .map((name, index) => activityStep(unit, day, name, index));
    const wrapUpIndex = lessonSteps.findIndex((item) => item.id === "wrap-up");
    const insertionIndex = wrapUpIndex < 0 ? lessonSteps.length : wrapUpIndex;
    return [...lessonSteps.slice(0, insertionIndex), ...additions, ...lessonSteps.slice(insertionIndex)];
  }

  function book1ExtraActivityLesson(unit, unitIndex) {
    const activities = window.BOOK1_ACTIVITIES?.[unit.id] || {};
    const day3 = (activities.day3 || []).map((name, index) => activityStep(unit, 3, name, index));
    const day4 = (activities.day4 || []).map((name, index) => activityStep(unit, 4, name, index));
    return {
      id: "activities-day-3-4",
      title: `${unit.title} · Activities`,
      day: "Day 3–4",
      source: {
        document: "B1_教學流程.pdf",
        pages: [B1_DAY_PAGES[unitIndex][2], B1_DAY_PAGES[unitIndex][3]]
      },
      curriculum: curriculumFor(unit),
      steps: [...day3, ...day4]
    };
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

  function sentencePicture(unit, text, index) {
    const items = vocabularyItems(unit.vocabulary);
    const lowerText = text.toLowerCase();
    const containsWord = (candidate) => {
      const escaped = candidate.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`).test(lowerText);
    };
    const negativeAlternatives = {
      boy: "girl", girl: "boy", one: "eight", happy: "sad",
      eraser: "pen", red: "blue", hat: "coat", hungry: "thirsty"
    };
    const matchingItem = [...items]
      .sort((a, b) => b.word.length - a.word.length)
      .find((item) => [item.word, ...(item.aliases || [])]
        .some(containsWord));
    if (matchingItem && lowerText.includes("not")) {
      const alternative = items.find((item) => item.word.toLowerCase() === negativeAlternatives[matchingItem.word.toLowerCase()]);
      if (alternative) return alternative;
    }
    return matchingItem || items[index % items.length] || { word: "picture", visual: "🖼️" };
  }

  function orderedChoices(answer, distractors, index) {
    const choices = [...new Set([answer, ...distractors, "I don’t know.", "Please say it again."])].slice(0, 3);
    if (index % 3 === 1) return [choices[1], choices[0], choices[2]];
    if (index % 3 === 2) return [choices[1], choices[2], choices[0]];
    return choices;
  }

  function letsTalkChoiceSteps(unit, totalDuration) {
    const sentences = [...new Set(unit.mainSentences)];
    const statements = sentences.filter((sentence) => !sentence.trim().endsWith("?"));
    const labels = ["A", "B", "C"];

    return sentences.map((sentence, index) => {
      const isQuestion = sentence.trim().endsWith("?");
      const originalIndex = unit.mainSentences.indexOf(sentence);
      const nextSentence = unit.mainSentences[originalIndex + 1];
      const answer = isQuestion && nextSentence && !nextSentence.trim().endsWith("?") ? nextSentence : sentence;
      const choiceTexts = orderedChoices(answer, statements, index);
      const picture = sentencePicture(unit, `${sentence} ${answer}`, index);
      const dialogueChoice = {
        instruction: isQuestion ? "Look at the picture and answer:" : "Look at the picture and choose:",
        prompt: isQuestion ? sentence : "Which sentence is correct?",
        answer: labels[choiceTexts.indexOf(answer)],
        image: picture.image || "",
        sprite: picture.sprite,
        visual: picture.visual,
        word: picture.word,
        choices: choiceTexts.map((choice, choiceIndex) => ({ label: labels[choiceIndex], lines: [choice] }))
      };

      return step(
        `lets-talk-choice-${index + 1}`,
        "practice",
        "Let’s Talk",
        distributeDuration(totalDuration, sentences.length, index),
        "Look at the picture and choose the correct sentence.",
        {
          activity: "dialogue-choice",
          phaseTitle: "Let’s Talk",
          mainSentences: unit.mainSentences,
          dialogueChoice,
          questionIndex: index + 1,
          questionTotal: sentences.length
        }
      );
    });
  }

  function passportSentenceSteps(unit) {
    const entries = unit.passportSentences || window.BOOK1_PASSPORT_SENTENCES?.[unit.id] || [];
    return entries.map(([text, translation], index) => {
      const picture = sentencePicture(unit, text, index);
      return step(
        `passport-sentence-${index + 1}`,
        "grammar",
        "Passport Review",
        0,
        "Read the sentence aloud.",
        {
          activity: "passport-sentence",
          phaseTitle: "Passport Review",
          passportSentence: {
            text,
            translation,
            image: picture.image || "",
            sprite: picture.sprite,
            visual: picture.visual,
            word: picture.word
          },
          questionIndex: index + 1,
          questionTotal: entries.length
        }
      );
    });
  }

  function sentenceReviewSteps(unit, totalDuration) {
    const passport = unit.passportSentences || [];
    return unit.mainSentences.map((text, index) => {
      const translation = passport.find(([sentence]) => sentence === text)?.[1] || "";
      const picture = sentencePicture(unit, text, index);
      return step(
        `sentence-review-${index + 1}`,
        "grammar",
        "Sentence Practice",
        distributeDuration(totalDuration, unit.mainSentences.length, index),
        "Look at the picture and read the sentence aloud.",
        {
          activity: "passport-sentence",
          phaseTitle: "Sentence Practice",
          passportSentence: {
            text,
            translation,
            image: picture.image || "",
            sprite: picture.sprite,
            visual: picture.visual,
            word: picture.word
          },
          questionIndex: index + 1,
          questionTotal: unit.mainSentences.length
        }
      );
    });
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
      const answerQuicklySteps = unitNumber === 1
        ? [step(
          "answer-quickly",
          "game",
          "Answer Quickly",
          5,
          "",
          {
            activity: "review",
            phaseTitle: "Let’s Learn",
            vocabulary: vocabularyItems(unit.vocabulary),
            activityImage: "assets/images/answer-quickly-activity.png",
            imageAlt: "Two teams answering a vocabulary picture quickly"
          }
        )]
        : [];
      const reviewVocabularyMatchSteps = unitNumber === 1
        ? [step(
          "review-vocabulary-match",
          "game",
          "Match!",
          5,
          "",
          {
            activity: "matching",
            phaseTitle: "Review Vocabulary",
            vocabulary: vocabularyItems(unit.vocabulary),
            activityImage: "assets/images/vocabulary-match-activity.png",
            imageAlt: "A four by three vocabulary coordinate matching grid"
          }
        )]
        : [];
      const afterVocabulary = unitNumber === 1
        ? step("live-grammar", "grammar", "Live Grammar", 10, "Introduce words and sentences. Focus on a capital letter, spaces, and a period.", { activity: "sentence-pattern" })
        : step("reader", "presentation", "Reader", 10, "Play the reader animation. Pause page by page, read together, and let students try reading independently.", { activity: "reader" });

      return [
        step(
          "warm-up",
          "warmup",
          unitNumber === 1 ? "Throw and Catch" : "Warm Up",
          10,
          unitNumber === 1 ? "" : warmUpInstruction,
          {
            activity: "review",
            ...(unitNumber === 1 ? {
              activityImage: "assets/images/throw-and-catch-activity.png",
              imageAlt: "Students passing a soft ball in a circle and saying their names"
            } : {})
          }
        ),
        ...vocabularySteps(unit, unitNumber === 1 ? 10 : 15),
        ...answerQuicklySteps,
        ...vocabularyPracticeSteps(unit, 15),
        ...(unitNumber === 1 ? [step(
          "lets-talk",
          "presentation",
          "How Are You?",
          5,
          "",
          {
            activity: "dialogue",
            phaseTitle: "Let’s Talk",
            mainSentences: unit.mainSentences,
            activityImage: "assets/images/how-are-you-activity.png",
            imageAlt: "Two students asking and answering How are you"
          }
        )] : []),
        ...letsTalkChoiceSteps(unit, unitNumber === 1 ? 10 : 15),
        ...passportSentenceSteps(unit),
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
          "",
          {
            activity: "review",
            phaseTitle: "Warm Up",
            activityImage: "assets/images/dialogue-puzzles-activity.png",
            imageAlt: "Two teams assembling Hello I am Ludi dialogue puzzle cards"
          }
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
          "",
          {
            activity: "matching",
            phaseTitle: "Review Sentence Patterns",
            mainSentences: unit.mainSentences,
            activityImage: "assets/images/matching-game-activity.png",
            imageAlt: "A four by four classroom matching card game"
          }
        )
        : step("review-patterns-2", "grammar", "Grammar Practice", 15, "Review the patterns with a team activity and complete the Live Grammar practice.", { activity: "matching", mainSentences: unit.mainSentences });
      const musicStep = unitNumber === 1
        ? step(
          "music",
          "game",
          "Word-Step Game",
          15,
          "",
          {
            activity: "song",
            phaseTitle: "Let’s Chant",
            activityImage: "assets/images/word-step-game-activity.png",
            imageAlt: "Students stepping on boy girl man and woman word cards"
          }
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
    const teachingDays = [1, 2].map((day) => ({
      id: `day-${day}`,
      title: `${unit.title} · Day ${day}`,
      day: `Day ${day}`,
      source: {
        document: "B1_教學流程.pdf",
        page: B1_DAY_PAGES[unitIndex][day - 1]
      },
      curriculum: curriculumFor(unit),
      steps: addBook1Activities(unit, day, book1DaySteps(unit, unitIndex + 1, day))
    }));
    return [...teachingDays, book1ExtraActivityLesson(unit, unitIndex)];
  }

  function book2DaySteps(unit, day) {
    const sentences = unit.mainSentences.join("\n");
    const phonics = phonicsText(unit.phonics);

    if (day === 1) {
      return [
        step("warm-up", "warmup", "Warm Up", 10, `Introduce today’s topic: ${unit.topic}. Use the classroom toolbox for a quick picture reveal.`, { activity: "review" }),
        ...vocabularySteps(unit, 20),
        ...vocabularyPracticeSteps(unit, 15),
        ...letsTalkChoiceSteps(unit, 15),
        ...passportSentenceSteps(unit),
        step("reader", "presentation", "Reader", 10, "Read or play the dialogue once, then repeat sentence by sentence.", { activity: "reader" }),
        step("break", "break", "Break Time", 10, "Take a ten-minute break.", { activity: "break" }),
        { ...wordwallStep(unit, "book-2", "day-1", 10), phaseTitle: "Game", title: "Wordwall Game" },
        step("review-dialogue", "speaking", "Review Dialogue", 10, `Students listen, point, repeat, and role-play.\n\n${sentences}`, { activity: "dialogue", mainSentences: unit.mainSentences }),
        step("sound-it-out", "phonics", "Sound It Out", 15, phonics, { activity: "phonics-drill", phonics: unit.phonics }),
        step("wrap-up", "homework", "Wrap Up", 5, "Review today’s words and assign the passport sentences for home practice.", { activity: "homework" })
      ];
    }

    return [
      step("warm-up", "warmup", "Picture Review", 10, "Use Random Vocabulary or Picture Reveal from the classroom toolbox.", { activity: "review", vocabulary: vocabularyItems(unit.vocabulary) }),
      ...vocabularyPracticeSteps(unit, 10),
      { ...wordwallStep(unit, "book-2", "day-2", 10), phaseTitle: "Review Vocabulary", title: "Wordwall Review" },
      ...sentenceReviewSteps(unit, 20),
      step("review-patterns", "grammar", "Review Sentence Patterns", 10, sentences, { activity: "sentence-pattern", mainSentences: unit.mainSentences }),
      step("break", "break", "Break Time", 10, "Take a ten-minute break.", { activity: "break" }),
      step("speaking", "speaking", "Speaking Challenge", 15, "Show a random picture. Students ask and answer using today’s pattern.", { activity: "speaking-prompt", vocabulary: vocabularyItems(unit.vocabulary), mainSentences: unit.mainSentences }),
      step("game", "game", "Team Picture Quiz", 15, "Split the class into teams. Reveal a picture and let the first student answer earn a point.", { activity: "random-prompt", vocabulary: vocabularyItems(unit.vocabulary) }),
      step("sound-it-out", "phonics", "Sound It Out", 15, phonics, { activity: "phonics-drill", phonics: unit.phonics }),
      step("wrap-up", "homework", "Wrap Up", 5, "Assign homework and preview the next Unit.", { activity: "homework" })
    ];
  }

  function book2LessonsFromUnit(unit) {
    return [1, 2].map((day) => ({
      id: `day-${day}`,
      title: `${unit.title} · Day ${day}`,
      day: `Day ${day}`,
      curriculum: curriculumFor(unit),
      steps: book2DaySteps(unit, day)
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

  const CLASSROOM_FLOW = [
    { id: "warm-up", groupId: "warm-up", groupTitle: "Warm Up", title: "Warm Up", duration: 5, activityType: "teaching" },
    { id: "vocabulary-teaching", groupId: "vocabulary", groupTitle: "Vocabulary", title: "Vocabulary Teaching", duration: 3, activityType: "teaching" },
    { id: "vocabulary-games", groupId: "vocabulary", groupTitle: "Vocabulary", title: "Vocabulary Games", duration: 5, activityType: "game", skippable: true },
    { id: "vocabulary-check", groupId: "vocabulary", groupTitle: "Vocabulary", title: "Vocabulary Check", duration: 2, activityType: "check" },
    { id: "grammar-teaching", groupId: "grammar", groupTitle: "Grammar / Sentence Pattern", title: "Grammar Teaching", duration: 3, activityType: "teaching" },
    { id: "grammar-games", groupId: "grammar", groupTitle: "Grammar / Sentence Pattern", title: "Grammar Games", duration: 5, activityType: "game", skippable: true },
    { id: "topic-conversation", groupId: "topic", groupTitle: "Topic / Conversation", title: "Topic Conversation", duration: 2, activityType: "conversation" },
    { id: "show-book", groupId: "book-review", groupTitle: "Book & Review", title: "Show Book", duration: 10, activityType: "book" },
    { id: "quiz", groupId: "book-review", groupTitle: "Book & Review", title: "Quiz", duration: 8, activityType: "check" },
    { id: "homework", groupId: "book-review", groupTitle: "Book & Review", title: "Homework", duration: 2, activityType: "homework" }
  ];

  const VOCABULARY_GAMES = [
    { id: "random", title: "Random" },
    { id: "reveal", title: "Reveal" },
    { id: "matching", title: "Matching" },
    { id: "dice", title: "Dice" }
  ];

  const GRAMMAR_GAMES = [
    { id: "sentence-match", title: "Sentence Match" },
    { id: "substitution", title: "Substitution" },
    { id: "picture-sentence", title: "Picture Sentence" },
    { id: "dice-qa", title: "Dice Q&A" },
    { id: "quick-response", title: "Quick Response" }
  ];

  function phaseById(id) {
    return CLASSROOM_FLOW.find((phase) => phase.id === id);
  }

  function makePhase(id, phaseSteps, extra = {}) {
    const definition = phaseById(id);
    return makePhaseFromDefinition(definition, phaseSteps, extra);
  }

  function makePhaseFromDefinition(definition, phaseSteps, extra = {}) {
    const steps = phaseSteps.map((page, index) => ({
      ...page,
      duration: null,
      phase: definition.groupId,
      phaseId: definition.id,
      phaseTitle: definition.title,
      phaseGroupId: definition.groupId,
      phaseGroupTitle: definition.groupTitle,
      phaseDuration: definition.duration,
      activityType: page.activityType || definition.activityType,
      content: page.content || page.instruction || "",
      skippable: page.skippable ?? definition.skippable ?? false,
      phaseStepIndex: index + 1,
      phaseStepTotal: phaseSteps.length
    }));
    return { ...definition, ...extra, steps };
  }

  function customPhase(id, groupId, groupTitle, title, duration, activityType, phaseSteps, extra = {}) {
    return makePhaseFromDefinition({ id, groupId, groupTitle, title, duration, activityType }, phaseSteps, extra);
  }

  function warmUpPages(unit, unitIndex, day) {
    if (unitIndex === 0 && day === 1) {
      return [step("warm-up-throw-catch", "warmup", "Throw and Catch", null, "準備一顆軟球。接到球的學生說：I am [name].，再把球傳給下一位。", {
        activity: "visual-activity",
        activityImage: "assets/images/throw-and-catch-activity.png",
        imageAlt: "Students introduce themselves while throwing and catching a soft ball"
      })];
    }
    return [step("warm-up-review", "warmup", day === 1 ? "Hello & Topic Warm Up" : "Quick Review", null,
      day === 1
        ? `Greet the class and introduce today’s topic: ${unit.topic}.`
        : "Use two quick questions to review the previous lesson, then introduce today’s goal.",
      { activity: "review" })];
  }

  function vocabularyGameIdeas(bookId, unit, day) {
    const names = bookId === "book-1" ? (window.BOOK1_ACTIVITIES?.[unit.id]?.[`day${day}`] || []) : [];
    return names.map((name, index) => ({
      title: name,
      image: activityImageFor(unit, day, name),
      id: `idea-${index + 1}`
    }));
  }

  function grammarTeachingPages(unit) {
    const pages = unit.sentenceCards?.length
      ? sentencePatternSteps(unit, 0, unit.mainSentences)
      : sentenceReviewSteps(unit, 0);
    return pages.length ? pages : [step("grammar-pattern", "grammar", "Grammar Teaching", null, unit.mainSentences.join("\n"), {
      activity: "sentence-pattern",
      mainSentences: unit.mainSentences
    })];
  }

  function grammarCheckPage(unit) {
    return step("grammar-check", "check", "Grammar Check", null, "Show one prompt at a time. Students answer with a complete sentence before revealing the model answer.", {
      activity: "grammar-check",
      activityType: "check",
      vocabulary: vocabularyItems(unit.vocabulary),
      mainSentences: unit.mainSentences,
      topic: unit.topic
    });
  }

  function topicPages(unit) {
    const sampleQuestion = unit.mainSentences.find((sentence) => sentence.includes("?")) || `What can you say about ${unit.topic}?`;
    const sampleAnswer = unit.mainSentences.find((sentence) => !sentence.includes("?")) || unit.mainSentences[0] || "Answer in a complete sentence.";
    return [
      step("topic-intro", "speaking", "Topic Introduction", null, `Connect today’s words and sentence pattern to the situation: ${unit.topic}.`, { activity: "topic-conversation", topicRole: "intro", topic: unit.topic }),
      step("teacher-question", "speaking", "Teacher Questions", null, sampleQuestion, { activity: "topic-conversation", topicRole: "teacher-question", modelAnswer: sampleAnswer, mainSentences: unit.mainSentences }),
      step("pair-practice", "speaking", "Pair Practice", null, "Student A asks. Student B answers in a complete sentence. Then switch roles.", { activity: "topic-conversation", topicRole: "pair", mainSentences: unit.mainSentences }),
      step("speaking-challenge", "speaking", "Speaking Challenge", null, `Use at least one vocabulary word and one sentence pattern to talk about ${unit.topic}.`, { activity: "topic-conversation", topicRole: "challenge", vocabulary: vocabularyItems(unit.vocabulary), mainSentences: unit.mainSentences })
    ];
  }

  function practiceStep(id, title, prompt, options = {}) {
    return step(id, "check", title, null, "", {
      activity: "guided-practice",
      practice: {
        prompt,
        choices: options.choices || [],
        answer: options.answer || "",
        modelAnswer: options.modelAnswer || options.answer || "",
        image: options.image || "",
        sprite: options.sprite || null,
        visual: options.visual || "",
        word: options.word || ""
      }
    });
  }

  function u1Image(unit, word) {
    return vocabularyItems(unit.vocabulary).find((item) => item.word === word)?.image || "";
  }

  function u1PassportSteps(unit) {
    const sentences = [
      ["I am a boy.", "我是一個男孩。", "boy"],
      ["You are a girl.", "你是一個女孩。", "girl"],
      ["I am a student.", "我是學生。", "student"],
      ["You are a teacher.", "你是老師。", "teacher"],
      ["I am a man.", "我是男人。", "man"],
      ["You are a woman.", "你是女人。", "woman"]
    ];
    return sentences.map(([text, translation, word], index) => step(`u1-passport-${index + 1}`, "grammar", "Passport Sentence", null, "", {
      activity: "passport-sentence",
      passportSentence: { text, translation, image: u1Image(unit, word), word },
      questionIndex: index + 1,
      questionTotal: sentences.length
    }));
  }

  function unit1Day1(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const phases = [
      customPhase("u1-d1-vocabulary", "vocabulary", "Vocabulary", "Vocabulary", 6, "teaching", vocabularySteps(unit, 0, "u1-d1-word", "Vocabulary"), { vocabulary }),
      customPhase("u1-d1-pronouns", "grammar", "I / You", "I = 我 / You = 你", 4, "teaching", [
        practiceStep("u1-d1-i", "I = 我", "I", { modelAnswer: "I = 我（說話的人自己）" }),
        practiceStep("u1-d1-you", "You = 你", "You", { modelAnswer: "You = 你（正在對話的對方）" })
      ]),
      customPhase("u1-d1-be", "grammar", "I am / You are", "I am / You are", 5, "teaching", [
        practiceStep("u1-d1-i-am", "I am", "I ___", { modelAnswer: "I am" }),
        practiceStep("u1-d1-you-are", "You are", "You ___", { modelAnswer: "You are" })
      ]),
      customPhase("u1-d1-guided", "practice", "Guided Practice", "Guided Practice", 8, "check", [
        practiceStep("u1-d1-g1", "Choose the subject", "___ am a boy.", { choices: ["I", "You"], answer: "I", image: u1Image(unit, "boy") }),
        practiceStep("u1-d1-g2", "Choose the subject", "___ are a girl.", { choices: ["I", "You"], answer: "You", image: u1Image(unit, "girl") }),
        practiceStep("u1-d1-g3", "Choose the be verb", "I ___ a student.", { choices: ["am", "are"], answer: "am", image: u1Image(unit, "student") }),
        practiceStep("u1-d1-g4", "Choose the be verb", "You ___ a teacher.", { choices: ["am", "are"], answer: "are", image: u1Image(unit, "teacher") })
      ]),
      customPhase("u1-d1-passport", "passport", "Passport", "Passport · Six Sentences", 10, "teaching", u1PassportSteps(unit)),
      customPhase("u1-d1-phonics", "phonics", "Phonics", "Phonics", 7, "teaching", [step("u1-d1-phonics", "phonics", "Phonics", null, phonicsText(unit.phonics), { activity: "phonics-drill", phonics: unit.phonics })]),
      customPhase("u1-d1-show-book", "book-review", "Book", "Show Book", 5, "book", [step("u1-d1-show-book", "showbook", "Show Book", null, "", { activity: "book-resource", embedUrl: unit.materials?.bookUrl || "" })])
    ];
    return makeUnit1Lesson(unit, 1, "第一次理解", phases);
  }

  function unit1Day2(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const phases = [
      customPhase("u1-d2-vocab-review", "vocabulary", "Vocabulary", "Quick Vocabulary Review", 5, "game", vocabularySteps(unit, 0, "u1-d2-review", "Quick Vocabulary Review"), { vocabulary }),
      customPhase("u1-d2-pattern", "grammar", "I / You + am / are", "I / You / am / are", 5, "teaching", [
        practiceStep("u1-d2-pattern-i", "I → am", "I ___", { modelAnswer: "I am" }),
        practiceStep("u1-d2-pattern-you", "You → are", "You ___", { modelAnswer: "You are" })
      ]),
      customPhase("u1-d2-subject", "practice", "Practice", "Choose the Subject", 7, "check", [
        practiceStep("u1-d2-s1", "Choose I or You", "___ am a man.", { choices: ["I", "You"], answer: "I", image: u1Image(unit, "man") }),
        practiceStep("u1-d2-s2", "Choose I or You", "___ are a woman.", { choices: ["I", "You"], answer: "You", image: u1Image(unit, "woman") })
      ]),
      customPhase("u1-d2-be", "practice", "Practice", "Choose the Be Verb", 7, "check", [
        practiceStep("u1-d2-b1", "Choose am or are", "I ___ a student.", { choices: ["am", "are"], answer: "am", image: u1Image(unit, "student") }),
        practiceStep("u1-d2-b2", "Choose am or are", "You ___ a teacher.", { choices: ["am", "are"], answer: "are", image: u1Image(unit, "teacher") })
      ]),
      customPhase("u1-d2-match", "practice", "Practice", "Sentence Match", 7, "check", [
        practiceStep("u1-d2-m1", "Match the sentence", "I + am + boy", { choices: ["I am a boy.", "You are a boy."], answer: "I am a boy.", image: u1Image(unit, "boy") }),
        practiceStep("u1-d2-m2", "Match the sentence", "You + are + girl", { choices: ["I am a girl.", "You are a girl."], answer: "You are a girl.", image: u1Image(unit, "girl") })
      ]),
      customPhase("u1-d2-person", "practice", "Practice", "I or You?", 5, "check", [
        practiceStep("u1-d2-p1", "Who is speaking?", "The speaker talks about oneself.", { choices: ["I", "You"], answer: "I" }),
        practiceStep("u1-d2-p2", "Who is the listener?", "The speaker talks to another person.", { choices: ["I", "You"], answer: "You" })
      ]),
      customPhase("u1-d2-order", "practice", "Practice", "Sentence Order", 7, "check", [
        practiceStep("u1-d2-o1", "Choose the correct order", "am / I / a boy", { choices: ["I am a boy.", "I a boy am."], answer: "I am a boy." }),
        practiceStep("u1-d2-o2", "Choose the correct order", "a teacher / are / You", { choices: ["You are a teacher.", "You teacher are a."], answer: "You are a teacher." })
      ]),
      customPhase("u1-d2-check", "check", "Mastery Check", "I → am / You → are", 2, "check", [
        practiceStep("u1-d2-check", "Complete both patterns", "I ___   /   You ___", { choices: ["am / are", "are / am"], answer: "am / are" })
      ])
    ];
    return makeUnit1Lesson(unit, 2, "練到熟", phases);
  }

  function unit1Day3(unit) {
    const phases = [
      customPhase("u1-d3-review", "review", "Review", "Affirmative Review", 5, "teaching", u1PassportSteps(unit)),
      customPhase("u1-d3-supplement", "supplement", "Course Supplement", "課程補充：肯定句與否定句", 5, "teaching", [
        practiceStep("u1-d3-note", "Not a Passport Sentence", "這是 U1 課本補充內容，不列入護照六句。", { modelAnswer: "肯定句加入 not，變成否定句。" })
      ]),
      customPhase("u1-d3-not", "grammar", "Affirmative / Negative", "Add not", 8, "teaching", [
        practiceStep("u1-d3-n1", "Affirmative → Negative", "I am a boy.", { modelAnswer: "I am not a boy.", image: u1Image(unit, "boy") }),
        practiceStep("u1-d3-n2", "Affirmative → Negative", "You are a girl.", { modelAnswer: "You are not a girl.", image: u1Image(unit, "girl") })
      ]),
      customPhase("u1-d3-guided", "practice", "Guided Practice", "Make It Negative", 10, "check", [
        practiceStep("u1-d3-g1", "Add not", "I am a student.", { modelAnswer: "I am not a student." }),
        practiceStep("u1-d3-g2", "Add not", "You are a teacher.", { modelAnswer: "You are not a teacher." }),
        practiceStep("u1-d3-g3", "Add not", "I am a man.", { modelAnswer: "I am not a man." }),
        practiceStep("u1-d3-g4", "Add not", "You are a woman.", { modelAnswer: "You are not a woman." })
      ]),
      customPhase("u1-d3-choice", "practice", "Practice", "Choose the Negative Sentence", 8, "check", [
        practiceStep("u1-d3-c1", "Choose the negative sentence", "I am a boy.", { choices: ["I am not a boy.", "I not am a boy."], answer: "I am not a boy." }),
        practiceStep("u1-d3-c2", "Choose the negative sentence", "You are a girl.", { choices: ["You are not a girl.", "You not are a girl."], answer: "You are not a girl." })
      ]),
      customPhase("u1-d3-check", "check", "Check", "Affirmative or Negative?", 7, "check", [
        practiceStep("u1-d3-check1", "Choose the correct sentence", "I + am + not + girl", { choices: ["I am not a girl.", "I are not a girl."], answer: "I am not a girl." }),
        practiceStep("u1-d3-check2", "Choose the correct sentence", "You + are + not + boy", { choices: ["You are not a boy.", "You am not a boy."], answer: "You are not a boy." })
      ]),
      customPhase("u1-d3-homework", "book-review", "Wrap Up", "Homework", 2, "homework", [step("u1-d3-homework", "homework", "Homework", null, "", { activity: "homework" })])
    ];
    return makeUnit1Lesson(unit, 3, "補充課", phases);
  }

  function unit1Day4(unit) {
    const phases = [
      customPhase("u1-d4-review", "review", "Review", "I / You + am / are + not", 5, "teaching", [
        practiceStep("u1-d4-review", "Pattern Review", "I → am   /   You → are   /   not → negative", { modelAnswer: "I am / You are / am not / are not" })
      ]),
      customPhase("u1-d4-error", "practice", "Advanced Practice", "Error Correction", 8, "check", [
        practiceStep("u1-d4-e1", "Fix the sentence", "I are a boy. ✕", { modelAnswer: "I am a boy." }),
        practiceStep("u1-d4-e2", "Fix the sentence", "You am a teacher. ✕", { modelAnswer: "You are a teacher." }),
        practiceStep("u1-d4-e3", "Fix the sentence", "I are not a girl. ✕", { modelAnswer: "I am not a girl." })
      ]),
      customPhase("u1-d4-order", "practice", "Advanced Practice", "Sentence Order", 8, "check", [
        practiceStep("u1-d4-o1", "Choose the correct order", "not / am / I / a girl", { choices: ["I am not a girl.", "I not am a girl."], answer: "I am not a girl." }),
        practiceStep("u1-d4-o2", "Choose the correct order", "You / not / are / a student", { choices: ["You are not a student.", "You not are a student."], answer: "You are not a student." })
      ]),
      customPhase("u1-d4-choice", "practice", "Advanced Practice", "Multiple Choice", 7, "check", [
        practiceStep("u1-d4-c1", "Choose the correct sentence", "I + boy", { choices: ["I am a boy.", "I are a boy."], answer: "I am a boy.", image: u1Image(unit, "boy") }),
        practiceStep("u1-d4-c2", "Choose the correct sentence", "You + woman", { choices: ["You am a woman.", "You are a woman."], answer: "You are a woman.", image: u1Image(unit, "woman") })
      ]),
      customPhase("u1-d4-picture", "practice", "Advanced Practice", "Picture Sentence", 7, "check", [
        practiceStep("u1-d4-p1", "Make a sentence", "I + student", { modelAnswer: "I am a student.", image: u1Image(unit, "student") }),
        practiceStep("u1-d4-p2", "Make a sentence", "You + teacher", { modelAnswer: "You are a teacher.", image: u1Image(unit, "teacher") })
      ]),
      customPhase("u1-d4-transform", "practice", "Advanced Practice", "Affirmative → Negative", 7, "check", [
        practiceStep("u1-d4-t1", "Make it negative", "I am a boy.", { modelAnswer: "I am not a boy." }),
        practiceStep("u1-d4-t2", "Make it negative", "You are a girl.", { modelAnswer: "You are not a girl." })
      ]),
      customPhase("u1-d4-check", "check", "Final Check", "Mixed Challenge", 3, "check", [
        practiceStep("u1-d4-final", "Choose the correct sentence", "I + not + girl", { choices: ["I am not a girl.", "I are not a girl."], answer: "I am not a girl." })
      ])
    ];
    return makeUnit1Lesson(unit, 4, "進階應用", phases);
  }

  function makeUnit1Lesson(unit, day, dayGoal, phases) {
    const steps = phases.flatMap((phase) => phase.steps);
    const totalDuration = phases.reduce((total, phase) => total + (Number(phase.duration) || 0), 0);
    return {
      id: `day-${day}`,
      title: `${unit.title} · Day ${day}｜${dayGoal}`,
      day: `Day ${day}`,
      dayGoal,
      curriculum: curriculumFor(unit),
      phases,
      duration: totalDuration,
      durationMinutes: totalDuration,
      steps,
      source: { document: "B1_教學流程.pdf", page: B1_DAY_PAGES[0]?.[Math.min(day - 1, 3)] }
    };
  }

  function book1Unit1Lessons(unit) {
    return [unit1Day1(unit), unit1Day2(unit), unit1Day3(unit), unit1Day4(unit)];
  }

  function u2Asset(unit, word) {
    return vocabularyItems(unit.vocabulary).find((item) => item.word.toLowerCase() === word.toLowerCase()) || { word };
  }

  function u2PracticeStep(unit, id, title, prompt, word, options = {}) {
    return practiceStep(id, title, prompt, { ...u2Asset(unit, word), word, ...options });
  }

  const U2_PASSPORT_PAIRS = [
    { pronoun: "he", word: "father" },
    { pronoun: "she", word: "mother" },
    { pronoun: "he", word: "grandfather" },
    { pronoun: "she", word: "grandmother" },
    { pronoun: "he", word: "brother" },
    { pronoun: "she", word: "sister" },
    { pronoun: "he", word: "uncle" },
    { pronoun: "she", word: "aunt" }
  ];

  function u2PassportSteps(unit, order = U2_PASSPORT_PAIRS, prefix = "u2-passport") {
    return order.map(({ pronoun, word }, index) => {
      const subject = pronoun === "he" ? "He" : "She";
      return u2PracticeStep(unit, `${prefix}-${index + 1}`, `Passport ${index + 1} / ${order.length}`, `Who is ${pronoun}?`, word, {
        modelAnswer: `${subject} is my ${word}.`
      });
    });
  }

  function makeUnit2Lesson(unit, day, dayGoal, phases) {
    const steps = phases.flatMap((phase) => phase.steps);
    const totalDuration = phases.reduce((total, phase) => total + (Number(phase.duration) || 0), 0);
    return {
      id: `day-${day}`,
      title: `${unit.title} · Day ${day}｜${dayGoal}`,
      day: `Day ${day}`,
      dayGoal,
      curriculum: curriculumFor(unit),
      phases,
      duration: totalDuration,
      durationMinutes: totalDuration,
      steps,
      source: { document: "B1_教學流程.pdf", page: B1_DAY_PAGES[1]?.[day - 1] }
    };
  }

  function unit2Day1(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const phases = [
      customPhase("u2-d1-vocabulary", "vocabulary", "Family Vocabulary", "Family Vocabulary", 10, "teaching", vocabularySteps(unit, 0, "u2-d1-word", "Family Vocabulary"), { vocabulary }),
      customPhase("u2-d1-he-she", "grammar", "He / She", "he = 他 / she = 她", 5, "teaching", [
        u2PracticeStep(unit, "u2-d1-he", "he = 他", "he", "father", { modelAnswer: "he = 他（男生）" }),
        u2PracticeStep(unit, "u2-d1-she", "she = 她", "she", "mother", { modelAnswer: "she = 她（女生）" })
      ]),
      customPhase("u2-d1-pattern", "grammar", "Who is he / she?", "Listen and Recognize", 5, "teaching", [
        u2PracticeStep(unit, "u2-d1-pattern-he", "Listen and Recognize", "Who is he?", "father", { modelAnswer: "He is my father." }),
        u2PracticeStep(unit, "u2-d1-pattern-she", "Listen and Recognize", "Who is she?", "mother", { modelAnswer: "She is my mother." })
      ]),
      customPhase("u2-d1-passport", "passport", "Passport", "Passport Sentences", 16, "teaching", u2PassportSteps(unit)),
      customPhase("u2-d1-check", "check", "Listening Check", "Who is he or she?", 9, "check", [
        u2PracticeStep(unit, "u2-d1-check-father", "Listen and Choose", "Who is he?", "father", { choices: ["He is my father.", "She is my mother."], answer: "He is my father." }),
        u2PracticeStep(unit, "u2-d1-check-mother", "Listen and Choose", "Who is she?", "mother", { choices: ["He is my grandfather.", "She is my mother."], answer: "She is my mother." }),
        u2PracticeStep(unit, "u2-d1-check-brother", "Listen and Choose", "Who is he?", "brother", { choices: ["He is my brother.", "She is my sister."], answer: "He is my brother." }),
        u2PracticeStep(unit, "u2-d1-check-sister", "Listen and Choose", "Who is she?", "sister", { choices: ["He is my uncle.", "She is my sister."], answer: "She is my sister." })
      ])
    ];
    return makeUnit2Lesson(unit, 1, "Family + Who is he / she?", phases);
  }

  function unit2Day2(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const randomPassportOrder = [
      U2_PASSPORT_PAIRS[4], U2_PASSPORT_PAIRS[1], U2_PASSPORT_PAIRS[2], U2_PASSPORT_PAIRS[7],
      U2_PASSPORT_PAIRS[0], U2_PASSPORT_PAIRS[5], U2_PASSPORT_PAIRS[6], U2_PASSPORT_PAIRS[3]
    ];
    const phases = [
      customPhase("u2-d2-vocabulary", "vocabulary", "Vocabulary Review", "Quick Family Review", 6, "review", vocabularySteps(unit, 0, "u2-d2-word", "Quick Family Review"), { vocabulary }),
      customPhase("u2-d2-he-she", "practice", "He or She?", "Look and Choose", 8, "check", [
        u2PracticeStep(unit, "u2-d2-he-father", "Choose he or she", "father", "father", { choices: ["he", "she"], answer: "he" }),
        u2PracticeStep(unit, "u2-d2-she-mother", "Choose he or she", "mother", "mother", { choices: ["he", "she"], answer: "she" }),
        u2PracticeStep(unit, "u2-d2-he-brother", "Choose he or she", "brother", "brother", { choices: ["he", "she"], answer: "he" }),
        u2PracticeStep(unit, "u2-d2-she-sister", "Choose he or she", "sister", "sister", { choices: ["he", "she"], answer: "she" })
      ]),
      customPhase("u2-d2-question", "practice", "Question Practice", "Who is he / she?", 7, "check", [
        u2PracticeStep(unit, "u2-d2-q1", "Choose the question", "father", "father", { choices: ["Who is he?", "Who is she?"], answer: "Who is he?" }),
        u2PracticeStep(unit, "u2-d2-q2", "Choose the question", "mother", "mother", { choices: ["Who is he?", "Who is she?"], answer: "Who is she?" })
      ]),
      customPhase("u2-d2-complete", "practice", "Sentence Match", "He / She is my ____.", 7, "check", [
        u2PracticeStep(unit, "u2-d2-c1", "Complete the answer", "He is my ____.", "grandfather", { choices: ["grandfather", "grandmother", "aunt"], answer: "grandfather" }),
        u2PracticeStep(unit, "u2-d2-c2", "Complete the answer", "She is my ____.", "aunt", { choices: ["uncle", "brother", "aunt"], answer: "aunt" })
      ]),
      customPhase("u2-d2-quick", "practice", "Quick Pictures", "Say the Family Word", 5, "check", [
        u2PracticeStep(unit, "u2-d2-quick-grandfather", "Quick Picture", "Who is this?", "grandfather", { modelAnswer: "grandfather" }),
        u2PracticeStep(unit, "u2-d2-quick-mother", "Quick Picture", "Who is this?", "mother", { modelAnswer: "mother" }),
        u2PracticeStep(unit, "u2-d2-quick-brother", "Quick Picture", "Who is this?", "brother", { modelAnswer: "brother" })
      ]),
      customPhase("u2-d2-passport", "passport", "Passport Review", "Random Order", 10, "review", u2PassportSteps(unit, randomPassportOrder, "u2-d2-passport")),
      customPhase("u2-d2-check", "check", "Mastery Check", "Who is he / she?", 2, "check", [
        u2PracticeStep(unit, "u2-d2-final", "Choose the answer", "Who is she?", "grandmother", { choices: ["He is my grandfather.", "She is my grandmother."], answer: "She is my grandmother." })
      ])
    ];
    return makeUnit2Lesson(unit, 2, "Who is he / she? 練熟", phases);
  }

  function unit2Day3(unit) {
    const phases = [
      customPhase("u2-d3-u1-review", "review", "U1 Review", "I → am / You → are", 5, "review", [
        practiceStep("u2-d3-r1", "U1 Review", "I ___", { choices: ["am", "are", "is"], answer: "am" }),
        practiceStep("u2-d3-r2", "U1 Review", "You ___", { choices: ["am", "are", "is"], answer: "are" })
      ]),
      customPhase("u2-d3-map", "grammar", "Grammar Map", "Subject + Be Verb", 8, "teaching", [
        practiceStep("u2-d3-map", "Grammar Map", "I am  ·  You are  ·  He is  ·  She is", { modelAnswer: "I → am   |   You → are   |   He / She → is" })
      ]),
      customPhase("u2-d3-compare", "grammar", "Compare Sentences", "Subject Changes · Be Verb Changes", 8, "teaching", [
        u2PracticeStep(unit, "u2-d3-i", "Compare", "I am a student.", "student", { modelAnswer: "I → am" }),
        u2PracticeStep(unit, "u2-d3-you", "Compare", "You are a teacher.", "teacher", { modelAnswer: "You → are" }),
        u2PracticeStep(unit, "u2-d3-he", "Compare", "He is my father.", "father", { modelAnswer: "He → is" }),
        u2PracticeStep(unit, "u2-d3-she", "Compare", "She is my mother.", "mother", { modelAnswer: "She → is" })
      ]),
      customPhase("u2-d3-choose", "practice", "Choose the Be Verb", "am / are / is", 10, "check", [
        u2PracticeStep(unit, "u2-d3-c1", "Choose the be verb", "He ___ my father.", "father", { choices: ["am", "are", "is"], answer: "is" }),
        u2PracticeStep(unit, "u2-d3-c2", "Choose the be verb", "She ___ my mother.", "mother", { choices: ["am", "are", "is"], answer: "is" }),
        practiceStep("u2-d3-c3", "Choose the be verb", "I ___ a student.", { choices: ["am", "are", "is"], answer: "am" }),
        practiceStep("u2-d3-c4", "Choose the be verb", "You ___ a teacher.", { choices: ["am", "are", "is"], answer: "are" })
      ]),
      customPhase("u2-d3-error", "practice", "Error Correction", "Fix the Be Verb", 8, "check", [
        u2PracticeStep(unit, "u2-d3-e1", "Fix the sentence", "She are my mother. ✕", "mother", { modelAnswer: "She is my mother. ✓" }),
        u2PracticeStep(unit, "u2-d3-e2", "Fix the sentence", "He am my father. ✕", "father", { modelAnswer: "He is my father. ✓" })
      ]),
      customPhase("u2-d3-check", "check", "Grammar Check", "I / You / He / She", 6, "check", [
        practiceStep("u2-d3-final1", "Complete the Grammar Map", "I ___ / You ___ / He ___ / She ___", { choices: ["am / are / is / is", "is / are / am / is"], answer: "am / are / is / is" }),
        u2PracticeStep(unit, "u2-d3-final2", "Choose the correct sentence", "father", "father", { choices: ["He is my father.", "He are my father."], answer: "He is my father." })
      ])
    ];
    return makeUnit2Lesson(unit, 3, "第三人稱 be 動詞", phases);
  }

  function unit2Day4(unit) {
    const phases = [
      customPhase("u2-d4-map", "review", "Grammar Map Review", "I / You / He / She", 5, "review", [
        practiceStep("u2-d4-map", "Grammar Map", "I am  ·  You are  ·  He is  ·  She is", { modelAnswer: "am / are / is" })
      ]),
      customPhase("u2-d4-subject", "practice", "Choose the Subject", "I / You / He / She", 8, "check", [
        practiceStep("u2-d4-s1", "Choose the subject", "___ am a boy.", { choices: ["I", "You", "He", "She"], answer: "I" }),
        practiceStep("u2-d4-s2", "Choose the subject", "___ are a girl.", { choices: ["I", "You", "He", "She"], answer: "You" }),
        u2PracticeStep(unit, "u2-d4-s3", "Choose the subject", "___ is my brother.", "brother", { choices: ["I", "You", "He", "She"], answer: "He" }),
        u2PracticeStep(unit, "u2-d4-s4", "Choose the subject", "___ is my sister.", "sister", { choices: ["I", "You", "He", "She"], answer: "She" })
      ]),
      customPhase("u2-d4-error", "practice", "Error Correction", "Fix the Sentence", 8, "check", [
        practiceStep("u2-d4-e1", "Fix the sentence", "I is a student. ✕", { modelAnswer: "I am a student. ✓" }),
        practiceStep("u2-d4-e2", "Fix the sentence", "You am a teacher. ✕", { modelAnswer: "You are a teacher. ✓" }),
        u2PracticeStep(unit, "u2-d4-e3", "Fix the sentence", "He are my father. ✕", "father", { modelAnswer: "He is my father. ✓" }),
        u2PracticeStep(unit, "u2-d4-e4", "Check the sentence", "She is my mother. ✓", "mother", { modelAnswer: "Correct! She is my mother." })
      ]),
      customPhase("u2-d4-order", "practice", "Sentence Order", "Put the Words in Order", 8, "check", [
        u2PracticeStep(unit, "u2-d4-o1", "Choose the correct order", "father / my / is / He", "father", { choices: ["He is my father.", "He my father is."], answer: "He is my father." }),
        u2PracticeStep(unit, "u2-d4-o2", "Choose the correct order", "my / She / sister / is", "sister", { choices: ["She my is sister.", "She is my sister."], answer: "She is my sister." })
      ]),
      customPhase("u2-d4-complete", "practice", "Complete the Sentence", "Choose the Be Verb", 6, "check", [
        u2PracticeStep(unit, "u2-d4-c1", "Choose the be verb", "Who is he? He ___ my uncle.", "uncle", { choices: ["am", "are", "is"], answer: "is" }),
        u2PracticeStep(unit, "u2-d4-c2", "Choose the be verb", "Who is she? She ___ my aunt.", "aunt", { choices: ["am", "are", "is"], answer: "is" })
      ]),
      customPhase("u2-d4-speaking", "speaking", "Picture Speaking", "Say a Complete Sentence", 7, "check", [
        u2PracticeStep(unit, "u2-d4-p1", "Look and Say", "Who is he?", "grandfather", { modelAnswer: "He is my grandfather." }),
        u2PracticeStep(unit, "u2-d4-p2", "Look and Say", "Who is she?", "grandmother", { modelAnswer: "She is my grandmother." }),
        u2PracticeStep(unit, "u2-d4-p3", "Look and Say", "Who is he?", "brother", { modelAnswer: "He is my brother." })
      ]),
      customPhase("u2-d4-check", "check", "Final Check", "Mixed Challenge", 3, "check", [
        practiceStep("u2-d4-final", "Complete all four", "I ___ / You ___ / He ___ / She ___", { choices: ["am / are / is / is", "are / am / is / are"], answer: "am / are / is / is" })
      ])
    ];
    return makeUnit2Lesson(unit, 4, "進階混合", phases);
  }

  function book1Unit2Lessons(unit) {
    return [unit2Day1(unit), unit2Day2(unit), unit2Day3(unit), unit2Day4(unit)];
  }

  function u3Asset(unit, word) {
    return vocabularyItems(unit.vocabulary).find((item) => item.word.toLowerCase() === word.toLowerCase()) || { word };
  }

  function u3PracticeStep(unit, id, title, prompt, word, options = {}) {
    return practiceStep(id, title, prompt, { ...u3Asset(unit, word), word, ...options });
  }

  function makeUnit3Lesson(unit, day, dayGoal, phases) {
    const steps = phases.flatMap((phase) => phase.steps);
    const totalDuration = phases.reduce((total, phase) => total + (Number(phase.duration) || 0), 0);
    return {
      id: `day-${day}`,
      title: `${unit.title} · Day ${day}｜${dayGoal}`,
      day: `Day ${day}`,
      dayGoal,
      curriculum: curriculumFor(unit),
      phases,
      duration: totalDuration,
      durationMinutes: totalDuration,
      steps,
      source: { document: "B1_教學流程.pdf", page: B1_DAY_PAGES[2]?.[day - 1] }
    };
  }

  function unit3Day1(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const phases = [
      customPhase("u3-d1-numbers", "vocabulary", "Numbers", "Numbers One to Ten", 10, "teaching", vocabularySteps(unit, 0, "u3-d1-number", "Numbers One to Ten"), { vocabulary }),
      customPhase("u3-d1-how-old", "grammar", "How old?", "How old = 幾歲", 5, "teaching", [
        practiceStep("u3-d1-meaning", "How old = 幾歲", "How old are you?", { modelAnswer: "你幾歲？" })
      ]),
      customPhase("u3-d1-pattern", "grammar", "Age Pattern", "How old are you?", 6, "teaching", [
        u3PracticeStep(unit, "u3-d1-pattern-one", "Ask and Answer", "How old are you?", "one", { modelAnswer: "I am one year old." }),
        u3PracticeStep(unit, "u3-d1-pattern-five", "Ask and Answer", "How old are you?", "five", { modelAnswer: "I am five years old." })
      ]),
      customPhase("u3-d1-year-years", "grammar", "Year / Years", "One year · Two or more years", 5, "teaching", [
        u3PracticeStep(unit, "u3-d1-year", "One = year", "I am one ___ old.", "one", { choices: ["year", "years"], answer: "year" }),
        u3PracticeStep(unit, "u3-d1-years", "Two or more = years", "I am two ___ old.", "two", { choices: ["year", "years"], answer: "years" })
      ]),
      customPhase("u3-d1-passport", "passport", "Passport", "Passport Sentences", 8, "teaching", [
        u3PracticeStep(unit, "u3-d1-passport-one", "Passport 1 / 2", "How old are you?", "one", { modelAnswer: "I am one year old." }),
        u3PracticeStep(unit, "u3-d1-passport-two", "Passport 2 / 2", "How old are you?", "two", { modelAnswer: "I am two years old." })
      ]),
      customPhase("u3-d1-guided", "practice", "Guided Practice", "Look and Answer", 6, "check", [
        u3PracticeStep(unit, "u3-d1-g3", "Choose the answer", "How old are you?", "three", { choices: ["I am three years old.", "I are three years old."], answer: "I am three years old." }),
        u3PracticeStep(unit, "u3-d1-g7", "Choose the answer", "How old are you?", "seven", { choices: ["I am seven year old.", "I am seven years old."], answer: "I am seven years old." })
      ]),
      customPhase("u3-d1-check", "check", "Age Check", "How old are you?", 5, "check", [
        u3PracticeStep(unit, "u3-d1-check-one", "Complete the sentence", "I am one ___ old.", "one", { choices: ["year", "years"], answer: "year" }),
        u3PracticeStep(unit, "u3-d1-check-nine", "Complete the sentence", "I am nine ___ old.", "nine", { choices: ["year", "years"], answer: "years" })
      ])
    ];
    return makeUnit3Lesson(unit, 1, "Numbers + 年齡基本問答", phases);
  }

  function unit3Day2(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const phases = [
      customPhase("u3-d2-review", "vocabulary", "Numbers", "Quick Number Review", 6, "review", vocabularySteps(unit, 0, "u3-d2-number", "Quick Number Review"), { vocabulary }),
      customPhase("u3-d2-random", "practice", "Age Practice", "Random Number Answers", 10, "check", [
        u3PracticeStep(unit, "u3-d2-r2", "Look and Answer", "How old are you?", "two", { modelAnswer: "I am two years old." }),
        u3PracticeStep(unit, "u3-d2-r5", "Look and Answer", "How old are you?", "five", { modelAnswer: "I am five years old." }),
        u3PracticeStep(unit, "u3-d2-r8", "Look and Answer", "How old are you?", "eight", { modelAnswer: "I am eight years old." }),
        u3PracticeStep(unit, "u3-d2-r10", "Look and Answer", "How old are you?", "ten", { modelAnswer: "I am ten years old." })
      ]),
      customPhase("u3-d2-number-answer", "practice", "Number Response", "See a Number · Say the Sentence", 8, "check", [
        u3PracticeStep(unit, "u3-d2-n4", "Say the full sentence", "4", "four", { modelAnswer: "I am four years old." }),
        u3PracticeStep(unit, "u3-d2-n6", "Say the full sentence", "6", "six", { modelAnswer: "I am six years old." }),
        u3PracticeStep(unit, "u3-d2-n9", "Say the full sentence", "9", "nine", { modelAnswer: "I am nine years old." })
      ]),
      customPhase("u3-d2-year-years", "practice", "Year or Years?", "Choose year / years", 6, "check", [
        u3PracticeStep(unit, "u3-d2-y1", "Choose year or years", "I am one ___ old.", "one", { choices: ["year", "years"], answer: "year" }),
        u3PracticeStep(unit, "u3-d2-y10", "Choose year or years", "I am ten ___ old.", "ten", { choices: ["year", "years"], answer: "years" })
      ]),
      customPhase("u3-d2-order", "practice", "Sentence Order", "Put the Words in Order", 8, "check", [
        u3PracticeStep(unit, "u3-d2-o5", "Choose the correct order", "five / am / years old / I", "five", { choices: ["I am five years old.", "I five am years old."], answer: "I am five years old." }),
        practiceStep("u3-d2-oq", "Choose the correct order", "old / are / How / you / ?", { choices: ["How old are you?", "How are old you?"], answer: "How old are you?" })
      ]),
      customPhase("u3-d2-mixed", "practice", "Mixed Practice", "Question and Answer", 5, "check", [
        u3PracticeStep(unit, "u3-d2-m3", "Choose the full answer", "How old are you?", "three", { choices: ["I am three years old.", "I are three year old."], answer: "I am three years old." }),
        u3PracticeStep(unit, "u3-d2-m7", "Choose the full answer", "How old are you?", "seven", { choices: ["I am seven years old.", "I am seven year old."], answer: "I am seven years old." })
      ]),
      customPhase("u3-d2-check", "check", "Mastery Check", "I am ___ years old.", 2, "check", [
        u3PracticeStep(unit, "u3-d2-final", "Say without help", "How old are you?", "six", { modelAnswer: "I am six years old." })
      ])
    ];
    return makeUnit3Lesson(unit, 2, "年齡句型熟練", phases);
  }

  function unit3Day3(unit) {
    const phases = [
      customPhase("u3-d3-map", "review", "Grammar Map", "Be Verb Review", 6, "review", [
        practiceStep("u3-d3-map", "Grammar Map", "I am  ·  You are  ·  He is  ·  She is", { modelAnswer: "I → am   |   You → are   |   He / She → is" })
      ]),
      customPhase("u3-d3-questions", "grammar", "Age Questions", "Question Changes with the Subject", 8, "teaching", [
        practiceStep("u3-d3-q-you", "Ask you", "How old are you?", { modelAnswer: "you → are" }),
        practiceStep("u3-d3-q-he", "Ask about a boy", "How old is he?", { visual: "👦", modelAnswer: "he → is" }),
        practiceStep("u3-d3-q-she", "Ask about a girl", "How old is she?", { visual: "👧", modelAnswer: "she → is" })
      ]),
      customPhase("u3-d3-he", "grammar", "He + is", "How old is he?", 8, "teaching", [
        u3PracticeStep(unit, "u3-d3-he3", "Ask and Answer", "How old is he?", "three", { modelAnswer: "He is three years old." }),
        u3PracticeStep(unit, "u3-d3-he8", "Ask and Answer", "How old is he?", "eight", { modelAnswer: "He is eight years old." })
      ]),
      customPhase("u3-d3-she", "grammar", "She + is", "How old is she?", 8, "teaching", [
        u3PracticeStep(unit, "u3-d3-she5", "Ask and Answer", "How old is she?", "five", { modelAnswer: "She is five years old." }),
        u3PracticeStep(unit, "u3-d3-she6", "Ask and Answer", "How old is she?", "six", { modelAnswer: "She is six years old." })
      ]),
      customPhase("u3-d3-be", "practice", "Choose the Be Verb", "are / is", 8, "check", [
        practiceStep("u3-d3-b-you", "Choose the be verb", "How old ___ you?", { choices: ["are", "is"], answer: "are" }),
        practiceStep("u3-d3-b-he", "Choose the be verb", "How old ___ he?", { visual: "👦", choices: ["are", "is"], answer: "is" }),
        practiceStep("u3-d3-b-she", "Choose the be verb", "How old ___ she?", { visual: "👧", choices: ["are", "is"], answer: "is" })
      ]),
      customPhase("u3-d3-compare", "practice", "Question Comparison", "you → are · he / she → is", 5, "check", [
        practiceStep("u3-d3-compare", "Choose the correct map", "How old ___ you? / How old ___ he? / How old ___ she?", { choices: ["are / is / is", "is / are / are"], answer: "are / is / is" })
      ]),
      customPhase("u3-d3-check", "check", "Grammar Check", "How old + be verb + subject?", 2, "check", [
        practiceStep("u3-d3-final", "Complete both questions", "How old ___ you?  ·  How old ___ she?", { choices: ["are / is", "is / are"], answer: "are / is" })
      ])
    ];
    return makeUnit3Lesson(unit, 3, "把 he / she 接回來", phases);
  }

  function unit3Day4(unit) {
    const phases = [
      customPhase("u3-d4-formula", "review", "Question Formula", "How old + Be Verb + Subject?", 5, "review", [
        practiceStep("u3-d4-formula", "Question Formula", "How old + be verb + subject?", { modelAnswer: "How old are you?  ·  How old is he?  ·  How old is she?" })
      ]),
      customPhase("u3-d4-be", "practice", "Choose the Be Verb", "am / are / is", 8, "check", [
        practiceStep("u3-d4-b1", "Choose the be verb", "How old ___ you?", { choices: ["am", "are", "is"], answer: "are" }),
        practiceStep("u3-d4-b2", "Choose the be verb", "How old ___ she?", { visual: "👧", choices: ["are", "is"], answer: "is" }),
        practiceStep("u3-d4-b3", "Choose the be verb", "How old ___ he?", { visual: "👦", choices: ["am", "are", "is"], answer: "is" })
      ]),
      customPhase("u3-d4-error", "practice", "Error Correction", "Fix the Sentence", 8, "check", [
        practiceStep("u3-d4-e1", "Fix the question", "How old are he? ✕", { visual: "👦", modelAnswer: "How old is he? ✓" }),
        u3PracticeStep(unit, "u3-d4-e2", "Fix the answer", "He are six years old. ✕", "six", { modelAnswer: "He is six years old. ✓" }),
        u3PracticeStep(unit, "u3-d4-e3", "Fix year / years", "She is five year old. ✕", "five", { modelAnswer: "She is five years old. ✓" })
      ]),
      customPhase("u3-d4-order", "practice", "Sentence Order", "Put the Words in Order", 8, "check", [
        practiceStep("u3-d4-o1", "Choose the correct order", "old / is / How / she / ?", { visual: "👧", choices: ["How old is she?", "How is old she?"], answer: "How old is she?" }),
        u3PracticeStep(unit, "u3-d4-o2", "Choose the correct order", "years old / is / He / eight", "eight", { choices: ["He is eight years old.", "He eight is years old."], answer: "He is eight years old." })
      ]),
      customPhase("u3-d4-picture", "speaking", "Picture Q&A", "Ask and Answer", 10, "check", [
        practiceStep("u3-d4-p-boy", "Look and Ask", "👦  8", { visual: "👦 8️⃣", modelAnswer: "How old is he?\nHe is eight years old." }),
        practiceStep("u3-d4-p-girl", "Look and Ask", "👧  5", { visual: "👧 5️⃣", modelAnswer: "How old is she?\nShe is five years old." }),
        practiceStep("u3-d4-p-you", "Ask your partner", "YOU  7", { visual: "🙂 7️⃣", modelAnswer: "How old are you?\nI am seven years old." })
      ]),
      customPhase("u3-d4-check", "check", "Final Check", "U1–U3 Mixed Challenge", 6, "check", [
        practiceStep("u3-d4-final1", "Complete the questions", "How old ___ you? / How old ___ he? / How old ___ she?", { choices: ["are / is / is", "is / are / is"], answer: "are / is / is" }),
        u3PracticeStep(unit, "u3-d4-final2", "Choose the full answer", "How old is he?", "eight", { choices: ["He is eight years old.", "He are eight year old."], answer: "He is eight years old." })
      ])
    ];
    return makeUnit3Lesson(unit, 4, "混合進階", phases);
  }

  function book1Unit3Lessons(unit) {
    return [unit3Day1(unit), unit3Day2(unit), unit3Day3(unit), unit3Day4(unit)];
  }

  function u4Asset(unit, word) {
    return vocabularyItems(unit.vocabulary).find((item) => item.word.toLowerCase() === word.toLowerCase()) || { word };
  }

  function u4PracticeStep(unit, id, title, prompt, word, options = {}) {
    return practiceStep(id, title, prompt, { ...u4Asset(unit, word), word, ...options });
  }

  function makeUnit4Lesson(unit, day, dayGoal, phases) {
    const steps = phases.flatMap((phase) => phase.steps);
    const totalDuration = phases.reduce((total, phase) => total + (Number(phase.duration) || 0), 0);
    return {
      id: `day-${day}`,
      title: `${unit.title} · Day ${day}｜${dayGoal}`,
      day: `Day ${day}`,
      dayGoal,
      curriculum: curriculumFor(unit),
      phases,
      duration: totalDuration,
      durationMinutes: totalDuration,
      steps,
      source: { document: "B1_教學流程.pdf", page: B1_DAY_PAGES[3]?.[day - 1] }
    };
  }

  function unit4Day1(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const phases = [
      customPhase("u4-d1-adjectives", "vocabulary", "Adjectives", "Adjective Vocabulary", 10, "teaching", vocabularySteps(unit, 0, "u4-d1-word", "Adjective Vocabulary"), { vocabulary }),
      customPhase("u4-d1-question-rule", "grammar", "Question Rule", "Move the Be Verb to the Front", 7, "teaching", [
        u4PracticeStep(unit, "u4-d1-rule-you", "Statement → Question", "You are happy.  →  Are you happy?", "happy", { modelAnswer: "are moves before you" }),
        u4PracticeStep(unit, "u4-d1-rule-he", "Statement → Question", "He is chubby.  →  Is he chubby?", "chubby", { modelAnswer: "is moves before he" })
      ]),
      customPhase("u4-d1-you", "grammar", "Are you...?", "You are → Are you...?", 6, "teaching", [
        u4PracticeStep(unit, "u4-d1-you-happy", "Make a question", "You are happy.", "happy", { modelAnswer: "Are you happy?" }),
        u4PracticeStep(unit, "u4-d1-you-tall", "Make a question", "You are tall.", "tall", { modelAnswer: "Are you tall?" })
      ]),
      customPhase("u4-d1-he", "grammar", "Is he...?", "He is → Is he...?", 6, "teaching", [
        u4PracticeStep(unit, "u4-d1-he-chubby", "Make a question", "He is chubby.", "chubby", { modelAnswer: "Is he chubby?" }),
        u4PracticeStep(unit, "u4-d1-he-short", "Make a question", "He is short.", "short", { modelAnswer: "Is he short?" })
      ]),
      customPhase("u4-d1-passport", "passport", "Passport", "Positive Passport Sentences", 10, "teaching", [
        u4PracticeStep(unit, "u4-d1-p-happy", "Passport 1 / 5", "I am happy.", "happy", { modelAnswer: "Are you happy?  Yes, I am." }),
        u4PracticeStep(unit, "u4-d1-p-chubby", "Passport 2 / 5", "He is chubby.", "chubby", { modelAnswer: "Is he chubby?  Yes, he is." }),
        u4PracticeStep(unit, "u4-d1-p-young", "Passport 3 / 5", "I am young.", "young", { modelAnswer: "Are you young?  Yes, I am." }),
        u4PracticeStep(unit, "u4-d1-p-short", "Passport 4 / 5", "He is short.", "short", { modelAnswer: "Is he short?  Yes, he is." }),
        u4PracticeStep(unit, "u4-d1-p-cute", "Passport 5 / 5", "I am cute.", "cute", { modelAnswer: "Are you cute?  Yes, I am." })
      ]),
      customPhase("u4-d1-check", "check", "Question Check", "Statement or Question?", 6, "check", [
        u4PracticeStep(unit, "u4-d1-c1", "Choose the question", "You are happy.", "happy", { choices: ["Are you happy?", "Is you happy?"], answer: "Are you happy?" }),
        u4PracticeStep(unit, "u4-d1-c2", "Choose the question", "He is chubby.", "chubby", { choices: ["Are he chubby?", "Is he chubby?"], answer: "Is he chubby?" })
      ])
    ];
    return makeUnit4Lesson(unit, 1, "形容詞＋Yes/No 問句", phases);
  }

  function unit4Day2(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const phases = [
      customPhase("u4-d2-review", "vocabulary", "Adjectives", "Quick Adjective Review", 6, "review", vocabularySteps(unit, 0, "u4-d2-word", "Quick Adjective Review"), { vocabulary }),
      customPhase("u4-d2-map", "grammar", "Subject + Be Verb", "you → are · he / she → is", 5, "review", [
        practiceStep("u4-d2-map", "Question Map", "you → are  ·  he → is  ·  she → is", { modelAnswer: "Are you...?  ·  Is he...?  ·  Is she...?" })
      ]),
      customPhase("u4-d2-you", "practice", "Are you...?", "Question + Positive Answer", 8, "check", [
        u4PracticeStep(unit, "u4-d2-y-happy", "Ask and Answer", "Are you happy?", "happy", { modelAnswer: "Yes, I am." }),
        u4PracticeStep(unit, "u4-d2-y-tall", "Ask and Answer", "Are you tall?", "tall", { modelAnswer: "Yes, I am." }),
        u4PracticeStep(unit, "u4-d2-y-young", "Ask and Answer", "Are you young?", "young", { modelAnswer: "Yes, I am." })
      ]),
      customPhase("u4-d2-he", "practice", "Is he...?", "Question + Positive Answer", 8, "check", [
        u4PracticeStep(unit, "u4-d2-h-short", "Ask and Answer", "Is he short?", "short", { modelAnswer: "Yes, he is." }),
        u4PracticeStep(unit, "u4-d2-h-chubby", "Ask and Answer", "Is he chubby?", "chubby", { modelAnswer: "Yes, he is." })
      ]),
      customPhase("u4-d2-she", "practice", "Is she...?", "Question + Positive Answer", 8, "check", [
        u4PracticeStep(unit, "u4-d2-s-cute", "Ask and Answer", "Is she cute?", "cute", { modelAnswer: "Yes, she is." }),
        u4PracticeStep(unit, "u4-d2-s-thin", "Ask and Answer", "Is she thin?", "thin", { modelAnswer: "Yes, she is." })
      ]),
      customPhase("u4-d2-mixed", "practice", "Mixed Questions", "Choose the Correct Question", 8, "check", [
        u4PracticeStep(unit, "u4-d2-m-you", "Choose the question", "you + happy", "happy", { choices: ["Are you happy?", "Is you happy?"], answer: "Are you happy?" }),
        u4PracticeStep(unit, "u4-d2-m-he", "Choose the question", "he + short", "short", { choices: ["Are he short?", "Is he short?"], answer: "Is he short?" }),
        u4PracticeStep(unit, "u4-d2-m-she", "Choose the question", "she + cute", "cute", { choices: ["Is she cute?", "Are she cute?"], answer: "Is she cute?" })
      ]),
      customPhase("u4-d2-check", "check", "Mastery Check", "Question + Answer", 2, "check", [
        u4PracticeStep(unit, "u4-d2-final", "Choose the correct pair", "Is she cute?", "cute", { choices: ["Yes, she is.", "Yes, she are."], answer: "Yes, she is." })
      ])
    ];
    return makeUnit4Lesson(unit, 2, "問句＋肯定回答練熟", phases);
  }

  function unit4Day3(unit) {
    const phases = [
      customPhase("u4-d3-map", "grammar", "Answer Map", "Yes / No Answer Map", 8, "teaching", [
        practiceStep("u4-d3-map-i", "I Answer Map", "Yes, I am.  /  No, I am not.", { visual: "🙂", modelAnswer: "Are you...? → I am / I am not" }),
        practiceStep("u4-d3-map-he", "He Answer Map", "Yes, he is.  /  No, he is not.", { visual: "👦", modelAnswer: "Is he...? → he is / he is not" }),
        practiceStep("u4-d3-map-she", "She Answer Map", "Yes, she is.  /  No, she is not.", { visual: "👧", modelAnswer: "Is she...? → she is / she is not" })
      ]),
      customPhase("u4-d3-you", "practice", "Are you...?", "Negative Answers", 7, "check", [
        u4PracticeStep(unit, "u4-d3-y-tall", "Answer No", "Are you tall?", "tall", { modelAnswer: "No, I am not." }),
        u4PracticeStep(unit, "u4-d3-y-sad", "Answer No", "Are you sad?", "sad", { modelAnswer: "No, I am not." })
      ]),
      customPhase("u4-d3-he", "practice", "Is he...?", "Negative Answers", 7, "check", [
        u4PracticeStep(unit, "u4-d3-h-old", "Answer No", "Is he old?", "old", { modelAnswer: "No, he is not." }),
        u4PracticeStep(unit, "u4-d3-h-thin", "Answer No", "Is he thin?", "thin", { modelAnswer: "No, he is not." })
      ]),
      customPhase("u4-d3-she", "practice", "Is she...?", "Negative Answers", 7, "check", [
        u4PracticeStep(unit, "u4-d3-s-sad", "Answer No", "Is she sad?", "sad", { modelAnswer: "No, she is not." }),
        u4PracticeStep(unit, "u4-d3-s-short", "Answer No", "Is she short?", "short", { modelAnswer: "No, she is not." })
      ]),
      customPhase("u4-d3-choice", "practice", "Choose the No Answer", "Match the Subject", 8, "check", [
        u4PracticeStep(unit, "u4-d3-c-you", "Choose the answer", "Are you old?", "old", { choices: ["No, I am not.", "No, you are not."], answer: "No, I am not." }),
        u4PracticeStep(unit, "u4-d3-c-he", "Choose the answer", "Is he sad?", "sad", { choices: ["No, he is not.", "No, he are not."], answer: "No, he is not." }),
        u4PracticeStep(unit, "u4-d3-c-she", "Choose the answer", "Is she tall?", "tall", { choices: ["No, she is not.", "No, she am not."], answer: "No, she is not." })
      ]),
      customPhase("u4-d3-not", "practice", "Not Review", "Fix the Negative Answer", 6, "check", [
        practiceStep("u4-d3-n1", "Fix the answer", "No, I not am. ✕", { modelAnswer: "No, I am not. ✓" }),
        practiceStep("u4-d3-n2", "Fix the answer", "No, he not is. ✕", { modelAnswer: "No, he is not. ✓" }),
        practiceStep("u4-d3-n3", "Fix the answer", "No, she are not. ✕", { modelAnswer: "No, she is not. ✓" })
      ]),
      customPhase("u4-d3-check", "check", "Answer Check", "Yes or No", 2, "check", [
        u4PracticeStep(unit, "u4-d3-final", "Choose the correct answer", "Is she sad?", "sad", { choices: ["No, she is not.", "No, she not is."], answer: "No, she is not." })
      ])
    ];
    return makeUnit4Lesson(unit, 3, "加入否定回答", phases);
  }

  function unit4Day4(unit) {
    const phases = [
      customPhase("u4-d4-map", "grammar", "Three Sentence Forms", "Affirmative · Negative · Question", 6, "review", [
        practiceStep("u4-d4-map", "Three Forms", "主詞 + be  ·  主詞 + be + not  ·  be + 主詞 ...?", { modelAnswer: "affirmative / negative / question" })
      ]),
      customPhase("u4-d4-three", "practice", "Three Forms", "Statement → Negative → Question", 10, "check", [
        u4PracticeStep(unit, "u4-d4-t-she", "Change all three forms", "She is tall.", "tall", { modelAnswer: "She is tall. → She is not tall. → Is she tall?" }),
        u4PracticeStep(unit, "u4-d4-t-he", "Change all three forms", "He is short.", "short", { modelAnswer: "He is short. → He is not short. → Is he short?" })
      ]),
      customPhase("u4-d4-question", "practice", "Make a Question", "Move Be to the Front", 8, "check", [
        u4PracticeStep(unit, "u4-d4-q-you", "Statement → Question", "You are happy.", "happy", { choices: ["Are you happy?", "Is you happy?"], answer: "Are you happy?" }),
        u4PracticeStep(unit, "u4-d4-q-she", "Statement → Question", "She is cute.", "cute", { choices: ["Is she cute?", "Are she cute?"], answer: "Is she cute?" })
      ]),
      customPhase("u4-d4-error", "practice", "Error Correction", "Fix the Question or Answer", 8, "check", [
        u4PracticeStep(unit, "u4-d4-e1", "Fix the question", "Are he happy? ✕", "happy", { modelAnswer: "Is he happy? ✓" }),
        u4PracticeStep(unit, "u4-d4-e2", "Fix the question", "Is you young? ✕", "young", { modelAnswer: "Are you young? ✓" }),
        u4PracticeStep(unit, "u4-d4-e3", "Fix the answer", "Yes, she are. ✕", "cute", { modelAnswer: "Yes, she is. ✓" })
      ]),
      customPhase("u4-d4-transform", "practice", "Sentence Transformation", "Affirmative / Negative / Question", 8, "check", [
        u4PracticeStep(unit, "u4-d4-x1", "Make it negative", "You are happy.", "happy", { modelAnswer: "You are not happy." }),
        u4PracticeStep(unit, "u4-d4-x2", "Make it a question", "You are happy.", "happy", { modelAnswer: "Are you happy?" }),
        u4PracticeStep(unit, "u4-d4-x3", "Answer the question", "Is he short?", "short", { modelAnswer: "Yes, he is." })
      ]),
      customPhase("u4-d4-check", "check", "Final Check", "Choose the Sentence Form", 5, "check", [
        u4PracticeStep(unit, "u4-d4-final1", "Choose the question", "she + tall", "tall", { choices: ["She is tall.", "She is not tall.", "Is she tall?"], answer: "Is she tall?" }),
        practiceStep("u4-d4-final2", "Complete the rules", "肯定句 / 否定句 / 問句", { modelAnswer: "subject + be / subject + be + not / be + subject...?" })
      ])
    ];
    return makeUnit4Lesson(unit, 4, "肯定、否定、問句混合", phases);
  }

  function book1Unit4Lessons(unit) {
    return [unit4Day1(unit), unit4Day2(unit), unit4Day3(unit), unit4Day4(unit)];
  }

  function sharedLessonFromUnit(unit, unitIndex, bookId, day) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const activityIdeas = vocabularyGameIdeas(bookId, unit, day);
    const ideaSplit = Math.ceil(activityIdeas.length / 2);
    const vocabularyIdeas = activityIdeas.slice(0, ideaSplit);
    const grammarIdeas = activityIdeas.slice(ideaSplit);
    const vocabCheck = vocabularyPracticeSteps(unit, 0);
    const phases = [
      makePhase("warm-up", warmUpPages(unit, unitIndex, day)),
      makePhase("vocabulary-teaching", vocabularySteps(unit, 0, "vocabulary", "Vocabulary Teaching"), { vocabulary }),
      makePhase("vocabulary-games", [
        step("vocabulary-games", "game", "Vocabulary Games", null, "Choose 2–3 games. Every game can be replayed, completed, or skipped.", {
          activity: "flow-games", gameScope: "vocabulary", vocabulary, suggestedGames: VOCABULARY_GAMES, activityIdeas: vocabularyIdeas, skippable: true
        }),
        wordwallStep(unit, bookId, `day-${day}`, 0)
      ], { vocabulary, suggestedGames: VOCABULARY_GAMES, skippable: true }),
      makePhase("vocabulary-check", vocabCheck.length ? vocabCheck : [step("vocabulary-check", "check", "Vocabulary Check", null, "Show a picture and ask students to say or choose the correct word.", { activity: "vocabulary-check", vocabulary })]),
      makePhase("grammar-teaching", grammarTeachingPages(unit), { grammar: unit.mainSentences }),
      makePhase("grammar-games", [
        step("grammar-games", "game", "Grammar Games", null, "Choose 2–3 sentence games before the check.", {
          activity: "flow-games", gameScope: "grammar", vocabulary, mainSentences: unit.mainSentences, suggestedGames: GRAMMAR_GAMES, activityIdeas: grammarIdeas, skippable: true
        }),
        grammarCheckPage(unit)
      ], { grammar: unit.mainSentences, suggestedGames: GRAMMAR_GAMES, skippable: true }),
      makePhase("topic-conversation", topicPages(unit), { topic: unit.topic }),
      makePhase("show-book", [step("show-book", "showbook", "Show Book", null, "Open the original e-book or teaching slides and complete the assigned pages.", { activity: "book-resource", embedUrl: unit.materials?.bookUrl || "" })]),
      makePhase("quiz", quizSteps(unit, 0)),
      makePhase("homework", [step("homework", "homework", "Homework", null, "Review today’s vocabulary and sentence pattern. Finish the assigned book pages.", { activity: "homework" })])
    ];
    const steps = phases.flatMap((phase) => phase.steps);
    const totalDuration = phases.reduce((total, phase) => total + (Number(phase.duration) || 0), 0);
    return {
      id: `day-${day}`,
      title: `${unit.title} · Day ${day}`,
      day: `Day ${day}`,
      curriculum: curriculumFor(unit),
      phases,
      duration: totalDuration,
      durationMinutes: totalDuration,
      steps,
      source: bookId === "book-1" ? { document: "B1_教學流程.pdf", page: B1_DAY_PAGES[unitIndex]?.[day - 1] } : undefined
    };
  }

  function buildCatalog(books) {
    return books.map((book) => ({
      ...book,
      units: book.units.map((unit, unitIndex) => ({
        id: unit.id,
        title: `Unit ${unitIndex + 1}`,
        topic: unit.title,
        lessons: book.id === "book-1" && unit.id === "unit-1"
          ? book1Unit1Lessons(unit)
          : book.id === "book-1" && unit.id === "unit-2"
            ? book1Unit2Lessons(unit)
            : book.id === "book-1" && unit.id === "unit-3"
              ? book1Unit3Lessons(unit)
              : book.id === "book-1" && unit.id === "unit-4"
                ? book1Unit4Lessons(unit)
                : [1, 2].map((day) => sharedLessonFromUnit(unit, unitIndex, book.id, day))
      }))
    }));
  }

  window.TeachingFlow = { FLOW_TEMPLATE: CLASSROOM_FLOW, buildCatalog };
  window.COURSE_CATALOG = buildCatalog(window.CURRICULUM_BOOKS || []);
})();

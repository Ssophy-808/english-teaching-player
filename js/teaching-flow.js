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

  function sentenceTransformerStep(id, source, forms, options = {}) {
    return step(id, "practice", "Sentence Transformer", null, "", {
      activity: "sentence-transformer",
      transformer: {
        source,
        forms,
        image: options.image || "",
        sprite: options.sprite || null,
        visual: options.visual || "",
        word: options.word || ""
      }
    });
  }

  function practiceLoopStep(id, title, questions) {
    return step(id, "practice", title, null, "", {
      activity: "practice-loop",
      practiceLoop: { title, questions }
    });
  }

  function writeTimeStep(id, part, minutes, instruction) {
    return step(id, "writing", `Write Time · Part ${part}`, null, instruction, {
      activity: "write-time",
      worksheetPart: part,
      writeMinutes: minutes
    });
  }

  function liveSectionPhase(prefix, id, groupTitle, title, duration, activityType, instruction, extra = {}) {
    return customPhase(`${prefix}-${id}`, id, groupTitle, title, duration, activityType, [
      step(`${prefix}-${id}-step`, extra.type || "lesson", title, null, instruction, {
        activity: extra.activity || "lesson-section",
        ...extra
      })
    ]);
  }

  function liveTalkPhase(unit, prefix, prompt, modelAnswer) {
    return customPhase(`${prefix}-lets-talk`, "lets-talk", "Let’s Talk", "Let’s Talk", 6, "conversation", [
      step(`${prefix}-lets-talk-step`, "speaking", "Let’s Talk", null, prompt, {
        activity: "topic-conversation",
        topicRole: "teacher-question",
        topic: unit.topic,
        modelAnswer,
        mainSentences: unit.mainSentences
      })
    ]);
  }

  function liveVocabularyReviewPhase(unit, bookId, prefix, vocabulary) {
    return customPhase(`${prefix}-vocabulary-review`, "vocabulary-review", "Vocabulary Review", "Vocabulary Games & Check", 10, "game", [
      step(`${prefix}-vocabulary-games`, "game", "Vocabulary Games", null, "Choose a quick review game.", {
        activity: "flow-games",
        gameScope: "vocabulary",
        vocabulary,
        suggestedGames: VOCABULARY_GAMES,
        skippable: true
      }),
      wordwallStep(unit, bookId, "day-1", 0)
    ], { vocabulary, suggestedGames: VOCABULARY_GAMES, skippable: true });
  }

  function liveChantPhase(unit, prefix, chantLine) {
    return liveSectionPhase(prefix, "lets-chant", "Let’s Chant / Sing", "Let’s Chant / Sing", 6, "speaking",
      chantLine || `Chant the target words and pattern for ${unit.topic}.`, {
        activity: "lesson-section",
        mainSentences: unit.mainSentences
      });
  }

  function liveGrammarBookPhase(unit, prefix) {
    return liveSectionPhase(prefix, "grammar-book", "Grammar Book", "Grammar Book", 12, "book",
      "Complete the assigned Grammar Book pages.", {
        activity: "book-resource",
        embedUrl: unit.materials?.grammarBookUrl || ""
      });
  }

  function liveReadPhase(unit, prefix) {
    return liveSectionPhase(prefix, "lets-read", "Let’s Read", "Let’s Read", 18, "reading",
      "Open the official Live reading page. Read once for meaning, then read again and answer the comprehension questions.", {
        activity: "book-resource",
        embedUrl: unit.materials?.readUrl || unit.materials?.bookUrl || ""
      });
  }

  function livePhonicsPhase(unit, prefix) {
    const hasPhonics = unit.phonics?.review || unit.phonics?.groups?.length;
    return customPhase(`${prefix}-lets-say`, "lets-say", "Let’s Say", "Let’s Say · Phonics", 15, "phonics", [
      step(`${prefix}-lets-say-step`, "phonics", "Let’s Say · Phonics", null,
        hasPhonics ? phonicsText(unit.phonics) : "Open the official Live Let’s Say page for this Unit.", {
          activity: hasPhonics ? "phonics-drill" : "book-resource",
          phonics: hasPhonics ? unit.phonics : undefined,
          embedUrl: hasPhonics ? "" : (unit.materials?.bookUrl || "")
        })
    ]);
  }

  function liveShowBookPhase(unit, prefix) {
    return liveSectionPhase(prefix, "show-book", "Show Book", "Show Book", 8, "book",
      "Open the original Live e-book and finish today’s assigned section.", {
        activity: "book-resource",
        embedUrl: unit.materials?.bookUrl || ""
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
      customPhase("u1-d1-warm-up", "warm-up", "Warm Up", "Throw and Catch", 6, "speaking", [
        step("u1-d1-warm-up-step", "warmup", "Throw and Catch", null, "", {
          activity: "visual-activity",
          activityImage: "assets/images/throw-and-catch-activity.png",
          imageAlt: "Students introduce themselves while passing a soft ball"
        })
      ]),
      liveTalkPhase(unit, "u1-d1", "I am [name]. How are you?", "I am [name]. I am fine, thank you."),
      customPhase("u1-d1-vocabulary", "lets-learn", "Let’s Learn", "Let’s Learn · Vocabulary", 10, "teaching", vocabularySteps(unit, 0, "u1-d1-word", "Let’s Learn"), { vocabulary }),
      liveVocabularyReviewPhase(unit, "book-1", "u1-d1", vocabulary),
      liveChantPhase(unit, "u1-d1", "boy, girl, student, teacher, man, woman — listen, point, chant, and repeat."),
      customPhase("u1-d1-pronouns", "lets-practice", "Let’s Practice", "I = 我 / You = 你", 5, "teaching", [
        practiceStep("u1-d1-i", "I = 我", "I", { modelAnswer: "I = 我（說話的人自己）" }),
        practiceStep("u1-d1-you", "You = 你", "You", { modelAnswer: "You = 你（正在對話的對方）" })
      ]),
      customPhase("u1-d1-be", "lets-practice", "Let’s Practice", "I am / You are", 5, "teaching", [
        practiceStep("u1-d1-i-am", "I am", "I ___", { modelAnswer: "I am" }),
        practiceStep("u1-d1-you-are", "You are", "You ___", { modelAnswer: "You are" })
      ]),
      customPhase("u1-d1-passport", "lets-practice", "Let’s Practice", "Passport · Six Sentences", 10, "teaching", u1PassportSteps(unit)),
      customPhase("u1-d1-guided", "grammar-activity", "Grammar Activity", "Guided Practice", 10, "check", [
        practiceStep("u1-d1-g1", "Choose the subject", "___ am a boy.", { choices: ["I", "You"], answer: "I", image: u1Image(unit, "boy") }),
        practiceStep("u1-d1-g2", "Choose the subject", "___ are a girl.", { choices: ["I", "You"], answer: "You", image: u1Image(unit, "girl") }),
        practiceStep("u1-d1-g3", "Choose the be verb", "I ___ a student.", { choices: ["am", "are"], answer: "am", image: u1Image(unit, "student") }),
        practiceStep("u1-d1-g4", "Choose the be verb", "You ___ a teacher.", { choices: ["am", "are"], answer: "are", image: u1Image(unit, "teacher") })
      ]),
      liveGrammarBookPhase(unit, "u1-d1")
    ];
    return makeUnit1Lesson(unit, 1, "Let’s Talk → Learn → Chant → Practice → Grammar Book", phases);
  }

  function unit1Day2(unit) {
    const phases = [
      liveSectionPhase("u1-d2", "quick-review", "Quick Review", "Quick Review", 5, "review", "Review the six Unit 1 words and I am / You are."),
      customPhase("u1-d2-lets-speak", "lets-speak", "Let’s Speak", "Let’s Speak · Dialogue", 18, "conversation", [
        practiceStep("u1-d2-speak-1", "Dialogue 1", "A: I am Amy. How are you?", { modelAnswer: "B: I am Ben. I am fine, thank you." }),
        practiceStep("u1-d2-speak-2", "Change the names", "A: I am ______. How are you?", { modelAnswer: "B: I am ______. I am fine, thank you." }),
        practiceStep("u1-d2-speak-3", "Pair Practice", "Introduce yourself to a partner.", { modelAnswer: "I am [name]. How are you?" })
      ]),
      liveReadPhase(unit, "u1-d2"),
      customPhase("u1-d2-reading-check", "reading-check", "Reading Check", "Read & Respond", 10, "check", [
        practiceStep("u1-d2-read-check-1", "Who is speaking?", "The speaker says: I am Ludi.", { choices: ["I", "You"], answer: "I" }),
        practiceStep("u1-d2-read-check-2", "Complete the reply", "You ___ Lumi.", { choices: ["am", "are"], answer: "are" })
      ]),
      customPhase("u1-d2-speaking-activity", "speaking-activity", "Speaking Activity", "How Are You?", 6, "speaking", [
        step("u1-d2-how-are-you", "game", "How Are You?", null, "", {
          activity: "visual-activity",
          activityImage: "assets/images/how-are-you-activity.png",
          imageAlt: "Students walk around the classroom and practise introducing themselves"
        })
      ]),
      livePhonicsPhase(unit, "u1-d2"),
      liveShowBookPhase(unit, "u1-d2")
    ];
    return makeUnit1Lesson(unit, 2, "Let’s Speak → Read → Say", phases);
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
      dailyHandout: {
        day,
        pageStart: ((day - 1) * 4) + 1,
        pageEnd: day * 4,
        studentUrl: "assets/handouts/book1/unit1/book1-unit1-daily-handouts.pdf?v=2",
        teacherUrl: "assets/handouts/book1/unit1/book1-unit1-teacher-key.pdf?v=2"
      },
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

  function u5Asset(unit, word) {
    return vocabularyItems(unit.vocabulary).find((item) => item.word.toLowerCase() === word.toLowerCase()) || { word };
  }

  function u5PracticeStep(unit, id, title, prompt, word, options = {}) {
    return practiceStep(id, title, prompt, { ...u5Asset(unit, word), word, ...options });
  }

  function makeUnit5Lesson(unit, day, dayGoal, phases) {
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
      source: { document: "B1_教學流程.pdf", page: B1_DAY_PAGES[4]?.[day - 1] }
    };
  }

  function unit5Day1(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const passportWords = ["school bag", "ruler", "book", "pencil case", "pencil", "pen", "eraser", "desk"];
    const phases = [
      customPhase("u5-d1-stationery", "vocabulary", "Stationery", "Stationery Vocabulary", 10, "teaching", vocabularySteps(unit, 0, "u5-d1-word", "Stationery Vocabulary"), { vocabulary }),
      customPhase("u5-d1-map", "grammar", "Grammar Map", "Add It → is", 6, "teaching", [
        practiceStep("u5-d1-map", "Expanded Grammar Map", "I → am  ·  You → are  ·  He → is  ·  She → is  ·  It → is", { modelAnswer: "It = 它／這個東西；物品用 It is..." })
      ]),
      customPhase("u5-d1-pattern", "grammar", "What is it?", "It = 它／這個東西", 6, "teaching", [
        u5PracticeStep(unit, "u5-d1-pen", "Ask and Answer", "What is it?", "pen", { modelAnswer: "It is a pen." }),
        u5PracticeStep(unit, "u5-d1-book", "Ask and Answer", "What is it?", "book", { modelAnswer: "It is a book." })
      ]),
      customPhase("u5-d1-passport", "passport", "Passport", "Eight Passport Questions", 16, "teaching", passportWords.map((word, index) =>
        u5PracticeStep(unit, `u5-d1-passport-${index + 1}`, `Passport ${index + 1} / ${passportWords.length}`, "What is it?", word, {
          modelAnswer: `It is ${word === "eraser" ? "an" : "a"} ${word}.`
        })
      )),
      customPhase("u5-d1-check", "check", "Object Check", "What is it?", 7, "check", [
        u5PracticeStep(unit, "u5-d1-c-pencil", "Choose the answer", "What is it?", "pencil", { choices: ["It is a pencil.", "He is a pencil."], answer: "It is a pencil." }),
        u5PracticeStep(unit, "u5-d1-c-desk", "Choose the answer", "What is it?", "desk", { choices: ["It are a desk.", "It is a desk."], answer: "It is a desk." }),
        u5PracticeStep(unit, "u5-d1-c-eraser", "Choose the answer", "What is it?", "eraser", { choices: ["It is an eraser.", "It is a eraser."], answer: "It is an eraser." })
      ])
    ];
    return makeUnit5Lesson(unit, 1, "It is + 物品", phases);
  }

  function unit5Day2(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const phases = [
      customPhase("u5-d2-review", "vocabulary", "Stationery", "Quick Stationery Review", 6, "review", vocabularySteps(unit, 0, "u5-d2-word", "Quick Stationery Review"), { vocabulary }),
      customPhase("u5-d2-look", "practice", "Look and Answer", "What is it?", 10, "check", [
        u5PracticeStep(unit, "u5-d2-l-bag", "Look and Answer", "What is it?", "school bag", { modelAnswer: "It is a school bag." }),
        u5PracticeStep(unit, "u5-d2-l-ruler", "Look and Answer", "What is it?", "ruler", { modelAnswer: "It is a ruler." }),
        u5PracticeStep(unit, "u5-d2-l-case", "Look and Answer", "What is it?", "pencil case", { modelAnswer: "It is a pencil case." }),
        u5PracticeStep(unit, "u5-d2-l-eraser", "Look and Answer", "What is it?", "eraser", { modelAnswer: "It is an eraser." })
      ]),
      customPhase("u5-d2-choose", "practice", "Choose the Word", "Complete It is a / an...", 8, "check", [
        u5PracticeStep(unit, "u5-d2-c-pen", "Choose the word", "It is a ____.", "pen", { choices: ["pen", "desk", "book"], answer: "pen" }),
        u5PracticeStep(unit, "u5-d2-c-chair", "Choose the word", "It is a ____.", "chair", { choices: ["ruler", "chair", "pencil"], answer: "chair" }),
        u5PracticeStep(unit, "u5-d2-c-eraser", "Choose the word", "It is an ____.", "eraser", { choices: ["eraser", "book", "school bag"], answer: "eraser" })
      ]),
      customPhase("u5-d2-article", "grammar", "A / An", "A or An?", 7, "check", [
        u5PracticeStep(unit, "u5-d2-a-pen", "Choose a or an", "___ pen", "pen", { choices: ["a", "an"], answer: "a" }),
        u5PracticeStep(unit, "u5-d2-a-ruler", "Choose a or an", "___ ruler", "ruler", { choices: ["a", "an"], answer: "a" }),
        u5PracticeStep(unit, "u5-d2-an-eraser", "Choose a or an", "___ eraser", "eraser", { choices: ["a", "an"], answer: "an" })
      ]),
      customPhase("u5-d2-order", "practice", "Sentence Order", "Put the Words in Order", 8, "check", [
        u5PracticeStep(unit, "u5-d2-o-ruler", "Choose the correct order", "It / is / a / ruler", "ruler", { choices: ["It is a ruler.", "It a ruler is."], answer: "It is a ruler." }),
        u5PracticeStep(unit, "u5-d2-o-eraser", "Choose the correct order", "an / eraser / is / It", "eraser", { choices: ["It is an eraser.", "It an is eraser."], answer: "It is an eraser." }),
        practiceStep("u5-d2-o-question", "Choose the correct order", "is / What / it / ?", { choices: ["What is it?", "What it is?"], answer: "What is it?" })
      ]),
      customPhase("u5-d2-match", "practice", "Picture Matching", "Match Picture and Word", 4, "check", [
        u5PracticeStep(unit, "u5-d2-m-book", "Match the picture", "Choose the word.", "book", { choices: ["book", "pen", "desk"], answer: "book" }),
        u5PracticeStep(unit, "u5-d2-m-desk", "Match the picture", "Choose the word.", "desk", { choices: ["chair", "desk", "ruler"], answer: "desk" })
      ]),
      customPhase("u5-d2-check", "check", "Mastery Check", "What is it?", 2, "check", [
        u5PracticeStep(unit, "u5-d2-final", "Say the full answer", "What is it?", "pencil", { modelAnswer: "It is a pencil." })
      ])
    ];
    return makeUnit5Lesson(unit, 2, "What is it? 練熟", phases);
  }

  function unit5Day3(unit) {
    const phases = [
      customPhase("u5-d3-three", "grammar", "Three Sentence Forms", "It is / It is not / Is it...?", 8, "teaching", [
        u5PracticeStep(unit, "u5-d3-three-pen", "Three Forms", "It is a pen.", "pen", { modelAnswer: "It is a pen. → It is not a pen. → Is it a pen?" }),
        u5PracticeStep(unit, "u5-d3-three-book", "Three Forms", "It is a book.", "book", { modelAnswer: "It is a book. → It is not a book. → Is it a book?" })
      ]),
      customPhase("u5-d3-positive", "practice", "Affirmative", "It is + Object", 8, "check", [
        u5PracticeStep(unit, "u5-d3-p-ruler", "Make an affirmative sentence", "ruler", "ruler", { modelAnswer: "It is a ruler." }),
        u5PracticeStep(unit, "u5-d3-p-eraser", "Make an affirmative sentence", "eraser", "eraser", { modelAnswer: "It is an eraser." })
      ]),
      customPhase("u5-d3-negative", "practice", "Negative", "It is not + Object", 8, "check", [
        u5PracticeStep(unit, "u5-d3-n-pen", "Make it negative", "It is a pen.", "pen", { modelAnswer: "It is not a pen." }),
        u5PracticeStep(unit, "u5-d3-n-desk", "Make it negative", "It is a desk.", "desk", { modelAnswer: "It is not a desk." })
      ]),
      customPhase("u5-d3-question", "practice", "Question", "Is it + Object?", 8, "check", [
        u5PracticeStep(unit, "u5-d3-q-pen", "Make a question", "It is a pen.", "pen", { modelAnswer: "Is it a pen?" }),
        u5PracticeStep(unit, "u5-d3-q-eraser", "Make a question", "It is an eraser.", "eraser", { modelAnswer: "Is it an eraser?" })
      ]),
      customPhase("u5-d3-answer", "practice", "Yes / No Answers", "Is it...?", 8, "check", [
        u5PracticeStep(unit, "u5-d3-y-eraser", "Answer Yes", "Is it an eraser?", "eraser", { modelAnswer: "Yes, it is." }),
        u5PracticeStep(unit, "u5-d3-no-pen", "Answer No", "Is it a pen?", "eraser", { modelAnswer: "No, it is not." }),
        u5PracticeStep(unit, "u5-d3-no-book", "Answer No", "Is it a book?", "ruler", { modelAnswer: "No, it is not." })
      ]),
      customPhase("u5-d3-compare", "grammar", "Same Question Rule", "She is... / It is...", 3, "review", [
        practiceStep("u5-d3-compare", "Compare the rule", "She is happy. → Is she happy?  ·  It is a pen. → Is it a pen?", { modelAnswer: "Move is before she / it." })
      ]),
      customPhase("u5-d3-check", "check", "Form Check", "Affirmative · Negative · Question", 2, "check", [
        u5PracticeStep(unit, "u5-d3-final", "Choose the question", "It is a pencil.", "pencil", { choices: ["Is it a pencil?", "It is not a pencil."], answer: "Is it a pencil?" })
      ])
    ];
    return makeUnit5Lesson(unit, 3, "it 的肯定、否定、問句", phases);
  }

  function unit5Day4(unit) {
    const phases = [
      customPhase("u5-d4-mix", "grammar", "Two Question Types", "What is it? / Is it...?", 8, "review", [
        u5PracticeStep(unit, "u5-d4-mix-pencil", "Compare the questions", "What is it?  ·  Is it a pen?", "pencil", { modelAnswer: "It is a pencil.  ·  No, it is not." }),
        u5PracticeStep(unit, "u5-d4-mix-book", "Compare the questions", "What is it?  ·  Is it a book?", "book", { modelAnswer: "It is a book.  ·  Yes, it is." })
      ]),
      customPhase("u5-d4-what", "practice", "What is it?", "Name the Object", 8, "check", [
        u5PracticeStep(unit, "u5-d4-w-pencil", "Look and Answer", "What is it?", "pencil", { modelAnswer: "It is a pencil." }),
        u5PracticeStep(unit, "u5-d4-w-case", "Look and Answer", "What is it?", "pencil case", { modelAnswer: "It is a pencil case." }),
        u5PracticeStep(unit, "u5-d4-w-desk", "Look and Answer", "What is it?", "desk", { modelAnswer: "It is a desk." })
      ]),
      customPhase("u5-d4-is-it", "practice", "Is it...?", "Answer Yes or No", 8, "check", [
        u5PracticeStep(unit, "u5-d4-i-pen", "Answer the question", "Is it a pen?", "pencil", { choices: ["Yes, it is.", "No, it is not."], answer: "No, it is not." }),
        u5PracticeStep(unit, "u5-d4-i-ruler", "Answer the question", "Is it a ruler?", "ruler", { choices: ["Yes, it is.", "No, it is not."], answer: "Yes, it is." }),
        u5PracticeStep(unit, "u5-d4-i-book", "Answer the question", "Is it a pen?", "book", { choices: ["Yes, it is.", "No, it is not."], answer: "No, it is not." })
      ]),
      customPhase("u5-d4-error", "practice", "Error Correction", "Fix the Sentence", 8, "check", [
        u5PracticeStep(unit, "u5-d4-e1", "Fix the sentence", "It are a book. ✕", "book", { modelAnswer: "It is a book. ✓" }),
        u5PracticeStep(unit, "u5-d4-e2", "Fix a / an", "Is it a eraser? ✕", "eraser", { modelAnswer: "Is it an eraser? ✓" }),
        practiceStep("u5-d4-e3", "Fix the question", "What are it? ✕", { modelAnswer: "What is it? ✓" })
      ]),
      customPhase("u5-d4-transform", "practice", "Three-Form Transformation", "Affirmative → Negative → Question", 8, "check", [
        u5PracticeStep(unit, "u5-d4-t-desk", "Change all three forms", "It is a desk.", "desk", { modelAnswer: "It is a desk. → It is not a desk. → Is it a desk?" }),
        u5PracticeStep(unit, "u5-d4-t-eraser", "Change all three forms", "It is an eraser.", "eraser", { modelAnswer: "It is an eraser. → It is not an eraser. → Is it an eraser?" })
      ]),
      customPhase("u5-d4-check", "check", "Final Check", "It → is", 5, "check", [
        practiceStep("u5-d4-final-map", "Complete the map", "I → am / You → are / He → is / She → is / It → ___", { choices: ["am", "are", "is"], answer: "is" }),
        u5PracticeStep(unit, "u5-d4-final-question", "Choose the object question", "eraser", "eraser", { choices: ["What is it?", "What are it?"], answer: "What is it?" })
      ])
    ];
    return makeUnit5Lesson(unit, 4, "What is it?＋Is it...? 混合", phases);
  }

  function book1Unit5Lessons(unit) {
    return [unit5Day1(unit), unit5Day2(unit), unit5Day3(unit), unit5Day4(unit)];
  }

  function u6Asset(unit, word) {
    return vocabularyItems(unit.vocabulary).find((item) => item.word.toLowerCase() === word.toLowerCase()) || { word };
  }

  function u6PracticeStep(unit, id, title, prompt, word, options = {}) {
    return practiceStep(id, title, prompt, { ...u6Asset(unit, word), word, ...options });
  }

  function makeUnit6Lesson(unit, day, dayGoal, phases) {
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
      source: { document: "B1_教學流程.pdf", page: B1_DAY_PAGES[5]?.[day - 1] }
    };
  }

  function unit6Day1(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const phases = [
      customPhase("u6-d1-colors", "vocabulary", "Colors", "Ten Colors", 10, "teaching", vocabularySteps(unit, 0, "u6-d1-color", "Ten Colors"), { vocabulary }),
      customPhase("u6-d1-meaning", "grammar", "What color?", "What color = 什麼顏色", 5, "teaching", [
        practiceStep("u6-d1-meaning", "What color = 什麼顏色", "What color is it?", { visual: "🎨", modelAnswer: "它是什麼顏色？" })
      ]),
      customPhase("u6-d1-it", "grammar", "It → is", "Review It → is", 5, "review", [
        practiceStep("u6-d1-it", "Grammar Map Review", "It → is", { modelAnswer: "It is red. / It is blue." })
      ]),
      customPhase("u6-d1-pattern", "grammar", "Color Pattern", "What color is it?", 6, "teaching", [
        u6PracticeStep(unit, "u6-d1-red", "Ask and Answer", "What color is it?", "red", { modelAnswer: "It is red." }),
        u6PracticeStep(unit, "u6-d1-blue", "Ask and Answer", "What color is it?", "blue", { modelAnswer: "It is blue." })
      ]),
      customPhase("u6-d1-passport", "passport", "Passport", "Color Passport Practice", 14, "teaching", vocabulary.map((color, index) =>
        u6PracticeStep(unit, `u6-d1-passport-${index + 1}`, `Passport ${index + 1} / ${vocabulary.length}`, "What color is it?", color.word, {
          modelAnswer: `It is ${color.word}.`
        })
      )),
      customPhase("u6-d1-check", "check", "Color Check", "What color is it?", 5, "check", [
        u6PracticeStep(unit, "u6-d1-c-green", "Choose the answer", "What color is it?", "green", { choices: ["It is green.", "It are green."], answer: "It is green." }),
        u6PracticeStep(unit, "u6-d1-c-purple", "Choose the answer", "What color is it?", "purple", { choices: ["It is pink.", "It is purple."], answer: "It is purple." })
      ])
    ];
    return makeUnit6Lesson(unit, 1, "Colors + What color is it?", phases);
  }

  function unit6Day2(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const phases = [
      customPhase("u6-d2-review", "vocabulary", "Colors", "Quick Color Review", 6, "review", vocabularySteps(unit, 0, "u6-d2-color", "Quick Color Review"), { vocabulary }),
      customPhase("u6-d2-block", "practice", "Color Blocks", "Look and Answer", 10, "check", [
        u6PracticeStep(unit, "u6-d2-b-red", "Look and Answer", "What color is it?", "red", { modelAnswer: "It is red." }),
        u6PracticeStep(unit, "u6-d2-b-yellow", "Look and Answer", "What color is it?", "yellow", { modelAnswer: "It is yellow." }),
        u6PracticeStep(unit, "u6-d2-b-black", "Look and Answer", "What color is it?", "black", { modelAnswer: "It is black." }),
        u6PracticeStep(unit, "u6-d2-b-orange", "Look and Answer", "What color is it?", "orange", { modelAnswer: "It is orange." })
      ]),
      customPhase("u6-d2-object", "practice", "Colored Objects", "Look at the Object Color", 8, "check", [
        practiceStep("u6-d2-o-pencil", "Look and Answer", "What color is the pencil?", { visual: "🔵 ✏️", modelAnswer: "It is blue." }),
        practiceStep("u6-d2-o-book", "Look and Answer", "What color is the book?", { visual: "🔴 📕", modelAnswer: "It is red." }),
        practiceStep("u6-d2-o-bag", "Look and Answer", "What color is the school bag?", { visual: "🟣 🎒", modelAnswer: "It is purple." })
      ]),
      customPhase("u6-d2-choose", "practice", "Choose the Color", "See the Color · Choose the Word", 7, "check", [
        u6PracticeStep(unit, "u6-d2-c-pink", "Choose the color", "Which color?", "pink", { choices: ["pink", "brown", "white"], answer: "pink" }),
        u6PracticeStep(unit, "u6-d2-c-brown", "Choose the color", "Which color?", "brown", { choices: ["orange", "brown", "black"], answer: "brown" }),
        u6PracticeStep(unit, "u6-d2-c-white", "Choose the color", "Which color?", "white", { choices: ["white", "yellow", "green"], answer: "white" })
      ]),
      customPhase("u6-d2-order", "practice", "Sentence Order", "Put the Words in Order", 7, "check", [
        practiceStep("u6-d2-o-question", "Choose the correct order", "color / What / is / it / ?", { choices: ["What color is it?", "What is color it?"], answer: "What color is it?" }),
        u6PracticeStep(unit, "u6-d2-o-answer", "Choose the correct order", "is / It / green", "green", { choices: ["It is green.", "It green is."], answer: "It is green." })
      ]),
      customPhase("u6-d2-listen", "practice", "Listen and Point", "Teacher Says a Color", 5, "check", [
        u6PracticeStep(unit, "u6-d2-l-blue", "Listen: blue", "Tap blue.", "blue", { choices: ["red", "blue", "yellow"], answer: "blue" }),
        u6PracticeStep(unit, "u6-d2-l-orange", "Listen: orange", "Tap orange.", "orange", { choices: ["purple", "brown", "orange"], answer: "orange" })
      ]),
      customPhase("u6-d2-check", "check", "Mastery Check", "What color is it?", 2, "check", [
        u6PracticeStep(unit, "u6-d2-final", "Say the full answer", "What color is it?", "purple", { modelAnswer: "It is purple." })
      ])
    ];
    return makeUnit6Lesson(unit, 2, "顏色問答練熟", phases);
  }

  function unit6Day3(unit) {
    const phases = [
      customPhase("u6-d3-my-your", "grammar", "My / Your", "my = 我的 · your = 你的", 6, "teaching", [
        practiceStep("u6-d3-my", "my = 我的", "my book", { visual: "🙋 📘", modelAnswer: "我的書" }),
        practiceStep("u6-d3-your", "your = 你的", "your book", { visual: "👉 📘", modelAnswer: "你的書" })
      ]),
      customPhase("u6-d3-compare", "grammar", "Possessive Comparison", "My Book / Your Book", 8, "teaching", [
        u6PracticeStep(unit, "u6-d3-my-red", "My book", "My book is red.", "red", { visual: "🙋 📕", modelAnswer: "my = 我的" }),
        u6PracticeStep(unit, "u6-d3-your-blue", "Your book", "Your book is blue.", "blue", { visual: "👉 📘", modelAnswer: "your = 你的" })
      ]),
      customPhase("u6-d3-choose", "practice", "Choose My or Your", "Who Owns It?", 7, "check", [
        practiceStep("u6-d3-c-my", "Choose my or your", "This is my book. ___ book is red.", { visual: "🙋 📕", choices: ["My", "Your"], answer: "My" }),
        practiceStep("u6-d3-c-your", "Choose my or your", "This is your pen. ___ pen is blue.", { visual: "👉 🖊️", choices: ["My", "Your"], answer: "Your" })
      ]),
      customPhase("u6-d3-negative", "grammar", "Color Negative", "Your Book is Not...", 8, "teaching", [
        u6PracticeStep(unit, "u6-d3-n-red", "Make it negative", "Your book is red.", "red", { modelAnswer: "Your book is not red." }),
        u6PracticeStep(unit, "u6-d3-n-blue", "Make it negative", "My book is blue.", "blue", { modelAnswer: "My book is not blue." })
      ]),
      customPhase("u6-d3-not", "practice", "Not Review", "Put Not after Is", 6, "check", [
        u6PracticeStep(unit, "u6-d3-not1", "Choose the negative sentence", "your book + not red", "red", { choices: ["Your book is not red.", "Your book not is red."], answer: "Your book is not red." }),
        u6PracticeStep(unit, "u6-d3-not2", "Choose the negative sentence", "my pen + not green", "green", { choices: ["My pen is not green.", "My pen is green not."], answer: "My pen is not green." })
      ]),
      customPhase("u6-d3-picture", "practice", "My / Your Color Practice", "Look and Say", 8, "check", [
        practiceStep("u6-d3-p-my", "Make a sentence", "my book + red", { visual: "🙋 📕", modelAnswer: "My book is red." }),
        practiceStep("u6-d3-p-your", "Make a sentence", "your pen + blue", { visual: "👉 🔵 🖊️", modelAnswer: "Your pen is blue." }),
        practiceStep("u6-d3-p-not", "Make a negative sentence", "your book + not yellow", { visual: "👉 📘", modelAnswer: "Your book is not yellow." })
      ]),
      customPhase("u6-d3-check", "check", "Possessive Check", "my / your + color", 2, "check", [
        practiceStep("u6-d3-final", "Choose the correct sentence", "your book + blue", { visual: "👉 📘", choices: ["Your book is blue.", "My book are blue."], answer: "Your book is blue." })
      ])
    ];
    return makeUnit6Lesson(unit, 3, "my / your + color", phases);
  }

  function unit6Day4(unit) {
    const phases = [
      customPhase("u6-d4-questions", "grammar", "Three Question Types", "Object · Color · Yes/No", 6, "review", [
        practiceStep("u6-d4-map", "Question Map", "What is it?  ·  What color is it?  ·  Is it...?", { visual: "🔵 ✏️", modelAnswer: "object / color / yes-no" })
      ]),
      customPhase("u6-d4-triple", "speaking", "Three-Question Challenge", "Ask Three Questions", 12, "check", [
        practiceStep("u6-d4-t-pencil", "Blue Pencil", "What is it?\nWhat color is it?\nIs it red?", { visual: "🔵 ✏️", modelAnswer: "It is a pencil.\nIt is blue.\nNo, it is not." }),
        practiceStep("u6-d4-t-book", "Red Book", "What is it?\nWhat color is it?\nIs it red?", { visual: "🔴 📕", modelAnswer: "It is a book.\nIt is red.\nYes, it is." }),
        practiceStep("u6-d4-t-bag", "Purple School Bag", "What is it?\nWhat color is it?\nIs it blue?", { visual: "🟣 🎒", modelAnswer: "It is a school bag.\nIt is purple.\nNo, it is not." })
      ]),
      customPhase("u6-d4-what", "practice", "What / What Color", "Choose the Question", 8, "check", [
        practiceStep("u6-d4-w-object", "Ask about the object", "Answer: It is a pen.", { visual: "🖊️", choices: ["What is it?", "What color is it?"], answer: "What is it?" }),
        practiceStep("u6-d4-w-color", "Ask about the color", "Answer: It is blue.", { visual: "🔵", choices: ["What is it?", "What color is it?"], answer: "What color is it?" })
      ]),
      customPhase("u6-d4-is-it", "practice", "Is it...?", "Answer Yes or No", 8, "check", [
        u6PracticeStep(unit, "u6-d4-i-blue", "Answer the question", "Is it blue?", "blue", { choices: ["Yes, it is.", "No, it is not."], answer: "Yes, it is." }),
        u6PracticeStep(unit, "u6-d4-i-red", "Answer the question", "Is it red?", "blue", { choices: ["Yes, it is.", "No, it is not."], answer: "No, it is not." })
      ]),
      customPhase("u6-d4-error", "practice", "Error Correction", "Fix the Sentence", 7, "check", [
        u6PracticeStep(unit, "u6-d4-e1", "Fix the question", "What color are it? ✕", "red", { modelAnswer: "What color is it? ✓" }),
        u6PracticeStep(unit, "u6-d4-e2", "Fix the answer", "It are red. ✕", "red", { modelAnswer: "It is red. ✓" }),
        practiceStep("u6-d4-e3", "Fix the sentence", "My book are blue. ✕", { visual: "📘", modelAnswer: "My book is blue. ✓" })
      ]),
      customPhase("u6-d4-check", "check", "Final Check", "U5 + U6", 4, "check", [
        practiceStep("u6-d4-final", "Match each question", "What is it? → object  ·  What color is it? → color  ·  Is it...? → yes/no", { visual: "🎒 🎨 ✅", modelAnswer: "Object / Color / Yes-No" })
      ])
    ];
    return makeUnit6Lesson(unit, 4, "What color / Is it...? 混合", phases);
  }

  function book1Unit6Lessons(unit) {
    return [unit6Day1(unit), unit6Day2(unit), unit6Day3(unit), unit6Day4(unit)];
  }

  function u7Asset(unit, word) {
    return vocabularyItems(unit.vocabulary).find((item) => item.word.toLowerCase() === word.toLowerCase()) || { word };
  }

  function u7PracticeStep(unit, id, title, prompt, word, options = {}) {
    return practiceStep(id, title, prompt, { ...u7Asset(unit, word), word, ...options });
  }

  function makeUnit7Lesson(unit, day, dayGoal, phases) {
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
      source: { document: "B1_教學流程.pdf", page: B1_DAY_PAGES[6]?.[day - 1] }
    };
  }

  function unit7Day1(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const passportPairs = [
      ["this", "coat"], ["this", "dress"], ["this", "jacket"], ["this", "T-shirt"],
      ["that", "shirt"], ["that", "cap"], ["that", "hat"], ["that", "skirt"]
    ];
    const phases = [
      customPhase("u7-d1-clothing", "vocabulary", "Clothing", "Clothing Vocabulary", 10, "teaching", vocabularySteps(unit, 0, "u7-d1-word", "Clothing Vocabulary"), { vocabulary }),
      customPhase("u7-d1-this-that", "grammar", "This / That", "this = 近 · that = 遠", 5, "teaching", [
        practiceStep("u7-d1-this", "this = 這個，近", "this", { visual: "🧥 👈", modelAnswer: "this = nearby" }),
        practiceStep("u7-d1-that", "that = 那個，遠", "that", { visual: "👉       👕", modelAnswer: "that = far away" })
      ]),
      customPhase("u7-d1-pattern", "grammar", "What is this / that?", "Near and Far Questions", 6, "teaching", [
        u7PracticeStep(unit, "u7-d1-this-coat", "Near Object", "What is this?", "coat", { modelAnswer: "This is a coat." }),
        u7PracticeStep(unit, "u7-d1-that-shirt", "Far Object", "What is that?", "shirt", { modelAnswer: "That is a shirt." })
      ]),
      customPhase("u7-d1-passport", "passport", "Passport", "Eight Passport Questions", 16, "teaching", passportPairs.map(([distance, clothing], index) => {
        const subject = distance === "this" ? "This" : "That";
        return u7PracticeStep(unit, `u7-d1-passport-${index + 1}`, `Passport ${index + 1} / ${passportPairs.length}`, `What is ${distance}?`, clothing, {
          modelAnswer: `${subject} is a ${clothing}.`
        });
      })),
      customPhase("u7-d1-distance", "practice", "Distance Check", "This or That?", 6, "check", [
        u7PracticeStep(unit, "u7-d1-near", "Near object", "___ is a coat.", "coat", { choices: ["This", "That"], answer: "This" }),
        u7PracticeStep(unit, "u7-d1-far", "Far object", "___ is a hat.", "hat", { choices: ["This", "That"], answer: "That" })
      ]),
      customPhase("u7-d1-check", "check", "Question Check", "What is this / that?", 2, "check", [
        u7PracticeStep(unit, "u7-d1-final", "Choose the far-object pair", "hat (far)", "hat", { choices: ["What is this? This is a hat.", "What is that? That is a hat."], answer: "What is that? That is a hat." })
      ])
    ];
    return makeUnit7Lesson(unit, 1, "this / that + clothing", phases);
  }

  function unit7Day2(unit) {
    const phases = [
      customPhase("u7-d2-review", "review", "This / That", "Near / Far Review", 5, "review", [
        practiceStep("u7-d2-map", "Distance Map", "this → near  ·  that → far", { visual: "🧢 👈        👉 👗", modelAnswer: "this = 近 / that = 遠" })
      ]),
      customPhase("u7-d2-near-far", "practice", "Near or Far?", "Choose This / That", 8, "check", [
        u7PracticeStep(unit, "u7-d2-n-coat", "Near clothing", "___ is a coat.", "coat", { choices: ["This", "That"], answer: "This" }),
        u7PracticeStep(unit, "u7-d2-f-dress", "Far clothing", "___ is a dress.", "dress", { choices: ["This", "That"], answer: "That" }),
        u7PracticeStep(unit, "u7-d2-n-cap", "Near clothing", "___ is a cap.", "cap", { choices: ["This", "That"], answer: "This" })
      ]),
      customPhase("u7-d2-question", "practice", "Choose the Question", "What is this / that?", 8, "check", [
        u7PracticeStep(unit, "u7-d2-q-near", "Near object", "Ask about this jacket.", "jacket", { choices: ["What is this?", "What is that?"], answer: "What is this?" }),
        u7PracticeStep(unit, "u7-d2-q-far", "Far object", "Ask about that shirt.", "shirt", { choices: ["What is this?", "What is that?"], answer: "What is that?" })
      ]),
      customPhase("u7-d2-match", "practice", "Picture Matching", "Match Distance and Sentence", 6, "check", [
        u7PracticeStep(unit, "u7-d2-m-hat", "Match the picture", "hat (far)", "hat", { choices: ["This is a hat.", "That is a hat."], answer: "That is a hat." }),
        u7PracticeStep(unit, "u7-d2-m-skirt", "Match the picture", "skirt (near)", "skirt", { choices: ["This is a skirt.", "That is a skirt."], answer: "This is a skirt." })
      ]),
      customPhase("u7-d2-order", "practice", "Sentence Order", "Put the Words in Order", 8, "check", [
        practiceStep("u7-d2-o-question", "Choose the correct order", "is / this / What / ?", { choices: ["What is this?", "What this is?"], answer: "What is this?" }),
        u7PracticeStep(unit, "u7-d2-o-hat", "Choose the correct order", "a / hat / That / is", "hat", { choices: ["That is a hat.", "That a hat is."], answer: "That is a hat." }),
        u7PracticeStep(unit, "u7-d2-o-shirt", "Choose the correct order", "shirt / a / is / This", "shirt", { choices: ["This is a shirt.", "This shirt a is."], answer: "This is a shirt." })
      ]),
      customPhase("u7-d2-scene", "practice", "Near / Far Scene", "Two Objects · Two Distances", 8, "check", [
        practiceStep("u7-d2-scene1", "Choose the near sentence", "Near: cap  ·  Far: dress", { visual: "🧢 👈          👉 👗", choices: ["This is a cap.", "That is a cap."], answer: "This is a cap." }),
        practiceStep("u7-d2-scene2", "Choose the far sentence", "Near: jacket  ·  Far: hat", { visual: "🧥 👈          👉 🎩", choices: ["This is a hat.", "That is a hat."], answer: "That is a hat." })
      ]),
      customPhase("u7-d2-check", "check", "Mastery Check", "this = near · that = far", 2, "check", [
        u7PracticeStep(unit, "u7-d2-final", "Choose this or that", "___ is a skirt. (far)", "skirt", { choices: ["This", "That"], answer: "That" })
      ])
    ];
    return makeUnit7Lesson(unit, 2, "this / that 練熟", phases);
  }

  function unit7Day3(unit) {
    const phases = [
      customPhase("u7-d3-review", "grammar", "My / Your Review", "my = 我的 · your = 你的", 6, "review", [
        practiceStep("u7-d3-my", "my = 我的", "my coat", { visual: "🙋 🧥", modelAnswer: "我的外套" }),
        practiceStep("u7-d3-your", "your = 你的", "your hat", { visual: "👉 🎩", modelAnswer: "你的帽子" })
      ]),
      customPhase("u7-d3-his-her", "grammar", "His / Her", "his = 他的 · her = 她的", 6, "teaching", [
        practiceStep("u7-d3-his", "his = 他的", "his hat", { visual: "👦 🎩", modelAnswer: "他的帽子" }),
        practiceStep("u7-d3-her", "her = 她的", "her dress", { visual: "👧 👗", modelAnswer: "她的洋裝" })
      ]),
      customPhase("u7-d3-map", "grammar", "Possessive Map", "Whose Clothing?", 7, "teaching", [
        practiceStep("u7-d3-map", "Possessive Map", "my → 我的  ·  your → 你的  ·  his → 他的  ·  her → 她的", { visual: "🙋 👉 👦 👧", modelAnswer: "The owner changes the possessive word." })
      ]),
      customPhase("u7-d3-pattern", "practice", "Possessive Clothing", "This / That + Owner + Clothing", 10, "check", [
        u7PracticeStep(unit, "u7-d3-this-my-hat", "Near clothing", "This is my hat.", "hat", { visual: "🙋 🎩", modelAnswer: "my = mine" }),
        u7PracticeStep(unit, "u7-d3-that-his-hat", "Far clothing", "That is his hat.", "hat", { visual: "👦 🎩", modelAnswer: "his = the boy's" }),
        u7PracticeStep(unit, "u7-d3-this-my-coat", "Near clothing", "This is my coat.", "coat", { visual: "🙋 🧥", modelAnswer: "my = mine" }),
        u7PracticeStep(unit, "u7-d3-that-her-dress", "Far clothing", "That is her dress.", "dress", { visual: "👧 👗", modelAnswer: "her = the girl's" })
      ]),
      customPhase("u7-d3-choose", "practice", "Choose the Owner", "my / your / his / her", 8, "check", [
        practiceStep("u7-d3-c-my", "Choose the possessive", "I own the coat. This is ___ coat.", { visual: "🙋 🧥", choices: ["my", "your", "his", "her"], answer: "my" }),
        practiceStep("u7-d3-c-his", "Choose the possessive", "The boy owns the hat. That is ___ hat.", { visual: "👦 🎩", choices: ["my", "your", "his", "her"], answer: "his" }),
        practiceStep("u7-d3-c-her", "Choose the possessive", "The girl owns the dress. That is ___ dress.", { visual: "👧 👗", choices: ["my", "your", "his", "her"], answer: "her" })
      ]),
      customPhase("u7-d3-compare", "practice", "Owner Comparison", "Change the Owner", 6, "check", [
        u7PracticeStep(unit, "u7-d3-change1", "Change the owner", "This is my cap. → the boy", "cap", { modelAnswer: "This is his cap." }),
        u7PracticeStep(unit, "u7-d3-change2", "Change the owner", "That is your skirt. → the girl", "skirt", { modelAnswer: "That is her skirt." })
      ]),
      customPhase("u7-d3-check", "check", "Possessive Check", "Who Owns It?", 2, "check", [
        practiceStep("u7-d3-final", "Choose the correct sentence", "the girl + dress", { visual: "👧 👗", choices: ["That is his dress.", "That is her dress."], answer: "That is her dress." })
      ])
    ];
    return makeUnit7Lesson(unit, 3, "my / your / his / her", phases);
  }

  function unit7Day4(unit) {
    const phases = [
      customPhase("u7-d4-map", "grammar", "U5–U7 Question Map", "Object · Color · Owner", 5, "review", [
        practiceStep("u7-d4-map", "Question Map", "What is this?  ·  What color is it?  ·  Is this your...?", { visual: "🔵 👕", modelAnswer: "object / color / owner" })
      ]),
      customPhase("u7-d4-triple", "speaking", "Three-Question Clothing Challenge", "Ask Three Questions", 12, "check", [
        u7PracticeStep(unit, "u7-d4-t-shirt", "Blue T-shirt", "What is this?\nWhat color is it?\nIs this your T-shirt?", "T-shirt", { visual: "🔵 👕", modelAnswer: "This is a T-shirt.\nIt is blue.\nYes, it is." }),
        u7PracticeStep(unit, "u7-d4-t-hat", "Red Hat", "What is that?\nWhat color is it?\nIs that his hat?", "hat", { visual: "🔴 🎩", modelAnswer: "That is a hat.\nIt is red.\nYes, it is." })
      ]),
      customPhase("u7-d4-owner", "practice", "Ownership Practice", "Choose the Possessive", 8, "check", [
        u7PracticeStep(unit, "u7-d4-o-my", "Choose the owner", "This is ___ cap. (mine)", "cap", { choices: ["my", "your", "his", "her"], answer: "my" }),
        u7PracticeStep(unit, "u7-d4-o-his", "Choose the owner", "That is ___ shirt. (the boy's)", "shirt", { choices: ["my", "your", "his", "her"], answer: "his" }),
        u7PracticeStep(unit, "u7-d4-o-her", "Choose the owner", "That is ___ dress. (the girl's)", "dress", { choices: ["my", "your", "his", "her"], answer: "her" })
      ]),
      customPhase("u7-d4-error", "practice", "Error Correction", "Fix the Sentence", 8, "check", [
        u7PracticeStep(unit, "u7-d4-e1", "Fix the question", "What is these? ✕", "coat", { modelAnswer: "What is this? ✓" }),
        u7PracticeStep(unit, "u7-d4-e2", "Fix the sentence", "This are a hat. ✕", "hat", { modelAnswer: "This is a hat. ✓" }),
        u7PracticeStep(unit, "u7-d4-e3", "Fix the possessive", "That is she hat. ✕", "hat", { visual: "👧 🎩", modelAnswer: "That is her hat. ✓" })
      ]),
      customPhase("u7-d4-order", "practice", "Sentence Order", "Put the Words in Order", 7, "check", [
        u7PracticeStep(unit, "u7-d4-r-cap", "Choose the correct order", "this / my / is / cap", "cap", { choices: ["This is my cap.", "This my cap is."], answer: "This is my cap." }),
        u7PracticeStep(unit, "u7-d4-r-dress", "Choose the correct order", "her / That / dress / is", "dress", { choices: ["That her is dress.", "That is her dress."], answer: "That is her dress." })
      ]),
      customPhase("u7-d4-check", "check", "Final Check", "This / That + Possessive", 5, "check", [
        practiceStep("u7-d4-final", "Complete the map", "this = ___ / that = ___ / my-your-his-her = ___", { choices: ["near / far / owner", "far / near / color"], answer: "near / far / owner" }),
        u7PracticeStep(unit, "u7-d4-final-sentence", "Choose the correct sentence", "girl + far dress", "dress", { choices: ["That is her dress.", "This is his dress."], answer: "That is her dress." })
      ])
    ];
    return makeUnit7Lesson(unit, 4, "this / that + 所有格進階", phases);
  }

  function book1Unit7Lessons(unit) {
    return [unit7Day1(unit), unit7Day2(unit), unit7Day3(unit), unit7Day4(unit)];
  }

  function u8Asset(unit, word) {
    return vocabularyItems(unit.vocabulary).find((item) => item.word.toLowerCase() === word.toLowerCase()) || { word };
  }

  function u8PracticeStep(unit, id, title, prompt, word, options = {}) {
    return practiceStep(id, title, prompt, { ...u8Asset(unit, word), word, ...options });
  }

  function makeUnit8Lesson(unit, day, dayGoal, phases) {
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
      source: { document: "B1_教學流程.pdf", page: B1_DAY_PAGES[7]?.[day - 1] }
    };
  }

  function unit8Day1(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const passportPairs = [
      ["this", "dog"], ["this", "cow"], ["that", "rabbit"], ["that", "cat"],
      ["this", "sheep"], ["that", "duck"], ["this", "pig"], ["that", "horse"]
    ];
    const phases = [
      customPhase("u8-d1-animals", "vocabulary", "Farm Animals", "Farm Animal Vocabulary", 10, "teaching", vocabularySteps(unit, 0, "u8-d1-animal", "Farm Animal Vocabulary"), { vocabulary }),
      customPhase("u8-d1-this-that", "grammar", "This / That", "this = 近 · that = 遠", 5, "review", [
        practiceStep("u8-d1-this", "this = 這個，近", "this", { visual: "🐶 👈", modelAnswer: "this = nearby" }),
        practiceStep("u8-d1-that", "that = 那個，遠", "that", { visual: "👉       🐰", modelAnswer: "that = far away" })
      ]),
      customPhase("u8-d1-pattern", "grammar", "Animal Question", "Is + this / that + a + animal?", 6, "teaching", [
        practiceStep("u8-d1-formula", "Question Formula", "Is + this / that + a + animal?", { visual: "🐶 🐰", modelAnswer: "Is this a cat? / Is that a rabbit?" }),
        u8PracticeStep(unit, "u8-d1-this-cat", "Ask and Answer", "Is this a cat?", "cat", { modelAnswer: "Yes, it is." }),
        u8PracticeStep(unit, "u8-d1-that-rabbit", "Ask and Answer", "Is that a rabbit?", "rabbit", { modelAnswer: "Yes, it is." })
      ]),
      customPhase("u8-d1-passport", "passport", "Passport", "Eight Passport Questions", 16, "teaching", passportPairs.map(([distance, animal], index) =>
        u8PracticeStep(unit, `u8-d1-passport-${index + 1}`, `Passport ${index + 1} / ${passportPairs.length}`, `Is ${distance} a ${animal}?`, animal, {
          modelAnswer: "Yes, it is."
        })
      )),
      customPhase("u8-d1-guided", "practice", "Guided Practice", "This or That?", 6, "check", [
        u8PracticeStep(unit, "u8-d1-g-this", "Choose this or that", "Is ___ a dog?  (near)", "dog", { choices: ["this", "that"], answer: "this" }),
        u8PracticeStep(unit, "u8-d1-g-that", "Choose this or that", "Is ___ a horse?  (far)", "horse", { choices: ["this", "that"], answer: "that" })
      ]),
      customPhase("u8-d1-check", "check", "Question Check", "Is this / that a...?", 2, "check", [
        u8PracticeStep(unit, "u8-d1-final", "Choose the correct question", "rabbit (far)", "rabbit", { choices: ["Is that a rabbit?", "Are that a rabbit?"], answer: "Is that a rabbit?" })
      ])
    ];
    return makeUnit8Lesson(unit, 1, "this / that + 動物", phases);
  }

  function unit8Day2(unit) {
    const phases = [
      customPhase("u8-d2-map", "grammar", "Yes / No Map", "Yes → it is · No → it isn't", 5, "review", [
        practiceStep("u8-d2-map", "Answer Map", "Yes → it is  ·  No → it isn't", { modelAnswer: "Yes, it is. / No, it isn't." })
      ]),
      customPhase("u8-d2-yes", "practice", "Yes Answers", "Look and Decide", 8, "check", [
        u8PracticeStep(unit, "u8-d2-y-dog", "Answer the question", "Is this a dog?", "dog", { choices: ["Yes, it is.", "No, it isn't."], answer: "Yes, it is." }),
        u8PracticeStep(unit, "u8-d2-y-horse", "Answer the question", "Is that a horse?", "horse", { choices: ["Yes, it is.", "No, it isn't."], answer: "Yes, it is." }),
        u8PracticeStep(unit, "u8-d2-y-duck", "Answer the question", "Is this a duck?", "duck", { choices: ["Yes, it is.", "No, it isn't."], answer: "Yes, it is." })
      ]),
      customPhase("u8-d2-no", "practice", "No Answers", "Look and Decide", 10, "check", [
        u8PracticeStep(unit, "u8-d2-n-pig", "Answer the question", "Is this a cow?", "pig", { choices: ["Yes, it is.", "No, it isn't."], answer: "No, it isn't." }),
        u8PracticeStep(unit, "u8-d2-n-rat", "Answer the question", "Is that a rabbit?", "rat", { choices: ["Yes, it is.", "No, it isn't."], answer: "No, it isn't." }),
        u8PracticeStep(unit, "u8-d2-n-chicken", "Answer the question", "Is this a sheep?", "chicken", { choices: ["Yes, it is.", "No, it isn't."], answer: "No, it isn't." })
      ]),
      customPhase("u8-d2-pronoun", "practice", "Choose the It Answer", "Animal = it", 8, "check", [
        u8PracticeStep(unit, "u8-d2-p-horse", "Choose the answer", "Is that a horse?", "horse", { choices: ["Yes, it is.", "Yes, she is.", "Yes, they are."], answer: "Yes, it is." }),
        u8PracticeStep(unit, "u8-d2-p-dog", "Choose the answer", "Is this a dog?", "dog", { choices: ["Yes, he is.", "Yes, it is.", "Yes, they are."], answer: "Yes, it is." })
      ]),
      customPhase("u8-d2-random", "practice", "Rapid Decisions", "Yes or No?", 8, "check", [
        u8PracticeStep(unit, "u8-d2-r-cat", "Quick Answer", "Is this a cat?", "cat", { choices: ["Yes, it is.", "No, it isn't."], answer: "Yes, it is." }),
        u8PracticeStep(unit, "u8-d2-r-cow", "Quick Answer", "Is this a horse?", "cow", { choices: ["Yes, it is.", "No, it isn't."], answer: "No, it isn't." }),
        u8PracticeStep(unit, "u8-d2-r-rabbit", "Quick Answer", "Is that a rabbit?", "rabbit", { choices: ["Yes, it is.", "No, it isn't."], answer: "Yes, it is." })
      ]),
      customPhase("u8-d2-order", "practice", "Answer Order", "Build the Answer", 4, "check", [
        practiceStep("u8-d2-o-yes", "Choose the correct order", "it / Yes / is", { choices: ["Yes, it is.", "Yes, is it."], answer: "Yes, it is." }),
        practiceStep("u8-d2-o-no", "Choose the correct order", "isn't / it / No", { choices: ["No, it isn't.", "No, isn't it."], answer: "No, it isn't." })
      ]),
      customPhase("u8-d2-check", "check", "Mastery Check", "Yes → it is · No → it isn't", 2, "check", [
        u8PracticeStep(unit, "u8-d2-final", "Choose the correct answer", "Is that a pig?", "pig", { choices: ["Yes, it is.", "Yes, she is.", "Yes, they are."], answer: "Yes, it is." })
      ])
    ];
    return makeUnit8Lesson(unit, 2, "Yes / No 回答練熟", phases);
  }

  function unit8Day3(unit) {
    const phases = [
      customPhase("u8-d3-rule", "grammar", "Question Rule Review", "Move Is to the Front", 6, "review", [
        practiceStep("u8-d3-rule", "U4 Rule Again", "This is a dog. → Is this a dog?", { visual: "🐶", modelAnswer: "Move is before this." })
      ]),
      customPhase("u8-d3-this", "practice", "This Transformation", "Statement → Question", 8, "check", [
        u8PracticeStep(unit, "u8-d3-this-dog", "Make a question", "This is a dog.", "dog", { modelAnswer: "Is this a dog?" }),
        u8PracticeStep(unit, "u8-d3-this-cow", "Make a question", "This is a cow.", "cow", { modelAnswer: "Is this a cow?" })
      ]),
      customPhase("u8-d3-that", "practice", "That Transformation", "Statement → Question", 8, "check", [
        u8PracticeStep(unit, "u8-d3-that-rabbit", "Make a question", "That is a rabbit.", "rabbit", { modelAnswer: "Is that a rabbit?" }),
        u8PracticeStep(unit, "u8-d3-that-horse", "Make a question", "That is a horse.", "horse", { modelAnswer: "Is that a horse?" })
      ]),
      customPhase("u8-d3-three", "grammar", "Three Sentence Forms", "Affirmative · Negative · Question", 10, "teaching", [
        u8PracticeStep(unit, "u8-d3-three-dog", "Three Forms", "This is a dog.", "dog", { modelAnswer: "This is a dog. → This is not a dog. → Is this a dog?" }),
        u8PracticeStep(unit, "u8-d3-three-pig", "Three Forms", "That is a pig.", "pig", { modelAnswer: "That is a pig. → That is not a pig. → Is that a pig?" })
      ]),
      customPhase("u8-d3-choose", "practice", "Choose the Form", "Statement / Negative / Question", 7, "check", [
        u8PracticeStep(unit, "u8-d3-c-statement", "Choose the affirmative", "this + cow", "cow", { choices: ["This is a cow.", "This is not a cow.", "Is this a cow?"], answer: "This is a cow." }),
        u8PracticeStep(unit, "u8-d3-c-negative", "Choose the negative", "this + not pig", "pig", { choices: ["This is a pig.", "This is not a pig.", "Is this a pig?"], answer: "This is not a pig." }),
        u8PracticeStep(unit, "u8-d3-c-question", "Choose the question", "that + rabbit", "rabbit", { choices: ["That is a rabbit.", "That is not a rabbit.", "Is that a rabbit?"], answer: "Is that a rabbit?" })
      ]),
      customPhase("u8-d3-order", "practice", "Question Order", "Move Is to the Front", 4, "check", [
        u8PracticeStep(unit, "u8-d3-o-this", "Choose the correct order", "this / Is / a / dog / ?", "dog", { choices: ["Is this a dog?", "This is a dog?"], answer: "Is this a dog?" })
      ]),
      customPhase("u8-d3-check", "check", "Form Check", "Three Forms", 2, "check", [
        u8PracticeStep(unit, "u8-d3-final", "Choose the question", "That is a duck.", "duck", { choices: ["Is that a duck?", "That is not a duck."], answer: "Is that a duck?" })
      ])
    ];
    return makeUnit8Lesson(unit, 3, "陳述句和問句連結", phases);
  }

  function unit8Day4(unit) {
    const phases = [
      customPhase("u8-d4-map", "grammar", "Question Map", "What is this / that? · Is this / that...?", 6, "review", [
        practiceStep("u8-d4-map", "Two Question Types", "What is this / that? → ask the animal\nIs this / that a ___? → ask yes or no", { visual: "🐰", modelAnswer: "Name question / Yes-No question" })
      ]),
      customPhase("u8-d4-rabbit", "speaking", "Far Rabbit Challenge", "What is that? + Is that...?", 10, "check", [
        u8PracticeStep(unit, "u8-d4-r1", "Name the animal", "What is that?", "rabbit", { modelAnswer: "It is a rabbit." }),
        u8PracticeStep(unit, "u8-d4-r2", "Answer Yes", "Is that a rabbit?", "rabbit", { modelAnswer: "Yes, it is." }),
        u8PracticeStep(unit, "u8-d4-r3", "Answer the trap question", "Is that a dog?", "rabbit", { modelAnswer: "No, it isn't." })
      ]),
      customPhase("u8-d4-mixed", "practice", "Mixed Animal Q&A", "Name + Yes / No", 8, "check", [
        u8PracticeStep(unit, "u8-d4-m-dog", "Two questions", "What is this?\nIs this a dog?", "dog", { modelAnswer: "It is a dog.\nYes, it is." }),
        u8PracticeStep(unit, "u8-d4-m-duck", "Two questions", "What is that?\nIs that a sheep?", "duck", { modelAnswer: "It is a duck.\nNo, it isn't." })
      ]),
      customPhase("u8-d4-error", "practice", "Error Correction", "Fix the Sentence", 8, "check", [
        u8PracticeStep(unit, "u8-d4-e1", "Fix the question", "Is this is a cat? ✕", "cat", { modelAnswer: "Is this a cat? ✓" }),
        u8PracticeStep(unit, "u8-d4-e2", "Fix the statement", "This a dog is. ✕", "dog", { modelAnswer: "This is a dog. ✓" }),
        u8PracticeStep(unit, "u8-d4-e3", "Fix a / an", "Is that an pig? ✕", "pig", { modelAnswer: "Is that a pig? ✓" }),
        u8PracticeStep(unit, "u8-d4-e4", "Fix the answer", "Yes, this is. ✕", "cow", { modelAnswer: "Yes, it is. ✓" })
      ]),
      customPhase("u8-d4-order", "practice", "Question Order", "Put the Words in Order", 8, "check", [
        u8PracticeStep(unit, "u8-d4-o-cow", "Choose the correct order", "this / Is / a / cow / ?", "cow", { choices: ["Is this a cow?", "This is a cow?"], answer: "Is this a cow?" }),
        u8PracticeStep(unit, "u8-d4-o-horse", "Choose the correct order", "that / horse / Is / a / ?", "horse", { choices: ["Is that a horse?", "That horse is a?"], answer: "Is that a horse?" })
      ]),
      customPhase("u8-d4-rapid", "practice", "Rapid Review", "What or Is?", 3, "check", [
        u8PracticeStep(unit, "u8-d4-q-what", "Choose the name question", "Ask: 這是什麼？", "cat", { choices: ["What is this?", "Is this a cat?"], answer: "What is this?" }),
        u8PracticeStep(unit, "u8-d4-q-is", "Choose the yes/no question", "Ask: 這是一隻貓嗎？", "cat", { choices: ["What is this?", "Is this a cat?"], answer: "Is this a cat?" })
      ]),
      customPhase("u8-d4-check", "check", "Final Check", "Question + Answer Map", 2, "check", [
        practiceStep("u8-d4-final", "Complete the map", "What is this / that? → object  ·  Is this / that a ___? → yes/no", { visual: "🐶 ✅", modelAnswer: "Yes, it is. / No, it isn't." })
      ])
    ];
    return makeUnit8Lesson(unit, 4, "U5＋U7＋U8 進階混合", phases);
  }

  function book1Unit8Lessons(unit) {
    return [unit8Day1(unit), unit8Day2(unit), unit8Day3(unit), unit8Day4(unit)];
  }

  function u9Asset(unit, word) {
    return vocabularyItems(unit.vocabulary).find((item) => item.word.toLowerCase() === word.toLowerCase()) || { word };
  }

  function u9PracticeStep(unit, id, title, prompt, word, options = {}) {
    return practiceStep(id, title, prompt, { ...u9Asset(unit, word), word, ...options });
  }

  function makeUnit9Lesson(unit, day, dayGoal, phases) {
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
      source: { document: "B1_教學流程.pdf", page: B1_DAY_PAGES[8]?.[day - 1] }
    };
  }

  function unit9Day1(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const phases = [
      customPhase("u9-d1-adjectives", "vocabulary", "Feelings", "Unit 9 Adjectives", 10, "teaching", vocabularySteps(unit, 0, "u9-d1-word", "Unit 9 Adjectives"), { vocabulary }),
      customPhase("u9-d1-they", "grammar", "They", "they = 他們／她們／它們", 5, "teaching", [
        practiceStep("u9-d1-they", "they = 他們／她們／它們", "They → are", { visual: "👧 👦 🐶", modelAnswer: "More than one person or thing → they" })
      ]),
      customPhase("u9-d1-map", "grammar", "Complete Be Verb Map", "Book 1 Be Verb Map", 6, "teaching", [
        practiceStep("u9-d1-map", "Complete Be Verb Map", "I → am  ·  You → are  ·  He → is  ·  She → is  ·  It → is  ·  They → are", { modelAnswer: "am / are / is / is / is / are" })
      ]),
      customPhase("u9-d1-pattern", "grammar", "Are they...?", "Plural Question + Answer", 6, "teaching", [
        u9PracticeStep(unit, "u9-d1-hungry", "Ask and Answer", "Are they hungry?", "hungry", { visual: "👧 👦 😋", modelAnswer: "Yes, they are." }),
        u9PracticeStep(unit, "u9-d1-thirsty", "Ask and Answer", "Are they thirsty?", "thirsty", { visual: "👧 👦 🥤", modelAnswer: "Yes, they are." })
      ]),
      customPhase("u9-d1-passport", "passport", "Passport", "Eight Passport Questions", 16, "teaching", vocabulary.map((item, index) =>
        u9PracticeStep(unit, `u9-d1-passport-${index + 1}`, `Passport ${index + 1} / ${vocabulary.length}`, `Are they ${item.word}?`, item.word, {
          visual: `👧 👦 ${item.visual || ""}`,
          modelAnswer: "Yes, they are."
        })
      )),
      customPhase("u9-d1-check", "check", "They Check", "They → are", 2, "check", [
        u9PracticeStep(unit, "u9-d1-final", "Choose the answer", "Are they hungry?", "hungry", { visual: "👧 👦 😋", choices: ["Yes, they are.", "Yes, they is."], answer: "Yes, they are." })
      ])
    ];
    return makeUnit9Lesson(unit, 1, "They + are", phases);
  }

  function unit9Day2(unit) {
    const phases = [
      customPhase("u9-d2-map", "grammar", "They Answer Map", "Yes, they are / No, they aren't", 5, "review", [
        practiceStep("u9-d2-map", "Answer Map", "Yes → they are  ·  No → they aren't", { visual: "👧 👦", modelAnswer: "Yes, they are. / No, they aren't." })
      ]),
      customPhase("u9-d2-yes", "practice", "Yes Answers", "Look and Decide", 8, "check", [
        u9PracticeStep(unit, "u9-d2-y-thirsty", "Answer the question", "Are they thirsty?", "thirsty", { visual: "👧 👦 🥤", choices: ["Yes, they are.", "No, they aren't."], answer: "Yes, they are." }),
        u9PracticeStep(unit, "u9-d2-y-sleepy", "Answer the question", "Are they sleepy?", "sleepy", { visual: "👧 👦 😴", choices: ["Yes, they are.", "No, they aren't."], answer: "Yes, they are." })
      ]),
      customPhase("u9-d2-no", "practice", "No Answers", "Look and Decide", 8, "check", [
        u9PracticeStep(unit, "u9-d2-n-noisy", "Answer the question", "Are they noisy?", "quiet", { visual: "👧 👦 🤫", choices: ["Yes, they are.", "No, they aren't."], answer: "No, they aren't." }),
        u9PracticeStep(unit, "u9-d2-n-angry", "Answer the question", "Are they angry?", "happy", { visual: "👧 👦 😄", choices: ["Yes, they are.", "No, they aren't."], answer: "No, they aren't." })
      ]),
      customPhase("u9-d2-picture", "practice", "Picture Decisions", "Are they...?", 8, "check", [
        u9PracticeStep(unit, "u9-d2-p-hungry", "Look and Answer", "Are they hungry?", "hungry", { visual: "👧 👦 😋", modelAnswer: "Yes, they are." }),
        u9PracticeStep(unit, "u9-d2-p-tired", "Look and Answer", "Are they tired?", "tired", { visual: "👧 👦 🥱", modelAnswer: "Yes, they are." }),
        u9PracticeStep(unit, "u9-d2-p-lazy", "Look and Answer", "Are they lazy?", "lazy", { visual: "👧 👦 🛋️", modelAnswer: "Yes, they are." })
      ]),
      customPhase("u9-d2-fill", "practice", "They / Are Fill-in", "Complete the Sentence", 6, "check", [
        practiceStep("u9-d2-f-they", "Choose the subject", "Are ___ hungry?", { visual: "👧 👦 😋", choices: ["he", "she", "they"], answer: "they" }),
        practiceStep("u9-d2-f-are", "Choose the be verb", "___ they thirsty?", { visual: "👧 👦 🥤", choices: ["Am", "Is", "Are"], answer: "Are" })
      ]),
      customPhase("u9-d2-compare", "grammar", "One or Many?", "Is he...? / Are they...?", 8, "check", [
        practiceStep("u9-d2-c-map", "One vs Many", "Is he hungry?  ·  Are they hungry?", { visual: "👦  /  👧 👦", modelAnswer: "one person → is  ·  many people → are" }),
        u9PracticeStep(unit, "u9-d2-c-one", "One person", "___ he hungry?", "hungry", { visual: "👦 😋", choices: ["Is", "Are"], answer: "Is" }),
        u9PracticeStep(unit, "u9-d2-c-many", "Many people", "___ they hungry?", "hungry", { visual: "👧 👦 😋", choices: ["Is", "Are"], answer: "Are" }),
        practiceStep("u9-d2-c-rule", "Complete the rule", "one person → ___  ·  many people → ___", { choices: ["is / are", "are / is"], answer: "is / are" })
      ]),
      customPhase("u9-d2-check", "check", "Mastery Check", "Are they...?", 2, "check", [
        u9PracticeStep(unit, "u9-d2-final", "Choose the correct pair", "Are they noisy?", "noisy", { visual: "👧 👦 📣", choices: ["Yes, they are.", "Yes, it is.", "Yes, she is."], answer: "Yes, they are." })
      ])
    ];
    return makeUnit9Lesson(unit, 2, "Are they...? 熟練", phases);
  }

  function unit9Day3(unit) {
    const phases = [
      customPhase("u9-d3-map", "grammar", "Singular / Plural Map", "Subject + Be Verb", 7, "teaching", [
        practiceStep("u9-d3-map", "Be Verb Groups", "he / she / it → is  ·  you / they → are  ·  I → am", { modelAnswer: "one → is  ·  many → are" })
      ]),
      customPhase("u9-d3-compare", "grammar", "Singular vs Plural", "One Person / Many People", 8, "teaching", [
        u9PracticeStep(unit, "u9-d3-he", "One person", "He is hungry.", "hungry", { visual: "👦 😋", modelAnswer: "he → is" }),
        u9PracticeStep(unit, "u9-d3-they", "Many people", "They are hungry.", "hungry", { visual: "👧 👦 😋", modelAnswer: "they → are" }),
        u9PracticeStep(unit, "u9-d3-she-q", "One person question", "Is she sleepy?", "sleepy", { visual: "👧 😴", modelAnswer: "she → is" }),
        u9PracticeStep(unit, "u9-d3-they-q", "Many people question", "Are they sleepy?", "sleepy", { visual: "👧 👦 😴", modelAnswer: "they → are" })
      ]),
      customPhase("u9-d3-statement", "practice", "Subject Replacement", "He / She → They", 8, "check", [
        u9PracticeStep(unit, "u9-d3-s-tired", "Change the subject", "He is tired. → They...", "tired", { modelAnswer: "They are tired." }),
        u9PracticeStep(unit, "u9-d3-s-hungry", "Change the subject", "She is hungry. → They...", "hungry", { modelAnswer: "They are hungry." })
      ]),
      customPhase("u9-d3-question", "practice", "Question Replacement", "Is he / she...? → Are they...?", 8, "check", [
        u9PracticeStep(unit, "u9-d3-q-noisy", "Change the subject", "Is he noisy? → They", "noisy", { modelAnswer: "Are they noisy?" }),
        u9PracticeStep(unit, "u9-d3-q-sleepy", "Change the subject", "Is she sleepy? → They", "sleepy", { modelAnswer: "Are they sleepy?" })
      ]),
      customPhase("u9-d3-choose", "practice", "Choose Is or Are", "One or Many?", 9, "check", [
        u9PracticeStep(unit, "u9-d3-c-he", "Choose the be verb", "He ___ hungry.", "hungry", { visual: "👦 😋", choices: ["is", "are"], answer: "is" }),
        u9PracticeStep(unit, "u9-d3-c-they", "Choose the be verb", "They ___ hungry.", "hungry", { visual: "👧 👦 😋", choices: ["is", "are"], answer: "are" }),
        u9PracticeStep(unit, "u9-d3-c-she", "Choose the question verb", "___ she sleepy?", "sleepy", { visual: "👧 😴", choices: ["Is", "Are"], answer: "Is" }),
        u9PracticeStep(unit, "u9-d3-c-many", "Choose the question verb", "___ they sleepy?", "sleepy", { visual: "👧 👦 😴", choices: ["Is", "Are"], answer: "Are" })
      ]),
      customPhase("u9-d3-check", "check", "Singular / Plural Check", "is / are", 5, "check", [
        practiceStep("u9-d3-final", "Complete the map", "he / she / it → ___  ·  you / they → ___  ·  I → ___", { choices: ["is / are / am", "are / is / am"], answer: "is / are / am" })
      ])
    ];
    return makeUnit9Lesson(unit, 3, "單數 vs 複數", phases);
  }

  function unit9Day4(unit) {
    const phases = [
      customPhase("u9-d4-map", "grammar", "Final Be Verb Map", "Book 1 Complete Map", 6, "review", [
        practiceStep("u9-d4-map", "Be Verb Map Final Review", "I am  ·  You are  ·  He is  ·  She is  ·  It is  ·  They are", { modelAnswer: "am / are / is / is / is / are" })
      ]),
      customPhase("u9-d4-be", "practice", "Choose the Be Verb", "Book 1 Mixed Subjects", 12, "check", [
        practiceStep("u9-d4-b-i", "Choose am / are / is", "I ___ a student.", { choices: ["am", "are", "is"], answer: "am" }),
        practiceStep("u9-d4-b-you", "Choose am / are / is", "You ___ happy.", { choices: ["am", "are", "is"], answer: "are" }),
        practiceStep("u9-d4-b-he", "Choose am / are / is", "He ___ my brother.", { choices: ["am", "are", "is"], answer: "is" }),
        practiceStep("u9-d4-b-she", "Choose am / are / is", "She ___ six years old.", { choices: ["am", "are", "is"], answer: "is" }),
        practiceStep("u9-d4-b-it", "Choose am / are / is", "It ___ red.", { choices: ["am", "are", "is"], answer: "is" }),
        practiceStep("u9-d4-b-they", "Choose am / are / is", "They ___ hungry.", { choices: ["am", "are", "is"], answer: "are" })
      ]),
      customPhase("u9-d4-judge", "practice", "Correct or Incorrect?", "Sentence Judgment", 8, "check", [
        practiceStep("u9-d4-j1", "Fix the question", "Are she tired? ✕", { modelAnswer: "Is she tired? ✓" }),
        practiceStep("u9-d4-j2", "Fix the question", "Is they noisy? ✕", { modelAnswer: "Are they noisy? ✓" }),
        practiceStep("u9-d4-j3", "Fix the sentence", "They is hungry. ✕", { modelAnswer: "They are hungry. ✓" }),
        practiceStep("u9-d4-j4", "Check the question", "Are they sleepy? ✓", { modelAnswer: "Correct!" })
      ]),
      customPhase("u9-d4-error", "practice", "Book 1 Error Challenge", "Find and Fix", 7, "check", [
        practiceStep("u9-d4-e1", "Fix the sentence", "I is a student. ✕", { modelAnswer: "I am a student. ✓" }),
        practiceStep("u9-d4-e2", "Fix the sentence", "It are blue. ✕", { modelAnswer: "It is blue. ✓" }),
        practiceStep("u9-d4-e3", "Fix the question", "Are he hungry? ✕", { modelAnswer: "Is he hungry? ✓" })
      ]),
      customPhase("u9-d4-transform", "practice", "Three-Form Transformation", "Affirmative → Negative → Question", 8, "check", [
        u9PracticeStep(unit, "u9-d4-t-noisy", "Change all three forms", "They are noisy.", "noisy", { visual: "👧 👦 📣", modelAnswer: "They are noisy. → They are not noisy. → Are they noisy?" }),
        u9PracticeStep(unit, "u9-d4-t-tired", "Change all three forms", "They are tired.", "tired", { visual: "👧 👦 🥱", modelAnswer: "They are tired. → They are not tired. → Are they tired?" })
      ]),
      customPhase("u9-d4-check", "check", "Final Grammar Challenge", "Book 1 Complete", 4, "check", [
        practiceStep("u9-d4-final", "Complete all six", "I ___ / You ___ / He ___ / She ___ / It ___ / They ___", { choices: ["am / are / is / is / is / are", "are / am / is / are / is / is"], answer: "am / are / is / is / is / are" })
      ])
    ];
    return makeUnit9Lesson(unit, 4, "Book 1 Final Grammar Challenge", phases);
  }

  function book1Unit9Lessons(unit) {
    return [unit9Day1(unit), unit9Day2(unit), unit9Day3(unit), unit9Day4(unit)];
  }

  function b2u1Asset(unit, word) {
    return vocabularyItems(unit.vocabulary).find((item) => item.word.toLowerCase() === word.toLowerCase()) || { word };
  }

  function b2u1PracticeStep(unit, id, title, prompt, word, options = {}) {
    return practiceStep(id, title, prompt, { ...b2u1Asset(unit, word), word, ...options });
  }

  function b2u1TransformerStep(unit, id, source, word) {
    const asset = b2u1Asset(unit, word);
    return sentenceTransformerStep(id, source, {
      affirmative: `There is a ${word}.`,
      negative: `There is not a ${word}.`,
      question: `Is there a ${word}?`
    }, { ...asset, word });
  }

  function makeBook2Unit1Lesson(unit, day, dayGoal, phases) {
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
      dailyHandout: {
        day,
        pageStart: ((day - 1) * 4) + 1,
        pageEnd: day * 4,
        studentUrl: "assets/handouts/book2/unit1/book2-unit1-daily-handouts.pdf?v=2",
        teacherUrl: "assets/handouts/book2/unit1/book2-unit1-teacher-key.pdf?v=2"
      },
      steps
    };
  }

  function book2Unit1Day1(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const passportAnswers = [true, true, false, true, true, false, true, true, false, true];
    const phases = [
      liveSectionPhase("b2u1-d1", "warm-up", "Warm Up", "Classroom Hunt Warm Up", 5, "speaking", "Look around the classroom. Point to an object you already know."),
      liveTalkPhase(unit, "b2u1-d1", "What can you see in our classroom?", "There is a ______."),
      customPhase("b2u1-d1-vocab", "lets-learn", "Let’s Learn", "Let’s Learn · Classroom Vocabulary", 12, "teaching", vocabularySteps(unit, 0, "b2u1-d1-word", "Let’s Learn"), { vocabulary }),
      liveVocabularyReviewPhase(unit, "book-2", "b2u1-d1", vocabulary),
      liveChantPhase(unit, "b2u1-d1", "door, window, television, speaker — point, clap, and chant the classroom words."),
      customPhase("b2u1-d1-there-is", "lets-practice", "Let’s Practice", "There is + One Thing", 6, "teaching", [
        b2u1PracticeStep(unit, "b2u1-d1-door", "There is + one thing", "There is a door.", "door", { modelAnswer: "有一扇門。" }),
        b2u1PracticeStep(unit, "b2u1-d1-fan", "There is + one thing", "There is a fan.", "fan", { modelAnswer: "有一台電風扇。" })
      ]),
      customPhase("b2u1-d1-question", "lets-practice", "Let’s Practice", "Move Is to the Front", 6, "teaching", [
        b2u1PracticeStep(unit, "b2u1-d1-transform", "Statement → Question", "There is a door.  →  Is there a door?", "door", { modelAnswer: "Move is before there." }),
        b2u1PracticeStep(unit, "b2u1-d1-positive", "Positive Answer", "Is there a fan?", "fan", { modelAnswer: "Yes, there is." })
      ]),
      customPhase("b2u1-d1-core", "lets-practice", "Let’s Practice", "Singular Question Pattern", 5, "teaching", [
        practiceStep("b2u1-d1-formula", "Question Formula", "Is there + a + singular thing?", { visual: "🚪", modelAnswer: "Is there a door?  Yes, there is." })
      ]),
      customPhase("b2u1-d1-passport", "lets-practice", "Let’s Practice", "Passport · Ten Classroom Questions", 10, "teaching", vocabulary.map((item, index) =>
        b2u1PracticeStep(unit, `b2u1-d1-passport-${index + 1}`, `Passport ${index + 1} / ${vocabulary.length}`, `Is there a ${item.word}?`, item.word, {
          modelAnswer: passportAnswers[index] ? "Yes, there is." : "No, there isn't."
        })
      )),
      customPhase("b2u1-d1-hunt", "grammar-activity", "Grammar Activity", "Classroom Hunt", 6, "check", [
        b2u1PracticeStep(unit, "b2u1-d1-hunt-fan", "Classroom Hunt", "Is there a fan in the classroom?", "fan", { modelAnswer: "Yes, there is. / No, there isn't." }),
        b2u1PracticeStep(unit, "b2u1-d1-hunt-door", "Classroom Hunt", "Is there a door in the classroom?", "door", { modelAnswer: "Yes, there is. / No, there isn't." }),
        b2u1PracticeStep(unit, "b2u1-d1-hunt-tv", "Classroom Hunt", "Is there a television in the classroom?", "television", { modelAnswer: "Yes, there is. / No, there isn't." })
      ]),
      customPhase("b2u1-d1-see-say", "grammar-activity", "Grammar Activity", "See and Say", 6, "check", [
        b2u1PracticeStep(unit, "b2u1-d1-see-window", "See and Say", "There is a ______.", "window", { modelAnswer: "There is a window." }),
        b2u1PracticeStep(unit, "b2u1-d1-see-speaker", "See and Say", "There is a ______.", "speaker", { modelAnswer: "There is a speaker." }),
        b2u1PracticeStep(unit, "b2u1-d1-see-table", "See and Say", "There is a ______.", "table", { modelAnswer: "There is a table." })
      ]),
      liveGrammarBookPhase(unit, "b2u1-d1")
    ];
    return makeBook2Unit1Lesson(unit, 1, "Let’s Talk → Learn → Chant → Practice → Grammar Book", phases);
  }

  function book2Unit1Day2(unit) {
    const phases = [
      customPhase("b2u1-d2-review", "quick-review", "Quick Review", "Is there...?", 5, "review", [
        practiceStep("b2u1-d2-review", "Question + Answer", "Is there a ___?", { modelAnswer: "Yes, there is. / No, there isn't." })
      ]),
      customPhase("b2u1-d2-speak", "lets-speak", "Let’s Speak", "Let’s Speak · Classroom Dialogue", 15, "conversation", [
        practiceStep("b2u1-d2-map", "Correct Answer Map", "Is there...? → Yes, there is. / No, there isn't.", { modelAnswer: "Do not answer: Yes, it is." }),
        practiceStep("b2u1-d2-m-tv", "Mystery Classroom", "Is there a television?", { visual: "❓", modelAnswer: "📺  Yes, there is!" }),
        practiceStep("b2u1-d2-m-fan", "Mystery Classroom", "Is there a fan?", { visual: "❓", modelAnswer: "🌀  Yes, there is!" }),
        practiceStep("b2u1-d2-m-phone", "Mystery Classroom", "Is there a telephone?", { visual: "❓", modelAnswer: "No, there isn't." })
      ]),
      liveReadPhase(unit, "b2u1-d2"),
      customPhase("b2u1-d2-reading-check", "reading-check", "Reading Check", "Read & Respond", 10, "check", [
        b2u1PracticeStep(unit, "b2u1-d2-read-1", "Choose the question", "You want to know about a door.", "door", { choices: ["Is there a door?", "It is a door?"], answer: "Is there a door?" }),
        practiceStep("b2u1-d2-read-2", "Choose the reply", "Is there a speaker?", { choices: ["Yes, there is.", "Yes, it is."], answer: "Yes, there is." })
      ]),
      customPhase("b2u1-d2-speaking-activity", "speaking-activity", "Speaking Activity", "Guess and Ask", 10, "check", [
        practiceStep("b2u1-d2-g1", "Secret Card 1", "Ask: Is there a ___?", { visual: "🔒", modelAnswer: "fan" }),
        practiceStep("b2u1-d2-g2", "Secret Card 2", "Ask: Is there a ___?", { visual: "🔒", modelAnswer: "whiteboard" }),
        practiceStep("b2u1-d2-g3", "Secret Card 3", "Ask: Is there a ___?", { visual: "🔒", modelAnswer: "trash can" })
      ]),
      livePhonicsPhase(unit, "b2u1-d2"),
      liveShowBookPhase(unit, "b2u1-d2")
    ];
    return makeBook2Unit1Lesson(unit, 2, "Let’s Speak → Read → Say", phases);
  }

  function book2Unit1Day3(unit) {
    const phases = [
      customPhase("b2u1-d3-positive", "grammar", "Affirmative", "There is...", 6, "teaching", [
        b2u1PracticeStep(unit, "b2u1-d3-p-speaker", "Affirmative Sentence", "There is a speaker.", "speaker", { modelAnswer: "有一個喇叭。" }),
        b2u1PracticeStep(unit, "b2u1-d3-p-table", "Affirmative Sentence", "There is a table.", "table", { modelAnswer: "有一張桌子。" })
      ]),
      customPhase("b2u1-d3-negative", "grammar", "Negative", "There is not...", 6, "teaching", [
        b2u1PracticeStep(unit, "b2u1-d3-n-speaker", "Make it negative", "There is a speaker.", "speaker", { modelAnswer: "There is not a speaker." }),
        b2u1PracticeStep(unit, "b2u1-d3-n-tv", "Make it negative", "There is a television.", "television", { modelAnswer: "There is not a television." })
      ]),
      customPhase("b2u1-d3-contraction", "grammar", "Is Not / Isn't", "Contraction", 5, "teaching", [
        practiceStep("b2u1-d3-contraction", "Contraction Map", "there is not = there isn't", { modelAnswer: "There is not a television. = There isn't a television." })
      ]),
      customPhase("b2u1-d3-three", "grammar", "Three Sentence Forms", "Affirmative · Negative · Question", 8, "teaching", [
        b2u1TransformerStep(unit, "b2u1-d3-fan", "There is a fan.", "fan"),
        b2u1TransformerStep(unit, "b2u1-d3-door", "There is a door.", "door")
      ]),
      customPhase("b2u1-d3-true-fake", "practice", "True / Fake Classroom", "Look Around and Decide", 8, "check", [
        b2u1PracticeStep(unit, "b2u1-d3-t-blackboard", "True or False?", "There is a blackboard in the classroom.", "blackboard", { choices: ["True", "False"], answer: "True" }),
        b2u1PracticeStep(unit, "b2u1-d3-t-phone", "True or False?", "There is a telephone in the classroom.", "telephone", { choices: ["True", "False"], answer: "False", modelAnswer: "There is not a telephone." })
      ]),
      customPhase("b2u1-d3-throw", "practice", "Throw and Say", "Digital 3 × 4 Grid", 10, "check", [
        b2u1PracticeStep(unit, "b2u1-d3-r-door", "Random: door", "door", "door", { modelAnswer: "There is a door." }),
        b2u1PracticeStep(unit, "b2u1-d3-r-fan", "Random: fan", "fan", "fan", { modelAnswer: "There is a fan." }),
        b2u1PracticeStep(unit, "b2u1-d3-r-not-tv", "Random: not + television", "not + television", "television", { modelAnswer: "There is not a television." }),
        b2u1PracticeStep(unit, "b2u1-d3-r-not-phone", "Random: not + telephone", "not + telephone", "telephone", { modelAnswer: "There is not a telephone." })
      ]),
      customPhase("b2u1-d3-check", "check", "Form Check", "There is / There is not / Is there?", 2, "check", [
        b2u1PracticeStep(unit, "b2u1-d3-final", "Choose the negative", "fan", "fan", { choices: ["There is a fan.", "There is not a fan.", "Is there a fan?"], answer: "There is not a fan." })
      ])
    ];
    return makeBook2Unit1Lesson(unit, 3, "文法延伸：There is / There is not", phases);
  }

  function book2Unit1Day4(unit) {
    const phases = [
      customPhase("b2u1-d4-map", "grammar", "Three Sentence Forms", "Affirmative · Negative · Question", 5, "review", [
        b2u1PracticeStep(unit, "b2u1-d4-map", "Three Forms", "There is a door.\nThere is not a door.\nIs there a door?", "door", { modelAnswer: "affirmative / negative / question" })
      ]),
      customPhase("b2u1-d4-transformer", "practice", "Sentence Transformer", "Choose a Sentence Form", 12, "check", [
        b2u1TransformerStep(unit, "b2u1-d4-t-phone", "There is a telephone.", "telephone"),
        b2u1TransformerStep(unit, "b2u1-d4-t-fan", "There is a fan.", "fan"),
        b2u1TransformerStep(unit, "b2u1-d4-t-tv", "There is a television.", "television")
      ]),
      customPhase("b2u1-d4-error", "practice", "Error Detective", "Find and Fix", 8, "check", [
        b2u1PracticeStep(unit, "b2u1-d4-e1", "Fix the question", "Is there is a fan? ✕", "fan", { modelAnswer: "Is there a fan? ✓" }),
        b2u1PracticeStep(unit, "b2u1-d4-e2", "Fix the statement", "There are a door. ✕", "door", { modelAnswer: "There is a door. ✓" }),
        practiceStep("b2u1-d4-e3", "Fix the answer", "Yes, it is. ✕", { modelAnswer: "Yes, there is. ✓" }),
        practiceStep("b2u1-d4-e4", "Fix the answer", "No, there aren't. ✕", { modelAnswer: "No, there isn't. ✓" })
      ]),
      customPhase("b2u1-d4-quickly", "practice", "Quickly!", "See · Remember · Say", 8, "check", [
        b2u1PracticeStep(unit, "b2u1-d4-q-window", "Quick Look", "Say the sentence quickly.", "window", { modelAnswer: "There is a window." }),
        b2u1PracticeStep(unit, "b2u1-d4-q-board", "Quick Look", "Say the sentence quickly.", "whiteboard", { modelAnswer: "There is a whiteboard." }),
        b2u1PracticeStep(unit, "b2u1-d4-q-trash", "Quick Look", "Answer: Is there a trash can?", "trash can", { modelAnswer: "Yes, there is. / No, there isn't." })
      ]),
      customPhase("b2u1-d4-mixed", "practice", "Mixed Transformations", "Statement → Target Form", 8, "check", [
        b2u1PracticeStep(unit, "b2u1-d4-m-fan", "Change to a question", "There is a fan.", "fan", { modelAnswer: "Is there a fan?" }),
        b2u1PracticeStep(unit, "b2u1-d4-m-tv", "Change to negative", "There is a television.", "television", { modelAnswer: "There is not a television." }),
        b2u1PracticeStep(unit, "b2u1-d4-m-table", "Change to affirmative", "Is there a table?", "table", { modelAnswer: "There is a table." })
      ]),
      customPhase("b2u1-d4-check", "check", "Final Check", "Book 2 Unit 1", 4, "check", [
        practiceStep("b2u1-d4-final", "Complete the map", "There is + singular / There is not + singular / Is there + singular?", { modelAnswer: "Yes, there is. / No, there isn't." })
      ])
    ];
    return makeBook2Unit1Lesson(unit, 4, "進階：肯定、否定、問句混合", phases);
  }

  function book2Unit1Lessons(unit) {
    return [book2Unit1Day1(unit), book2Unit1Day2(unit), book2Unit1Day3(unit), book2Unit1Day4(unit)];
  }

  function b3u1Asset(unit, word) {
    const normalized = String(word).toLowerCase();
    return vocabularyItems(unit.vocabulary).find((item) => {
      const aliases = item.aliases || [];
      return item.word.toLowerCase() === normalized || aliases.some((alias) => alias.toLowerCase() === normalized);
    }) || { word };
  }

  function b3u1PracticeStep(unit, id, title, prompt, word, options = {}) {
    return practiceStep(id, title, prompt, { ...b3u1Asset(unit, word), word, ...options });
  }

  function b3u1LoopQuestion(unit, prompt, word = "", options = {}) {
    return {
      ...(word ? b3u1Asset(unit, word) : {}),
      prompt,
      choices: options.choices || [],
      answer: options.answer || "",
      modelAnswer: options.modelAnswer || options.answer || "",
      visual: options.visual || (word ? b3u1Asset(unit, word).visual : "")
    };
  }

  function b3u1TransformerStep(unit, id, subject, animal) {
    const asset = b3u1Asset(unit, animal);
    return sentenceTransformerStep(id, `${subject} like ${animal}.`, {
      affirmative: `${subject} like ${animal}.`,
      negative: `${subject} don't like ${animal}.`,
      question: `Do ${subject.toLowerCase()} like ${animal}?`
    }, { ...asset, word: animal });
  }

  function makeBook3Unit1Lesson(unit, day, dayGoal, phases) {
    const steps = phases.flatMap((phase) => phase.steps);
    const totalDuration = phases.reduce((total, phase) => total + (Number(phase.duration) || 0), 0);
    const reviewDay = window.BOOK3_REVIEW_BANK?.[unit.id]?.[`day${day}`] || null;
    const firstPage = ((day - 1) * 4) + 1;
    return {
      id: `day-${day}`,
      title: `${unit.title} · Day ${day}｜${dayGoal}`,
      day: `Day ${day}`,
      dayGoal,
      curriculum: curriculumFor(unit),
      phases,
      duration: totalDuration,
      durationMinutes: totalDuration,
      dailyHandout: {
        day,
        pageStart: firstPage,
        pageEnd: firstPage + 3,
        studentUrl: "assets/handouts/book3/unit1/book3-unit1-daily-handouts.pdf",
        teacherUrl: "assets/handouts/book3/unit1/book3-unit1-teacher-key.pdf"
      },
      worksheet: reviewDay ? { unitTitle: unit.title, day, ...reviewDay } : null,
      steps
    };
  }

  function reviewLoopQuestion(item) {
    return {
      prompt: item.playerPrompt,
      choices: item.choices || [],
      answer: item.answer,
      modelAnswer: item.answer,
      visual: item.visual || "",
      skill: item.skill,
      difficulty: item.difficulty
    };
  }

  function reviewQuestions(unitId, day, part) {
    return (window.BOOK3_REVIEW_BANK?.[unitId]?.[`day${day}`]?.blocks?.[part]?.questions || []).map(reviewLoopQuestion);
  }

  function book3Unit1Day1(unit) {
    const vocabulary = vocabularyItems(unit.vocabulary);
    const passport = [
      ["I", "birds"], ["You", "frogs"], ["We", "puppies"], ["They", "fish"]
    ];
    const phases = [
      liveSectionPhase("b3u1-d1", "warm-up", "Warm Up", "Animal Warm Up", 5, "speaking", "Name an animal you already know."),
      liveTalkPhase(unit, "b3u1-d1", "What animals do you like?", "I like ______."),
      customPhase("b3u1-d1-vocab", "lets-learn", "Let’s Learn", "Let’s Learn · Animals", 12, "teaching", vocabularySteps(unit, 0, "b3u1-d1-word", "Let’s Learn"), { vocabulary }),
      liveVocabularyReviewPhase(unit, "book-3", "b3u1-d1", vocabulary),
      liveChantPhase(unit, "b3u1-d1", "I like birds. You like frogs. We like puppies. They like fish."),
      customPhase("b3u1-d1-subjects", "lets-practice", "Let’s Practice", "I / You / We / They + like", 8, "teaching", [
        practiceStep("b3u1-d1-map", "Subject Map", "I like  ·  You like  ·  We like  ·  They like", { modelAnswer: "The subject changes. The verb like stays the same." }),
        practiceStep("b3u1-d1-like", "What stays the same?", "I → You → We → They", { choices: ["like", "likes", "am"], answer: "like" })
      ]),
      customPhase("b3u1-d1-plural", "lets-practice", "Let’s Practice", "Animals as a Group", 5, "teaching", [
        b3u1PracticeStep(unit, "b3u1-d1-plural", "One type of animal", "I like birds.  ·  You like frogs.  ·  We like puppies.", "birds", { modelAnswer: "Use plural animal words when talking about the kind you like." }),
        b3u1PracticeStep(unit, "b3u1-d1-fish", "Special Word", "They like fish.", "fish", { modelAnswer: "fish — not fishes in this sentence" })
      ]),
      customPhase("b3u1-d1-passport", "lets-practice", "Let’s Practice", "Passport · First Four Sentences", 12, "teaching", passport.map(([subject, animal], index) =>
        b3u1PracticeStep(unit, `b3u1-d1-passport-${index + 1}`, `Passport ${index + 1} / 4`, `${subject} like ______.`, animal, { modelAnswer: `${subject} like ${animal}.` })
      )),
      customPhase("b3u1-d1-substitution", "grammar-activity", "Grammar Activity", "主詞 + like 連續訓練", 10, "check", [
        practiceLoopStep("b3u1-d1-loop", "Subject + like Practice Loop", [
          b3u1LoopQuestion(unit, "I ___ birds.", "birds", { choices: ["like", "likes"], answer: "like" }),
          b3u1LoopQuestion(unit, "You ___ frogs.", "frogs", { choices: ["like", "likes"], answer: "like" }),
          b3u1LoopQuestion(unit, "We ___ puppies.", "puppies", { choices: ["like", "likes"], answer: "like" }),
          b3u1LoopQuestion(unit, "They ___ fish.", "fish", { choices: ["like", "likes"], answer: "like" }),
          b3u1LoopQuestion(unit, "Change I → You:\nI like birds.", "birds", { modelAnswer: "You like birds." }),
          b3u1LoopQuestion(unit, "Change You → We:\nYou like frogs.", "frogs", { modelAnswer: "We like frogs." }),
          b3u1LoopQuestion(unit, "Change We → They:\nWe like puppies.", "puppies", { modelAnswer: "They like puppies." }),
          b3u1LoopQuestion(unit, "Choose the correct sentence.", "fish", { choices: ["They like fish.", "They likes fishes."], answer: "They like fish." })
        ])
      ]),
      liveGrammarBookPhase(unit, "b3u1-d1")
    ];
    return makeBook3Unit1Lesson(unit, 1, "Let’s Talk → Learn → Chant → Practice → Grammar Book", phases);
  }

  function book3Unit1Day2(unit) {
    const phases = [
      customPhase("b3u1-d2-review", "quick-review", "Quick Review", "Subject + like", 5, "review", [
        practiceStep("b3u1-d2-review", "Complete all four", "I ___  ·  You ___  ·  We ___  ·  They ___", { choices: ["like / like / like / like", "like / likes / like / likes"], answer: "like / like / like / like" })
      ]),
      customPhase("b3u1-d2-formula", "lets-speak", "Let’s Speak", "What + do + Subject + like?", 8, "conversation", [
        practiceStep("b3u1-d2-formula", "Question Formula", "What + do + you / they + like?", { modelAnswer: "What do you like?  ·  What do they like?" }),
        practiceStep("b3u1-d2-do-map", "Do Map", "you → do  ·  they → do", { modelAnswer: "Use do with you and they." })
      ]),
      customPhase("b3u1-d2-compare", "lets-speak", "Let’s Speak", "Dialogue · You / They", 7, "conversation", [
        b3u1PracticeStep(unit, "b3u1-d2-you", "Statement → Question", "You like bunnies.  →  What do you like?", "bunnies", { modelAnswer: "I like bunnies." }),
        b3u1PracticeStep(unit, "b3u1-d2-they", "Statement → Question", "They like turtles.  →  What do they like?", "turtles", { modelAnswer: "They like turtles." })
      ]),
      customPhase("b3u1-d2-random", "speaking-activity", "Speaking Activity", "What do...? 連續訓練", 10, "check", [
        practiceLoopStep("b3u1-d2-loop", "What do...? Practice Loop", [
          b3u1LoopQuestion(unit, "What do you like?", "bunnies", { modelAnswer: "I like bunnies." }),
          b3u1LoopQuestion(unit, "What do they like?", "turtles", { modelAnswer: "They like turtles." }),
          b3u1LoopQuestion(unit, "What do you like?", "frogs", { modelAnswer: "I like frogs." }),
          b3u1LoopQuestion(unit, "What do they like?", "puppies", { modelAnswer: "They like puppies." }),
          b3u1LoopQuestion(unit, "What ___ you like?", "birds", { choices: ["do", "are", "is"], answer: "do" }),
          b3u1LoopQuestion(unit, "What ___ they like?", "fish", { choices: ["do", "are", "is"], answer: "do" }),
          b3u1LoopQuestion(unit, "do / What / you / like / ?", "hamsters", { choices: ["What do you like?", "What you do like?"], answer: "What do you like?" }),
          b3u1LoopQuestion(unit, "they / What / like / do / ?", "spiders", { choices: ["What do they like?", "Do what they like?"], answer: "What do they like?" })
        ])
      ]),
      customPhase("b3u1-d2-passport", "lets-speak", "Let’s Speak", "Passport · What do you / they like?", 8, "conversation", [
        b3u1PracticeStep(unit, "b3u1-d2-passport-you", "Passport Question", "What do you like?", "bunnies", { modelAnswer: "I like bunnies." }),
        b3u1PracticeStep(unit, "b3u1-d2-passport-they", "Passport Question", "What do they like?", "turtles", { modelAnswer: "They like turtles." })
      ]),
      liveReadPhase(unit, "b3u1-d2"),
      customPhase("b3u1-d2-reading-check", "reading-check", "Reading Check", "Read & Respond", 10, "check", [
        b3u1PracticeStep(unit, "b3u1-d2-read-1", "Complete the answer", "What do you like? I like ______.", "bunnies", { choices: ["bunnies", "bunny"], answer: "bunnies" }),
        b3u1PracticeStep(unit, "b3u1-d2-read-2", "Complete the answer", "What do they like? They like ______.", "turtles", { choices: ["turtles", "turtle"], answer: "turtles" })
      ]),
      livePhonicsPhase(unit, "b3u1-d2"),
      liveShowBookPhase(unit, "b3u1-d2")
    ];
    return makeBook3Unit1Lesson(unit, 2, "Let’s Speak → Read → Say", phases);
  }

  function book3Unit1Day3(unit) {
    const partA = reviewQuestions(unit.id, 3, "A");
    const partB = reviewQuestions(unit.id, 3, "B");
    const phases = [
      customPhase("b3u1-d3-a-retrieval", "block-a", "Block A｜肯定句", "Quick Retrieval", 7, "review", [
        practiceStep("b3u1-d3-a-map", "Subject Map", "I like  ·  You like  ·  We like  ·  They like", { modelAnswer: "The subject changes. The verb like stays the same." }),
        b3u1PracticeStep(unit, "b3u1-d3-a-fish", "Special Word", "They like fish.", "fish", { modelAnswer: "Use fish, not fishes, in this sentence." })
      ]),
      customPhase("b3u1-d3-a-grammar", "block-a", "Block A｜肯定句", "Grammar Box · Affirmative", 8, "teaching", [
        practiceStep("b3u1-d3-a-formula", "Grammar Box", "I / You / We / They + like + plural animal", { modelAnswer: "I like birds.  ·  We like puppies.  ·  They like fish." })
      ]),
      customPhase("b3u1-d3-a-loop", "block-a", "Block A｜肯定句", "Affirmative Practice Loop", 10, "check", [
        practiceLoopStep("b3u1-d3-a-practice", "Part A · Affirmative Practice", partA)
      ]),
      customPhase("b3u1-d3-a-wordwall", "block-a", "Block A｜肯定句", "Game / Wordwall", 5, "game", [
        { ...wordwallStep(unit, "book-3", "day-3-part-a", 0), title: "Part A Wordwall" }
      ]),
      customPhase("b3u1-d3-a-write", "block-a", "Block A｜肯定句", "Write Time · Part A", 12, "writing", [
        writeTimeStep("b3u1-d3-write-a", "A", 12, "Complete Part A on the Day 3 worksheet. Then check the affirmative sentences together.")
      ]),
      customPhase("b3u1-d3-b-grammar", "block-b", "Block B｜否定句", "Grammar Box · Negative", 8, "teaching", [
        practiceStep("b3u1-d3-b-formula", "Grammar Box", "I / You / We / They + don't like + animal", { modelAnswer: "They don't like spiders.  ·  We don't like frogs." }),
        practiceStep("b3u1-d3-b-contrast", "Do not mix the patterns", "You don't like spiders.  ✓\nYou aren't like spiders.  ✕", { modelAnswer: "Use don't with the action verb like." })
      ]),
      customPhase("b3u1-d3-b-transform", "block-b", "Block B｜否定句", "Sentence Transformer", 8, "game", [
        b3u1TransformerStep(unit, "b3u1-d3-b-t1", "They", "spiders"),
        b3u1TransformerStep(unit, "b3u1-d3-b-t2", "We", "puppies")
      ]),
      customPhase("b3u1-d3-b-loop", "block-b", "Block B｜否定句", "Negative Practice Loop", 10, "check", [
        practiceLoopStep("b3u1-d3-b-practice", "Part B · Negative Practice", partB)
      ]),
      customPhase("b3u1-d3-b-write", "block-b", "Block B｜否定句", "Write Time · Part B", 12, "writing", [
        writeTimeStep("b3u1-d3-write-b", "B", 12, "Complete Part B on the Day 3 worksheet. Use don't like in every negative sentence.")
      ]),
      customPhase("b3u1-d3-b-exit", "block-b", "Block B｜否定句", "Correction & Exit Ticket", 5, "check", [
        practiceLoopStep("b3u1-d3-exit", "Day 3 Exit Ticket", partB.slice(4, 8))
      ])
    ];
    return makeBook3Unit1Lesson(unit, 3, "肯定句 → 否定句｜雙區塊複習", phases);
  }

  function book3Unit1Day4(unit) {
    const partA = reviewQuestions(unit.id, 4, "A");
    const partB = reviewQuestions(unit.id, 4, "B");
    const phases = [
      customPhase("b3u1-d4-a-retrieval", "block-a", "Block A｜疑問句", "Quick Retrieval", 6, "review", [
        practiceStep("b3u1-d4-a-map", "Question Map", "What do you / they like?\nDo you / they like...?", { modelAnswer: "Wh question → information answer  |  Do question → Yes / No answer" })
      ]),
      customPhase("b3u1-d4-a-grammar", "block-a", "Block A｜疑問句", "Grammar Box · Questions", 10, "teaching", [
        practiceStep("b3u1-d4-a-wh", "Wh Question", "What + do + you / they + like?", { modelAnswer: "What do they like?  →  They like turtles." }),
        practiceStep("b3u1-d4-a-yesno", "Yes / No Question", "Do + you / they + like + animal?", { modelAnswer: "Do you like spiders?  →  No, I don't." })
      ]),
      customPhase("b3u1-d4-a-loop", "block-a", "Block A｜疑問句", "Question Practice Loop", 10, "check", [
        practiceLoopStep("b3u1-d4-a-practice", "Part A · Questions and Answers", partA)
      ]),
      customPhase("b3u1-d4-a-wordwall", "block-a", "Block A｜疑問句", "Game / Wordwall", 4, "game", [
        { ...wordwallStep(unit, "book-3", "day-4-part-a", 0), title: "Part A Wordwall" }
      ]),
      customPhase("b3u1-d4-a-write", "block-a", "Block A｜疑問句", "Write Time · Part A", 12, "writing", [
        writeTimeStep("b3u1-d4-write-a", "A", 12, "Complete Part A on the Day 4 worksheet. Build the questions before choosing an answer.")
      ]),
      customPhase("b3u1-d4-b-map", "block-b", "Block B｜綜合螺旋", "Spiral Grammar Map", 8, "teaching", [
        practiceStep("b3u1-d4-b-map", "Choose the Question Helper", "be verb → Am / Are / Is\nthere be → Is there\naction verb → Do", { modelAnswer: "Are you happy?  ·  Is there a fan?  ·  Do they like turtles?" })
      ]),
      customPhase("b3u1-d4-b-loop", "block-b", "Block B｜綜合螺旋", "Mixed Spiral Practice", 12, "check", [
        practiceLoopStep("b3u1-d4-b-practice", "Part B · Mixed Spiral Review", partB)
      ]),
      customPhase("b3u1-d4-b-challenge", "block-b", "Block B｜綜合螺旋", "Error Detective & Transformer", 8, "game", [
        b3u1TransformerStep(unit, "b3u1-d4-b-t1", "They", "turtles"),
        b3u1PracticeStep(unit, "b3u1-d4-b-error", "Fix the question", "Are you like hamsters? ✕", "hamsters", { modelAnswer: "Do you like hamsters? ✓" })
      ]),
      customPhase("b3u1-d4-b-write", "block-b", "Block B｜綜合螺旋", "Write Time · Part B", 12, "writing", [
        writeTimeStep("b3u1-d4-write-b", "B", 12, "Complete Part B on the Day 4 worksheet. Decide whether each sentence needs a be verb, there be, or do.")
      ]),
      customPhase("b3u1-d4-b-exit", "block-b", "Block B｜綜合螺旋", "Exit Ticket", 3, "check", [
        practiceLoopStep("b3u1-d4-exit", "Day 4 Exit Ticket", partB.slice(5, 10))
      ])
    ];
    return makeBook3Unit1Lesson(unit, 4, "疑問句 → 全題型｜雙區塊螺旋複習", phases);
  }

  function book3Unit1Lessons(unit) {
    return [book3Unit1Day1(unit), book3Unit1Day2(unit), book3Unit1Day3(unit), book3Unit1Day4(unit)];
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

  function spiralWorksheetQuestion(step, id, fallbackSkill) {
    const practice = step.practice || {};
    const prompt = practice.prompt || step.prompt || step.instruction || step.title || "";
    const answer = practice.answer || practice.modelAnswer || step.answer || step.modelAnswer || "";
    if (!prompt || !answer) return null;
    return {
      id,
      skill: step.phaseTitle || fallbackSkill,
      type: practice.choices?.length ? "choice" : "rewrite",
      playerPrompt: prompt,
      worksheetPrompt: prompt,
      answer,
      choices: practice.choices || [],
      image: practice.image || step.image || "",
      sprite: practice.sprite || step.sprite || null,
      visual: practice.visual || step.visual || ((!practice.image && !practice.sprite) ? practice.word : ""),
      difficulty: 1
    };
  }

  function book3GrammarToken(sentence) {
    const groups = [
      { pattern: /\b(doesn't|don't)\b/i, choices: ["doesn't", "don't", "isn't"] },
      { pattern: /\b(wants|want)\b/i, choices: ["want", "wants", "wanting"] },
      { pattern: /\b(likes|like)\b/i, choices: ["like", "likes", "liking"] },
      { pattern: /\b(has|have)\b/i, choices: ["have", "has", "having"] },
      { pattern: /\b(does|do)\b/i, choices: ["do", "does", "is"] },
      { pattern: /\b(some|any)\b/i, choices: ["some", "any", "a"] },
      { pattern: /\b(on)\b/i, choices: ["on", "in", "at"] }
    ];
    const group = groups.find((item) => item.pattern.test(sentence));
    if (!group) return null;
    const match = sentence.match(group.pattern);
    const answer = match[0];
    const choices = group.choices.map((choice) => match.index === 0 ? choice.charAt(0).toUpperCase() + choice.slice(1) : choice);
    return { answer, choices, index: match.index, length: answer.length };
  }

  function worksheetGrammarToken(sentence) {
    const groups = [
      { pattern: /\b(am|are|is)\b/i, choices: ["am", "are", "is"] },
      { pattern: /\b(do|does)\b/i, choices: ["do", "does", "is"] },
      { pattern: /\b(like|likes)\b/i, choices: ["like", "likes", "liking"] },
      { pattern: /\b(have|has)\b/i, choices: ["have", "has", "having"] },
      { pattern: /\b(this|that)\b/i, choices: ["this", "that"] },
      { pattern: /\b(a|an)\b/i, choices: ["a", "an"] }
    ];
    const group = groups.find((item) => item.pattern.test(sentence));
    if (!group) return null;
    const match = sentence.match(group.pattern);
    const answer = match[0];
    const choices = group.choices.map((choice) => match.index === 0 ? choice.charAt(0).toUpperCase() + choice.slice(1) : choice);
    return { answer, choices, index: match.index, length: answer.length };
  }

  function worksheetEnglishSentence(question) {
    const candidates = [question.answer, question.playerPrompt, question.worksheetPrompt];
    return candidates.find((value) => {
      const text = String(value || "").trim();
      return /^[\x20-\x7E]+$/.test(text)
        && /[.?!]$/.test(text)
        && text.split(/\s+/).length >= 3
        && !/[=+→✕✓]|___|\s\/\s/.test(text);
    }) || "";
  }

  function worksheetWrongToken(token) {
    const preferred = {
      am: "are",
      are: "is",
      is: "are",
      do: "does",
      does: "do",
      like: "likes",
      likes: "like",
      have: "has",
      has: "have",
      this: "that",
      that: "this",
      a: "an",
      an: "a"
    };
    return preferred[token.answer.toLowerCase()]
      || token.choices.find((choice) => choice.toLowerCase() !== token.answer.toLowerCase())
      || token.choices[0];
  }

  function worksheetContentBlank(sentence) {
    const stopWords = new Set(["a", "an", "the", "am", "are", "is", "do", "does", "to", "of", "in", "on", "my", "your", "his", "her", "it", "they", "you", "i", "we", "he", "she", "today"]);
    const words = [...sentence.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)];
    const target = words.filter((match) => !stopWords.has(match[0].toLowerCase())).sort((a, b) => b[0].length - a[0].length)[0] || words[words.length - 1];
    if (!target) return null;
    return {
      answer: sentence,
      prompt: `${sentence.slice(0, target.index)}________${sentence.slice(target.index + target[0].length)}`
    };
  }

  function strengthenWorksheetQuestion(question, day, part, index) {
    if (question.choices?.length || question.type === "error" || question.type === "reorder" || question.type === "fill") return question;
    const sentence = worksheetEnglishSentence(question);
    if (!sentence) return question;
    const token = worksheetGrammarToken(sentence);
    const hasPicture = question.image || question.sprite || question.visual;
    const mode = day === 4 ? index % 4 : (part === "A" ? index % 3 : (index + 1) % 3);

    if ((mode === 0 || (part === "B" && day === 4)) && hasPicture) {
      return {
        ...question,
        type: "picture",
        worksheetPrompt: day === 4
          ? "Look at the picture. Write a complete sentence without copying."
          : "Look at the picture. Recall and write the complete sentence.",
        answer: sentence,
        difficulty: day === 4 ? 3 : 2
      };
    }
    if (mode === 1 && token) {
      const prompt = `${sentence.slice(0, token.index)}___${sentence.slice(token.index + token.length)}`;
      return {
        ...question,
        type: "choice",
        worksheetPrompt: `Choose the correct word: ${prompt}`,
        answer: token.answer,
        choices: token.choices,
        difficulty: 2
      };
    }
    if (mode === 2 && token) {
      const wrong = worksheetWrongToken(token);
      const replacement = token.index === 0 ? wrong.charAt(0).toUpperCase() + wrong.slice(1) : wrong;
      const wrongSentence = `${sentence.slice(0, token.index)}${replacement}${sentence.slice(token.index + token.length)}`;
      return {
        ...question,
        type: "error",
        worksheetPrompt: `Find and correct the mistake: ${wrongSentence}`,
        answer: sentence,
        choices: [],
        difficulty: day === 4 ? 3 : 2
      };
    }
    const words = sentence.replace(/([?.!,])/g, " $1").split(/\s+/).filter(Boolean);
    const split = Math.max(1, Math.floor(words.length / 2));
    const scrambled = [...words.slice(split), ...words.slice(0, split)].join(" / ");
    return {
      ...question,
      type: "reorder",
      worksheetPrompt: `Put the words in order: ${scrambled}`,
      answer: sentence,
      choices: [],
      difficulty: day === 4 ? 3 : 2
    };
  }

  function book3FocusedQuestions(unit, bookId, day, part) {
    const all = (unit.mainSentences || []).filter(Boolean);
    const questions = all.filter((sentence) => sentence.includes("?"));
    const negatives = all.filter((sentence) => /\b(?:not|don't|doesn't|isn't|aren't)\b/i.test(sentence));
    const statements = all.filter((sentence) => !sentence.includes("?") && !/^(?:Yes|No),/i.test(sentence));
    const affirmatives = statements.filter((sentence) => !negatives.includes(sentence));
    let source = day === 4 ? (part === "A" ? questions : all) : (part === "A" ? affirmatives : negatives);
    if (source.length < 2) source = part === "A" ? statements : all;
    if (!source.length) return [];
    const vocabulary = vocabularyItems(unit.vocabulary || []);
    return Array.from({ length: 8 }, (_, index) => {
      const sentence = source[index % source.length];
      const token = book3GrammarToken(sentence);
      const words = sentence.replace(/([?.!,])/g, " $1").split(/\s+/).filter(Boolean);
      const visualItem = vocabulary.find((item) => sentence.toLowerCase().includes(String(item.word).replace(/\(s\)|\(es\)/g, "").toLowerCase()));
      const mode = index % 4;
      const base = {
        id: `${bookId}-${unit.id}-d${day}${part.toLowerCase()}-focus-${index}`,
        skill: unit.grammarFocus || "Book 3 grammar",
        answer: sentence,
        choices: [],
        image: visualItem?.image || "",
        sprite: visualItem?.sprite || null,
        visual: visualItem?.visual || "",
        difficulty: mode > 0 ? 2 : 1
      };
      if (mode === 0 && token) {
        const prompt = `${sentence.slice(0, token.index)}___${sentence.slice(token.index + token.length)}`;
        return { ...base, type: "choice", playerPrompt: prompt, worksheetPrompt: `Choose: ${prompt}`, answer: token.answer, choices: token.choices };
      }
      if (mode === 1 && token) {
        const wrong = token.choices.find((choice) => choice.toLowerCase() !== token.answer.toLowerCase()) || token.choices[0];
        const wrongSentence = `${sentence.slice(0, token.index)}${wrong}${sentence.slice(token.index + token.length)}`;
        return { ...base, type: "error", playerPrompt: `Fix it: ${wrongSentence}`, worksheetPrompt: `Correct the sentence: ${wrongSentence}` };
      }
      if (mode === 2) {
        const scrambled = words.slice().reverse().join(" / ");
        return { ...base, type: "reorder", playerPrompt: scrambled, worksheetPrompt: `Put in order: ${scrambled}` };
      }
      if (token) {
        const prompt = `${sentence.slice(0, token.index)}________${sentence.slice(token.index + token.length)}`;
        return { ...base, type: "fill", playerPrompt: prompt, worksheetPrompt: `Complete: ${prompt}`, answer: token.answer };
      }
      const blank = worksheetContentBlank(sentence);
      return blank
        ? { ...base, type: "fill", playerPrompt: blank.prompt, worksheetPrompt: `Complete the sentence: ${blank.prompt}`, answer: blank.answer }
        : { ...base, type: "rewrite", playerPrompt: sentence, worksheetPrompt: "Write the complete sentence from memory." };
    });
  }

  function spiralWorksheetQuestions(phases, unit, bookId, day, part) {
    if (bookId === "book-3" && unit.id !== "unit-1") {
      const focused = book3FocusedQuestions(unit, bookId, day, part);
      if (focused.length) return focused;
    }
    const questions = phases.flatMap((phase, phaseIndex) => phase.steps.map((step, stepIndex) =>
      spiralWorksheetQuestion(step, `${bookId}-${unit.id}-d${day}${part.toLowerCase()}-${phaseIndex}-${stepIndex}`, phase.title)
    )).filter(Boolean);
    const sentences = (unit.mainSentences || []).filter(Boolean);
    let supplementIndex = 0;
    while (questions.length < 8 && sentences.length) {
      const sentence = sentences[supplementIndex % sentences.length];
      const words = sentence.replace(/([?.!,])/g, " $1").split(/\s+/).filter(Boolean);
      questions.push({
        id: `${bookId}-${unit.id}-d${day}${part.toLowerCase()}-sentence-${supplementIndex}`,
        skill: "sentence-order",
        type: "reorder",
        playerPrompt: words.slice().reverse().join(" / "),
        worksheetPrompt: `Put in order: ${words.slice().reverse().join(" / ")}`,
        answer: sentence,
        choices: [],
        visual: "",
        difficulty: supplementIndex > 2 ? 2 : 1
      });
      supplementIndex += 1;
    }
    const vocabulary = vocabularyItems(unit.vocabulary || []);
    while (questions.length < 8 && vocabulary.length) {
      const item = vocabulary[questions.length % vocabulary.length];
      questions.push({
        id: `${bookId}-${unit.id}-d${day}${part.toLowerCase()}-word-${questions.length}`,
        skill: "vocabulary-recall",
        type: "rewrite",
        playerPrompt: `Write the word: ${item.visual || item.meaning || item.word}`,
        worksheetPrompt: `Write the English word: ${item.visual || item.meaning || "picture"}`,
        answer: item.word,
        choices: [],
        image: item.image || "",
        sprite: item.sprite || null,
        visual: item.visual || "",
        difficulty: 1
      });
    }
    const finalQuestions = questions.slice(0, 10);
    const hasPicture = finalQuestions.some((question) => question.image || question.sprite || question.visual);
    if (!hasPicture && vocabulary.length) {
      finalQuestions.slice(0, 2).forEach((question, index) => {
        const searchable = `${question.worksheetPrompt || ""} ${question.answer || ""}`.toLowerCase();
        const matchingItem = vocabulary.find((item) => {
          const word = String(item.word || "").replace(/\(s\)|\(es\)/gi, "").toLowerCase();
          return word && searchable.includes(word);
        });
        const item = matchingItem || vocabulary[index % vocabulary.length];
        question.image = item.image || "";
        question.sprite = item.sprite || null;
        question.visual = item.visual || "";
      });
    }
    return finalQuestions.map((question, index) => strengthenWorksheetQuestion(question, day, part, index));
  }

  function scalePhaseDurations(phases, targetMinutes) {
    const weights = phases.map((phase) => Math.max(1, Number(phase.duration) || 1));
    const totalWeight = weights.reduce((sum, value) => sum + value, 0);
    const durations = weights.map((weight) => Math.max(1, Math.floor((weight / totalWeight) * targetMinutes)));
    let difference = targetMinutes - durations.reduce((sum, value) => sum + value, 0);
    let cursor = 0;
    while (difference !== 0) {
      const index = cursor % durations.length;
      if (difference > 0) {
        durations[index] += 1;
        difference -= 1;
      } else if (durations[index] > 1) {
        durations[index] -= 1;
        difference += 1;
      }
      cursor += 1;
    }
    phases.forEach((phase, index) => { phase.duration = durations[index]; });
  }

  function addSpiralLoop(phase, questions, id, title) {
    const step = practiceLoopStep(id, title, questions.map(reviewLoopQuestion));
    Object.assign(step, {
      phase: phase.title,
      phaseId: phase.id,
      phaseTitle: phase.title,
      phaseGroup: phase.groupId,
      phaseGroupTitle: phase.groupTitle,
      activityType: "check",
      phaseDuration: phase.duration
    });
    phase.steps.push(step);
  }

  function upgradeToSpiralReview(lesson, book, unit, unitIndex, day) {
    const supported = (book.id === "book-1" || (book.id === "book-2" && unit.id === "unit-1") || (book.id === "book-3" && unit.id !== "unit-1")) && day >= 3;
    if (!supported || lesson.worksheet) return lesson;
    const phases = lesson.phases.map((phase) => ({ ...phase, steps: [...phase.steps] }));
    const splitIndex = Math.max(1, Math.ceil(phases.length / 2));
    const partAPhases = phases.slice(0, splitIndex);
    const partBPhases = phases.slice(splitIndex);
    const partAQuestions = spiralWorksheetQuestions(partAPhases, unit, book.id, day, "A");
    const partBQuestions = spiralWorksheetQuestions(partBPhases.length ? partBPhases : partAPhases, unit, book.id, day, "B");
    scalePhaseDurations(phases, 61);
    const decorate = (phase, part, title) => {
      phase.groupId = `block-${part.toLowerCase()}`;
      phase.groupTitle = title;
      phase.steps.forEach((step) => Object.assign(step, {
        phaseGroup: phase.groupId,
        phaseGroupTitle: title,
        phaseDuration: phase.duration
      }));
    };
    partAPhases.forEach((phase) => decorate(phase, "A", day === 3 ? "Block A｜課本文法" : "Block A｜疑問與應用"));
    partBPhases.forEach((phase) => decorate(phase, "B", day === 3 ? "Block B｜加深練習" : "Block B｜綜合螺旋"));
    addSpiralLoop(partAPhases[partAPhases.length - 1], partAQuestions, `${book.id}-${unit.id}-d${day}-loop-a`, "Part A · Continuous Practice");
    addSpiralLoop((partBPhases[partBPhases.length - 1] || partAPhases[partAPhases.length - 1]), partBQuestions, `${book.id}-${unit.id}-d${day}-loop-b`, "Part B · Continuous Practice");
    const writeA = customPhase(`${book.id}-${unit.id}-d${day}-write-a`, "block-a", partAPhases[0].groupTitle, "Write Time · Part A", 12, "writing", [
      writeTimeStep(`${book.id}-${unit.id}-d${day}-write-a-step`, "A", 12, "Complete Part A independently. Then check the answers together.")
    ]);
    const writeB = customPhase(`${book.id}-${unit.id}-d${day}-write-b`, "block-b", (partBPhases[0] || partAPhases[0]).groupTitle, "Write Time · Part B", 12, "writing", [
      writeTimeStep(`${book.id}-${unit.id}-d${day}-write-b-step`, "B", 12, "Complete Part B independently. Use the grammar map before checking.")
    ]);
    const upgradedPhases = [...partAPhases, writeA, ...partBPhases, writeB];
    return {
      ...lesson,
      phases: upgradedPhases,
      steps: upgradedPhases.flatMap((phase) => phase.steps),
      duration: 85,
      durationMinutes: 85,
      worksheet: {
        title: lesson.title,
        day,
        unitTitle: unit.title,
        blocks: {
          A: { title: partAPhases[0].groupTitle, subtitle: unit.grammarFocus || partAPhases.map((phase) => phase.title).slice(0, 3).join(" → "), questions: partAQuestions },
          B: { title: (partBPhases[0] || partAPhases[0]).groupTitle, subtitle: day === 4 ? `Mixed review · ${unit.grammarFocus || unit.title}` : `Practice · ${unit.grammarFocus || unit.title}`, questions: partBQuestions }
        }
      }
    };
  }

  function lessonsForUnit(book, unit, unitIndex) {
    const lessons = book.id === "book-3" && unit.id === "unit-1"
      ? book3Unit1Lessons(unit)
      : book.id === "book-2" && unit.id === "unit-1"
        ? book2Unit1Lessons(unit)
        : book.id === "book-1" && unit.id === "unit-1"
          ? book1Unit1Lessons(unit)
          : book.id === "book-1" && unit.id === "unit-2"
            ? book1Unit2Lessons(unit)
            : book.id === "book-1" && unit.id === "unit-3"
              ? book1Unit3Lessons(unit)
              : book.id === "book-1" && unit.id === "unit-4"
                ? book1Unit4Lessons(unit)
                : book.id === "book-1" && unit.id === "unit-5"
                  ? book1Unit5Lessons(unit)
                  : book.id === "book-1" && unit.id === "unit-6"
                    ? book1Unit6Lessons(unit)
                    : book.id === "book-1" && unit.id === "unit-7"
                      ? book1Unit7Lessons(unit)
                      : book.id === "book-1" && unit.id === "unit-8"
                        ? book1Unit8Lessons(unit)
                        : book.id === "book-1" && unit.id === "unit-9"
                          ? book1Unit9Lessons(unit)
                          : (book.id === "book-3" ? [1, 2, 3, 4] : [1, 2]).map((day) => sharedLessonFromUnit(unit, unitIndex, book.id, day));
    return lessons.map((lesson, index) => upgradeToSpiralReview(lesson, book, unit, unitIndex, index + 1));
  }

  function buildCatalog(books) {
    return books.map((book) => ({
      ...book,
      units: book.units.map((unit, unitIndex) => ({
        id: unit.id,
        title: `Unit ${unitIndex + 1}`,
        topic: unit.title,
        lessons: lessonsForUnit(book, unit, unitIndex)
      }))
    }));
  }

  window.TeachingFlow = { FLOW_TEMPLATE: CLASSROOM_FLOW, buildCatalog };
  window.COURSE_CATALOG = buildCatalog(window.CURRICULUM_BOOKS || []);
})();

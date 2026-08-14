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

  function buildCatalog(books) {
    return books.map((book) => ({
      ...book,
      units: book.units.map((unit, unitIndex) => ({
        id: unit.id,
        title: `Unit ${unitIndex + 1}`,
        topic: unit.title,
        lessons: book.id === "book-1"
          ? book1LessonsFromUnit(unit, unitIndex)
          : book.id === "book-2"
            ? book2LessonsFromUnit(unit)
            : defaultLessonFromUnit(unit, unitIndex, book.id)
      }))
    }));
  }

  window.TeachingFlow = { FLOW_TEMPLATE: DEFAULT_FLOW_TEMPLATE, buildCatalog };
  window.COURSE_CATALOG = buildCatalog(window.CURRICULUM_BOOKS || []);
})();

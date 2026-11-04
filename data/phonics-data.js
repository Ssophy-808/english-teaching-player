(function () {
  "use strict";

  const audioPolicy = { useBrowserTtsFallback: true, locale: "en-US" };
  const emptyWordwall = { url: "", label: "Open Wordwall" };

  function clueFor(word) {
    return word === "eight" ? "a number" : `starts with ${word[0].toUpperCase()}`;
  }

  function makeWords(groups, core = true) {
    return groups.flatMap((group) => group.words.map((word) => ({
      word, vowelType: group.sound, pattern: group.id, audio: "", clue: clueFor(word), core
    })));
  }

  function makeUnit(config) {
    const coreWords = makeWords(config.groups);
    const contrastWords = (config.contrastWords || []).map((item) => ({
      word: item.word, vowelType: item.sound, pattern: item.pattern || item.sound,
      audio: "", clue: clueFor(item.word), core: false
    }));
    const patterns = config.groups.map((group) => ({ id: group.id, display: group.display, words: [...group.words] }));
    const soundLabels = Object.fromEntries(config.groups.map((group) => [group.sound, group.soundLabel || group.display]));
    for (const item of contrastWords) soundLabels[item.vowelType] ||= config.contrastLabel || item.vowelType;
    return {
      id: `unit${config.number}`, number: config.number, title: config.title,
      focus: config.focus || config.title,
      recognitionPrompt: config.recognitionPrompt || "Which sound group?",
      classificationSummary: config.classificationSummary || Object.values(soundLabels).join(" · "),
      patternSummary: patterns.map((pattern) => pattern.display).join(" · "),
      resultTitle: config.resultTitle || config.title,
      shortSound: config.shortSound || "", longSound: config.longSound || "",
      soundLabels, patterns, words: [...coreWords, ...contrastWords],
      contrastPairs: config.contrastPairs || [], wordwall: { ...emptyWordwall }, audioPolicy: { ...audioPolicy }
    };
  }

  const units = [
    makeUnit({
      number: 1, title: "Long a", shortSound: "short-a", longSound: "long-a",
      recognitionPrompt: "Short a or Long a?", classificationSummary: "Short a · Long a", contrastLabel: "Short a",
      groups: [
        { id: "a_e", display: "A space E", sound: "long-a", soundLabel: "Long a", words: ["cape", "late"] },
        { id: "ai", display: "A-I", sound: "long-a", soundLabel: "Long a", words: ["nail", "rain"] },
        { id: "ay", display: "A-Y", sound: "long-a", soundLabel: "Long a", words: ["hay", "ray"] },
        { id: "eigh", display: "E-I-G-H", sound: "long-a", soundLabel: "Long a", words: ["eight", "weigh"] }
      ],
      contrastWords: ["cap", "map", "mad", "pan", "tap", "hat", "ran"].map((word) => ({ word, sound: "short-a", pattern: "short-a" })),
      contrastPairs: [["cap", "cape"], ["mad", "late"], ["pan", "rain"], ["hat", "hay"]]
    }),
    makeUnit({
      number: 2, title: "Long e", shortSound: "short-e", longSound: "long-e",
      recognitionPrompt: "Short e or Long e?", classificationSummary: "Short e · Long e", contrastLabel: "Short e",
      groups: [
        { id: "e_e", display: "E space E", sound: "long-e", soundLabel: "Long e", words: ["eve", "these"] },
        { id: "ea", display: "E-A", sound: "long-e", soundLabel: "Long e", words: ["pea", "meat"] },
        { id: "ee", display: "E-E", sound: "long-e", soundLabel: "Long e", words: ["bee", "feet"] },
        { id: "ey", display: "E-Y", sound: "long-e", soundLabel: "Long e", words: ["honey", "key"] }
      ],
      contrastWords: ["bed", "pet", "hen", "ten", "red", "leg"].map((word) => ({ word, sound: "short-e", pattern: "short-e" })),
      contrastPairs: [["bed", "bee"], ["pet", "feet"], ["hen", "these"], ["ten", "meat"]]
    }),
    makeUnit({
      number: 3, title: "Long i", shortSound: "short-i", longSound: "long-i",
      recognitionPrompt: "Short i or Long i?", classificationSummary: "Short i · Long i", contrastLabel: "Short i",
      groups: [
        { id: "i_e", display: "I space E", sound: "long-i", soundLabel: "Long i", words: ["bike", "nine"] },
        { id: "ie", display: "I-E", sound: "long-i", soundLabel: "Long i", words: ["pie", "tie"] },
        { id: "igh", display: "I-G-H", sound: "long-i", soundLabel: "Long i", words: ["light", "night"] },
        { id: "i", display: "I", sound: "long-i", soundLabel: "Long i", words: ["wild", "find"] }
      ],
      contrastWords: ["bit", "sit", "fin", "pin", "rid", "kit"].map((word) => ({ word, sound: "short-i", pattern: "short-i" })),
      contrastPairs: [["bit", "bike"], ["sit", "tie"], ["fin", "find"], ["pin", "pie"]]
    }),
    makeUnit({
      number: 4, title: "Long o", shortSound: "short-o", longSound: "long-o",
      recognitionPrompt: "Short o or Long o?", classificationSummary: "Short o · Long o", contrastLabel: "Short o",
      groups: [
        { id: "o_e", display: "O space E", sound: "long-o", soundLabel: "Long o", words: ["bone", "nose"] },
        { id: "oa", display: "O-A", sound: "long-o", soundLabel: "Long o", words: ["boat", "road"] },
        { id: "oe", display: "O-E", sound: "long-o", soundLabel: "Long o", words: ["hoe", "toe"] },
        { id: "ow", display: "O-W", sound: "long-o", soundLabel: "Long o", words: ["low", "row"] }
      ],
      contrastWords: ["hot", "hop", "not", "rod", "fox", "cot"].map((word) => ({ word, sound: "short-o", pattern: "short-o" })),
      contrastPairs: [["not", "nose"], ["rod", "road"], ["hot", "hoe"], ["cot", "boat"]]
    }),
    makeUnit({
      number: 5, title: "Long u", shortSound: "short-u", longSound: "long-u",
      recognitionPrompt: "Short u or Long u?", classificationSummary: "Short u · Long u", contrastLabel: "Short u",
      groups: [
        { id: "u_e", display: "U space E", sound: "long-u", soundLabel: "Long u", words: ["cute", "rude"] },
        { id: "ue", display: "U-E", sound: "long-u", soundLabel: "Long u", words: ["fuel", "blue"] },
        { id: "ew", display: "E-W", sound: "long-u", soundLabel: "Long u", words: ["dew", "new"] },
        { id: "ui", display: "U-I", sound: "long-u", soundLabel: "Long u", words: ["juice", "suit"] }
      ],
      contrastWords: ["cut", "cub", "sun", "tub", "run", "hug"].map((word) => ({ word, sound: "short-u", pattern: "short-u" })),
      contrastPairs: [["cut", "cute"], ["cub", "rude"], ["sun", "suit"], ["tub", "blue"]]
    }),
    makeUnit({ number: 6, title: "Hard and Soft c", recognitionPrompt: "Hard c or Soft c?", classificationSummary: "Hard c /k/ · Soft c /s/", groups: [
      { id: "hard-c", display: "Hard c /k/", sound: "hard-c", words: ["cake", "cone", "cube", "cup"] },
      { id: "soft-c", display: "Soft c /s/", sound: "soft-c", words: ["cent", "face", "city", "fancy"] }
    ], contrastPairs: [["cake", "city"], ["cone", "cent"], ["cube", "face"], ["cup", "fancy"]] }),
    makeUnit({ number: 7, title: "Hard and Soft g", recognitionPrompt: "Hard g or Soft g?", classificationSummary: "Hard g /g/ · Soft g /j/", groups: [
      { id: "hard-g", display: "Hard g /g/", sound: "hard-g", words: ["game", "gate", "goat", "gull"] },
      { id: "soft-g", display: "Soft g /j/", sound: "soft-g", words: ["gem", "page", "giant", "gym"] }
    ], contrastPairs: [["game", "gem"], ["gate", "giant"], ["goat", "gym"], ["gull", "page"]] }),
    makeUnit({ number: 8, title: "ar and or", recognitionPrompt: "Which r-controlled sound?", classificationSummary: "ar · or", groups: [
      { id: "ar", display: "A-R", sound: "ar", words: ["barn", "car", "jar", "park"] },
      { id: "or", display: "O-R", sound: "or", words: ["corn", "fork", "horn", "pork"] }
    ], contrastPairs: [["barn", "corn"], ["car", "fork"], ["jar", "horn"], ["park", "pork"]] }),
    makeUnit({ number: 9, title: "er, ir, and ur", recognitionPrompt: "Which r-controlled spelling?", classificationSummary: "er · ir · ur", groups: [
      { id: "er", display: "E-R", sound: "er", words: ["fern", "mermaid", "butter", "summer"] },
      { id: "ir", display: "I-R", sound: "ir", words: ["bird", "dirt", "first", "stir"] },
      { id: "ur", display: "U-R", sound: "ur", words: ["burn", "hurt", "surf", "turn"] }
    ], contrastPairs: [["fern", "bird"], ["summer", "turn"], ["dirt", "hurt"], ["mermaid", "surf"]] }),
    makeUnit({ number: 10, title: "ch and sh", recognitionPrompt: "ch or sh?", classificationSummary: "ch /ch/ · sh /sh/", groups: [
      { id: "ch", display: "C-H", sound: "ch", words: ["cheese", "chin", "peach", "rich"] },
      { id: "sh", display: "S-H", sound: "sh", words: ["sheep", "ship", "fish", "wash"] }
    ], contrastPairs: [["cheese", "sheep"], ["chin", "ship"], ["peach", "fish"], ["rich", "wash"]] }),
    makeUnit({ number: 11, title: "th, wh, and tch", recognitionPrompt: "Which consonant team?", classificationSummary: "th · wh · tch", groups: [
      { id: "th", display: "T-H", sound: "th", words: ["thin", "math", "them", "mother"] },
      { id: "wh", display: "W-H", sound: "wh", words: ["whale", "wheat"] },
      { id: "tch", display: "T-C-H", sound: "tch", words: ["match", "witch"] }
    ], contrastPairs: [["thin", "whale"], ["math", "match"], ["them", "wheat"], ["mother", "witch"]] }),
    makeUnit({ number: 12, title: "gh and ph", recognitionPrompt: "Which consonant spelling?", classificationSummary: "gh · ph", groups: [
      { id: "gh", display: "G-H", sound: "gh", words: ["ghee", "ghost", "cough", "laugh"] },
      { id: "ph", display: "P-H", sound: "ph", words: ["phone", "photo", "dolphin", "graph"] }
    ], contrastPairs: [["ghee", "phone"], ["ghost", "photo"], ["cough", "dolphin"], ["laugh", "graph"]] })
  ];

  window.PHONICS_COURSES = [{ id: "sio2", title: "Sound It Out 2", subtitle: "Phonics Practice", units }];
})();

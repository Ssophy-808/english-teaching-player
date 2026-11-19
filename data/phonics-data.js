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

  const sio2Units = [
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

  const sio3Units = [
    makeUnit({ number: 1, title: "au and aw", recognitionPrompt: "au or aw?", classificationSummary: "au · aw", groups: [
      { id: "au", display: "A-U", sound: "au", words: ["August", "faucet", "pause", "sauce"] },
      { id: "aw", display: "A-W", sound: "aw", words: ["lawn", "paw", "saw", "yawn"] }
    ], contrastPairs: [["August", "lawn"], ["faucet", "paw"], ["pause", "saw"], ["sauce", "yawn"]] }),
    makeUnit({ number: 2, title: "ou and ow", recognitionPrompt: "ou or ow?", classificationSummary: "ou · ow", groups: [
      { id: "ou", display: "O-U", sound: "ou", words: ["couch", "house", "loud", "shout"] },
      { id: "ow", display: "O-W", sound: "ow", words: ["owl", "bow", "clown", "town"] }
    ], contrastPairs: [["couch", "owl"], ["house", "bow"], ["loud", "clown"], ["shout", "town"]] }),
    makeUnit({ number: 3, title: "oi and oy", recognitionPrompt: "oi or oy?", classificationSummary: "oi · oy", groups: [
      { id: "oi", display: "O-I", sound: "oi", words: ["oil", "coin", "point", "soil", "oyster"] },
      { id: "oy", display: "O-Y", sound: "oy", words: ["boy", "soybean", "toy"] }
    ], contrastPairs: [["oil", "boy"], ["coin", "soybean"], ["point", "toy"]] }),
    makeUnit({ number: 4, title: "ea and oo", recognitionPrompt: "Which vowel sound?", classificationSummary: "ea /e/ · ea /ee/ · oo /u/ · oo /oo/", groups: [
      { id: "ea-short", display: "E-A /e/", sound: "ea-short", words: ["head", "weather"] },
      { id: "ea-long", display: "E-A /ee/", sound: "ea-long", words: ["leak", "seat"] },
      { id: "oo-short", display: "O-O /u/", sound: "oo-short", words: ["book", "cook"] },
      { id: "oo-long", display: "O-O /oo/", sound: "oo-long", words: ["moon", "pool"] }
    ], contrastPairs: [["head", "seat"], ["weather", "leak"], ["book", "moon"], ["cook", "pool"]] }),
    makeUnit({ number: 5, title: "y Sounds", recognitionPrompt: "Which final y sound?", classificationSummary: "y /ee/ · y /long i/", groups: [
      { id: "y-ee", display: "Y /ee/", sound: "y-ee", words: ["baby", "candy", "forty", "windy"] },
      { id: "y-long-i", display: "Y /long i/", sound: "y-long-i", words: ["fly", "shy", "sky", "why"] }
    ], contrastPairs: [["baby", "fly"], ["candy", "shy"], ["forty", "sky"], ["windy", "why"]] }),
    makeUnit({ number: 6, title: "l Blends", recognitionPrompt: "Which l blend?", classificationSummary: "bl · cl · fl · gl · pl · sl", groups: [
      { id: "bl", display: "B-L", sound: "bl", words: ["blade", "blow"] },
      { id: "cl", display: "C-L", sound: "cl", words: ["clip", "cloud"] },
      { id: "fl", display: "F-L", sound: "fl", words: ["flag", "flute"] },
      { id: "gl", display: "G-L", sound: "gl", words: ["glass", "globe"] },
      { id: "pl", display: "P-L", sound: "pl", words: ["plate", "plug"] },
      { id: "sl", display: "S-L", sound: "sl", words: ["sled", "slide"] }
    ] }),
    makeUnit({ number: 7, title: "r Blends", recognitionPrompt: "Which r blend?", classificationSummary: "br · cr · dr · fr · gr · pr", groups: [
      { id: "br", display: "B-R", sound: "br", words: ["brown", "brush"] },
      { id: "cr", display: "C-R", sound: "cr", words: ["crab", "crane"] },
      { id: "dr", display: "D-R", sound: "dr", words: ["dream", "drum"] },
      { id: "fr", display: "F-R", sound: "fr", words: ["frog", "fry"] },
      { id: "gr", display: "G-R", sound: "gr", words: ["grape", "grow"] },
      { id: "pr", display: "P-R", sound: "pr", words: ["pray", "press"] }
    ] }),
    makeUnit({ number: 8, title: "s Blends", recognitionPrompt: "Which s blend?", classificationSummary: "sc/sk · sm · sn · sp · st · sw", groups: [
      { id: "sc-sk", display: "S-C / S-K", sound: "sc-sk", words: ["scarf", "skate"] },
      { id: "sm", display: "S-M", sound: "sm", words: ["smell", "smoke"] },
      { id: "sn", display: "S-N", sound: "sn", words: ["snail", "snore"] },
      { id: "sp", display: "S-P", sound: "sp", words: ["spill", "spot"] },
      { id: "st", display: "S-T", sound: "st", words: ["stand", "stone"] },
      { id: "sw", display: "S-W", sound: "sw", words: ["sweets", "swim"] }
    ] }),
    makeUnit({ number: 9, title: "Three-letter Blends", recognitionPrompt: "Which three-letter blend?", classificationSummary: "sch · scr · shr · thr · spl · spr · str · squ", groups: [
      { id: "sch", display: "S-C-H", sound: "sch", words: ["school"] },
      { id: "scr", display: "S-C-R", sound: "scr", words: ["screen"] },
      { id: "shr", display: "S-H-R", sound: "shr", words: ["shrimp"] },
      { id: "thr", display: "T-H-R", sound: "thr", words: ["throw"] },
      { id: "spl", display: "S-P-L", sound: "spl", words: ["splash"] },
      { id: "spr", display: "S-P-R", sound: "spr", words: ["spray"] },
      { id: "str", display: "S-T-R", sound: "str", words: ["street"] },
      { id: "squ", display: "S-Q-U", sound: "squ", words: ["squid"] }
    ] }),
    makeUnit({ number: 10, title: "tr and tw", recognitionPrompt: "tr or tw?", classificationSummary: "tr · tw", groups: [
      { id: "tr", display: "T-R", sound: "tr", words: ["train", "trap", "tray", "tree"] },
      { id: "tw", display: "T-W", sound: "tw", words: ["tweet", "twenty", "twins", "twist"] }
    ], contrastPairs: [["train", "tweet"], ["trap", "twenty"], ["tray", "twins"], ["tree", "twist"]] }),
    makeUnit({ number: 11, title: "kn, wr, and mb", recognitionPrompt: "Which silent-letter spelling?", classificationSummary: "kn · wr · mb", groups: [
      { id: "kn", display: "K-N", sound: "kn", words: ["knee", "knit", "knob", "know"] },
      { id: "wr", display: "W-R", sound: "wr", words: ["wrap", "wrist", "write", "wrong"] },
      { id: "mb", display: "M-B", sound: "mb", words: ["bomb", "comb", "lamb", "thumb"] }
    ], contrastPairs: [["knee", "wrap"], ["knit", "wrist"], ["know", "comb"]] }),
    makeUnit({ number: 12, title: "ck, ng, and nk", recognitionPrompt: "Which ending spelling?", classificationSummary: "ck · ng · nk", groups: [
      { id: "ck", display: "C-K", sound: "ck", words: ["back", "lick", "neck", "sick"] },
      { id: "ng", display: "N-G", sound: "ng", words: ["hang", "lung", "ring", "wing"] },
      { id: "nk", display: "N-K", sound: "nk", words: ["bank", "drink", "pink", "trunk"] }
    ], contrastPairs: [["back", "bank"], ["lick", "ring"], ["sick", "pink"]] })
  ];

  window.PHONICS_COURSES = [
    { id: "sio2", title: "Sound It Out 2", subtitle: "Phonics Practice", units: sio2Units },
    { id: "sio3", title: "Sound It Out 3", subtitle: "Phonics Practice", units: sio3Units }
  ];
})();

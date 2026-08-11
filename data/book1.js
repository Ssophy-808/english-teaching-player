(function () {
  "use strict";

  const units = [
    {
      id: "unit-1",
      title: "Hello, I am Ludi.",
      topic: "Greeting",
      mainSentences: [
        "I am Ludi.",
        "I am a boy.",
        "I am not a boy.",
        "You are Lumi.",
        "You are a girl.",
        "You are not a girl."
      ],
      vocabulary: [
        { word: "boy", image: "assets/images/unit1-boy.png" },
        { word: "man", image: "assets/images/unit1-man.png" },
        { word: "student", image: "assets/images/unit1-student.png" },
        { word: "girl", image: "assets/images/unit1-girl.png" },
        { word: "woman", image: "assets/images/unit1-woman.png" },
        { word: "teacher", image: "assets/images/unit1-teacher.png" }
      ],
      sentenceCards: [
        { label: "① boy / girl", word: "boy", image: "assets/images/unit1-boy.png", sentences: [{ before: "I am a", word: "boy", after: "." }, { before: "I am not a", word: "girl", after: "." }] },
        { label: "② girl / boy", word: "girl", image: "assets/images/unit1-girl.png", sentences: [{ before: "You are a", word: "girl", after: "." }, { before: "You are not a", word: "boy", after: "." }] },
        { label: "③ student / teacher", word: "student", image: "assets/images/unit1-student.png", sentences: [{ before: "I am a", word: "student", after: "." }, { before: "I am not a", word: "teacher", after: "." }] },
        { label: "④ teacher / student", word: "teacher", image: "assets/images/unit1-teacher.png", sentences: [{ before: "You are a", word: "teacher", after: "." }, { before: "You are not a", word: "student", after: "." }] },
        { label: "⑤ man / woman", word: "man", image: "assets/images/unit1-man.png", sentences: [{ before: "I am a", word: "man", after: "." }, { before: "I am not a", word: "woman", after: "." }] },
        { label: "⑥ woman / man", word: "woman", image: "assets/images/unit1-woman.png", sentences: [{ before: "You are a", word: "woman", after: "." }, { before: "You are not a", word: "man", after: "." }] }
      ],
      quiz: [{ prompt: "You are a ____.", answer: "girl", choices: ["boy", "girl", "teacher"], visual: "👧", image: "" }],
      materials: {
        wordwallUrl: "https://wordwall.net/embed/47d167079d8f4f51bae8000c15d9c53e?themeId=1&templateId=38&fontStackId=0"
      },
      phonics: {
        groups: [
          { family: "-ad", words: ["bad", "mad", "sad"] },
          { family: "-am", words: ["ham", "jam", "yam"] },
          { family: "-ap", words: ["cap", "map", "nap"] }
        ]
      }
    },
    {
      id: "unit-2",
      title: "Who is he?",
      topic: "Family Members",
      mainSentences: [
        "He is my brother.",
        "She is not my sister.",
        "Who is he?",
        "He is my brother.",
        "Who is she?",
        "She is my sister."
      ],
      vocabulary: [
        { word: "grandfather", sprite: { col: 0, row: 0 } },
        { word: "grandmother", sprite: { col: 1, row: 0 } },
        { word: "father", sprite: { col: 2, row: 0 } },
        { word: "mother", sprite: { col: 3, row: 0 } },
        { word: "aunt", sprite: { col: 4, row: 0 } },
        { word: "uncle", sprite: { col: 0, row: 1 } },
        { word: "sister", sprite: { col: 1, row: 1 } },
        { word: "me", sprite: { col: 4, row: 1 } },
        { word: "brother", sprite: { col: 2, row: 1 } },
        { word: "cousin(s)", sprite: { col: 3, row: 1 } }
      ],
      quiz: [
        { prompt: "She’s my ____.", answer: "grandmother", choices: ["sister", "grandmother", "aunt"], sprite: { col: 1, row: 0 }, image: "" },
        { prompt: "He’s my ____.", answer: "grandfather", choices: ["father", "uncle", "grandfather"], sprite: { col: 0, row: 0 }, image: "" },
        { prompt: "He’s my ____.", answer: "father", choices: ["brother", "father", "uncle"], sprite: { col: 2, row: 0 }, image: "" },
        { prompt: "She’s my ____.", answer: "mother", choices: ["mother", "sister", "grandmother"], sprite: { col: 3, row: 0 }, image: "" },
        { prompt: "She’s my ____.", answer: "aunt", choices: ["cousin(s)", "mother", "aunt"], sprite: { col: 4, row: 0 }, image: "" },
        { prompt: "He’s my ____.", answer: "uncle", choices: ["grandfather", "uncle", "brother"], sprite: { col: 0, row: 1 }, image: "" }
      ],
      dialogueChoices: [
        {
          instruction: "Make a question:", prompt: "Is she your mom?", sprite: { col: 1, row: 1 }, image: "", answer: "C",
          choices: [
            { label: "A", lines: ["No, she isn’t.", "She’s my aunt."] },
            { label: "B", lines: ["No, she isn’t.", "She’s my grandma."] },
            { label: "C", lines: ["No, she isn’t.", "She’s my sister."] }
          ]
        },
        {
          instruction: "Make a question:", prompt: "Is he your dad?", sprite: { col: 2, row: 0 }, image: "", answer: "A",
          choices: [
            { label: "A", lines: ["Yes, he is.", "He’s my father."] },
            { label: "B", lines: ["No, he isn’t.", "He’s my brother."] },
            { label: "C", lines: ["No, he isn’t.", "He’s my grandpa."] }
          ]
        },
        {
          instruction: "Make a question:", prompt: "Is she your grandma?", sprite: { col: 1, row: 0 }, image: "", answer: "B",
          choices: [
            { label: "A", lines: ["No, she isn’t.", "She’s my mom."] },
            { label: "B", lines: ["Yes, she is.", "She’s my grandmother."] },
            { label: "C", lines: ["No, she isn’t.", "She’s my aunt."] }
          ]
        },
        {
          instruction: "Make a question:", prompt: "Is he your brother?", sprite: { col: 2, row: 1 }, image: "", answer: "C",
          choices: [
            { label: "A", lines: ["No, he isn’t.", "He’s my uncle."] },
            { label: "B", lines: ["No, he isn’t.", "He’s my father."] },
            { label: "C", lines: ["Yes, he is.", "He’s my brother."] }
          ]
        },
        {
          instruction: "Make a question:", prompt: "Is she your aunt?", sprite: { col: 4, row: 0 }, image: "", answer: "A",
          choices: [
            { label: "A", lines: ["Yes, she is.", "She’s my aunt."] },
            { label: "B", lines: ["No, she isn’t.", "She’s my sister."] },
            { label: "C", lines: ["No, she isn’t.", "She’s my mom."] }
          ]
        }
      ],
      materials: {
        wordwallUrl: "https://wordwall.net/embed/33efefc9f2474a0fad8a3ee746e13ff9?themeId=1&templateId=38&fontStackId=0"
      },
      phonics: {
        groups: [
          { family: "-ag", words: ["bag", "tag", "wag"] },
          { family: "-an", words: ["can", "fan", "pan"] },
          { family: "-at", words: ["bat", "hat", "mat"] }
        ]
      }
    },
    {
      id: "unit-3",
      title: "How old are you?",
      topic: "Numbers 1–10",
      mainSentences: [
        "I am eight years old.",
        "I am not one year old.",
        "He is eight years old.",
        "He is not one year old.",
        "How old are you?",
        "I am six years old.",
        "How old is she?",
        "She is six years old."
      ],
      vocabulary: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
      quiz: [{ prompt: "She is ____ years old.", answer: "six", choices: ["four", "six", "eight"], visual: "6️⃣", image: "" }],
      phonics: {
        groups: [
          { family: "-ed", words: ["bed", "red"] },
          { family: "-eg", words: ["beg", "leg"] },
          { family: "-en", words: ["men", "pen"] },
          { family: "-et", words: ["net", "vet"] }
        ]
      }
    },
    {
      id: "unit-4",
      title: "Are you happy?",
      topic: "Adjectives",
      mainSentences: [
        "I am happy.",
        "I am not happy.",
        "You are happy.",
        "You are not happy.",
        "He is happy.",
        "He is not happy.",
        "Are you tall?",
        "Yes, I am.",
        "Is she tall?",
        "No, she is not."
      ],
      vocabulary: ["sad", "happy", "chubby", "thin", "young", "old", "short", "tall", "cute"],
      quiz: [{ prompt: "She is ____.", answer: "happy", choices: ["sad", "happy", "tall"], visual: "😄", image: "" }],
      phonics: {
        groups: [
          { family: "-ib", words: ["bib", "rib"] },
          { family: "-id", words: ["kid", "lid"] },
          { family: "-ig", words: ["big", "dig"] },
          { family: "-in", words: ["fin", "win"] }
        ]
      }
    },
    {
      id: "unit-5",
      title: "What is it?",
      topic: "Stationery",
      mainSentences: [
        "It is a pen.",
        "It is not an eraser.",
        "What is it?",
        "It is a pen.",
        "Is it an eraser?",
        "Yes, it is."
      ],
      vocabulary: ["school bag", "ruler", "book", "pencil case", "pencil", "pen", "eraser", "desk", "chair"],
      quiz: [{ prompt: "It is a ____.", answer: "pen", choices: ["book", "pen", "eraser"], visual: "🖊️", image: "" }],
      phonics: {
        groups: [
          { family: "-ip", words: ["dip", "lip", "rip"] },
          { family: "-it", words: ["hit", "kit", "sit"] },
          { family: "-ix", words: ["fix", "mix", "six"] }
        ]
      }
    },
    {
      id: "unit-6",
      title: "What color is it?",
      topic: "Colors",
      mainSentences: [
        "My book is red.",
        "Your book is not red.",
        "What color is your pen?",
        "It is red.",
        "Is it red?",
        "No, it is not."
      ],
      vocabulary: ["red", "yellow", "green", "blue", "pink", "black", "white", "brown", "orange", "purple"],
      quiz: [{ prompt: "It is ____.", answer: "red", choices: ["blue", "red", "yellow"], visual: "🟥", image: "" }],
      phonics: {
        groups: [
          { family: "-og", words: ["jog", "log"] },
          { family: "-op", words: ["hop", "mop"] },
          { family: "-ot", words: ["cot", "pot"] },
          { family: "-ox", words: ["ox", "box"] }
        ]
      }
    },
    {
      id: "unit-7",
      title: "This is a hat.",
      topic: "Clothing",
      mainSentences: [
        "This is my hat.",
        "That is not his hat.",
        "What is this?",
        "This is a hat.",
        "What is that?",
        "It is a hat."
      ],
      vocabulary: ["coat", "dress", "jacket", "T-shirt", "shirt", "cap", "hat", "skirt"],
      quiz: [{ prompt: "This is a ____.", answer: "hat", choices: ["coat", "hat", "skirt"], visual: "🎩", image: "" }],
      phonics: {
        groups: [
          { family: "-ub", words: ["cub", "sub", "tub"] },
          { family: "-ug", words: ["bug", "hug", "mug"] },
          { family: "-up", words: ["up", "cup", "pup"] }
        ]
      }
    },
    {
      id: "unit-8",
      title: "Is that a rabbit?",
      topic: "Animals on the Farm",
      mainSentences: [
        "Is this a dog?",
        "Yes, it is.",
        "Is that your dog?",
        "No, it is not."
      ],
      vocabulary: ["cat", "horse", "rat", "pig", "sheep", "rabbit", "chicken", "cow", "duck", "dog"],
      quiz: [{ prompt: "Is that a ____?", answer: "rabbit", choices: ["cat", "rabbit", "dog"], visual: "🐇", image: "" }],
      phonics: {
        groups: [
          { family: "-ud", words: ["bud", "cud", "mud"] },
          { family: "-un", words: ["bun", "run", "sun"] },
          { family: "-ut", words: ["cut", "hut", "nut"] }
        ]
      }
    },
    {
      id: "unit-9",
      title: "We are hungry.",
      topic: "Animals in the Zoo",
      mainSentences: [
        "He is hungry.",
        "They are not hungry.",
        "Is she noisy?",
        "Yes, she is.",
        "Are they noisy?",
        "No, they are not."
      ],
      vocabulary: ["hungry", "thirsty", "angry", "lazy", "noisy", "quiet", "sleepy", "tired"],
      quiz: [{ prompt: "She is ____.", answer: "sleepy", choices: ["hungry", "sleepy", "noisy"], visual: "😴", image: "" }],
      phonics: { review: true, groups: [] }
    }
  ];

  window.CURRICULUM_BOOKS = [{
    id: "book-1",
    title: "Book 1",
    subtitle: "Starter English",
    units
  }];
})();

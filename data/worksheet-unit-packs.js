(function () {
  "use strict";

  const reading = (title, skill, lines, questions, heroWords = []) => ({
    title, skill, lines, questions, heroWords
  });

  window.UNIT_PACKS = {
    ...(window.UNIT_PACKS || {}),
    "book-1/unit-6": {
      dialogueOrder: [
        { lines: ["A. It is yellow.", "B. Is your book green?", "C. What color is it?", "D. No, it is not."], expectedAnswer: "B → D → C → A" },
        { lines: ["A. Is the pen blue?", "B. It is a pen.", "C. Yes, it is blue.", "D. What is it?"], expectedAnswer: "D → B → A → C" },
        { lines: ["A. Is it a ruler?", "B. What color is the pencil?", "C. No, it is a pencil.", "D. It is green."], expectedAnswer: "A → C → B → D" },
        { lines: ["A. Yes, it is an eraser.", "B. It is pink.", "C. Is it an eraser?", "D. What color is the eraser?"], expectedAnswer: "C → A → D → B" }
      ],
      pairForVocabulary(word, index, day, vocabulary) {
        const objects = ["book", "book", "pen", "pencil", "ruler", "eraser", "pencil case", "school bag", "desk", "chair"];
        const col = vocabulary.indexOf(word);
        const object = objects[col];
        if (!object) return null;
        const sprite = { src: "assets/images/book1/unit6/color-school-objects.svg", cols: 10, rows: 1, col, row: 0 };
        if (index === 0) return { question: `What color is the ${object}?`, answer: `It is ${word}.`, sprite };
        const possessive = index % 3 === 1;
        const questionSubject = `${possessive ? "your" : "the"} ${object}`;
        const answerSubject = `${possessive ? "my" : "the"} ${object}`;
        const contrast = day === 1 ? vocabulary[({ 2: 4, 4: 6, 6: 2 })[index]] : null;
        if (contrast && contrast !== word) {
          return { question: `Is ${questionSubject} ${contrast}?`, answer: `No, ${answerSubject} is ${word}.`, sprite };
        }
        return { question: `Is ${questionSubject} ${word}?`, answer: `Yes, ${answerSubject} is ${word}.`, sprite };
      }
    },
    "book-2/unit-1": { reading: reading("Mia's Classroom", "There is / There is not", [
      "This is Mia's classroom.",
      "There is a door and a fan.",
      "There is a television.",
      "There is not a telephone."
    ], [
      { q: "Is there a door?", a: "Yes, there is." },
      { q: "Is there a fan?", a: "Yes, there is." },
      { q: "Is there a television?", a: "Yes, there is." },
      { q: "Is there a telephone?", a: "No, there is not." }
    ], ["door", "fan", "television", "telephone"]) },
    "book-2/unit-2": { reading: reading("Things in the Room", "There are / Are there", [
      "There are eleven books.",
      "There are fifteen pens.",
      "There are twelve rulers.",
      "There are not twenty erasers."
    ], [
      { q: "Are there eleven books?", a: "Yes, there are." },
      { q: "Are there fifteen pens?", a: "Yes, there are." },
      { q: "Are there twelve rulers?", a: "Yes, there are." },
      { q: "Are there twenty erasers?", a: "No, there are not." }
    ]) },
    "book-2/unit-3": { reading: reading("The Toy Room", "How many / There is / There are", [
      "There is one ball.",
      "There are five yo-yos.",
      "There are ten blocks.",
      "There is one teddy bear."
    ], [
      { q: "How many balls are there?", a: "There is one ball." },
      { q: "How many yo-yos are there?", a: "There are five yo-yos." },
      { q: "How many blocks are there?", a: "There are ten blocks." },
      { q: "How many teddy bears are there?", a: "There is one teddy bear." }
    ], ["ball", "yo-yo", "blocks", "teddy bear"]) },
    "book-2/unit-4": { reading: reading("Fruit Time", "these / those", [
      "These are bananas and pears.",
      "Those are guavas and watermelons.",
      "What are these?",
      "They are bananas and pears."
    ], [
      { q: "What are these?", a: "They are bananas and pears." },
      { q: "What are those?", a: "They are guavas and watermelons." },
      { q: "Are these guavas?", a: "No, they are not." },
      { q: "Are those watermelons?", a: "Yes, they are." }
    ], ["banana", "pear", "guava", "watermelon"]) },
    "book-2/unit-5": { reading: reading("More Fruit", "Are these / Are those", [
      "These are oranges and peaches.",
      "Those are kiwis and mangoes.",
      "Are these tomatoes?",
      "No, they are not."
    ], [
      { q: "What are these?", a: "They are oranges and peaches." },
      { q: "What are those?", a: "They are kiwis and mangoes." },
      { q: "Are these tomatoes?", a: "No, they are not." },
      { q: "Are those mangoes?", a: "Yes, they are." }
    ], ["orange", "peach", "kiwi", "mango", "tomato"]) },
    "book-2/unit-6": { reading: reading("What Can They Do?", "can / can't", [
      "Lumi can jump and run.",
      "Ludi can read and write.",
      "Can Lumi swim?",
      "No, she can't."
    ], [
      { q: "Can Lumi jump?", a: "Yes, she can." },
      { q: "Can Lumi swim?", a: "No, she can't." },
      { q: "Can Ludi read?", a: "Yes, he can." },
      { q: "Can Ludi write?", a: "Yes, he can." }
    ], ["jump", "run", "read", "write", "swim"]) },
    "book-2/unit-7": {
      pictureQuestionAnswers: true,
      pairForVocabulary(word) {
        const scenes = {
          on: ["Where is the book?", "It is on the desk."],
          in: ["Is the pencil in the pencil case?", "Yes, it is in the pencil case."],
          under: ["Is the book under the desk?", "Yes, it is under the desk."],
          behind: ["Where is the boy?", "He is behind the chair."],
          "in front of": ["Where is the girl?", "She is in front of the table."],
          between: ["Where is the ball?", "It is between the chairs."],
          "next to": ["Where is the chair?", "It is next to the desk."],
          near: ["Where is the desk?", "It is near the ball."]
        };
        const scene = scenes[word];
        const col = ({ in: 0, between: 1, near: 2 })[word];
        const sprite = Number.isInteger(col)
          ? { src: "assets/images/book2/unit7/worksheet-scenes.svg", cols: 3, rows: 1, col, row: 0 }
          : undefined;
        return scene && { question: scene[0], answer: scene[1], sprite };
      },
      reading: reading("Where Are the Things?", "where / place words", [
      "My book is under the desk.",
      "My pen is on the table.",
      "Goody is behind the door.",
      "The ball is next to Goody."
    ], [
      { q: "Where is my book?", a: "It is under the desk." },
      { q: "Where is my pen?", a: "It is on the table." },
      { q: "Where is Goody?", a: "He is behind the door." },
      { q: "Where is the ball?", a: "It is next to Goody." }
    ]) },
    "book-2/unit-8": { reading: reading("Where Is Everyone?", "where / rooms", [
      "Lumi is in the bedroom.",
      "Ludi is in the kitchen.",
      "His father is in the garden.",
      "Goody is in the yard."
    ], [
      { q: "Where is Lumi?", a: "She is in the bedroom." },
      { q: "Where is Ludi?", a: "He is in the kitchen." },
      { q: "Where is his father?", a: "He is in the garden." },
      { q: "Where is Goody?", a: "He is in the yard." }
    ], ["bedroom", "kitchen", "garden", "yard"]) },
    "book-2/unit-9": { reading: reading("Animals We Like", "like / don't like", [
      "Lumi says, “I like tigers.”",
      "Ludi says, “I like lions.”",
      "They like zebras, too.",
      "They don't like snakes."
    ], [
      { q: "Do they like zebras?", a: "Yes, they do." },
      { q: "Do they like snakes?", a: "No, they don't." }
    ], ["tiger", "lion", "zebra", "snake"]) },
    "book-3/unit-6": { reading: reading("Lumi and Ludi's Hair", "do / does + have", [
      "Lumi has long, dark hair.",
      "She doesn't have short hair.",
      "Ludi has short, curly hair.",
      "He doesn't have long hair."
    ], [
      { q: "Does Lumi have long hair?", a: "Yes, she does." },
      { q: "Does Lumi have short hair?", a: "No, she doesn't." },
      { q: "Does Ludi have curly hair?", a: "Yes, he does." },
      { q: "Does Ludi have long hair?", a: "No, he doesn't." }
    ], ["long", "dark", "short", "curly"]) },
    "book-3/unit-7": { reading: reading("Sports We Like", "like / likes to play", [
      "Lumi likes to play baseball.",
      "She also likes to play tennis.",
      "Mommy doesn't like to play baseball.",
      "She likes to play badminton."
    ], [
      { q: "Does Lumi like to play baseball?", a: "Yes, she does." },
      { q: "Does Lumi like to play tennis?", a: "Yes, she does." },
      { q: "Does Mommy like to play baseball?", a: "No, she doesn't." },
      { q: "What does Mommy like to play?", a: "She likes to play badminton." }
    ], ["baseball", "tennis", "badminton"]) },
    "book-3/unit-8": { reading: reading("Saturday and Sunday", "days / likes to", [
      "Today is Saturday.",
      "Lumi likes to ride a bike.",
      "Ludi likes to read a book.",
      "Tomorrow is Sunday.",
      "They like to watch TV on Sundays."
    ], [
      { q: "What day is today?", a: "It is Saturday." },
      { q: "What day is tomorrow?", a: "Tomorrow is Sunday." },
      { q: "What does Lumi like to do?", a: "She likes to ride a bike." },
      { q: "What do they like on Sundays?", a: "They like to watch TV." }
    ], ["ride a bike", "read a book", "watch TV"]) },
    "book-3/unit-9": { reading: reading("The Weather Today", "weather / likes to go", [
      "Today is sunny.",
      "Lumi likes to go swimming.",
      "Ludi likes to go fishing.",
      "He doesn't like to go hiking.",
      "Tomorrow is rainy."
    ], [
      { q: "How's the weather today?", a: "It is sunny." },
      { q: "What does Lumi like to do?", a: "She likes to go swimming." },
      { q: "What does Ludi like to do?", a: "He likes to go fishing." },
      { q: "Does Ludi like to go hiking?", a: "No, he doesn't." }
    ], ["sunny", "go swimming", "go fishing", "go hiking", "rainy"]) }
  };
})(window);

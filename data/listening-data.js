(function () {
  "use strict";

  const PUBLIC_PLAYER_URL = "https://ssophy-808.github.io/english-teaching-player/listen.html";
  const items = {
    "b1-u5-pen": {
      source: "book-1/unit-5",
      kind: "context",
      title: "What Is It?",
      audio: "assets/audio/listening/b1-u5-pen.wav",
      transcript: [
        "Lumi: What is it?",
        "Ludi: It is a pen.",
        "Lumi: Is it an eraser?",
        "Ludi: No, it is not."
      ],
      question: "What is it?",
      choices: ["It is a pen.", "It is an eraser.", "It is a book."],
      answer: "It is a pen."
    },
    "b2-u5-fruit": {
      source: "book-2/unit-5",
      kind: "context",
      title: "Fruit Time",
      audio: "assets/audio/listening/b2-u5-fruit.wav",
      transcript: [
        "Lumi: What are these?",
        "Ludi: They are strawberries.",
        "Lumi: Are those strawberries?",
        "Ludi: No, they aren't. They are kiwis."
      ],
      question: "What are those?",
      choices: ["They are kiwis.", "They are strawberries.", "They are peaches."],
      answer: "They are kiwis."
    },
    "b2-u7-book": {
      source: "book-2/unit-7",
      kind: "context",
      title: "In the Classroom",
      audio: "assets/audio/listening/b2-u7-book.wav",
      transcript: [
        "Lumi: Where is my book?",
        "Ludi: It is under the desk.",
        "Lumi: Is Goody under the desk, too?",
        "Ludi: No. He is behind the desk."
      ],
      question: "Where is Lumi's book?",
      choices: ["It is under the desk.", "It is behind the desk.", "It is next to the window."],
      answer: "It is under the desk."
    },
    "b3-u2-food": {
      source: "book-3/unit-2",
      kind: "context",
      title: "Lunch Time",
      audio: "assets/audio/listening/b3-u2-food.wav",
      transcript: [
        "Ludi: Does Lumi like pizza?",
        "Kenny: No, she doesn't.",
        "Ludi: What does she like?",
        "Kenny: She likes hamburgers."
      ],
      question: "What does Lumi like?",
      choices: ["She likes hamburgers.", "She likes pizza.", "She likes hot dogs."],
      answer: "She likes hamburgers."
    }
  };

  const sio2PhonicsChoices = {
    unit1: [["cape", "cap", "pan"], ["rain", "ran", "ray"], ["hay", "hat", "late"]],
    unit2: [["eve", "bed", "pet"], ["meat", "feet", "leg"], ["bee", "hen", "key"]],
    unit3: [["bike", "bit", "pin"], ["night", "nine", "sit"], ["wild", "find", "kit"]],
    unit4: [["bone", "hot", "fox"], ["road", "rod", "cot"], ["toe", "hoe", "hop"]],
    unit5: [["cute", "cut", "sun"], ["blue", "cub", "hug"], ["juice", "suit", "run"]],
    unit6: [["cake", "city", "cup"], ["cone", "cent", "cube"], ["face", "fancy", "cake"]],
    unit7: [["game", "gem", "gym"], ["goat", "gull", "page"], ["giant", "gate", "gem"]],
    unit8: [["barn", "corn", "fork"], ["car", "horn", "pork"], ["jar", "park", "corn"]],
    unit9: [["fern", "bird", "burn"], ["mermaid", "summer", "dirt"], ["first", "hurt", "turn"]],
    unit10: [["cheese", "chin", "ship"], ["peach", "rich", "fish"], ["sheep", "wash", "cheese"]],
    unit11: [["thin", "them", "whale"], ["math", "mother", "wheat"], ["match", "witch", "them"]],
    unit12: [["phone", "ghost", "laugh"], ["photo", "cough", "graph"], ["dolphin", "ghee", "phone"]]
  };

  function addPhonicsListening(courseId, banks) {
    Object.entries(banks).forEach(([unitId, questionSets], index) => questionSets.forEach((choices, questionIndex) => {
      const word = choices[0];
      items[`${courseId}-${unitId}-${word.toLowerCase()}`] = {
        source: `${courseId}/${unitId}`,
        kind: "phonics-word",
        title: `${courseId.toUpperCase()} ${index + 1}.${questionIndex + 1}`,
        audio: `assets/audio/phonics/${courseId}-${unitId}-${word.toLowerCase()}.wav`,
        transcript: [word, word],
        question: "Which word do you hear?",
        choices,
        answer: word,
        phonicsSkill: "whole word"
      };
    }));
  }

  function safeId(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function addSio3Listening() {
    const course = (window.PHONICS_COURSES || []).find((item) => item.id === "sio3");
    (course?.units || []).forEach((unit) => {
      const words = unit.words.map((item) => item.word);
      words.slice(0, 10).forEach((word, index) => {
        const distractorOne = words[(index + 1) % words.length];
        const distractorTwo = words[(index + Math.ceil(words.length / 2)) % words.length];
        const id = `sio3-${unit.id}-${safeId(word)}`;
        items[id] = {
          source: `sio3/${unit.id}`,
          kind: "phonics-word",
          title: `SIO3 ${unit.number}.${index + 1}`,
          audio: `assets/audio/phonics/${id}.wav`,
          transcript: [word, word],
          question: "Which word do you hear?",
          choices: [word, distractorOne, distractorTwo],
          answer: word,
          phonicsSkill: "whole word"
        };
      });
      const pairsNeeded = Math.max(0, 10 - Math.min(10, words.length));
      for (let index = 0; index < pairsNeeded; index += 1) {
        const first = words[(index * 2) % words.length];
        const second = words[(index * 2 + 1) % words.length];
        const other = words[(index * 2 + 3) % words.length];
        const id = `sio3-${unit.id}-${safeId(first)}-${safeId(second)}`;
        const answer = `${first} – ${second}`;
        items[id] = {
          source: `sio3/${unit.id}`,
          kind: "phonics-word",
          title: `SIO3 ${unit.number}.${words.length + index + 1}`,
          audio: `assets/audio/phonics/${id}.wav`,
          transcript: [first, second],
          question: "Which pair do you hear?",
          choices: [answer, `${second} – ${first}`, `${first} – ${other}`],
          answer,
          phonicsSkill: "word order"
        };
      }
    });
  }

  addPhonicsListening("sio2", sio2PhonicsChoices);
  addSio3Listening();

  window.LISTENING_CONFIG = { publicPlayerUrl: PUBLIC_PLAYER_URL };
  window.LISTENING_ITEMS = items;
})();

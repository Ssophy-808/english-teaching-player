(function () {
  "use strict";

  window.PRACTICE_QUESTION_BANKS = {
    ...(window.PRACTICE_QUESTION_BANKS || {}),
    "book-3/unit-6": {
      ...(window.PRACTICE_QUESTION_BANKS?.["book-3/unit-6"] || {}),
      day3: [
        {
          id: "b3u6-reading-cloze-picture-day",
          type: "reading-cloze",
          title: "Picture Day",
          instruction: "Choose a word, then choose the blank where it belongs.",
          wordBank: ["long", "short", "curly", "braided", "straight", "blond", "dark"],
          passage: [
            "It is picture day. Lumi has ",
            { blank: 0, answer: "long" },
            " hair. Ludi has ",
            { blank: 1, answer: "short" },
            " hair. Their friend has ",
            { blank: 2, answer: "curly" },
            " hair. She wants ",
            { blank: 3, answer: "braided" },
            " hair for the class photo."
          ]
        }
      ]
    }
  };
})();

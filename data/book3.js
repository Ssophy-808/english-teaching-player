(function () {
  "use strict";

  const vocabulary = (word, meaning, visual, aliases = []) => ({
    word,
    meaning,
    visual,
    aliases,
    image: "",
    audio: ""
  });

  const units = [
    {
      id: "unit-1",
      title: "What do you like?",
      topic: "Animals We Like",
      vocabulary: [
        vocabulary("birds", "鳥", "🐦", ["bird"]),
        vocabulary("frogs", "青蛙", "🐸", ["frog"]),
        vocabulary("puppies", "小狗", "🐶", ["puppy"]),
        vocabulary("fish", "魚", "🐟"),
        vocabulary("bunnies", "兔子", "🐰", ["bunny"]),
        vocabulary("turtles", "烏龜", "🐢", ["turtle"]),
        vocabulary("hamsters", "倉鼠", "🐹", ["hamster"]),
        vocabulary("spiders", "蜘蛛", "🕷️", ["spider"])
      ],
      mainSentences: [
        "I like birds.",
        "You like frogs.",
        "We like puppies.",
        "They like fish.",
        "What do you like? I like bunnies.",
        "What do they like? They like turtles.",
        "Do you like hamsters? Yes, I do.",
        "Do they like spiders? Yes, they do."
      ],
      passportSentences: [
        ["I like birds.", "我喜歡鳥。"],
        ["You like frogs.", "你喜歡青蛙。"],
        ["We like puppies.", "我們喜歡小狗。"],
        ["They like fish.", "他們喜歡魚。"],
        ["What do you like?", "你喜歡什麼？"],
        ["I like bunnies.", "我喜歡兔子。"],
        ["What do they like?", "他們喜歡什麼？"],
        ["They like turtles.", "他們喜歡烏龜。"],
        ["Do you like hamsters?", "你喜歡倉鼠嗎？"],
        ["Yes, I do.", "是的，我喜歡。"],
        ["Do they like spiders?", "他們喜歡蜘蛛嗎？"],
        ["Yes, they do.", "是的，他們喜歡。"]
      ],
      phonics: { groups: [] },
      materials: { wordwallDay1Url: "", wordwallDay2Url: "", bookUrl: "" }
    }
  ];

  window.CURRICULUM_BOOKS.push({
    id: "book-3",
    title: "Book 3",
    subtitle: "Growing Skills",
    units
  });
})();

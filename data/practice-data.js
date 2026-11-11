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
          instruction: "Read the whole passage. Type the missing words.",
          passage: [
            "Lumi and Ludi are getting ready for picture day. Lumi needs more time because she has ",
            { blank: 0 },
            " hair. Ludi is ready first because he has ",
            { blank: 1 },
            " hair. Their friend wants two braids for the photo, so she asks for ",
            { blank: 2 },
            " hair. They all smile for the class picture."
          ],
          answers: ["long", "short", "braided"]
        }
      ]
    }
  };
})();

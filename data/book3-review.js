(function () {
  "use strict";

  const q = (id, skill, type, playerPrompt, worksheetPrompt, answer, options = {}) => ({
    id,
    skill,
    type,
    playerPrompt,
    worksheetPrompt,
    answer,
    choices: options.choices || [],
    visual: options.visual || "",
    difficulty: options.difficulty || 1
  });

  window.BOOK3_REVIEW_BANK = {
    "unit-1": {
      title: "What do you like?",
      day3: {
        title: "Affirmative → Negative",
        duration: 85,
        blocks: {
          A: {
            title: "Part A｜Affirmative Sentences",
            subtitle: "I / You / We / They + like",
            questions: [
              q("d3a-1", "subject-like", "choice", "I ___ birds.", "I ___ birds.  (like / likes)", "like", { choices: ["like", "likes"], visual: "🐦" }),
              q("d3a-2", "subject-like", "choice", "You ___ frogs.", "You ___ frogs.  (like / likes)", "like", { choices: ["like", "likes"], visual: "🐸" }),
              q("d3a-3", "subject-like", "choice", "We ___ puppies.", "We ___ puppies.  (like / likes)", "like", { choices: ["like", "likes"], visual: "🐶" }),
              q("d3a-4", "subject-like", "choice", "They ___ fish.", "They ___ fish.  (like / likes)", "like", { choices: ["like", "likes"], visual: "🐟" }),
              q("d3a-5", "subject-swap", "rewrite", "Change I → You:\nI like birds.", "Change the subject to You: I like birds.", "You like birds.", { visual: "🐦" }),
              q("d3a-6", "subject-swap", "rewrite", "Change You → We:\nYou like frogs.", "Change the subject to We: You like frogs.", "We like frogs.", { visual: "🐸" }),
              q("d3a-7", "sentence-order", "reorder", "puppies / We / like", "Put in order: puppies / We / like", "We like puppies.", { visual: "🐶" }),
              q("d3a-8", "fish-form", "choice", "Choose the correct sentence.", "Circle the correct sentence.", "They like fish.", { choices: ["They like fish.", "They likes fishes."], visual: "🐟" })
            ]
          },
          B: {
            title: "Part B｜Negative Sentences",
            subtitle: "I / You / We / They + don't like",
            questions: [
              q("d3b-1", "negative", "choice", "I ___ like spiders.", "I ___ like spiders.  (don't / am not)", "don't", { choices: ["don't", "am not"], visual: "🕷️" }),
              q("d3b-2", "negative", "choice", "You ___ like turtles.", "You ___ like turtles.  (don't / aren't)", "don't", { choices: ["don't", "aren't"], visual: "🐢" }),
              q("d3b-3", "negative", "choice", "We ___ like hamsters.", "We ___ like hamsters.  (don't / aren't)", "don't", { choices: ["don't", "aren't"], visual: "🐹" }),
              q("d3b-4", "negative", "choice", "They ___ like frogs.", "They ___ like frogs.  (don't / doesn't)", "don't", { choices: ["don't", "doesn't"], visual: "🐸" }),
              q("d3b-5", "transform-negative", "rewrite", "Make it negative:\nI like birds.", "Change to negative: I like birds.", "I don't like birds.", { visual: "🐦" }),
              q("d3b-6", "transform-negative", "rewrite", "Make it negative:\nWe like puppies.", "Change to negative: We like puppies.", "We don't like puppies.", { visual: "🐶" }),
              q("d3b-7", "error", "error", "Fix it:\nThey doesn't like fish.", "Correct the sentence: They doesn't like fish.", "They don't like fish.", { visual: "🐟", difficulty: 2 }),
              q("d3b-8", "contrast", "choice", "Choose the action-verb negative.", "Circle the correct action-verb negative.", "You don't like spiders.", { choices: ["You don't like spiders.", "You aren't like spiders."], visual: "🕷️", difficulty: 2 })
            ]
          }
        }
      },
      day4: {
        title: "Questions → Spiral Review",
        duration: 85,
        blocks: {
          A: {
            title: "Part A｜Questions and Answers",
            subtitle: "What do...? / Do...?",
            questions: [
              q("d4a-1", "wh-question", "choice", "What ___ you like?", "What ___ you like?  (do / are / is)", "do", { choices: ["do", "are", "is"], visual: "🐰" }),
              q("d4a-2", "wh-question", "choice", "What ___ they like?", "What ___ they like?  (do / are / is)", "do", { choices: ["do", "are", "is"], visual: "🐢" }),
              q("d4a-3", "yes-no-question", "choice", "___ you like hamsters?", "___ you like hamsters?  (Do / Are)", "Do", { choices: ["Do", "Are"], visual: "🐹" }),
              q("d4a-4", "yes-no-question", "choice", "___ they like spiders?", "___ they like spiders?  (Do / Are)", "Do", { choices: ["Do", "Are"], visual: "🕷️" }),
              q("d4a-5", "answer", "choice", "Do you like frogs?", "Choose the answer: Do you like frogs?", "Yes, I do.", { choices: ["Yes, I do.", "Yes, I am."], visual: "🐸" }),
              q("d4a-6", "answer", "choice", "Do they like spiders?", "Choose the answer: Do they like spiders?", "No, they don't.", { choices: ["No, they don't.", "No, they aren't."], visual: "🕷️" }),
              q("d4a-7", "sentence-order", "reorder", "do / What / you / like / ?", "Put in order: do / What / you / like / ?", "What do you like?", { visual: "🐶" }),
              q("d4a-8", "dialogue", "dialogue", "A: What do you like?\nB: I like puppies.\nA: Do you like spiders?\nB: ______", "Complete the dialogue: Do you like spiders? — ______", "No, I don't.", { visual: "🐶", difficulty: 2 })
            ]
          },
          B: {
            title: "Part B｜Mixed Spiral Review",
            subtitle: "be verb / there be / action verb",
            questions: [
              q("d4b-1", "spiral-be", "choice", "___ you happy?", "___ you happy?  (Are / Do)", "Are", { choices: ["Are", "Do"], visual: "😊" }),
              q("d4b-2", "spiral-be", "choice", "___ she your sister?", "___ she your sister?  (Is / Does)", "Is", { choices: ["Is", "Does"], visual: "👧" }),
              q("d4b-3", "spiral-there", "choice", "___ there a fan?", "___ there a fan?  (Is / Do)", "Is", { choices: ["Is", "Do"], visual: "🌀" }),
              q("d4b-4", "spiral-do", "choice", "___ they like turtles?", "___ they like turtles?  (Do / Are)", "Do", { choices: ["Do", "Are"], visual: "🐢" }),
              q("d4b-5", "identify", "choice", "Which question asks about an action?", "Circle the action-verb question.", "Do you like frogs?", { choices: ["Are you happy?", "Do you like frogs?", "Is there a door?"], visual: "🐸", difficulty: 2 }),
              q("d4b-6", "error", "error", "Fix it:\nAre you like hamsters?", "Correct the sentence: Are you like hamsters?", "Do you like hamsters?", { visual: "🐹", difficulty: 2 }),
              q("d4b-7", "error", "error", "Fix it:\nWhat do they likes?", "Correct the sentence: What do they likes?", "What do they like?", { visual: "🐢", difficulty: 2 }),
              q("d4b-8", "transform", "rewrite", "Change to a question:\nYou like bunnies.", "Change to a Yes/No question: You like bunnies.", "Do you like bunnies?", { visual: "🐰", difficulty: 2 }),
              q("d4b-9", "transform", "rewrite", "Change to a Wh question:\nThey like turtles.", "Change to a Wh question: They like turtles.", "What do they like?", { visual: "🐢", difficulty: 2 }),
              q("d4b-10", "dialogue", "dialogue", "A: What do you like?\nB: I like birds.\nA: Do you like spiders?\nB: ______", "Complete the mini-dialogue: Do you like spiders? — ______", "No, I don't.", { visual: "🐦", difficulty: 2 })
            ]
          }
        }
      }
    }
  };
})();

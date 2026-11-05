(function () {
  "use strict";

  window.LITERACY_BANKS = [{
    id: "book1-unit4",
    bookId: "book1",
    unitId: "unit4",
    title: "Book 1 · Units 1–4 Review",
    subtitle: "情境式素養題 Demo",
    scope: "Greetings · Family · Numbers 1–10 · Adjectives",
    questions: [
      {
        id: "b1u4-context-1",
        type: "context",
        context: ["Lumi gets a new book from her mother.", "She smiles and says, “Thank you!”"],
        question: "How does Lumi feel?",
        choices: ["She is sad.", "She is happy.", "She is old."],
        answer: 1,
        explanation: "Lumi gets a gift, smiles, and says thank you. These clues show that she is happy.",
        reasoning: ["She gets a new book.", "She smiles.", "→ She is happy."],
        grammar: "be verb + adjective",
        skill: "Infer a feeling from two context clues",
        difficulty: 1
      },
      {
        id: "b1u4-context-2",
        type: "context",
        context: ["Ben is eight years old.", "His grandfather is seventy years old."],
        question: "Who is old?",
        choices: ["Ben is old.", "His grandfather is old.", "They are both young."],
        answer: 1,
        explanation: "Ben is eight, but his grandfather is seventy. The grandfather is the old person.",
        reasoning: ["Ben = 8", "Grandfather = 70", "→ His grandfather is old."],
        grammar: "He is + adjective",
        skill: "Combine age and family information",
        difficulty: 1
      },
      {
        id: "b1u4-multi-1",
        type: "multi-clue",
        context: ["Mia is seven years old.", "Leo is nine years old.", "The child with the number seven is short."],
        question: "Who is short?",
        choices: ["Mia is short.", "Leo is short.", "Their mother is short."],
        answer: 0,
        explanation: "The short child has the number seven. Mia is seven, so Mia is short.",
        reasoning: ["short child = number 7", "Mia = 7", "→ Mia is short."],
        grammar: "She is + adjective",
        skill: "Connect two separate clues",
        difficulty: 2
      },
      {
        id: "b1u4-reverse-1",
        type: "reverse-question",
        dialogue: ["A: ______________________________", "B: No, she isn't. She's my aunt."],
        question: "Which question completes the dialogue?",
        choices: ["Is she your mother?", "Who is he?", "How old is she?"],
        answer: 0,
        explanation: "The answer begins with “No, she isn't,” so the question must be a yes/no question about she.",
        reasoning: ["No, she isn't. = yes/no answer", "she = female person", "→ Is she your mother?"],
        grammar: "Is she ...? / No, she isn't.",
        skill: "Infer a question from the answer form",
        difficulty: 2
      },
      {
        id: "b1u4-reverse-2",
        type: "reverse-question",
        dialogue: ["A: ______________________________", "B: She is nine years old."],
        question: "Which question completes the dialogue?",
        choices: ["Who is she?", "How old is she?", "Is she happy?"],
        answer: 1,
        explanation: "The answer gives her age, so the matching question is “How old is she?”",
        reasoning: ["She = the subject", "nine years old = age", "→ How old is she?"],
        grammar: "How old is she?",
        skill: "Match an information question to its answer",
        difficulty: 1
      },
      {
        id: "b1u4-dialogue-1",
        type: "dialogue",
        dialogue: ["Amy: Who is he?", "Ben: ______________________________"],
        question: "What should Ben say?",
        choices: ["He is my brother.", "I am eight years old.", "Yes, she is."],
        answer: 0,
        explanation: "“Who is he?” asks for the identity of a male person. “He is my brother” answers it.",
        reasoning: ["Who = asks about a person", "he = male person", "→ He is my brother."],
        grammar: "Who is he? / He is ...",
        skill: "Continue a dialogue logically",
        difficulty: 1
      },
      {
        id: "b1u4-dialogue-2",
        type: "dialogue",
        dialogue: ["Mia: Is Tom tall?", "Leo: No, he isn't.", "Mia: ______________________________"],
        question: "What should Mia say next?",
        choices: ["He is short.", "She is tall.", "He is my mother."],
        answer: 0,
        explanation: "Leo says Tom is not tall. The logical opposite description is “He is short.”",
        reasoning: ["Tom = he", "not tall", "→ He is short."],
        grammar: "He is not ... / He is ...",
        skill: "Use pronouns and opposite adjectives",
        difficulty: 2
      },
      {
        id: "b1u4-state-1",
        type: "state-inference",
        context: ["Kevin loses his favorite toy.", "He looks down and does not smile."],
        question: "Kevin is probably ________.",
        choices: ["happy", "sad", "cute"],
        answer: 1,
        explanation: "Kevin loses something he likes and does not smile, so he is probably sad.",
        reasoning: ["He loses his favorite toy.", "He does not smile.", "→ He is sad."],
        grammar: "be verb + adjective",
        skill: "Infer an emotional state",
        difficulty: 1
      },
      {
        id: "b1u4-picture-1",
        type: "image-context",
        image: "assets/images/book1/unit4/sad.png",
        imageAlt: "A sad face",
        context: ["Nina's ice cream falls on the ground.", "She looks at it and says, “Oh, no!”"],
        question: "How does Nina feel?",
        choices: ["She is happy.", "She is sad.", "She is tall."],
        answer: 1,
        explanation: "The picture, the fallen ice cream, and “Oh, no!” all show that Nina is sad.",
        reasoning: ["Use the picture.", "Use what happened.", "→ Nina is sad."],
        grammar: "How does ... feel? / She is ...",
        skill: "Combine picture and text clues",
        difficulty: 1
      },
      {
        id: "b1u4-picture-2",
        type: "image-context",
        image: "assets/images/unit1-teacher.png",
        imageAlt: "A teacher",
        context: ["Ms. Lin works at a school.", "The students say, “Good morning, Ms. Lin.”"],
        question: "Who is Ms. Lin?",
        choices: ["She is a student.", "She is a teacher.", "She is my sister."],
        answer: 1,
        explanation: "She works at a school, and students greet her as Ms. Lin. She is a teacher.",
        reasoning: ["She works at a school.", "Students greet her.", "→ She is a teacher."],
        grammar: "She is a + noun",
        skill: "Combine picture, setting, and people clues",
        difficulty: 2
      },
      {
        id: "b1u4-cloze-1",
        type: "dialogue-cloze",
        dialogue: ["Lumi: Is the girl your sister?", "Tom: No, she isn't.", "Lumi: Who is she?", "Tom: ______________________________"],
        question: "Which sentence completes the dialogue?",
        choices: ["She is my cousin.", "He is my brother.", "I am ten years old."],
        answer: 0,
        explanation: "Lumi asks who the girl is. Tom must answer with “She is ...” and a family member.",
        reasoning: ["the girl = she", "Who is she? = asks identity", "→ She is my cousin."],
        grammar: "Who is she? / She is my ...",
        skill: "Complete a multi-turn dialogue",
        difficulty: 2
      },
      {
        id: "b1u4-reading-1",
        type: "reading",
        title: "Meet Emma's Family",
        passage: [
          "Emma is eight years old.",
          "The tall boy next to her is Ben, her brother.",
          "The woman with a book is their mother.",
          "Ben is not happy because he cannot find his red cap."
        ],
        grammar: "be verb · family · adjectives",
        difficulty: 2,
        questions: [
          {
            id: "q1",
            question: "How old is Emma?",
            choices: ["She is eight years old.", "She is ten years old.", "She is old."],
            answer: 0,
            explanation: "The first sentence says Emma is eight years old.",
            reasoning: ["Find Emma's age.", "Emma = eight", "→ She is eight years old."],
            skill: "Find explicit information",
            difficulty: 1
          },
          {
            id: "q2",
            question: "Who is Ben?",
            choices: ["He is Emma's father.", "He is Emma's brother.", "He is Emma's uncle."],
            answer: 1,
            explanation: "The passage says the tall boy, Ben, is Emma's brother.",
            reasoning: ["Ben = the tall boy", "The tall boy is her brother.", "→ Ben is Emma's brother."],
            skill: "Connect a name with a family relationship",
            difficulty: 1
          },
          {
            id: "q3",
            question: "Which picture would probably make Ben happy?",
            choices: ["His red cap", "A number eight", "A tall teacher"],
            answer: 0,
            explanation: "Ben is unhappy because his red cap is missing. Finding the cap would probably make him happy.",
            reasoning: ["Ben cannot find his cap.", "That is why he is not happy.", "→ Finding the cap will help."],
            skill: "Infer a solution from the problem",
            difficulty: 2
          }
        ]
      }
    ]
  }];
})();

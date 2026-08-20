# English Teaching Player

A static, projection-friendly lesson player for English teachers. It includes a phase-based teaching flow, Book → Unit → Lesson navigation, one-step-at-a-time playback, Previous / Next controls, keyboard navigation, progress, fullscreen, saved local progress, Wordwall, picture quizzes, in-flow review games, and a no-prep classroom toolbox.

## Project structure

```text
/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  ├─ app.js          # Library navigation and Continue Lesson
│  ├─ player.js       # Lesson playback and controls
│  ├─ teaching-flow.js # Fixed curriculum-to-lesson template
│  ├─ activities.js   # Lesson activity renderers
│  └─ classroom-tools.js # Random cards, reveal, matching, dice, timer, scores
├─ data/
│  ├─ book1.js        # Book 1 curriculum, Units 1–9
│  ├─ book1-passport.js # Book 1 passport review sentences
│  └─ book2.js        # Book 2 curriculum, Units 1–9
└─ assets/
   ├─ images/
   └─ audio/
```

## Open locally

Because the site is static, it can be served by any simple local web server. From the project folder, use one of these options:

```powershell
# Python
python -m http.server 8080

# Or, if Node.js is installed
npx serve .
```

Then open `http://localhost:8080` (Python) or the URL shown by `serve`.

## Deploy to GitHub Pages

1. Push this project to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your publishing branch (usually `main`) and the `/ (root)` folder.
5. Click **Save**. GitHub will show the public Pages URL after deployment.

All asset paths are relative, so the app also works when GitHub Pages publishes it under a repository subpath.

## Add course content

Course data lives in `data/`. It contains curriculum only; it does not define page order or player behavior. Add another book file before `js/teaching-flow.js` in `index.html` and push the new book into `window.CURRICULUM_BOOKS`. Keep IDs unique.

The basic data shape is:

```js
{
  id: "book-2",
  title: "Book 2",
  subtitle: "Everyday English",
  units: [{
    id: "unit-1",
    title: "Who is he?",
    topic: "Family",
    mainSentences: ["Who is he?", "He is my brother."],
    vocabulary: ["father", "mother", "brother", "sister"],
    phonics: {
      groups: [{ family: "-ag", words: ["bag", "tag", "wag"] }]
    },
    materials: { embedUrl: "", bookUrl: "" }
  }]
}
```

`js/teaching-flow.js` automatically turns curriculum data into Day 1 and Day 2 lessons. Book 1 and Book 2 share the same phase model; new books receive it automatically. Stage durations are stored once and automatically total 45 minutes:

`Warm Up → Vocabulary Teaching → Vocabulary Games → Vocabulary Check → Grammar Teaching → Grammar Games + Check → Topic Conversation → Show Book → Quiz → Homework`

Book 1 Unit 1 uses a dedicated four-day progression: Day 1 builds first understanding and shows only the six affirmative Passport sentences; Day 2 drills `I → am` and `You → are`; Day 3 labels affirmative/negative forms as course-supplement material; Day 4 mixes `I / You + am / are + not` without introducing `He / She`.

Book 1 Unit 2 also uses a dedicated four-day progression: Day 1 introduces family words and the eight `Who is he / she?` Passport pairs; Day 2 drills recognition without adding new grammar; Day 3 formally maps `I → am`, `You → are`, and `He / She → is`; Day 4 mixes all four subjects through choices, corrections, reordering, and picture speaking.

Book 1 Unit 3 uses four days to build the age-question pattern: Day 1 introduces numbers and the one/two-year-old Passport answers; Day 2 drills `How old are you?`; Day 3 reconnects `he / she` and compares `are you` with `is he / she`; Day 4 applies the reusable formula `How old + be verb + subject?` in mixed practice.

Book 1 Unit 4 uses four days to introduce yes/no questions with adjectives: Day 1 moves the be verb to the front; Day 2 drills positive answers and subject–be matching; Day 3 restores `not` through negative answers; Day 4 mixes affirmative, negative, and question forms.

Book 1 Unit 5 uses four days to establish `It → is`: Day 1 introduces stationery and eight Passport object questions; Day 2 drills `What is it?` with a small `a / an` focus; Day 3 applies affirmative, negative, and yes/no question forms to `it`; Day 4 mixes `What is it?` and `Is it...?` in picture-based practice.

Book 1 Unit 6 uses four days to build color questions: Day 1 introduces ten colors and reviews `It → is`; Day 2 drills color blocks, colored objects, sentence order, and listening-style choices; Day 3 adds `my / your` and color negatives; Day 4 combines object, color, and yes/no questions in three-question picture challenges.

Book 1 Unit 7 uses four days to establish distance and ownership with clothing: Day 1 introduces `this / that` and eight Passport pairs; Day 2 drills near/far choices and sentence order; Day 3 extends `my / your` with `his / her`; Day 4 combines object, color, and ownership questions before Unit 8.

Book 1 Unit 8 uses four days to apply `this / that` to farm animals: Day 1 introduces the animal question pattern and eight Passport pairs; Day 2 drills `Yes, it is / No, it isn't`; Day 3 transforms statements into questions and compares three sentence forms; Day 4 mixes name questions, yes/no questions, corrections, and sentence order.

Book 1 Unit 9 completes the Book 1 be-verb system in four days: Day 1 adds `They → are` and eight adjective Passport questions; Day 2 drills `Are they...?`; Day 3 contrasts singular and plural subjects; Day 4 mixes all six subjects in a final grammar challenge.

Book 2 Unit 1 uses four days to establish singular `there is`: Day 1 introduces `There is... / Is there...?` and ten classroom-object Passport questions; Day 2 drills `Yes, there is / No, there isn't`; Day 3 adds negative statements; Day 4 mixes all three sentence forms with the reusable Sentence Transformer activity.

Book 3 Unit 1 uses four days to move from be verbs into the action verb `like`: Day 1 keeps `like` unchanged with `I / You / We / They`; Day 2 introduces `What do you / they like?`; Day 3 adds `Do you / they...?` with Yes/No answers and clearly contrasts be-verb questions; Day 4 combines `like / don't like / What do...? / Do...?` with transformations, error correction, and a short dialogue.

Generated lessons expose both `phases` and flattened `steps`. Every page has `phase`, `phaseId`, `activityType`, `title`, `content`, `phaseDuration`, curriculum-specific data, suggested games, and `skippable` where appropriate. Add curriculum data to a book file; do not copy the player or hard-code a new page sequence.

Vocabulary Games and Grammar Games are formal lesson stages. Vocabulary uses Random, Reveal, Matching, and Dice with the current Unit words. Grammar uses sentence matching, substitution, picture sentences, dice Q&A, and quick response with the current Unit patterns. Teachers can replay, mark complete, or skip. The star button still opens the independent classroom toolbox with Random Vocabulary, Picture Reveal, Memory Match, Virtual Dice, Timer, and Team Scoreboard.

The Grammar Teaching and Grammar Check stages use the current Unit's sentence cards and patterns. Topic Conversation follows the check with topic introduction, teacher questions, pair practice, and an integrated speaking challenge.

Vocabulary is expanded into one player page per word. Each word supports `image`, `sprite`, `meaning`, and `audio`. Book 1 uses dedicated illustrations and reusable picture atlases for people, feelings, stationery, colors, clothing, and animals.

Every Vocabulary Games phase retains its own Wordwall page. Paste a Wordwall Embed URL or complete iframe code; the player stores each lesson URL locally, displays the activity inside the player, and provides an Open externally fallback.

Every Book 1 Day 1 lesson also generates one picture-based multiple-choice practice question for every vocabulary word. The choices are built automatically from the Unit vocabulary data, so future vocabulary additions produce matching practice questions without editing the player code.

Book 1 activity names are stored separately in `data/book1-activities.js`, keeping curriculum content and the player engine independent.

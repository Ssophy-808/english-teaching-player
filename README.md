# English Teaching Player

A static, projection-friendly lesson player for English teachers. It includes a phase-based teaching flow, Book → Unit → Lesson navigation, one-step-at-a-time playback, Previous / Next controls, keyboard navigation, progress, fullscreen, saved local progress, Wordwall, picture quizzes, in-flow review games, and a no-prep classroom toolbox.

## Sound It Out / Phonics Practice

The home library includes a separate **Sound It Out** card. It opens a reusable phonics-practice module inside this SPA rather than copying textbook pages into the lesson player. Sound It Out 2 includes all 12 units:

```text
/phonics/sio2/unit1/
Sound It Out 2 · Unit 1 · Long a
/phonics/sio2/unit2/ through /phonics/sio2/unit12/
```

Each unit follows a five-level progression:

1. Visual sound-group recognition
2. Spelling-pattern recognition
3. Two-choice sound contrast
4. Three-choice listening
5. Same/different and limited odd-one-out exam practice

Each question is shown alone. Practice Mode gives immediate positive feedback, keeps an incorrect question on screen, reveals a hint after a second error, and provides a wrong-answer-only retry. Quiz Mode stores answers without revealing correctness and reports results by skill and spelling pattern at the end. Level mastery and teacher settings are stored in browser `localStorage`; there is no student account or leaderboard.

Reusable low-pressure activities include Sound Group Sort, Pattern Sort, Flip Cards, Read First, and Mystery Word. Teacher Settings control Practice/Quiz mode, question count, included skills, shuffling, and progress visibility. The unit picker links Long a/e/i/o/u, hard/soft c and g, r-controlled vowels, and consonant teams without duplicating activity HTML.

### Phonics files and components

- `data/phonics-data.js` contains courses, units, spelling patterns, word records, contrast pairs, Wordwall URLs, and audio metadata.
- `js/phonics-practice.js` contains reusable question generators, the five-level activity engine, study cards, audio interface, Practice/Quiz behavior, retry, mastery, and result analysis.
- `css/phonics.css` contains the responsive student and teacher-control layouts.
- `js/routes.js`, `js/app.js`, `index.html`, `404.html`, and `tools/serve_site.py` connect the module to the existing library and permanent routes.

### Add or revise a phonics Unit

Add a unit object to the appropriate course in `data/phonics-data.js`. UI and activity HTML must not be duplicated. A unit supplies stable IDs, sound labels, patterns, words, contrast pairs, and optional Wordwall/audio metadata:

```js
{
  id: "unit2",
  number: 2,
  title: "Long e",
  shortSound: "short-e",
  longSound: "long-e",
  soundLabels: { "short-e": "Short e", "long-e": "Long e" },
  patterns: [
    { id: "e_e", display: "E space E", words: ["eve", "these"] },
    { id: "ee", display: "E-E", words: ["bee", "feet"] },
    { id: "ea", display: "E-A", words: ["pea", "meat"] },
    { id: "ey", display: "E-Y", words: ["honey", "key"] }
  ],
  words: [
    { word: "eve", vowelType: "long-e", pattern: "e_e", audio: "", core: true }
  ],
  contrastPairs: [["pet", "Pete"]],
  wordwall: { url: "", label: "Open Wordwall" },
  audioPolicy: { useBrowserTtsFallback: true, locale: "en-US" }
}
```

`display` is the teacher-facing pronunciation of a pattern. Silent-e patterns should use `A space E`, `E space E`, or `I space E`, not a hyphen label.

### Add recorded audio

Every word record has an independent `audio` field:

```js
{ word: "rain", vowelType: "long-a", pattern: "ai", audio: "assets/audio/sio2/unit1/rain.mp3", core: true }
```

When `audio` is non-empty, **Play Sound** uses that file. When it is empty, the UI explicitly identifies browser text-to-speech as a fallback. No fake audio files are created. Set `useBrowserTtsFallback` to `false` to disable fallback for a Unit.

### Current placeholders

- Unit 1–12 word audio paths are empty and use the separately labeled browser-voice fallback.
- Unit 1–12 Wordwall URLs are empty; paste each supplied activity URL into its `wordwall.url`.

## 素養題練習 / Literacy Practice

The home library includes a separate **素養題練習** card. It opens an independent classroom-projection module at:

```text
/literacy/book1/unit4/
```

The first demo bank reviews Book 1 Units 1–4 and contains 12 reusable question groups. Its reading set expands into three slides, so a full practice run contains 14 one-question screens. The module supports context judgment, reverse-question inference, dialogue continuation, state inference, picture-plus-context questions, multi-clue reasoning, dialogue cloze, and reading sets with subquestions.

Interaction behavior is shared by every future bank: large A/B/C buttons, `Correct!`, retry without revealing the answer, teacher-controlled **Show Answer**, explanation and reasoning clues, **Reset**, **Next Question**, random order, fullscreen, and a separate Teacher Mode with answer, explanation, grammar, skill, difficulty, and question type.

### Literacy files

- `data/literacy-data.js` contains all question banks and metadata. Questions are not embedded in the component.
- `js/literacy-practice.js` contains the reusable `LiteracyQuestion` / `ContextQuestion` engine, reading-set expansion, interaction state, Teacher Mode, and fullscreen behavior.
- `css/literacy.css` contains the responsive projection layout and large classroom controls.
- `js/routes.js`, `js/app.js`, `index.html`, `404.html`, and `tools/serve_site.py` connect the module to the existing SPA and permanent URLs.

### Add the next Unit

Add another object to `window.LITERACY_BANKS` in `data/literacy-data.js`. Use compact route IDs such as `book1` and `unit5`; the route becomes `/literacy/book1/unit5/`.

```js
{
  id: "book1-unit5",
  bookId: "book1",
  unitId: "unit5",
  title: "Book 1 · Unit 5",
  subtitle: "情境式素養題",
  scope: "Only vocabulary and grammar already taught in this Unit",
  questions: [
    {
      id: "b1u5-context-1",
      type: "context",
      context: ["Sentence one.", "Sentence two."],
      question: "What is the best answer?",
      choices: ["Choice A", "Choice B", "Choice C"],
      answer: 1,
      explanation: "A short teacher-facing explanation.",
      reasoning: ["Clue one", "Clue two", "→ Conclusion"],
      grammar: "Target grammar",
      skill: "Infer from context",
      difficulty: 2
    }
  ]
}
```

For a picture question, add `image`, `imageAlt`, and `context`. For a reading set, use `type: "reading"`, add `passage: []`, and put two or three question objects inside `questions: []`. No component or HTML changes are needed.

## Current architecture

This remains one static single-page application. Existing Player, Wordwall, Show Book, Passport, classroom tools, Test Bank, progress and fullscreen code is retained. The September 2026 refactor adds a route layer and a reusable workbook layer around those working modules.

- `data/book1.js`, `data/book2.js`, and `data/book3.js` remain the curriculum sources.
- `data/course-schema.js` normalizes every Unit to the same data contract: `title`, `vocabulary`, `phonics`, `grammarFocus`, `passportSentences`, `days`, `activities`, `showBook`, and `worksheet`.
- `js/teaching-flow.js` converts curriculum data into four Day lessons without duplicating Player HTML.
- `data/worksheet-data.js` assigns four skill-focused workbook pages to each Day.
- `js/worksheet-components.js` contains reusable workbook components and renderers.
- `css/worksheet.css` is the fixed A4 elementary workbook design system.
- `js/routes.js` owns permanent Book / Unit / Day URLs.

Book 1 and Book 2 each contain 9 Units and every Unit exposes Day 1–4. The Day progression is fixed: guided introduction, fluency practice, spiral extension, then independent application.

## Permanent lesson URLs

Every level can be opened directly and survives refresh:

```text
/book1/
/book1/unit1/
/book1/unit1/day1/
/book1/unit1/day2/
/book1/unit1/day3/
/book1/unit1/day4/
```

The Player header includes **Copy Lesson Link**. `404.html` redirects GitHub Pages deep links back to the single Player without creating duplicate HTML files.

## Workbook design system

HTML worksheets are real selectable DOM text, not flattened worksheet images. Illustrations may be PNG, JPG, or sprite crops; titles, instructions, questions, answer lines, and teacher answers remain editable HTML.

Supported page types:

```text
picture_sentence
matching
fix_mistakes
unscramble
write_question
write_answer
big_picture
sentence_transform
```

Every page has one primary skill. Day 1 uses more pictures and grammar cues; Day 2 reduces support; Day 3 adds transformation; Day 4 uses correction, reordering, question writing, and a picture-board challenge. Student mode never renders `expectedAnswer`; Teacher Mode renders a separate key.

To add or override a worksheet, add page data with this shape and attach it to the lesson's `worksheet.pages` array:

```js
{
  type: "picture_sentence",
  title: "Picture Sentence Practice",
  instruction: "Look at the picture and write a complete sentence.",
  skill: "subject + be verb",
  items: [{
    asset: { image: "assets/images/book1/unit1/boy.png" },
    subjectCue: "Use “He”.",
    starter: "He ",
    expectedAnswer: "He is a boy."
  }]
}
```

Do not put the target noun beside a sentence-production picture. `subjectCue` and `grammarCue` should provide only the grammar support needed for that Day. Add new page renderers to `js/worksheet-components.js`, then style them in `css/worksheet.css`; do not create a new standalone worksheet HTML file.

## Add a Book, Unit, or Day

1. Add a curriculum data file under `data/` and push one book object into `window.CURRICULUM_BOOKS`.
2. Load the file before `data/course-schema.js` in `index.html`.
3. Give every Book and Unit a stable ID such as `book-4` and `unit-1`.
4. Supply the official Passport sentence pairs exactly as printed. Do not generate or rewrite them in the renderer.
5. Add illustration paths to vocabulary records. The common Player, route layer, four-Day generator, and worksheet system will handle the rest.

The remaining content dependency is original publisher material: add each Unit's e-book/PDF/PPT URL to `materials.bookUrl` for Show Book, Wordwall embed URL to the appropriate material field, and consistent ESL illustration assets where a vocabulary item currently has only text or an emoji.

The home screen also includes a Test Bank / Exam Builder. Teachers can select a Book, one or more Units, difficulty, spiral review, and counts for picture vocabulary, picture sentences, multiple choice, fill-in, error correction, sentence order, transformation, and dialogue questions. The generated exam supports per-question replacement, deletion, shuffling, scoring, four-line handwriting guides, a teacher answer key, A4 PDF printing, and editable `.docx` export for both student and answer modes. Builder settings are saved locally on the device.

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
│  ├─ worksheet.js    # Printable student sheets and teacher answer key
│  └─ classroom-tools.js # Random cards, reveal, matching, dice, timer, scores
├─ data/
│  ├─ book1.js        # Book 1 curriculum, Units 1–9
│  ├─ book1-passport.js # Book 1 passport review sentences
│  ├─ book2.js        # Book 2 curriculum, Units 1–9
│  ├─ book3.js        # Book 3 curriculum
│  └─ book3-review.js # Shared Player + worksheet question bank
└─ assets/
   ├─ images/
   └─ audio/
```

## Open locally

Use the included SPA-aware preview server so direct Book / Unit / Day paths work locally:

```powershell
python tools\serve_site.py
```

Then open `http://127.0.0.1:8765/`. Run the automated structural checks with:

```powershell
node tests\smoke.test.js
```

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

The Book 3 Unit 1 Day 3/4 pilot is designed for an 85-minute spiral-review class. Each day contains two blocks and two separate writing periods: Day 3 moves from affirmative to negative forms; Day 4 moves from questions to a mixed review of be verbs, `there be`, and action verbs. Player questions and printable questions come from the same bank in `data/book3-review.js`.

Open Book 3 → Unit 1 → Day 3 or Day 4 and choose **📝 講義**. Student mode produces two A4 pages (Part A and Part B); teacher mode produces an answer page. Questions can be removed, shuffled, reset, printed, or saved as PDF from the browser print dialog.

The same 85-minute spiral-review and worksheet system now covers every course with defined Day 3/4 content: Book 1 Units 1–9, Book 2 Unit 1, and Book 3 Units 1–9. Existing lesson activities remain the content source; the flow engine groups them into Part A and Part B, adds two Write Time periods, and builds shared continuous-practice and four-line handwriting questions. Later Book 2 units can enter the same system after their Day 3/4 curriculum is supplied.

Book 3 is complete through Unit 9. Units 2–9 include curriculum-accurate vocabulary, Chinese meanings, topic sentences, Passport review content, and phonics. Each Unit generates four lessons: Day 1/2 for the standard 45-minute content flow and Day 3/4 for the 85-minute spiral-review and printable worksheet flow.

Book 1, Book 2, and Book 3 Unit 1 now use the classroom-tested Live sequence. Day 1 follows `Warm Up → Let’s Talk → Let’s Learn → Vocabulary Review → Let’s Chant/Sing → Let’s Practice → Grammar Activity → Grammar Book`. Day 2 follows `Quick Review → Let’s Speak → Let’s Read → Reading Check / Speaking Activity → Let’s Say (Phonics) → Show Book`. Day 3/4 keep the spiral-review and writing flow; Day 5 uses the existing Unit test and is not duplicated in the Player.

Every Book 1, Book 2, and Book 3 Unit 1 lesson from Day 1 through Day 4 now includes a fixed four-page Daily Handout and a matching teacher key. The Player opens the correct four-page range for the selected day; these fixed handouts remain separate from the adjustable worksheet and Test Bank.

Book 3 Units 2–9 use grammar-aware question generation rather than vocabulary-only substitution. Day 3/4 Player loops, worksheets, and the Test Bank recognize each Unit's target forms, including `like / likes`, `want / wants`, `some / any`, `have / has`, `does + have`, `on + weekday`, and `go + V-ing`, and produce dedicated choice, correction, reordering, and fill-in questions.

Each Book 3 Unit 1 day includes a continuous Practice Loop. It shows one question at a time and supports immediate choice feedback, answer reveal for speaking questions, next question, random question, and restart controls.

Generated lessons expose both `phases` and flattened `steps`. Every page has `phase`, `phaseId`, `activityType`, `title`, `content`, `phaseDuration`, curriculum-specific data, suggested games, and `skippable` where appropriate. Add curriculum data to a book file; do not copy the player or hard-code a new page sequence.

Vocabulary Games and Grammar Games are formal lesson stages. Vocabulary uses Random, Reveal, Matching, and Dice with the current Unit words. Grammar uses sentence matching, substitution, picture sentences, dice Q&A, and quick response with the current Unit patterns. Teachers can replay, mark complete, or skip. The star button still opens the independent classroom toolbox with Random Vocabulary, Picture Reveal, Memory Match, Virtual Dice, Timer, and Team Scoreboard.

The Grammar Teaching and Grammar Check stages use the current Unit's sentence cards and patterns. Topic Conversation follows the check with topic introduction, teacher questions, pair practice, and an integrated speaking challenge.

Vocabulary is expanded into one player page per word. Each word supports `image`, `sprite`, `meaning`, and `audio`. Book 1 uses dedicated illustrations and reusable picture atlases for people, feelings, stationery, colors, clothing, and animals.

Every Vocabulary Games phase retains its own Wordwall page. Paste a Wordwall Embed URL or complete iframe code; the player stores each lesson URL locally, displays the activity inside the player, and provides an Open externally fallback.

Every Book 1 Day 1 lesson also generates one picture-based multiple-choice practice question for every vocabulary word. The choices are built automatically from the Unit vocabulary data, so future vocabulary additions produce matching practice questions without editing the player code.

Book 1 activity names are stored separately in `data/book1-activities.js`, keeping curriculum content and the player engine independent.

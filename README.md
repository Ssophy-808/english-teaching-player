# English Teaching Player — Phase 1

A static, projection-friendly lesson player for English teachers. Phase 1 includes the lesson library, Book → Unit → Lesson navigation, one-step-at-a-time playback, Previous / Next controls, keyboard navigation, progress, fullscreen, and saved local progress.

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
│  └─ activities.js   # Step renderer; later phases can add activity renderers
├─ data/
│  ├─ book1.js        # Book 1 curriculum, Units 1–9
│  └─ book2-unit1.js  # Course content only
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

`js/teaching-flow.js` automatically turns curriculum data into lesson steps. Book 1 uses Day 1 and Day 2 from `B1_教學流程.pdf`; each Unit contains two 120-minute lessons and keeps the guide's suggested times. Other books currently use the default sequence:

`Warm Up → Vocabulary → Sentence Pattern → Practice → Speaking → Game → Phonics → Show Book → Quiz → Homework`

Activity metadata for flashcards, random prompts, matching, embeds, phonics drills, and multiple choice is reserved for later phases. Phase 1 intentionally renders only the common step title, teaching phase, duration, and instruction.

Vocabulary is expanded into one player page per word. Each word supports `image`, `meaning`, and `audio`; when no image is supplied, the first version shows a large built-in pictogram. Book 1 Unit 1 includes six dedicated character illustrations and six picture sentence-pattern pages with paired affirmative and negative sentences.

Every lesson includes its own Wordwall Game step. Book 1 has separate Wordwall slots for every Unit's Day 1 and Day 2; later books receive the same interface automatically. Paste a Wordwall Embed URL or the complete iframe code in the player. Each lesson stores its own URL locally, displays the activity inside the player, and provides an Open externally fallback.

Every Book 1 Day 1 lesson also generates one picture-based multiple-choice practice question for every vocabulary word. The choices are built automatically from the Unit vocabulary data, so future vocabulary additions produce matching practice questions without editing the player code.

## Phase boundary

Included early by request: one-word vocabulary pages, a reusable picture-based Read and Choose activity, and a Dialogue Choice / New Sentence activity with Correct / Try again feedback.

Unit 2 includes a reusable family-character sprite sheet and multiple questions for both activity types. New questions are added as curriculum data; no renderer changes are required.

Not included yet: Show Answer, Random, Wordwall embeds, a full quiz bank, and Teacher / Student Mode. These belong to later phases.

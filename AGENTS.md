# English Worksheet & Test Builder

This repository is being simplified from an English teaching player into a worksheet and test builder for Taiwanese elementary students. Worksheet generation currently lives under `data/`, with rendering in `js/worksheet-components.js`.

## Worksheet quality rules

Read these rules before changing worksheet data or generation logic.

1. Every question must have a clear assessment purpose and one determinable answer. A multiple-choice question has exactly three distinct choices and exactly one correct choice. A distractor must represent a plausible vocabulary or grammar error and must not differ only by punctuation, capitalization, or whitespace.
2. Student-facing content may use only the current unit vocabulary and passport sentences plus material explicitly taught in earlier units of the same book. Common classroom directions, approved function words, names, and contractions belong in separate allowlists. Do not introduce language merely to make a question sound more advanced.
3. Do not use meta-questions about picture order, lesson topics, or whether a character answered a question. Reading questions must ask about information in one coherent passage. Avoid answer sets in which every answer is `Yes`.
4. Do not repeat a prompt, expected answer, grammar structure, or answer form on the same page merely by swapping vocabulary. If a fixed question pattern cannot supply enough distinct items, reduce the item count.
5. Sentence scrambles must use a deterministic real shuffle, keep punctuation as a separate chunk, contain one sentence, respect the book chunk limit, and have one defensible order. Record `acceptedAnswers` when more than one order is accepted.
6. A question chain must use information from the previous answer. Otherwise title it `Answer the Questions` and do not present it as one conversation.
7. Every Day must contain at least one page that directly assesses the unit `grammarFocus`.
8. Day progression is: Day 1 Learn, Day 2 Practise, Day 3 Extend, Day 4 Apply. Final reviews use Day 1–5. Difficulty and independence must increase across days.
9. Question-writing tasks must provide enough context for one unique question. If `these` and `those` are both possible, add a clear scene or do not use the item.
10. Formal worksheets use only reviewed or approved questions. Preserve the existing A4 layout and four-line handwriting guides unless a task explicitly changes them.

## Book profiles

Keep limits in one `BOOK_PROFILES` configuration rather than scattering numbers through generators.

- Book 1: sentence length <= 6 words; scramble <= 5 chunks; answers contain one sentence; no reading passage or abstract inference.
- Book 2: sentence length <= 8 words; scramble <= 6 chunks; answers contain at most two short sentences; reading contains 3–4 sentences.
- Book 3: sentence length <= 10 words; scramble <= 8 chunks; reading contains 4–6 sentences.
- Book 4–6 provisional limits: sentence length 12 / 14 / 15; scramble <= 9 chunks; reading contains 5–12 sentences. Recalibrate when source materials are available.

## Data architecture

- Do not add new `key === "book-x/unit-y"` branches for future units.
- Unit-specific content belongs in data packs such as `UNIT_PACKS["book-x/unit-y"]` and `SIO_PACKS["sio-x/unit-y"]`.
- A unit pack should hold vocabulary, structured grammar or phonics focus, question/answer pairs, extra questions, optional hand-written reading, optional coherent cloze, listening metadata, forbidden language, and review status.
- Generators arrange reviewed data into pages; they do not invent unsupported language.
- Come to Live and Sound It Out may be combined in one exam, but each question is validated against its own source allowlist.
- Preserve existing field names and worksheet layout until a task explicitly authorizes migration.

## Listening

- Listening scripts follow the same vocabulary and grammar allowlists as printed questions.
- Worksheet QR codes must point to stable public HTTPS playback pages, never localhost.
- Teacher keys include transcripts and answers. Student playback pages do not reveal transcripts or answers.
- Sound It Out questions must state whether they assess vowel sound, spelling pattern, or whole word and must not admit two phonically valid answers.

## Required checks

Before completing a worksheet-generator change:

1. Run the worksheet audit in `tests/`.
2. Run the existing smoke test.
3. Do not introduce new violations.
4. Report violation counts before and after each generator repair.

The first audit pass is report-only. Do not change generation logic until the user reviews the baseline report.

(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }

  function assetMarkup(asset, alt = "Picture prompt") {
    if (!asset) return "";
    if (asset.image) return `<img class="wb-picture" src="${escapeHtml(asset.image)}" alt="${escapeHtml(alt)}">`;
    if (asset.sprite) {
      const { src = "", cols = 1, rows = 1, col = 0, row = 0 } = asset.sprite;
      const x = cols > 1 ? Number(col) * 100 / (Number(cols) - 1) : 0;
      const y = rows > 1 ? Number(row) * 100 / (Number(rows) - 1) : 0;
      return `<span class="wb-picture wb-sprite" role="img" aria-label="${escapeHtml(alt)}" style="background-image:url('${escapeHtml(src)}');background-size:${Number(cols) * 100}% ${Number(rows) * 100}%;background-position:${x}% ${y}%"></span>`;
    }
    return asset.visual ? `<span class="wb-visual" role="img" aria-label="${escapeHtml(alt)}">${escapeHtml(asset.visual)}</span>` : "";
  }

  const NUMBER_WORDS = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20
  };

  function countCue(item) {
    const text = [item?.expectedAnswer, item?.answer, item?.prompt, item?.question, item?.left].filter(Boolean).join(" ");
    const match = text.match(/There are\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b/i)
      || text.match(/Are there\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b/i);
    if (!match) return "";
    return String(NUMBER_WORDS[match[1].toLowerCase()] || match[1]);
  }

  function itemPicture(item, alt = "Picture prompt") {
    const picture = assetMarkup(item?.asset, alt);
    if (!picture) return "";
    const count = countCue(item);
    if (!count || (!item.asset?.image && !item.asset?.sprite && String(item.asset?.visual || "") === count)) return picture;
    return `<span class="wb-picture-cue">${picture}<b class="wb-picture-count">${escapeHtml(count)}</b></span>`;
  }

  function answerLines(count = 1) {
    const guide = '<i class="wb-handwriting-row" aria-hidden="true"><b></b><b></b><b></b><b></b></i>';
    return `<span class="wb-answer-lines" aria-label="Four-line English handwriting guide">${Array.from({ length: count }, () => guide).join("")}</span>`;
  }

  function pictureSentence(item, index) {
    return `<li class="wb-picture-prompt"><span class="wb-number">${index + 1}</span>${itemPicture(item)}<div><small>${escapeHtml(item.subjectCue || "Look at the picture.")}</small><p>${escapeHtml(item.starter || "")} ${answerLines(item.lines || 1)}</p></div></li>`;
  }

  function standardItem(item, index) {
    return `<li class="wb-question-card"><span class="wb-number">${index + 1}</span>${itemPicture(item)}<div><p>${escapeHtml(item.prompt)}</p>${answerLines(item.lines || 1)}</div></li>`;
  }

  function matching(page) {
    return `<div class="wb-matching-section"><div class="wb-matching"><ol>${page.items.map((item, index) => `<li><span>${index + 1}</span>${itemPicture(item)}<b>${escapeHtml(item.left)}</b></li>`).join("")}</ol><ol>${page.items.map((item, index) => `<li><span>${String.fromCharCode(65 + index)}</span><b>${escapeHtml(item.right)}</b></li>`).join("")}</ol></div><div class="wb-matching-write"><strong>✎ Choose one pair. Write the complete answer.</strong>${answerLines(1)}</div></div>`;
  }

  function multipleChoice(page) {
    const cards = page.items.map((item, index) => `<li class="wb-choice-card"><span class="wb-number">${index + 1}</span>${itemPicture(item, item.prompt)}<div><p>${escapeHtml(item.prompt)}</p><ol>${item.choices.map((choice, choiceIndex) => `<li><span>${String.fromCharCode(65 + choiceIndex)}</span>${escapeHtml(choice)}</li>`).join("")}</ol></div></li>`).join("");
    return `<div class="wb-choice-section"><ol class="wb-choice-list">${cards}</ol><div class="wb-matching-write"><strong>✎ Choose one answer. Write the complete sentence.</strong>${answerLines(1)}</div></div>`;
  }

  function bigPicture(page) {
    return `<div class="wb-big-picture"><div class="wb-scene-grid">${(page.sceneAssets || []).map((asset) => assetMarkup(asset)).join("")}</div><ol>${page.items.map(standardItem).join("")}</ol></div>`;
  }

  function storyCloze(page) {
    const hero = (page.heroAssets || []).map((asset) => assetMarkup(asset, "Story picture")).join("");
    const intro = (page.introLines || []).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
    const prompts = page.items.map((item) => `<section class="wb-passage-prompt"><div><p>${escapeHtml(item.question)}</p>${answerLines(1)}</div>${itemPicture(item, item.expectedAnswer)}</section>`).join("");
    const ending = (page.endingLines || []).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
    return `<section class="wb-story-cloze wb-passage-page"><div class="wb-passage-hero">${hero}</div><div class="wb-passage-copy">${intro}</div>${prompts}<div class="wb-passage-copy wb-passage-ending">${ending}</div></section>`;
  }

  function chainQuestions(page) {
    const lines = page.items.map((item, index) => `<li><span class="wb-chain-step">${index + 1}</span><div><small>${escapeHtml(item.lead)}</small><p>${escapeHtml(item.prompt)}</p>${answerLines(1)}</div>${itemPicture(item, item.expectedAnswer)}</li>`).join("");
    return `<section class="wb-chain"><p class="wb-story-intro">${escapeHtml(page.intro)}</p><ol>${lines}</ol><div class="wb-chain-new"><strong>My next question:</strong>${answerLines(1)}</div></section>`;
  }

  function lockedTemplateItem(item, index, showPictures) {
    const picture = showPictures ? itemPicture(item, item.alt || item.expectedAnswer || "Picture prompt") : "";
    return `<li class="wb-template-item${showPictures ? " has-picture" : ""}"><span class="wb-template-number">${index + 1}.</span><p>${escapeHtml(item.prompt)}</p>${picture}${answerLines(1)}</li>`;
  }

  function lockedTemplateBody(page) {
    const showPictures = page.showPictures ?? page.type === "template_picture_answer";
    return `<ol class="wb-template-list">${page.items.map((item, index) => lockedTemplateItem(item, index, showPictures)).join("")}</ol>`;
  }

  function pageBody(page) {
    if (page.type === "story_cloze") return storyCloze(page);
    if (page.type === "chain_questions") return chainQuestions(page);
    if (page.layout === "locked_template") return lockedTemplateBody(page);
    if (page.type === "picture_sentence" || page.type === "write_answer") return `<ol class="wb-picture-list">${page.items.map(pictureSentence).join("")}</ol>`;
    if (page.type === "matching") return matching(page);
    if (page.type === "multiple_choice") return multipleChoice(page);
    if (page.type === "big_picture") return bigPicture(page);
    return `<ol class="wb-question-list">${page.items.map(standardItem).join("")}</ol>`;
  }

  function worksheetHeader(lesson, page, index, total) {
    return `<header class="wb-header"><div class="wb-name"><span>Name: ____________________</span><span>Date: ______________</span></div><div class="wb-title-row"><span class="wb-day">DAY ${escapeHtml(lesson.worksheet.day)}</span><div><p>${escapeHtml(lesson.bookTitle)} · ${escapeHtml(lesson.unitTitle)}</p><h1>${escapeHtml(page.title)}</h1></div><span class="wb-page-count">${index + 1} / ${total}</span></div><p class="wb-instruction">★ ${escapeHtml(page.instruction)}</p></header>`;
  }

  function lockedTemplateHeader(lesson, page, index, total) {
    const unitLabel = lesson.isReview && lesson.reviewRange ? `Review ${lesson.reviewRange}` : lesson.unitTitle;
    return `<header class="wb-template-header"><h1>${escapeHtml(page.title)}</h1><div class="wb-template-name"><span>Name:</span><i></i></div><p>${escapeHtml(page.instruction)}</p><small>${escapeHtml(lesson.bookTitle)} · ${escapeHtml(unitLabel)} · Day ${escapeHtml(lesson.worksheet.day)} · ${index + 1}/${total}</small></header>`;
  }

  function studentPage(lesson, page, index, total) {
    const locked = page.layout === "locked_template";
    return `<section class="workbook-page${locked ? " wb-locked-template" : ""}${lesson.isReview ? " wb-review-template" : ""}" data-worksheet-type="${escapeHtml(page.type)}">${locked ? lockedTemplateHeader(lesson, page, index, total) : worksheetHeader(lesson, page, index, total)}<main>${pageBody(page)}</main><footer><span>English Teaching Player Workbook</span><span>${escapeHtml(page.skill || "Think · Write · Check")}</span></footer></section>`;
  }

  function answerPage(lesson, pages) {
    return `<section class="workbook-page workbook-key"><header><p>TEACHER MODE</p><h1>${escapeHtml(lesson.bookTitle)} · ${escapeHtml(lesson.unitTitle)} · Day ${escapeHtml(lesson.worksheet.day)}</h1></header><div class="wb-key-grid">${pages.map((page, pageIndex) => `<section><h2>${pageIndex + 1}. ${escapeHtml(page.title)}</h2><ol>${page.items.map((item) => `<li>${escapeHtml(item.expectedAnswer || item.answer || "Answers may vary.")}</li>`).join("")}</ol></section>`).join("")}</div></section>`;
  }

  window.WorksheetComponents = { escapeHtml, studentPage, answerPage };
})();

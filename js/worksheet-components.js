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

  function answerLines(count = 1) {
    const guide = '<i class="wb-handwriting-row" aria-hidden="true"><b></b><b></b><b></b><b></b></i>';
    return `<span class="wb-answer-lines" aria-label="Four-line English handwriting guide">${Array.from({ length: count }, () => guide).join("")}</span>`;
  }

  function pictureSentence(item, index) {
    return `<li class="wb-picture-prompt"><span class="wb-number">${index + 1}</span>${assetMarkup(item.asset)}<div><small>${escapeHtml(item.subjectCue || "Look at the picture.")}</small><p>${escapeHtml(item.starter || "")} ${answerLines(item.lines || 1)}</p></div></li>`;
  }

  function standardItem(item, index) {
    return `<li class="wb-question-card"><span class="wb-number">${index + 1}</span>${assetMarkup(item.asset)}<div><p>${escapeHtml(item.prompt)}</p>${answerLines(item.lines || 1)}</div></li>`;
  }

  function matching(page) {
    return `<div class="wb-matching"><ol>${page.items.map((item, index) => `<li><span>${index + 1}</span>${assetMarkup(item.asset)}<b>${escapeHtml(item.left)}</b></li>`).join("")}</ol><ol>${page.items.map((item, index) => `<li><span>${String.fromCharCode(65 + index)}</span><b>${escapeHtml(item.right)}</b></li>`).join("")}</ol></div>`;
  }

  function bigPicture(page) {
    return `<div class="wb-big-picture"><div class="wb-scene-grid">${(page.sceneAssets || []).map((asset) => assetMarkup(asset)).join("")}</div><ol>${page.items.map(standardItem).join("")}</ol></div>`;
  }

  function pageBody(page) {
    if (page.type === "picture_sentence" || page.type === "write_answer") return `<ol class="wb-picture-list">${page.items.map(pictureSentence).join("")}</ol>`;
    if (page.type === "matching") return matching(page);
    if (page.type === "big_picture") return bigPicture(page);
    return `<ol class="wb-question-list">${page.items.map(standardItem).join("")}</ol>`;
  }

  function worksheetHeader(lesson, page, index, total) {
    return `<header class="wb-header"><div class="wb-name"><span>Name: ____________________</span><span>Date: ______________</span></div><div class="wb-title-row"><span class="wb-day">DAY ${escapeHtml(lesson.worksheet.day)}</span><div><p>${escapeHtml(lesson.bookTitle)} · ${escapeHtml(lesson.unitTitle)}</p><h1>${escapeHtml(page.title)}</h1></div><span class="wb-page-count">${index + 1} / ${total}</span></div><p class="wb-instruction">★ ${escapeHtml(page.instruction)}</p></header>`;
  }

  function studentPage(lesson, page, index, total) {
    return `<section class="workbook-page" data-worksheet-type="${escapeHtml(page.type)}">${worksheetHeader(lesson, page, index, total)}<main>${pageBody(page)}</main><footer><span>English Teaching Player Workbook</span><span>${escapeHtml(page.skill || "Think · Write · Check")}</span></footer></section>`;
  }

  function answerPage(lesson, pages) {
    return `<section class="workbook-page workbook-key"><header><p>TEACHER MODE</p><h1>${escapeHtml(lesson.bookTitle)} · ${escapeHtml(lesson.unitTitle)} · Day ${escapeHtml(lesson.worksheet.day)}</h1></header><div class="wb-key-grid">${pages.map((page, pageIndex) => `<section><h2>${pageIndex + 1}. ${escapeHtml(page.title)}</h2><ol>${page.items.map((item) => `<li>${escapeHtml(item.expectedAnswer || item.answer || "Answers may vary.")}</li>`).join("")}</ol></section>`).join("")}</div></section>`;
  }

  window.WorksheetComponents = { escapeHtml, studentPage, answerPage };
})();

(function () {
  "use strict";

  const A4 = { width: 11906, height: 16838 };
  const MARGIN = 850;
  const CONTENT_WIDTH = A4.width - MARGIN * 2;
  const NAVY = "17325C";
  const BLUE = "69A8DD";
  const GRAY = "64738A";
  const LINE = "9FC4E7";
  const NUMBER_WORDS = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20
  };

  function run(value, options = {}) {
    return new docx.TextRun({
      text: String(value ?? ""),
      font: "Segoe UI",
      size: options.size || 22,
      bold: Boolean(options.bold),
      color: options.color || "111111",
      break: options.break
    });
  }

  function paragraph(children = [], options = {}) {
    return new docx.Paragraph({
      children: Array.isArray(children) ? children : [run(children)],
      alignment: options.alignment,
      keepNext: options.keepNext,
      spacing: { before: options.before || 0, after: options.after ?? 90, line: options.line || 290 },
      border: options.border
    });
  }

  function handwriting(groups = 1) {
    const rows = [];
    for (let group = 0; group < groups; group += 1) {
      for (let line = 0; line < 4; line += 1) {
        rows.push(paragraph([run(" ", { size: 12 })], {
          after: 0,
          line: 145,
          border: {
            bottom: {
              style: line === 1 || line === 2 ? docx.BorderStyle.DASHED : docx.BorderStyle.SINGLE,
              size: 5,
              color: LINE
            }
          }
        }));
      }
    }
    return rows;
  }

  async function loadImage(asset) {
    if (!asset || (!asset.image && !asset.sprite)) return null;
    try {
      if (asset.image) {
        const response = await fetch(asset.image);
        const data = await response.arrayBuffer();
        const extension = asset.image.split(".").pop().toLowerCase();
        return { data, type: extension === "jpg" || extension === "jpeg" ? "jpg" : "png" };
      }
      const sprite = asset.sprite;
      const image = new Image();
      image.src = sprite.src;
      await image.decode();
      const cols = Number(sprite.cols) || 1;
      const rows = Number(sprite.rows) || 1;
      const width = image.naturalWidth / cols;
      const height = image.naturalHeight / rows;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      canvas.getContext("2d").drawImage(image, Number(sprite.col || 0) * width, Number(sprite.row || 0) * height, width, height, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      return blob ? { data: await blob.arrayBuffer(), type: "png" } : null;
    } catch (_error) {
      return null;
    }
  }

  function countCue(item) {
    const text = [item?.expectedAnswer, item?.answer, item?.prompt, item?.question, item?.left].filter(Boolean).join(" ");
    const match = text.match(/There are\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b/i)
      || text.match(/Are there\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b/i);
    if (!match) return "";
    return String(NUMBER_WORDS[match[1].toLowerCase()] || match[1]);
  }

  async function assetParagraph(asset, width = 105, height = 84, count = "") {
    const image = await loadImage(asset);
    if (image) {
      const children = [];
      if (count) children.push(run(`${count}  `, { size: 30, bold: true, color: NAVY }));
      children.push(new docx.ImageRun({
        data: image.data,
        type: image.type,
        transformation: { width, height },
        altText: { title: asset.word || "Worksheet picture", description: asset.meaning || asset.word || "Worksheet picture", name: asset.word || "Worksheet picture" }
      }));
      return paragraph(children, { alignment: docx.AlignmentType.CENTER, after: 45 });
    }
    const label = asset?.visual || asset?.meaning || "";
    return paragraph([run(label, { size: /[\u3400-\u9fff]/.test(label) ? 26 : 40, bold: true, color: NAVY })], { alignment: docx.AlignmentType.CENTER, after: 45 });
  }

  function noBorders() {
    const none = { style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF" };
    return { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
  }

  async function promptTable(item, index, promptText) {
    const left = [
      paragraph([run(`${index + 1}. ${promptText}`, { size: 22, bold: true })], { keepNext: true, after: 45 }),
      ...handwriting(1)
    ];
    const picture = await assetParagraph(item.asset || {}, 92, 74, countCue(item));
    return new docx.Table({
      width: { size: CONTENT_WIDTH, type: docx.WidthType.DXA },
      layout: docx.TableLayoutType.FIXED,
      borders: noBorders(),
      rows: [new docx.TableRow({ cantSplit: true, children: [
        new docx.TableCell({ width: { size: CONTENT_WIDTH - 1850, type: docx.WidthType.DXA }, margins: { top: 60, bottom: 80, left: 80, right: 120 }, children: left }),
        new docx.TableCell({ width: { size: 1850, type: docx.WidthType.DXA }, margins: { top: 30, bottom: 60, left: 40, right: 40 }, verticalAlign: docx.VerticalAlign.CENTER, children: [picture] })
      ] })]
    });
  }

  function pageHeader(lesson, page, index, total) {
    const unitLabel = lesson.isReview && lesson.reviewRange ? `Review ${lesson.reviewRange}` : lesson.unitTitle;
    return [
      paragraph([run(`${lesson.bookTitle} · ${unitLabel} · Day ${lesson.worksheet.day} · ${index + 1}/${total}`, { size: 15, color: GRAY, bold: true })], { after: 25 }),
      paragraph([run(page.title, { size: 31, color: NAVY, bold: true })], { after: 35 }),
      paragraph([run("Name: ", { bold: true }), run("__________________________")], { alignment: docx.AlignmentType.RIGHT, after: 50 }),
      paragraph([run(page.instruction, { size: 19, color: NAVY, bold: true })], { after: 100 })
    ];
  }

  async function storyChildren(page) {
    const children = [];
    if (page.heroAssets?.length) {
      const cells = [];
      for (const asset of page.heroAssets) {
        cells.push(new docx.TableCell({ width: { size: Math.floor(CONTENT_WIDTH / page.heroAssets.length), type: docx.WidthType.DXA }, children: [await assetParagraph(asset, 125, 95)] }));
      }
      children.push(new docx.Table({ width: { size: CONTENT_WIDTH, type: docx.WidthType.DXA }, borders: noBorders(), rows: [new docx.TableRow({ children: cells })] }));
    }
    for (const line of page.introLines || []) children.push(paragraph([run(line, { size: 22 })], { after: 35 }));
    children.push(paragraph([run(" ", { size: 5 })], { after: 25 }));
    for (let index = 0; index < page.items.length; index += 1) children.push(await promptTable(page.items[index], index, page.items[index].question || page.items[index].prompt || ""));
    for (const line of page.endingLines || []) children.push(paragraph([run(line, { size: 21 })], { after: 35 }));
    return children;
  }

  async function standardChildren(page) {
    const children = [];
    if (page.intro) children.push(paragraph([run(page.intro, { size: 21 })], { after: 70 }));
    for (let index = 0; index < page.items.length; index += 1) {
      const item = page.items[index];
      let prompt = item.prompt || item.question || item.left || "";
      if (page.type === "matching") prompt = `${item.left}     __________     ${String.fromCharCode(65 + index)}. ${item.right}`;
      if (item.choices?.length) prompt += `\n${item.choices.map((choice, choiceIndex) => `(${String.fromCharCode(65 + choiceIndex)}) ${choice}`).join("     ")}`;
      children.push(await promptTable(item, index, prompt));
    }
    return children;
  }

  async function createBlob(lesson, pages) {
    if (!window.docx && typeof docx === "undefined") throw new Error("Word export library is unavailable.");
    const children = [];
    for (let index = 0; index < pages.length; index += 1) {
      if (index) children.push(paragraph([new docx.PageBreak()], { after: 0 }));
      const page = pages[index];
      children.push(...pageHeader(lesson, page, index, pages.length));
      children.push(...(page.type === "story_cloze" ? await storyChildren(page) : await standardChildren(page)));
    }
    const documentFile = new docx.Document({
      creator: "English Teaching Player",
      title: `${lesson.bookTitle} ${lesson.unitTitle} Day ${lesson.worksheet.day}`,
      description: "Editable worksheet with replaceable pictures and editable questions",
      styles: { default: { document: { run: { font: "Segoe UI", size: 22, color: "111111" }, paragraph: { spacing: { after: 90, line: 290 } } } } },
      sections: [{ properties: { page: { size: A4, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } }, children }]
    });
    return docx.Packer.toBlob(documentFile);
  }

  window.WorksheetWordExporter = { createBlob };
})();

(function () {
  "use strict";

  const A4 = { width: 11906, height: 16838 };
  const MARGIN = 792;
  const CONTENT_WIDTH = A4.width - MARGIN * 2;
  const BLUE = "17325C";
  const ORANGE = "E97939";
  const MUTED = "64738A";
  const LINE = "A9C5E1";

  function text(value, options = {}) {
    return new docx.TextRun({ text: String(value ?? ""), font: "Arial", size: options.size || 21, bold: options.bold, color: options.color || "17233A", break: options.break });
  }

  function multilineText(value, options = {}) {
    return String(value ?? "").split("\n").map((line, index) => text(line, { ...options, break: index ? 1 : undefined }));
  }

  function paragraph(children, options = {}) {
    return new docx.Paragraph({
      children: Array.isArray(children) ? children : [text(children, options)],
      alignment: options.alignment,
      spacing: { before: options.before || 0, after: options.after ?? 80, line: options.line || 276 },
      keepNext: options.keepNext,
      border: options.border
    });
  }

  function handwriting(count = 1) {
    const rows = [];
    for (let group = 0; group < count; group += 1) {
      for (let index = 0; index < 3; index += 1) {
        rows.push(paragraph([text(" ", { size: 15 })], {
          after: 0,
          line: 170,
          border: {
            ...(index === 0 ? { top: { style: docx.BorderStyle.SINGLE, size: 5, color: LINE } } : {}),
            bottom: { style: index === 0 || index === 1 ? docx.BorderStyle.DASHED : docx.BorderStyle.SINGLE, size: 5, color: LINE }
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
        const ext = asset.image.split(".").pop().toLowerCase();
        return { data, type: ext === "jpg" || ext === "jpeg" ? "jpg" : "png" };
      }
      if (typeof document === "undefined") return null;
      const sprite = asset.sprite;
      const image = new Image();
      image.src = sprite.src || "assets/images/family-sprite.png";
      await image.decode();
      const cols = Number(sprite.cols) || 5;
      const rows = Number(sprite.rows) || 2;
      const cellWidth = image.naturalWidth / cols;
      const cellHeight = image.naturalHeight / rows;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(cellWidth);
      canvas.height = Math.round(cellHeight);
      canvas.getContext("2d").drawImage(image, sprite.col * cellWidth, sprite.row * cellHeight, cellWidth, cellHeight, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      return blob ? { data: await blob.arrayBuffer(), type: "png" } : null;
    } catch (_error) {
      return null;
    }
  }

  async function loadRemotePng(url) {
    if (!url) return null;
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      return { data: await response.arrayBuffer(), type: "png" };
    } catch (_error) {
      return null;
    }
  }

  function qrImageUrl(value) {
    return `https://quickchart.io/qr?size=240&margin=1&text=${encodeURIComponent(value)}`;
  }

  async function questionContent(question) {
    const children = [];
    if (question.displayPrompt) children.push(paragraph(multilineText(question.displayPrompt, { size: 21, bold: true }), { after: 40, keepNext: true }));
    if (question.choices?.length) children.push(paragraph([text(question.choices.map((choice, index) => `(${String.fromCharCode(65 + index)}) ${choice}`).join("     "), { size: 19 })], { after: 45 }));
    children.push(...handwriting(question.lines || 0));
    if (question.givenAnswer) children.push(paragraph([text("Answer: ", { size: 19, bold: true }), text(question.givenAnswer, { size: 19 })], { before: 25, after: 30 }));
    return children;
  }

  async function questionTable(question) {
    const noBorder = { style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const image = await loadImage(question.asset);
    const cells = [
      new docx.TableCell({ width: { size: 620, type: docx.WidthType.DXA }, borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, margins: { top: 80, bottom: 80, left: 0, right: 70 }, verticalAlign: docx.VerticalAlign.TOP, children: [paragraph([text(`${question.itemNumber}.`, { size: 23, color: "111111", bold: true })], { alignment: docx.AlignmentType.LEFT, after: 0 })] }),
      new docx.TableCell({ width: { size: image || question.asset?.visual ? CONTENT_WIDTH - 2420 : CONTENT_WIDTH - 620, type: docx.WidthType.DXA }, borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, margins: { top: 70, bottom: 100, left: 70, right: 100 }, children: await questionContent(question) })
    ];
    if (image || question.asset?.visual) {
      const visual = image
        ? new docx.ImageRun({ data: image.data, type: image.type, transformation: { width: 105, height: 86 }, altText: { title: "Question picture", description: "Question picture", name: "Question picture" } })
        : text(question.asset.visual, { size: 52 });
      cells.push(new docx.TableCell({ width: { size: 1800, type: docx.WidthType.DXA }, borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, margins: { top: 45, bottom: 60, left: 80, right: 0 }, verticalAlign: docx.VerticalAlign.CENTER, children: [paragraph([visual], { alignment: docx.AlignmentType.CENTER, after: 0 })] }));
    }
    return new docx.Table({
      width: { size: CONTENT_WIDTH, type: docx.WidthType.DXA },
      layout: docx.TableLayoutType.FIXED,
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
      rows: [new docx.TableRow({ cantSplit: true, children: cells })]
    });
  }

  function header(exam, page, pageTotal) {
    return [
      new docx.Table({
        width: { size: CONTENT_WIDTH, type: docx.WidthType.DXA }, layout: docx.TableLayoutType.FIXED,
        borders: { top: { style: docx.BorderStyle.NONE }, bottom: { style: docx.BorderStyle.NONE }, left: { style: docx.BorderStyle.NONE }, right: { style: docx.BorderStyle.NONE }, insideHorizontal: { style: docx.BorderStyle.NONE }, insideVertical: { style: docx.BorderStyle.NONE } },
        rows: [new docx.TableRow({ children: [
          new docx.TableCell({ width: { size: 3100, type: docx.WidthType.DXA }, children: [paragraph([text(`${exam.bookTitle} · ${exam.unitNames}`, { size: 15, color: "111111", bold: true }), text(`Page ${page} / ${pageTotal}`, { size: 14, color: "111111", break: 1 })], { after: 0 })] }),
          new docx.TableCell({ width: { size: 3600, type: docx.WidthType.DXA }, children: [paragraph([text(exam.title, { size: 32, color: "111111", bold: true })], { alignment: docx.AlignmentType.CENTER, after: 0 })] }),
          new docx.TableCell({ width: { size: CONTENT_WIDTH - 6700, type: docx.WidthType.DXA }, children: [paragraph("Name: __________________", { alignment: docx.AlignmentType.RIGHT, after: 0 })] })
        ] })]
      }),
      paragraph([text("Class: ________________    Score: ________", { size: 16 })], { alignment: docx.AlignmentType.RIGHT, after: 80 })
    ];
  }

  function paginateSections(sections, capacity = 4) {
    const pages = [];
    let page = { sections: [], count: 0 };
    sections.forEach((section) => {
      let offset = 0;
      while (offset < section.items.length) {
        if (page.count >= capacity) { pages.push(page); page = { sections: [], count: 0 }; }
        const take = Math.min(capacity - page.count, section.items.length - offset);
        page.sections.push({ ...section, continued: offset > 0, items: section.items.slice(offset, offset + take) });
        page.count += take;
        offset += take;
      }
    });
    if (page.sections.length) pages.push(page);
    return pages;
  }

  async function sectionHeading(section) {
    const title = `${section.number}、${section.title}${section.continued ? " (continued)" : ""}`;
    if (!section.playbackUrl || section.continued) return [
      paragraph([text(title, { size: 25, color: "111111", bold: true })], { before: 40, after: 25, keepNext: true }),
      ...(section.continued ? [] : [paragraph([text(section.instruction, { size: 19, color: "111111" })], { after: 55, keepNext: true })])
    ];
    const qr = await loadRemotePng(qrImageUrl(section.playbackUrl));
    const noBorder = { style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const qrChildren = qr
      ? [paragraph([new docx.ImageRun({ data: qr.data, type: qr.type, transformation: { width: 82, height: 82 }, altText: { title: "Listening QR code", description: "Scan to play the listening tracks", name: "Listening QR code" } })], { alignment: docx.AlignmentType.CENTER, after: 0 }), paragraph([text("Scan to listen", { size: 14, color: "111111", bold: true })], { alignment: docx.AlignmentType.CENTER, after: 0 })]
      : [paragraph([text("Open listening page:", { size: 14, bold: true })], { after: 10 }), paragraph([text(section.playbackUrl, { size: 12 })], { after: 0 })];
    return [new docx.Table({
      width: { size: CONTENT_WIDTH, type: docx.WidthType.DXA }, layout: docx.TableLayoutType.FIXED,
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
      rows: [new docx.TableRow({ cantSplit: true, children: [
        new docx.TableCell({ width: { size: CONTENT_WIDTH - 1650, type: docx.WidthType.DXA }, borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [paragraph([text(title, { size: 25, color: "111111", bold: true })], { before: 40, after: 25, keepNext: true }), paragraph([text(section.instruction, { size: 19, color: "111111" })], { after: 55, keepNext: true })] }),
        new docx.TableCell({ width: { size: 1650, type: docx.WidthType.DXA }, borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: qrChildren })
      ] })]
    })];
  }

  async function studentChildren(exam) {
    const pages = paginateSections(exam.sections || [], 4);
    const children = [];
    for (let page = 0; page < pages.length; page += 1) {
      if (page) children.push(paragraph([new docx.PageBreak()], { after: 0 }));
      children.push(...header(exam, page + 1, pages.length));
      for (const section of pages[page].sections) {
        children.push(...await sectionHeading(section));
        for (const question of section.items) {
          children.push(await questionTable(question));
          children.push(paragraph([text(" ", { size: 5 })], { after: 20 }));
        }
      }
    }
    return children;
  }

  function answerChildren(exam) {
    const children = [
      paragraph([text("TEACHER ANSWER KEY", { size: 15, color: ORANGE, bold: true })], { after: 25 }),
      paragraph([text(exam.title, { size: 34, color: BLUE, bold: true })], { after: 90 })
    ];
    (exam.sections || []).forEach((section) => {
      children.push(paragraph([text(`${section.number}、${section.title}`, { size: 24, color: "111111", bold: true })], { before: 35, after: 45 }));
      section.items.forEach((question) => {
        children.push(paragraph([
          text(`${question.itemNumber}. `, { size: 21, color: "111111", bold: true }),
          text(question.answer, { size: 21, bold: true })
        ], { after: question.transcript?.length ? 20 : 65 }));
        if (question.transcript?.length) children.push(paragraph([
          text("Transcript: ", { size: 17, color: "111111", bold: true }),
          text(question.transcript.join(" "), { size: 17, color: "111111" })
        ], { after: 65 }));
      });
    });
    return children;
  }

  async function createBlob(exam) {
    if (!window.docx && typeof docx === "undefined") throw new Error("Word export library is unavailable.");
    const children = exam.mode === "answer" ? answerChildren(exam) : await studentChildren(exam);
    const documentFile = new docx.Document({
      creator: "English Worksheet Builder",
      title: exam.title,
      description: "Editable English worksheet generated by English Worksheet Builder",
      styles: { default: { document: { run: { font: "Arial", size: 21, color: "17233A" }, paragraph: { spacing: { after: 80, line: 276 } } } } },
      sections: [{
        properties: { page: { size: A4, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN, header: 360, footer: 360 } } },
        children
      }]
    });
    return docx.Packer.toBlob(documentFile);
  }

  window.WordExamExporter = { createBlob };
})();

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

  async function questionContent(question) {
    const children = [
      paragraph([text(`${question.label} · ${question.unitLabel} · ${question.points} pts`, { size: 15, color: MUTED, bold: true })], { after: 35, keepNext: true })
    ];
    const image = await loadImage(question.asset);
    if (image) {
      children.push(paragraph([new docx.ImageRun({ data: image.data, type: image.type, transformation: { width: 76, height: 58 }, altText: { title: "Question picture", description: "Question picture", name: "Question picture" } })], { alignment: docx.AlignmentType.CENTER, after: 35, keepNext: true }));
    } else if (question.asset?.visual) {
      children.push(paragraph([text(question.asset.visual, { size: 42 })], { alignment: docx.AlignmentType.CENTER, after: 35, keepNext: true }));
    }
    children.push(paragraph(multilineText(question.prompt, { size: 21, bold: true }), { after: 40, keepNext: true }));
    if (question.choices?.length) children.push(paragraph([text(question.choices.map((choice, index) => `(${String.fromCharCode(65 + index)}) ${choice}`).join("     "), { size: 19 })], { after: 45 }));
    children.push(...handwriting(question.lines || 0));
    return children;
  }

  async function questionTable(question, index) {
    const border = { style: docx.BorderStyle.SINGLE, size: 4, color: "D8E4F0" };
    return new docx.Table({
      width: { size: CONTENT_WIDTH, type: docx.WidthType.DXA },
      layout: docx.TableLayoutType.FIXED,
      borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
      rows: [new docx.TableRow({ cantSplit: true, children: [
        new docx.TableCell({ width: { size: 620, type: docx.WidthType.DXA }, shading: { fill: "EAF4FF" }, margins: { top: 100, bottom: 100, left: 80, right: 80 }, verticalAlign: docx.VerticalAlign.CENTER, children: [paragraph([text(`${index + 1}.`, { size: 23, color: BLUE, bold: true })], { alignment: docx.AlignmentType.CENTER, after: 0 })] }),
        new docx.TableCell({ width: { size: CONTENT_WIDTH - 620, type: docx.WidthType.DXA }, margins: { top: 90, bottom: 100, left: 130, right: 130 }, children: await questionContent(question) })
      ] })]
    });
  }

  function header(exam, page, pageTotal) {
    return [
      paragraph([text(`${exam.bookTitle} · ${exam.unitNames}`, { size: 15, color: ORANGE, bold: true })], { after: 25 }),
      paragraph([text(exam.title, { size: 34, color: BLUE, bold: true })], { after: 70 }),
      new docx.Table({
        width: { size: CONTENT_WIDTH, type: docx.WidthType.DXA }, layout: docx.TableLayoutType.FIXED,
        borders: { top: { style: docx.BorderStyle.NONE }, bottom: { style: docx.BorderStyle.NONE }, left: { style: docx.BorderStyle.NONE }, right: { style: docx.BorderStyle.NONE }, insideHorizontal: { style: docx.BorderStyle.NONE }, insideVertical: { style: docx.BorderStyle.NONE } },
        rows: [new docx.TableRow({ children: [
          new docx.TableCell({ width: { size: 3800, type: docx.WidthType.DXA }, children: [paragraph("Name 姓名：________________", { after: 0 })] }),
          new docx.TableCell({ width: { size: 3200, type: docx.WidthType.DXA }, children: [paragraph("Class 班級：____________", { after: 0 })] }),
          new docx.TableCell({ width: { size: CONTENT_WIDTH - 7000, type: docx.WidthType.DXA }, children: [paragraph(`Page ${page} / ${pageTotal}`, { alignment: docx.AlignmentType.RIGHT, after: 0 })] })
        ] })]
      }),
      paragraph([text(" ", { size: 8 })], { after: 35, border: { bottom: { style: docx.BorderStyle.SINGLE, size: 12, color: ORANGE } } })
    ];
  }

  async function studentChildren(exam) {
    const pages = [];
    for (let index = 0; index < exam.questions.length; index += 8) pages.push(exam.questions.slice(index, index + 8));
    const children = [];
    for (let page = 0; page < pages.length; page += 1) {
      if (page) children.push(paragraph([new docx.PageBreak()], { after: 0 }));
      children.push(...header(exam, page + 1, pages.length));
      for (let index = 0; index < pages[page].length; index += 1) {
        children.push(await questionTable(pages[page][index], page * 8 + index));
        children.push(paragraph([text(" ", { size: 5 })], { after: 25 }));
      }
    }
    return children;
  }

  function answerChildren(exam) {
    const children = [
      paragraph([text("TEACHER ANSWER KEY", { size: 15, color: ORANGE, bold: true })], { after: 25 }),
      paragraph([text(exam.title, { size: 34, color: BLUE, bold: true })], { after: 90 })
    ];
    exam.questions.forEach((question, index) => children.push(paragraph([
      text(`${index + 1}. `, { size: 21, color: BLUE, bold: true }),
      text(question.answer, { size: 21, bold: true }),
      text(`   (${question.label} · ${question.points} pts)`, { size: 16, color: MUTED })
    ], { after: 75 })));
    return children;
  }

  async function createBlob(exam) {
    if (!window.docx && typeof docx === "undefined") throw new Error("Word export library is unavailable.");
    const children = exam.mode === "answer" ? answerChildren(exam) : await studentChildren(exam);
    const documentFile = new docx.Document({
      creator: "English Teaching Player",
      title: exam.title,
      description: "Editable English assessment generated by English Teaching Player",
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

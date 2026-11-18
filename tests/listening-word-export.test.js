const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = {
  console,
  Blob,
  Buffer,
  ArrayBuffer,
  Uint8Array,
  TextEncoder,
  TextDecoder,
  setTimeout,
  clearTimeout,
  fetch: async (url) => {
    assert.match(String(url), /^https:\/\/quickchart\.io\/qr\?/, "Word export must request a QR image over HTTPS");
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z8iwAAAAASUVORK5CYII=", "base64");
    return { ok: true, arrayBuffer: async () => png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) };
  }
};
context.window = context;
context.globalThis = context;
context.docx = vm.runInNewContext(`${fs.readFileSync(path.join(root, "js/vendor/docx.iife.js"), "utf8")}\ndocx;`, context);
vm.runInNewContext(fs.readFileSync(path.join(root, "js/word-export.js"), "utf8"), context);

const question = {
  itemNumber: 1,
  type: "listening-context",
  displayPrompt: "Track 1. What are those?",
  choices: ["They are kiwis.", "They are peaches.", "They are strawberries."],
  answer: "They are kiwis.",
  transcript: ["What are those?", "They are kiwis."],
  lines: 0
};
const section = {
  number: "一",
  title: "Listen and Choose",
  instruction: "Scan the QR code. Listen and choose the best answer.",
  playbackUrl: "https://ssophy-808.github.io/english-teaching-player/listen.html?items=b2-u5-fruit",
  items: [question]
};

(async () => {
  const student = await context.WordExamExporter.createBlob({ mode: "student", title: "Listening Test", bookTitle: "Book 2", unitNames: "Unit 5", sections: [section] });
  const teacher = await context.WordExamExporter.createBlob({ mode: "answer", title: "Listening Test", bookTitle: "Book 2", unitNames: "Unit 5", sections: [section] });
  assert.ok(student.size > 1000, "Student Word file must be generated with the QR code");
  assert.ok(teacher.size > 1000, "Teacher Word file must be generated with the transcript");
  console.log("Listening Word export test passed.");
})().catch((error) => { console.error(error); process.exitCode = 1; });

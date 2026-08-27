(function () {
  "use strict";

  let lesson = null;
  const modal = document.getElementById("daily-handout-modal");
  const title = document.getElementById("daily-handout-title");
  const meta = document.getElementById("daily-handout-meta");
  const frame = document.getElementById("daily-handout-frame");
  const closeButton = document.getElementById("daily-handout-close");
  const studentOpen = document.getElementById("daily-handout-student-open");
  const studentDownload = document.getElementById("daily-handout-student-download");
  const keyOpen = document.getElementById("daily-handout-key-open");

  function pdfUrl(url, page) {
    return `${url}#page=${page}&view=FitH`;
  }

  function setLesson(nextLesson) {
    lesson = nextLesson?.dailyHandout ? nextLesson : null;
  }

  function render() {
    if (!lesson) return;
    const handout = lesson.dailyHandout;
    title.textContent = `${lesson.bookTitle} ${lesson.unitTitle} · Day ${handout.day} 每日講義`;
    meta.textContent = `學生版 PDF 第 ${handout.pageStart}–${handout.pageEnd} 頁 · 教師答案第 ${handout.day} 頁`;
    frame.src = pdfUrl(handout.studentUrl, handout.pageStart);
    studentOpen.href = pdfUrl(handout.studentUrl, handout.pageStart);
    studentDownload.href = handout.studentUrl;
    studentDownload.download = `Book3-Unit1-Day1-4-Daily-Handouts.pdf`;
    keyOpen.href = pdfUrl(handout.teacherUrl, handout.day);
  }

  function open() {
    if (!lesson) return;
    render();
    modal.hidden = false;
    document.body.classList.add("daily-handout-open");
    closeButton.focus();
  }

  function close() {
    if (modal.hidden) return;
    modal.hidden = true;
    frame.src = "about:blank";
    document.body.classList.remove("daily-handout-open");
  }

  closeButton.addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) close();
  });

  window.DailyHandout = { setLesson, open, close };
})();

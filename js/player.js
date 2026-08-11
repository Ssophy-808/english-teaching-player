(function () {
  "use strict";

  const STORAGE_KEY = "englishTeachingPlayer.progress.v1";
  let currentLesson = null;
  let currentIndex = 0;
  let onExit = null;

  const elements = {};

  function cacheElements() {
    elements.homeView = document.getElementById("home-view");
    elements.playerView = document.getElementById("player-view");
    elements.playerContext = document.getElementById("player-context");
    elements.lessonName = document.getElementById("lesson-name");
    elements.stepCount = document.getElementById("step-count");
    elements.progressBar = document.getElementById("progress-bar");
    elements.stage = document.getElementById("step-stage");
    elements.previous = document.getElementById("previous-button");
    elements.next = document.getElementById("next-button");
    elements.home = document.getElementById("home-button");
    elements.fullscreen = document.getElementById("fullscreen-button");
  }

  function saveProgress() {
    if (!currentLesson) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      bookId: currentLesson.bookId,
      unitId: currentLesson.unitId,
      lessonId: currentLesson.id,
      stepIndex: currentIndex,
      savedAt: Date.now()
    }));
  }

  function render() {
    if (!currentLesson || !currentLesson.steps.length) return;
    const step = currentLesson.steps[currentIndex];
    const total = currentLesson.steps.length;
    const progress = ((currentIndex + 1) / total) * 100;

    elements.playerContext.textContent = `${currentLesson.bookTitle}  ·  ${currentLesson.unitTitle} ${currentLesson.unitTopic}  ·  ${currentLesson.day || "Lesson"}`;
    elements.lessonName.textContent = currentLesson.title;
    elements.stepCount.textContent = `${currentIndex + 1} / ${total}`;
    elements.progressBar.style.width = `${progress}%`;
    elements.stage.innerHTML = window.Activities.renderStep(step);
    window.Activities.activateStep(elements.stage, step);
    elements.previous.disabled = currentIndex === 0;
    elements.next.disabled = currentIndex === total - 1;
    elements.next.querySelector("strong").textContent = currentIndex === total - 1 ? "已完成" : "下一頁";
    elements.stage.focus({ preventScroll: true });
    saveProgress();
  }

  function goTo(index) {
    if (!currentLesson) return;
    const lastIndex = currentLesson.steps.length - 1;
    currentIndex = Math.max(0, Math.min(index, lastIndex));
    render();
  }

  function open(lessonContext, startIndex = 0) {
    currentLesson = lessonContext;
    currentIndex = Math.max(0, Math.min(Number(startIndex) || 0, lessonContext.steps.length - 1));
    elements.homeView.hidden = true;
    elements.playerView.hidden = false;
    document.body.classList.add("is-playing");
    render();
  }

  function close() {
    if (!currentLesson) return;
    saveProgress();
    currentLesson = null;
    elements.playerView.hidden = true;
    elements.homeView.hidden = false;
    document.body.classList.remove("is-playing");
    if (typeof onExit === "function") onExit();
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen is unavailable in this browser.", error);
    }
  }

  function updateFullscreenButton() {
    const active = Boolean(document.fullscreenElement);
    elements.fullscreen.textContent = active ? "×" : "⛶";
    elements.fullscreen.setAttribute("aria-label", active ? "Exit fullscreen" : "Enter fullscreen");
    elements.fullscreen.title = active ? "Exit fullscreen" : "Fullscreen";
  }

  function handleKeydown(event) {
    if (!currentLesson || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(currentIndex + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(currentIndex - 1);
    }
  }

  function init(options = {}) {
    cacheElements();
    onExit = options.onExit;
    elements.previous.addEventListener("click", () => goTo(currentIndex - 1));
    elements.next.addEventListener("click", () => goTo(currentIndex + 1));
    elements.home.addEventListener("click", close);
    elements.fullscreen.addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", updateFullscreenButton);
    document.addEventListener("keydown", handleKeydown);
  }

  function getSavedProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (_error) {
      return null;
    }
  }

  window.LessonPlayer = { init, open, getSavedProgress };
})();

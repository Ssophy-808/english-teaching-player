(function () {
  "use strict";

  const STORAGE_KEY = "englishTeachingPlayer.progress.v1";
  let currentLesson = null;
  let currentIndex = 0;
  let onExit = null;
  let activeGameTitle = "";
  const visitedIndices = new Set();

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
    elements.toolbox = document.getElementById("toolbox-button");
    elements.phaseTrail = document.getElementById("phase-trail");
    elements.practiceJump = document.getElementById("practice-jump-button");
    elements.dailyHandout = document.getElementById("daily-handout-button");
    elements.worksheet = document.getElementById("worksheet-button");
    elements.flowButton = document.getElementById("flow-button");
    elements.flowModal = document.getElementById("flow-modal");
    elements.flowClose = document.getElementById("flow-close");
    elements.flowReturn = document.getElementById("flow-return");
    elements.flowGroups = document.getElementById("flow-groups");
    elements.flowSummary = document.getElementById("flow-summary");
  }

  function saveProgress() {
    if (!currentLesson) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      bookId: currentLesson.bookId,
      unitId: currentLesson.unitId,
      lessonId: currentLesson.id,
      stepIndex: currentIndex,
      visitedIndices: [...visitedIndices],
      savedAt: Date.now()
    }));
  }

  function phaseStartIndex(phaseId) {
    return currentLesson?.steps.findIndex((step) => step.phaseId === phaseId) ?? -1;
  }

  function trailFor(step, gameTitle = "") {
    const middle = step.title === "Grammar Check" ? "Check"
      : step.activityType === "game" ? "Games"
        : step.phaseTitle;
    return [step.phaseGroupTitle, middle, gameTitle].filter(Boolean).join(" → ");
  }

  function phaseProgress(phase) {
    const indices = currentLesson.steps
      .map((step, index) => step.phaseId === phase.id ? index : -1)
      .filter((index) => index >= 0);
    if (!indices.length) return 0;
    const visited = indices.filter((index) => visitedIndices.has(index)).length;
    return Math.round((visited / indices.length) * 100);
  }

  function renderFlowOverview() {
    if (!currentLesson?.phases?.length) return;
    const groups = [];
    currentLesson.phases.forEach((phase) => {
      let group = groups.find((item) => item.id === phase.groupId);
      if (!group) {
        group = { id: phase.groupId, title: phase.groupTitle, phases: [] };
        groups.push(group);
      }
      group.phases.push(phase);
    });
    const totalMinutes = currentLesson.phases.reduce((sum, phase) => sum + (Number(phase.duration) || 0), 0);
    elements.flowSummary.textContent = `${groups.length} 個大階段 · ${totalMinutes} 分鐘`;
    elements.flowGroups.innerHTML = groups.map((group, groupIndex) => {
      const groupPercent = Math.round(group.phases.reduce((sum, phase) => sum + phaseProgress(phase), 0) / group.phases.length);
      return `
        <section class="flow-group ${group.phases.some((phase) => phase.id === currentLesson.steps[currentIndex].phaseId) ? "is-current" : ""}">
          <div class="flow-group-heading">
            <span>${groupIndex + 1}</span>
            <div><h3>${group.title}</h3><p>${groupPercent}% 完成</p></div>
          </div>
          <div class="flow-phase-list">
            ${group.phases.map((phase) => `
              <button class="flow-phase-button ${phase.id === currentLesson.steps[currentIndex].phaseId ? "is-current" : ""}" type="button" data-phase-id="${phase.id}">
                <span><strong>${phase.title}</strong><small>${phase.duration ? `${phase.duration} min` : "彈性"}${phase.skippable ? " · 可跳過" : ""}</small></span>
                <span class="flow-phase-progress">${phaseProgress(phase)}%</span>
              </button>`).join("")}
          </div>
        </section>`;
    }).join("");
  }

  function openFlow() {
    renderFlowOverview();
    elements.flowModal.hidden = false;
    elements.flowClose.focus();
  }

  function closeFlow() {
    elements.flowModal.hidden = true;
    elements.flowButton.focus();
  }

  function render() {
    if (!currentLesson || !currentLesson.steps.length) return;
    const step = currentLesson.steps[currentIndex];
    const total = currentLesson.steps.length;
    const progress = ((currentIndex + 1) / total) * 100;
    visitedIndices.add(currentIndex);
    activeGameTitle = "";

    elements.playerContext.textContent = `${currentLesson.bookTitle}  ·  ${currentLesson.unitTitle} ${currentLesson.unitTopic}  ·  ${currentLesson.day || "Lesson"}`;
    elements.lessonName.textContent = currentLesson.title;
    elements.stepCount.textContent = `${currentIndex + 1} / ${total}`;
    elements.phaseTrail.textContent = trailFor(step, activeGameTitle);
    elements.progressBar.style.width = `${progress}%`;
    elements.stage.innerHTML = window.Activities.renderStep(step);
    window.Activities.activateStep(elements.stage, step);
    elements.previous.disabled = currentIndex === 0;
    elements.next.disabled = currentIndex === total - 1;
    elements.next.querySelector("strong").textContent = currentIndex === total - 1 ? "已完成" : "下一頁";
    elements.stage.focus({ preventScroll: true });
    elements.stage.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "instant" });
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
    visitedIndices.clear();
    for (let index = 0; index <= currentIndex; index += 1) visitedIndices.add(index);
    elements.practiceJump.hidden = !lessonContext.steps.some((step) => step.activity === "practice-loop");
    elements.dailyHandout.hidden = !lessonContext.dailyHandout;
    elements.worksheet.hidden = !lessonContext.worksheet;
    window.DailyHandout?.setLesson(lessonContext);
    window.WorksheetBuilder?.setLesson(lessonContext);
    window.ClassroomTools?.setLesson(lessonContext);
    window.scrollTo({ top: 0, behavior: "instant" });
    render();
  }

  function close() {
    if (!currentLesson) return;
    saveProgress();
    window.DailyHandout?.close();
    window.WorksheetBuilder?.close();
    currentLesson = null;
    elements.playerView.hidden = true;
    elements.homeView.hidden = false;
    document.body.classList.remove("is-playing");
    elements.flowModal.hidden = true;
    window.scrollTo({ top: 0, behavior: "instant" });
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
    if (!currentLesson || !document.getElementById("toolbox-modal")?.hidden || !document.getElementById("worksheet-modal")?.hidden || !document.getElementById("daily-handout-modal")?.hidden || !elements.flowModal?.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
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
    elements.toolbox.addEventListener("click", () => window.ClassroomTools?.open());
    elements.dailyHandout.addEventListener("click", () => window.DailyHandout?.open());
    elements.worksheet.addEventListener("click", () => window.WorksheetBuilder?.open());
    elements.practiceJump.addEventListener("click", () => {
      const index = currentLesson?.steps.findIndex((step) => step.activity === "practice-loop") ?? -1;
      if (index >= 0) goTo(index);
    });
    elements.flowButton.addEventListener("click", openFlow);
    elements.flowClose.addEventListener("click", closeFlow);
    elements.flowReturn.addEventListener("click", closeFlow);
    elements.flowModal.addEventListener("click", (event) => {
      if (event.target === elements.flowModal) closeFlow();
      const button = event.target.closest("[data-phase-id]");
      if (!button) return;
      const index = phaseStartIndex(button.dataset.phaseId);
      if (index >= 0) {
        closeFlow();
        goTo(index);
      }
    });
    document.addEventListener("lesson:trail", (event) => {
      activeGameTitle = event.detail?.title || "";
      const step = currentLesson?.steps[currentIndex];
      if (step) elements.phaseTrail.textContent = trailFor(step, activeGameTitle);
    });
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

(function () {
  "use strict";

  const stage = document.getElementById("listening-tracks");
  const params = new URLSearchParams(window.location.search);
  const ids = (params.get("items") || "").split(",").map((id) => id.trim()).filter(Boolean);
  const items = ids.map((id) => window.LISTENING_ITEMS?.[id]).filter(Boolean);

  if (!items.length) {
    stage.innerHTML = '<p class="listening-error">No listening tracks were found. Please scan the QR code again.</p>';
    return;
  }

  stage.innerHTML = items.map((item, index) => `
    <section class="listening-track">
      <div class="track-number">${index + 1}</div>
      <div>
        <h2>Track ${index + 1}</h2>
        <p>Listen, then answer question ${index + 1} on your worksheet.</p>
        <audio controls preload="metadata" src="${item.audio}">Your browser cannot play this audio.</audio>
      </div>
    </section>`).join("");
})();

(function () {
  "use strict";

  const script = document.currentScript;
  const basePath = script ? new URL("../", script.src).pathname.replace(/\/+$/, "/") : "/";

  function compact(value) {
    return String(value || "").replace(/-/g, "");
  }

  function expanded(value, prefix) {
    const match = String(value || "").match(new RegExp(`^${prefix}-?(\\d+)$`, "i"));
    return match ? `${prefix}-${match[1]}` : "";
  }

  function pathFor(bookId, unitId, day) {
    const parts = [compact(bookId), compact(unitId), day ? `day${Number(day)}` : ""].filter(Boolean);
    return `${basePath}${parts.join("/")}${parts.length ? "/" : ""}`;
  }

  function parse(pathname = window.location.pathname) {
    const relative = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
    const parts = relative.split("/").filter(Boolean);
    return {
      bookId: expanded(parts[0], "book"),
      unitId: expanded(parts[1], "unit"),
      day: Number((parts[2] || "").replace(/^day/i, "")) || 0
    };
  }

  function navigate(path, replace = false) {
    const method = replace ? "replaceState" : "pushState";
    if (window.location.pathname !== path) window.history[method]({}, "", path);
  }

  function restoreRedirectedRoute() {
    const params = new URLSearchParams(window.location.search);
    const route = params.get("route");
    if (!route) return;
    window.history.replaceState({}, "", route);
  }

  restoreRedirectedRoute();
  window.LessonRoutes = { basePath, parse, pathFor, navigate };
})();

(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const openerByDialog = new WeakMap();
  const dialogStack = [];
  let initialized = false;

  const FOCUSABLE_SELECTOR = [
    "a[href]", "area[href]", "button:not([disabled])", "input:not([disabled]):not([type=hidden])",
    "select:not([disabled])", "textarea:not([disabled])", "details > summary", "[contenteditable=true]",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  function isVisible(element) {
    if (!(element instanceof HTMLElement)) return false;
    if (element.hidden || element.closest("[hidden]")) return false;
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function focusableElements(container) {
    return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(element => isVisible(element) && element.tabIndex >= 0);
  }

  function topDialog() {
    for (let index = dialogStack.length - 1; index >= 0; index -= 1) {
      if (dialogStack[index].open) return dialogStack[index];
    }
    const openDialogs = [...document.querySelectorAll("dialog[open]")];
    return openDialogs.at(-1) || null;
  }

  function focusInitial(dialog) {
    const explicit = dialog.querySelector("[data-initial-focus]");
    const target = explicit && isVisible(explicit) ? explicit : focusableElements(dialog)[0];
    if (target instanceof HTMLElement) target.focus();
    else dialog.focus();
  }

  function registerDialog(dialog) {
    if (!(dialog instanceof HTMLDialogElement) || dialog.dataset.a11yRegistered === "true") return;
    dialog.dataset.a11yRegistered = "true";
    if (!dialog.hasAttribute("tabindex")) dialog.tabIndex = -1;
    dialog.addEventListener("close", () => {
      const index = dialogStack.lastIndexOf(dialog);
      if (index >= 0) dialogStack.splice(index, 1);
      const opener = openerByDialog.get(dialog);
      queueMicrotask(() => {
        if (opener instanceof HTMLElement && opener.isConnected && !document.querySelector("dialog[open]")) opener.focus();
      });
    });
  }

  function patchDialogMethods() {
    if (!window.HTMLDialogElement || HTMLDialogElement.prototype.__provowareA11yPatched) return;
    const originalShowModal = HTMLDialogElement.prototype.showModal;
    const originalShow = HTMLDialogElement.prototype.show;
    const markOpen = function (original, args) {
      registerDialog(this);
      openerByDialog.set(this, document.activeElement);
      const existing = dialogStack.indexOf(this);
      if (existing >= 0) dialogStack.splice(existing, 1);
      dialogStack.push(this);
      const result = original.apply(this, args);
      queueMicrotask(() => focusInitial(this));
      return result;
    };
    HTMLDialogElement.prototype.showModal = function (...args) { return markOpen.call(this, originalShowModal, args); };
    HTMLDialogElement.prototype.show = function (...args) { return markOpen.call(this, originalShow, args); };
    Object.defineProperty(HTMLDialogElement.prototype, "__provowareA11yPatched", { value: true });
  }

  function trapTab(event, dialog) {
    if (event.key !== "Tab") return;
    const focusable = focusableElements(dialog);
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable.at(-1);
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleEscape(event, dialog) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const cancelEvent = new Event("cancel", { bubbles: false, cancelable: true });
    const mayClose = dialog.dispatchEvent(cancelEvent);
    if (mayClose && dialog.open) dialog.close();
  }

  function arrowCandidates(container) {
    return focusableElements(container).filter(element => !element.closest("[hidden]"));
  }

  function handleArrowNavigation(event) {
    const container = event.target.closest("[data-arrow-navigation]");
    if (!container) return;
    const orientation = container.dataset.arrowNavigation || "vertical";
    const relevant = orientation === "horizontal"
      ? ["ArrowLeft", "ArrowRight", "Home", "End"]
      : ["ArrowUp", "ArrowDown", "Home", "End"];
    if (!relevant.includes(event.key)) return;
    const candidates = arrowCandidates(container);
    if (!candidates.length) return;
    const currentIndex = Math.max(0, candidates.indexOf(document.activeElement));
    let targetIndex = currentIndex;
    if (event.key === "Home") targetIndex = 0;
    else if (event.key === "End") targetIndex = candidates.length - 1;
    else if (["ArrowRight", "ArrowDown"].includes(event.key)) targetIndex = (currentIndex + 1) % candidates.length;
    else targetIndex = (currentIndex - 1 + candidates.length) % candidates.length;
    event.preventDefault();
    candidates[targetIndex].focus();
  }

  function headingLevel(element) {
    return Number(element.tagName.slice(1));
  }

  function accessibleName(element) {
    return element.getAttribute("aria-label")
      || (element.getAttribute("aria-labelledby") && document.getElementById(element.getAttribute("aria-labelledby"))?.textContent)
      || element.textContent?.trim()
      || element.getAttribute("title")
      || "";
  }

  function hasLabel(control) {
    if (control.getAttribute("aria-label") || control.getAttribute("aria-labelledby")) return true;
    if (control.id && document.querySelector(`label[for="${CSS.escape(control.id)}"]`)) return true;
    return Boolean(control.closest("label"));
  }

  function audit(root = document) {
    const errors = [];
    const warnings = [];
    const ids = new Map();
    for (const element of root.querySelectorAll("[id]")) {
      if (ids.has(element.id)) errors.push(`Doppelte ID: ${element.id}`);
      ids.set(element.id, element);
    }
    for (const button of root.querySelectorAll("button")) {
      if (!accessibleName(button)) errors.push(`Schaltfläche ohne zugänglichen Namen: ${button.id || "ohne ID"}`);
    }
    for (const control of root.querySelectorAll("input:not([type=hidden]), select, textarea")) {
      if (!hasLabel(control)) errors.push(`Formularfeld ohne Beschriftung: ${control.id || control.name || "ohne ID"}`);
    }
    for (const dialog of root.querySelectorAll("dialog")) {
      const labelledBy = dialog.getAttribute("aria-labelledby");
      if (!labelledBy || !document.getElementById(labelledBy)) errors.push(`Dialog ohne gültige Überschrift: ${dialog.id || "ohne ID"}`);
    }
    for (const image of root.querySelectorAll("img")) {
      if (!image.hasAttribute("alt")) errors.push(`Bild ohne alt-Attribut: ${image.src || "ohne Quelle"}`);
    }
    for (const element of root.querySelectorAll("[tabindex]")) {
      if (Number(element.getAttribute("tabindex")) > 0) errors.push(`Positiver tabindex: ${element.id || element.tagName}`);
    }
    const headings = [...root.querySelectorAll("h1,h2,h3,h4,h5,h6")];
    for (let index = 1; index < headings.length; index += 1) {
      const previous = headingLevel(headings[index - 1]);
      const current = headingLevel(headings[index]);
      if (current - previous > 1) warnings.push(`Überschriftenebene springt von H${previous} auf H${current}: ${headings[index].textContent.trim()}`);
    }
    for (const live of root.querySelectorAll("[aria-live]")) {
      if (!live.getAttribute("role")) warnings.push(`Live-Bereich ohne explizite Rolle: ${live.id || live.tagName}`);
    }
    return { errors, warnings, passed: errors.length === 0, checkedAt: new Date().toISOString() };
  }

  function initialize() {
    if (initialized) return;
    initialized = true;
    patchDialogMethods();
    document.querySelectorAll("dialog").forEach(registerDialog);
    document.addEventListener("keydown", event => {
      const dialog = topDialog();
      if (dialog) {
        if (event.key === "Escape") handleEscape(event, dialog);
        else trapTab(event, dialog);
      }
      handleArrowNavigation(event);
    }, true);
  }

  namespace.accessibility = { initialize, audit, focusableElements, topDialog, focusInitial };
})();

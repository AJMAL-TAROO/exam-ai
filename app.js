/**
 * app.js — UI state machine, event handlers, orchestration.
 *
 * Imports core.js and subjects/* for all processing logic.
 * PDF.js is expected on window.pdfjsLib (loaded via CDN in index.html).
 */

import {
  buildIndex,
  buildMcqIndex,
  generateMcqPaper,
  generatePaper,
  loadPdf,
} from "./core.js";
import { TOPICS_O } from "./subjects/topics-o.js";
import { TOPICS_A } from "./subjects/topics-a.js";
import { TOPICS_NCE } from "./subjects/topics-nce.js";
import { buildPaperPath } from "./pathUtils.js";
import {
  consumeExamAiCredit,
  loadExamAiContext,
  loadTutorClassrooms,
  refreshCurrentMonthCredit,
  uploadGeneratedPaperToClassroom,
} from "./firebaseBackend.js";

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  level: null,          // 'o-level' | 'a-level' | 'nce'
  subject: null,        // subject key from manifest / topics map
  paperType: null,      // 'written' | 'mcq'
  paperNumber: null,    // numeric paper number for A-Level subjects
  allUrls: [],          // all URLs from manifest for chosen level/paper
  matchedUrls: [],      // URLs loaded from the manifest for the selected paper
  selectedPdfUrls: [],  // user-selected subset of loaded PDF URLs for indexing
  questionIndex: [],    // built index
  manifest: null,       // loaded manifest.json
  topics: [],           // current topic list
  examContext: null,    // Firebase session, tutor, plan, and credit context
  allowedSubjects: [],  // tutor subjects mapped to manifest keys
  debugMode: false,     // hidden developer details are created only when true
  debugClickCount: 0,
  lastDebugClickAt: 0,
  renderedQuestionContexts: [],
  generatedPaper: null,
  generatedPdf: null,
};

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum characters shown in the question preview inside the index report. */
const MAX_PREVIEW_LENGTH = 120;
const DEBUG_CLICK_TARGET = 5;
const DEBUG_CLICK_WINDOW_MS = 3000;
const nativeRequests = new Map();

const SUBJECT_LABELS = {
  maths: "Mathematics",
  physics: "Physics",
  chemistry: "Chemistry",
  economics: "Economics",
  accounts: "Accounts",
  business: "Business",
  "computer-science": "Computer Science",
};

const PAPER_TYPE_LABELS = {
  written: "Question-based",
  mcq: "Multiple choice",
};

const PAPER_1_MCQ_SUBJECTS = new Set([
  "accounts",
  "chemistry",
  "economics",
  "physics",
]);

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const $ = (id) => document.getElementById(id);

window.tawNativeResult = (result) => {
  const request = nativeRequests.get(result?.requestId);
  if (!request) return;
  nativeRequests.delete(result.requestId);
  if (result.ok) {
    request.resolve(result);
  } else {
    request.reject(new Error(result.message || "TAW could not complete the action."));
  }
};

function hasTawNativeBridge() {
  return Boolean(window.chrome?.webview?.postMessage || window.TawNativeBridge?.postMessage);
}

async function sendPdfToTaw(action, pdf, extra = {}) {
  if (!hasTawNativeBridge()) {
    throw new Error("Open Exam AI inside the TAW app to use this action.");
  }
  const requestId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const payload = {
    action,
    requestId,
    fileName: pdf.fileName,
    pdfBase64: await blobToBase64(pdf.blob),
    ...extra,
  };

  return new Promise((resolve, reject) => {
    nativeRequests.set(requestId, { resolve, reject });
    if (window.chrome?.webview?.postMessage) {
      window.chrome.webview.postMessage(payload);
    } else {
      window.TawNativeBridge.postMessage(JSON.stringify(payload));
    }
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not prepare the PDF for TAW."));
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] || "");
    reader.readAsDataURL(blob);
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setStatus(sectionId, message, type = "info") {
  const el = $(`${sectionId}-status`);
  if (!el) return;
  el.textContent = message;
  el.className = `status status--${type}`;
  el.hidden = !message;
}

function showSection(id) {
  $(id).hidden = false;
}

function hideSection(id) {
  $(id).hidden = true;
}

function clearGeneratedPaper() {
  state.generatedPaper = null;
  state.generatedPdf = null;
  setPaperActionStatus("");
}

function setPaperActionStatus(message, type = "info") {
  const el = $("paper-action-status");
  if (!el) return;
  el.textContent = message;
  el.className = `status status--${type}`;
  el.hidden = !message;
}

function setLoading(buttonId, loading) {
  const btn = $(buttonId);
  if (!btn) return;
  btn.disabled = loading;
  btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
  btn.textContent = loading ? btn.dataset.loadingText || "Working…" : btn.dataset.originalText;
}

function onDebugTriggerClick() {
  if (state.debugMode) {
    setDebugMode(false);
    return;
  }

  const now = Date.now();
  if (now - state.lastDebugClickAt > DEBUG_CLICK_WINDOW_MS) {
    state.debugClickCount = 0;
  }

  state.lastDebugClickAt = now;
  state.debugClickCount += 1;

  if (state.debugClickCount >= DEBUG_CLICK_TARGET) {
    setDebugMode(true);
  }
}

function setDebugMode(enabled) {
  state.debugMode = enabled;
  state.debugClickCount = 0;
  state.lastDebugClickAt = 0;

  const planSummary = $("plan-summary");
  if (planSummary) {
    planSummary.hidden = !enabled;
  }

  syncDebugLevelOption(enabled);

  if (enabled && state.questionIndex.length > 0) {
    renderPdfReport();
  } else {
    clearPdfReport();
  }

  syncAiAnalysisPanels();
}

function syncDebugLevelOption(enabled) {
  const levelSelect = $("level-select");
  if (!levelSelect) return;

  const existingOption = levelSelect.querySelector('option[value="nce"]');
  if (enabled && !existingOption) {
    const option = document.createElement("option");
    option.value = "nce";
    option.textContent = "NCE (Mauritius)";
    levelSelect.appendChild(option);
  }

  if (!enabled && existingOption) {
    if (levelSelect.value === "nce") {
      levelSelect.value = "";
      levelSelect.dispatchEvent(new Event("change"));
    }
    existingOption.remove();
  }

  renderLevelDropdown();
}

function setWorkflowEnabled(enabled) {
  [
    "level-select",
    "subject-select",
    "scan-btn",
    "build-index-btn",
    "generate-btn",
    "preview-btn",
    "download-btn",
    "upload-classroom-btn",
  ].forEach((id) => {
    const el = $(id);
    if (el) el.disabled = !enabled;
  });

  document
    .querySelectorAll('input[name="paper-type"], input[name="paper-number"], input[name="mode"]')
    .forEach((input) => {
      input.disabled = !enabled;
    });

  renderLevelDropdown();
  renderSubjectDropdown();
}

function setLevelDropdownOpen(open) {
  const trigger = $("level-select-trigger");
  const menu = $("level-select-menu");
  if (!trigger || !menu) return;

  const shouldOpen = open && !trigger.disabled;
  trigger.setAttribute("aria-expanded", String(shouldOpen));
  menu.hidden = !shouldOpen;
}

function renderLevelDropdown() {
  const select = $("level-select");
  const trigger = $("level-select-trigger");
  const value = $("level-select-value");
  const menu = $("level-select-menu");
  if (!select || !trigger || !value || !menu) return;

  trigger.disabled = select.disabled;
  value.textContent = select.selectedOptions[0]?.textContent || "- choose level -";
  menu.replaceChildren();

  [...select.options].forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "custom-select__option";
    button.textContent = option.textContent;
    button.dataset.value = option.value;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(option.value === select.value));
    button.addEventListener("click", () => {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      setLevelDropdownOpen(false);
      trigger.focus();
    });
    menu.appendChild(button);
  });
}

function setSubjectDropdownOpen(open) {
  const trigger = $("subject-select-trigger");
  const menu = $("subject-select-menu");
  if (!trigger || !menu) return;

  const shouldOpen = open && !trigger.disabled;
  trigger.setAttribute("aria-expanded", String(shouldOpen));
  menu.hidden = !shouldOpen;
}

function renderSubjectDropdown() {
  const select = $("subject-select");
  const trigger = $("subject-select-trigger");
  const value = $("subject-select-value");
  const menu = $("subject-select-menu");
  if (!select || !trigger || !value || !menu) return;

  trigger.disabled = select.disabled;
  value.textContent = select.selectedOptions[0]?.textContent || "- choose subject -";
  menu.replaceChildren();

  [...select.options].forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "custom-select__option";
    button.textContent = option.textContent;
    button.dataset.value = option.value;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(option.value === select.value));
    button.addEventListener("click", () => {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      setSubjectDropdownOpen(false);
      trigger.focus();
    });
    menu.appendChild(button);
  });
}

function getSessionToken() {
  return new URLSearchParams(window.location.search).get("session")?.trim() || "";
}

function setSessionStatus(message, type = "info") {
  const el = $("auth-status");
  if (!el) return;
  el.textContent = message;
  el.className = `status status--${type}`;
  el.hidden = !message;
}

function updateContextPanel() {
  const context = state.examContext;
  if (!context) return;

  const tutorEl = $("tutor-name");
  if (tutorEl) tutorEl.textContent = context.tutorName;

  const planEl = $("plan-name");
  if (planEl) planEl.textContent = context.plan;

  const subjectCountEl = $("subject-count");
  if (subjectCountEl) {
    subjectCountEl.textContent = `${state.allowedSubjects.length} subject${state.allowedSubjects.length === 1 ? "" : "s"}`;
  }

  updateCreditPanel(context.credit);
}

function updateCreditPanel(credit) {
  if (!credit) return;

  const creditEl = $("credit-summary");
  if (creditEl) {
    creditEl.textContent = `${credit.remaining}/${credit.limit} credits left`;
  }

  const monthEl = $("month-summary");
  if (monthEl) {
    monthEl.textContent = `Month ${credit.monthKey}`;
  }

  const generateBtn = $("generate-btn");
  if (generateBtn) {
    generateBtn.disabled = credit.remaining <= 0;
  }
}

function allowedSubjectLabel(subjectKey) {
  return state.allowedSubjects.find((subject) => subject.key === subjectKey)?.label;
}

function getTopicMapForLevel(level) {
  if (level === "o-level") return TOPICS_O;
  if (level === "a-level") return TOPICS_A;
  if (level === "nce") return TOPICS_NCE;
  return {};
}

function getTopics() {
  if (!state.level || !state.subject) return [];
  const topicMap = getTopicMapForLevel(state.level);
  const subjectTopics = topicMap[state.subject] || [];
  const paperKey = state.paperNumber ? `paper-${state.paperNumber}` : null;
  const paperTopics = subjectTopics.paperTopics || subjectTopics;

  if (paperKey && Array.isArray(paperTopics[paperKey]?.topics)) {
    return paperTopics[paperKey].topics;
  }

  if (Array.isArray(subjectTopics)) {
    return subjectTopics;
  }

  if (Array.isArray(subjectTopics.topics)) {
    return subjectTopics.topics;
  }

  return [];
}

function getTopicGroupLabel() {
  if (!state.level || !state.subject) return "Topics";
  const topicMap = getTopicMapForLevel(state.level);
  const subjectTopics = topicMap[state.subject];
  if (!subjectTopics) return "Topics";

  const paperKey = state.paperNumber ? `paper-${state.paperNumber}` : null;
  const paperTopics = subjectTopics.paperTopics || subjectTopics;
  const paperLabel = paperKey ? paperTopics[paperKey]?.label : null;
  return paperLabel ? `${paperLabel} topics` : "Topics";
}

function resetDownstreamFromPaperType() {
  state.paperNumber = null;
  state.matchedUrls = [];
  state.selectedPdfUrls = [];
  state.questionIndex = [];
  $("paper-number-options").innerHTML = "";
  hideSection("paper-select-section");
  hideSection("scan-section");
  hideSection("index-section");
  hideSection("generate-section");
  hideSection("paper-section");
  clearGeneratedPaper();
  resetPdfSelectorAndReport();
}

function formatSubjectLabel(subjectKey) {
  const tutorLabel = allowedSubjectLabel(subjectKey);
  if (tutorLabel) return tutorLabel;

  return SUBJECT_LABELS[subjectKey] ||
    subjectKey.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getSortedPaperNumbers(subjectData) {
  subjectData = subjectData?.["question-papers"] || subjectData;
  if (Array.isArray(subjectData)) {
    return [...new Set(subjectData
      .map(getPaperNumberFromUrl)
      .filter((num) => Number.isInteger(num)))]
      .sort((a, b) => a - b);
  }

  if (!subjectData || typeof subjectData !== "object" || Array.isArray(subjectData)) {
    return [];
  }
  return Object.keys(subjectData)
    .map((key) => {
      const match = key.match(/^paper-(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num) => Number.isInteger(num))
    .sort((a, b) => a - b);
}

function getQuestionPaperUrls(subjectData, paperNumber = null) {
  if (Array.isArray(subjectData)) {
    return paperNumber
      ? subjectData.filter((url) => getPaperNumberFromUrl(url) === paperNumber)
      : subjectData;
  }

  if (!subjectData || typeof subjectData !== "object") {
    return [];
  }

  const questionPapers = subjectData["question-papers"] || subjectData;
  if (Array.isArray(questionPapers)) {
    return paperNumber
      ? questionPapers.filter((url) => getPaperNumberFromUrl(url) === paperNumber)
      : questionPapers;
  }

  if (paperNumber) {
    return questionPapers[`paper-${paperNumber}`] || [];
  }

  return [];
}

function getPaperNumberFromUrl(url) {
  const pathMatch = url.match(/\/paper-(\d+)\//i);
  if (pathMatch) return parseInt(pathMatch[1], 10);

  const codeMatch = url.match(/_qp_(\d)\d/i);
  return codeMatch ? parseInt(codeMatch[1], 10) : null;
}

function classifyPdfUrl(url, level, subject) {
  const normalised = url.toLowerCase();
  if (level === "nce") {
    if (/(?:^|[-_/])section-a(?:[-_.\\/]|$)/i.test(normalised)) return "mcq";
    if (/(?:^|[-_/])section-b(?:[-_.\\/]|$)/i.test(normalised)) return "written";
    return "mixed";
  }

  const paperNumber = getPaperNumberFromUrl(url);
  if (paperNumber === 1 && PAPER_1_MCQ_SUBJECTS.has(subject)) return "mcq";
  return "written";
}

function isUrlCompatibleWithPaperType(url, paperType, level, subject) {
  const kind = classifyPdfUrl(url, level, subject);
  return kind === paperType || kind === "mixed";
}

function filterUrlsByPaperType(urls, paperType, level, subject) {
  if (!paperType) return urls;
  return urls.filter((url) => isUrlCompatibleWithPaperType(url, paperType, level, subject));
}

function getCompatiblePaperNumbers(subjectData, paperType, level, subject) {
  return getSortedPaperNumbers(subjectData).filter((paperNumber) => {
    const urls = getQuestionPaperUrls(subjectData, paperNumber);
    return filterUrlsByPaperType(urls, paperType, level, subject).length > 0;
  });
}

function populateSubjectOptions(levelKey, manifest) {
  const subjectSelect = $("subject-select");
  subjectSelect.innerHTML = '<option value="">- choose subject -</option>';

  const manifestSubjects = manifest?.[levelKey] || {};
  const subjects = state.allowedSubjects
    .filter((subject) => manifestSubjects[subject.key])
    .sort((a, b) => a.label.localeCompare(b.label));

  subjects.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject.key;
    option.textContent = subject.label;
    subjectSelect.appendChild(option);
  });
  renderSubjectDropdown();

  if (subjects.length === 0) {
    setStatus(
      "subject",
      "No mapped Exam AI subjects are available for this level.",
      "warn"
    );
  } else {
    setStatus("subject", "");
  }
}

function renderPaperOptions(paperNumbers) {
  const container = $("paper-number-options");
  container.innerHTML = "";

  paperNumbers.forEach((paper) => {
    const label = document.createElement("label");
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "paper-number";
    radio.value = String(paper);
    radio.addEventListener("change", onPaperChange);

    label.appendChild(radio);
    label.appendChild(document.createTextNode(` Paper ${paper}`));
    container.appendChild(label);
  });
}

// ─── Manifest loading ─────────────────────────────────────────────────────────

async function loadManifest() {
  if (state.manifest) return state.manifest;
  const resp = await fetch("./assets/manifest.json");
  if (!resp.ok) throw new Error(`Failed to load manifest: ${resp.status}`);
  state.manifest = await resp.json();
  return state.manifest;
}

// ─── Step 1 + 2: Level & Subject selection ────────────────────────────────────

async function bootstrapExamAiSession() {
  setWorkflowEnabled(false);
  setSessionStatus("Checking TAW session...");

  try {
    const [examContext] = await Promise.all([
      loadExamAiContext(getSessionToken()),
      loadManifest(),
    ]);
    state.examContext = examContext;
    state.allowedSubjects = state.examContext.allowedSubjects;
    updateContextPanel();
    setSessionStatus("Connected to TAW.", "success");
    setWorkflowEnabled(true);

    if (state.allowedSubjects.length === 0) {
      setWorkflowEnabled(false);
      setSessionStatus(
        "No mapped subjects were found for this tutor. Check ADMIN/<adminId>/SUBJECTS.",
        "warn"
      );
    }
  } catch (err) {
    console.error(err);
    setWorkflowEnabled(false);
    setSessionStatus(err.message || "Could not connect Exam AI to TAW.", "error");
  }
}

async function onLevelChange(e) {
  state.level = e.target.value || null;
  state.subject = null;
  state.paperType = null;
  state.paperNumber = null;
  state.matchedUrls = [];
  state.selectedPdfUrls = [];
  state.questionIndex = [];

  // Reset subject selector
  const subjectSelect = $("subject-select");
  subjectSelect.innerHTML = '<option value="">- choose subject -</option>';
  renderSubjectDropdown();
  setStatus("subject", "");

  $("paper-number-options").innerHTML = "";
  document.querySelectorAll('input[name="paper-type"]').forEach((radio) => {
    radio.checked = false;
  });

  // Hide downstream sections
  hideSection("paper-type-section");
  hideSection("paper-select-section");
  hideSection("scan-section");
  hideSection("index-section");
  hideSection("generate-section");
  hideSection("paper-section");
  clearGeneratedPaper();

  // Clear PDF selector + report
  resetPdfSelectorAndReport();

  if (state.level) {
    const manifest = await loadManifest();
    populateSubjectOptions(state.level, manifest);
    showSection("subject-section");
  } else {
    hideSection("subject-section");
  }
}

async function onSubjectChange(e) {
  state.subject = e.target.value || null;
  state.paperType = null;
  state.paperNumber = null;
  state.matchedUrls = [];
  state.selectedPdfUrls = [];
  state.questionIndex = [];

  $("paper-number-options").innerHTML = "";
  document.querySelectorAll('input[name="paper-type"]').forEach((radio) => {
    radio.checked = false;
  });

  hideSection("paper-type-section");
  hideSection("paper-select-section");
  hideSection("scan-section");
  hideSection("index-section");
  hideSection("generate-section");
  hideSection("paper-section");
  clearGeneratedPaper();

  // Clear PDF selector + report
  resetPdfSelectorAndReport();

  if (state.subject && state.level) {
    showSection("paper-type-section");
    setStatus("paper-type", "");
  } else {
    hideSection("paper-type-section");
    hideSection("paper-select-section");
  }
}

// ─── Step 3 (CS A-Level only): Paper selection ────────────────────────────────

async function onPaperTypeChange(e) {
  state.paperType = e.target.value || null;
  resetDownstreamFromPaperType();

  if (!state.paperType || !state.level || !state.subject) return;

  if (state.level === "a-level" || state.level === "o-level") {
    const manifest = await loadManifest();
    const subjectData = manifest?.[state.level]?.[state.subject];
    const paperNumbers = getCompatiblePaperNumbers(subjectData, state.paperType, state.level, state.subject);

    renderPaperOptions(paperNumbers);
    showSection("paper-select-section");
    if (paperNumbers.length > 0) {
      setStatus("paper-select", "");
      const firstPaper = paperNumbers[0];
      const firstRadio = document.querySelector(`input[name="paper-number"][value="${firstPaper}"]`);
      if (firstRadio) firstRadio.checked = true;
      state.paperNumber = firstPaper;
      showSection("scan-section");
      setStatus("scan", "");
    } else {
      state.paperNumber = null;
      hideSection("scan-section");
      setStatus(
        "paper-select",
        `No ${PAPER_TYPE_LABELS[state.paperType].toLowerCase()} ${state.level.replace("-", " ")} PDFs found for this subject.`,
        "warn"
      );
    }
  } else {
    hideSection("paper-select-section");
    showSection("scan-section");
    setStatus("scan", "");
  }
}

function onPaperChange(e) {
  state.paperNumber = parseInt(e.target.value, 10) || null;
  state.matchedUrls = [];
  state.selectedPdfUrls = [];
  state.questionIndex = [];

  hideSection("index-section");
  hideSection("generate-section");
  hideSection("paper-section");
  clearGeneratedPaper();

  // Clear PDF selector + report
  resetPdfSelectorAndReport();

  if (state.paperNumber) {
    showSection("scan-section");
    setStatus("scan", "");
  } else {
    hideSection("scan-section");
  }
}

// ─── Step 3: Load Files ───────────────────────────────────────────────────────

async function onLoadFilesClick() {
  setLoading("scan-btn", true);
  setStatus("scan", "Loading files...");
  hideSection("index-section");
  hideSection("generate-section");
  hideSection("paper-section");

  // Clear any previous PDF selector and report
  resetPdfSelectorAndReport();

  try {
    const manifest = await loadManifest();
    const levelKey = state.level;
    const subjectKey = state.subject;
    const paperType = state.paperType;

    if (!paperType) {
      setStatus("scan", "Please choose a paper type first.", "warn");
      setLoading("scan-btn", false);
      return;
    }

    let urlsToLoad;

    if ((levelKey === "a-level" || levelKey === "o-level") && state.paperNumber) {
      // Paper-specific path for levels whose papers are numbered in the manifest or URL paths.
      const subjectData = manifest[levelKey]?.[subjectKey];
      urlsToLoad = getQuestionPaperUrls(subjectData, state.paperNumber);
      if (urlsToLoad.length === 0) {
        setStatus(
          "scan",
          `No PDFs found in manifest for Paper ${state.paperNumber}. ` +
          `Add PDFs to ${buildPaperPath(levelKey, subjectKey, "question-papers", state.paperNumber)} ` +
          `and update manifest.json.`,
          "warn"
        );
        setLoading("scan-btn", false);
        return;
      }
    } else {
      // O-Level flow — use flat subject array from manifest
      const subjectData = manifest[levelKey]?.[subjectKey];
      urlsToLoad = getQuestionPaperUrls(subjectData);
      if (urlsToLoad.length === 0) {
        setStatus("scan", "No PDFs found in manifest for this subject. Add PDFs and update manifest.json.", "warn");
        setLoading("scan-btn", false);
        return;
      }
    }

    urlsToLoad = filterUrlsByPaperType(urlsToLoad, paperType, levelKey, subjectKey);
    if (urlsToLoad.length === 0) {
      const paperLabel = state.paperNumber ? ` Paper ${state.paperNumber}` : "";
      setStatus(
        "scan",
        `No ${PAPER_TYPE_LABELS[paperType].toLowerCase()} PDFs found for ${subjectKey}${paperLabel} (${levelKey}).`,
        "warn"
      );
      setLoading("scan-btn", false);
      return;
    }

    state.allUrls = urlsToLoad;
    setStatus("scan", "Loading files...");

    state.matchedUrls = urlsToLoad;

    if (state.matchedUrls.length === 0) {
      setStatus(
        "scan",
        `No PDFs found for ${subjectKey} / ${levelKey}. Check your manifest and PDF filenames.`,
        "warn"
      );
    } else {
      const paperLabel = state.paperNumber ? ` Paper ${state.paperNumber}` : "";
      setStatus(
        "scan",
        `✓ Loaded ${state.matchedUrls.length} PDF(s) for ${subjectKey}${paperLabel} (${levelKey}).`,
        "success"
      );
      renderPdfSelector();
      showSection("index-section");
    }
  } catch (err) {
    setStatus("scan", `Error: ${err.message}`, "error");
    console.error(err);
  }
  setLoading("scan-btn", false);
}

// ─── Step 4: Build Index ──────────────────────────────────────────────────────

async function onBuildIndexClick() {
  // Derive selected URLs from checked checkboxes.
  // If the selector was not rendered yet, fall back to all loaded URLs.
  const selectorVisible = !$("pdf-selector").hidden;
  const checkedBoxes = document.querySelectorAll(".pdf-cb:checked");

  if (selectorVisible && checkedBoxes.length === 0) {
    setStatus("index", "Please select at least one PDF to index.", "warn");
    return;
  }

  state.selectedPdfUrls = selectorVisible
    ? [...checkedBoxes].map((cb) => cb.value)
    : [...state.matchedUrls];

  if (state.selectedPdfUrls.length === 0) {
    setStatus("index", "Please select at least one PDF to index.", "warn");
    return;
  }

  setLoading("build-index-btn", true);
  setStatus("index", "Building question index…");
  hideSection("generate-section");
  hideSection("paper-section");
  clearGeneratedPaper();

  // Clear previous report
  clearPdfReport();

  state.topics = getTopics();
  state.questionIndex = [];

  try {
    const buildFn = state.paperType === "mcq" ? buildMcqIndex : buildIndex;
    state.questionIndex = await buildFn(
      state.selectedPdfUrls,
      state.topics,
      (done, total, url) => {
        const name = url ? url.split("/").pop() : "";
        setStatus("index", `Indexing… ${done}/${total}${name ? ` — ${name}` : ""}`);
      }
    );

    if (state.questionIndex.length === 0) {
      setStatus("index", "No questions found. PDFs may not be text-based or the selected paper type may not match the source format.", "warn");
    } else {
      setStatus(
        "index",
        `✓ Indexed ${state.questionIndex.length} question(s) from ${state.selectedPdfUrls.length} PDF(s).`,
        "success"
      );
      buildTopicCheckboxes();
      if (state.debugMode) {
        renderPdfReport();
      } else {
        clearPdfReport();
      }
      showSection("generate-section");
    }
  } catch (err) {
    setStatus("index", `Error: ${err.message}`, "error");
    console.error(err);
  }
  setLoading("build-index-btn", false);
}

// ─── PDF selector helpers ─────────────────────────────────────────────────────

/** Clear the PDF selector list and any previously rendered per-PDF report. */
function resetPdfSelectorAndReport() {
  const selectorEl = $("pdf-selector");
  const listEl = $("pdf-checkbox-list");
  if (selectorEl) selectorEl.hidden = true;
  if (listEl) listEl.innerHTML = "";
  clearPdfReport();
  state.selectedPdfUrls = [];
}

function clearPdfReport() {
  const reportEl = $("pdf-report");
  if (!reportEl) return;
  reportEl.replaceChildren();
  reportEl.hidden = true;
}

function onPdfReportLayoutChange() {
  if (state.debugMode && state.questionIndex.length > 0) {
    renderPdfReport();
  }
}

/**
 * Build the PDF checkbox list inside #pdf-selector from loaded manifest URLs.
 * All PDFs are checked by default.
 */
function renderPdfSelector() {
  const listEl = $("pdf-checkbox-list");
  listEl.innerHTML = "";

  state.matchedUrls.forEach((url) => {
    const label = document.createElement("label");
    label.className = "pdf-checkbox-label";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = url;
    cb.checked = true;
    cb.className = "pdf-cb";

    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + url.split("/").pop()));
    listEl.appendChild(label);
  });

  $("pdf-selector").hidden = false;
}

/**
 * After indexing, render a per-PDF summary (question count) and a per-question
 * report for each selected PDF.  On desktop a table is shown; on mobile the
 * same data is rendered as stacked cards (CSS toggles which is visible).
 */
function renderPdfReport() {
  if (!state.debugMode) {
    clearPdfReport();
    return;
  }

  const reportEl = $("pdf-report");
  reportEl.replaceChildren();

  // Build a lookup map: url → questions[]
  const byPdf = new Map();
  state.selectedPdfUrls.forEach((url) => byPdf.set(url, []));
  state.questionIndex.forEach((q) => {
    if (byPdf.has(q.pdfUrl)) {
      byPdf.get(q.pdfUrl).push(q);
    }
  });

  // Build a topic id → label lookup
  const topicLabelMap = new Map(state.topics.map((t) => [t.id, t.label]));

  const heading = document.createElement("h3");
  heading.style.cssText = "margin:0 0 0.75rem; font-size:0.95rem; font-weight:600;";
  heading.textContent = "Per-PDF Summary";
  reportEl.appendChild(heading);
  const useMobileCards = window.matchMedia("(max-width: 640px)").matches;

  state.selectedPdfUrls.forEach((url) => {
    const questions = byPdf.get(url) || [];
    const filename = url.split("/").pop();

    const entry = document.createElement("div");
    entry.className = "pdf-report-entry";

    const title = document.createElement("p");
    title.className = "pdf-report-title";
    title.textContent = filename;

    const count = document.createElement("p");
    count.className = "pdf-report-count";
    count.textContent = `${questions.length} question(s) indexed`;

    entry.appendChild(title);
    entry.appendChild(count);

    if (questions.length > 0) {
      // Pre-compute row data once to avoid duplicating logic
      const rows = questions.map((q, idx) => {
        const assignedId = (q.topics && q.topics[0]) || "unclassified";
        const assignedLabel = topicLabelMap.get(assignedId) || assignedId;

        const rawText = (q.text || "").replace(/\s+/g, " ").trim();
        const preview = rawText.length > MAX_PREVIEW_LENGTH ? rawText.slice(0, MAX_PREVIEW_LENGTH) + "…" : rawText;

        const sp = q.startPage ?? "";
        const ep = q.endPage ?? sp;
        const pageRange = sp ? (ep && ep !== sp ? `${sp}–${ep}` : `${sp}`) : "—";

        // Triggered keywords: find the topic score entry for the assigned topic
        const topicScores = q.debugInfo?.topicScores ?? [];
        const matchingScore = topicScores.find((ts) => ts.id === assignedId);
        const keywords = matchingScore?.matchedKeywords ?? [];
        const keywordsHtml = keywords.length > 0
          ? keywords.map(renderKeywordBadge).join(" ")
          : `<span class="ai-debug-muted">—</span>`;

        return { num: idx + 1, preview, assignedLabel, pageRange, keywordsHtml };
      });

      // ── Desktop: standard HTML table ──────────────────────────────────────
      if (!useMobileCards) {
      const table = document.createElement("table");
      table.className = "pdf-topic-table";

      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr>
          <th>#</th>
          <th>Question preview</th>
          <th>Assigned topic</th>
          <th>Pages</th>
          <th>Keywords triggered</th>
        </tr>
      `;

      const tbody = document.createElement("tbody");
      rows.forEach(({ num, preview, assignedLabel, pageRange, keywordsHtml }) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td data-label="#">${num}</td>
          <td data-label="Question">${escapeHtml(preview)}</td>
          <td data-label="Topic"><span class="topic-badge">${escapeHtml(assignedLabel)}</span></td>
          <td data-label="Pages" style="white-space:nowrap">${escapeHtml(pageRange)}</td>
          <td data-label="Keywords" class="report-kw-cell">${keywordsHtml}</td>
        `;
        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      entry.appendChild(table);
      }

      // ── Mobile: stacked cards (one card per question) ──────────────────────
      if (useMobileCards) {
      const cardList = document.createElement("div");
      cardList.className = "pdf-report-cards";

      rows.forEach(({ num, preview, assignedLabel, pageRange, keywordsHtml }) => {
        const card = document.createElement("div");
        card.className = "report-q-card";
        card.innerHTML = `
          <div class="report-q-card-row">
            <span class="report-q-card-label">#</span>
            <span class="report-q-card-value">${num}</span>
          </div>
          <div class="report-q-card-row">
            <span class="report-q-card-label">Question</span>
            <span class="report-q-card-value">${escapeHtml(preview)}</span>
          </div>
          <div class="report-q-card-row">
            <span class="report-q-card-label">Topic</span>
            <span class="report-q-card-value"><span class="topic-badge">${escapeHtml(assignedLabel)}</span></span>
          </div>
          <div class="report-q-card-row">
            <span class="report-q-card-label">Pages</span>
            <span class="report-q-card-value">${escapeHtml(pageRange)}</span>
          </div>
          <div class="report-q-card-row">
            <span class="report-q-card-label">Keywords</span>
            <span class="report-q-card-value report-kw-cell">${keywordsHtml}</span>
          </div>
        `;
        cardList.appendChild(card);
      });

      entry.appendChild(cardList);
      }
    }

    reportEl.appendChild(entry);
  });

  reportEl.hidden = false;
}

// ─── Topic checkboxes ─────────────────────────────────────────────────────────

function buildTopicCheckboxes() {
  const container = $("topic-checkboxes");
  container.innerHTML = "";

  const title = $("topic-selection")?.querySelector("p");
  if (title) {
    title.textContent = getTopicGroupLabel();
  }

  // Select All / Deselect All controls
  const controls = document.createElement("div");
  controls.className = "topic-select-controls";

  const selectAll = document.createElement("button");
  selectAll.type = "button";
  selectAll.className = "btn-link";
  selectAll.textContent = "Select all";
  selectAll.addEventListener("click", () => {
    container.querySelectorAll(".topic-cb").forEach((cb) => { cb.checked = true; });
  });

  const sep = document.createTextNode(" · ");

  const deselectAll = document.createElement("button");
  deselectAll.type = "button";
  deselectAll.className = "btn-link";
  deselectAll.textContent = "Deselect all";
  deselectAll.addEventListener("click", () => {
    container.querySelectorAll(".topic-cb").forEach((cb) => { cb.checked = false; });
  });

  controls.appendChild(selectAll);
  controls.appendChild(sep);
  controls.appendChild(deselectAll);
  container.appendChild(controls);

  state.topics.forEach((topic) => {
    const label = document.createElement("label");
    label.className = "topic-label";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = topic.id;
    cb.checked = true;
    cb.className = "topic-cb";
    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + topic.label));
    container.appendChild(label);
  });
}

function onModeChange(e) {
  const mode = e.target.value;
  $("topic-selection").hidden = mode !== "selected";
}

// ─── Step 6: Generate Paper ───────────────────────────────────────────────────

async function onGenerateClick() {
  if (!state.examContext) {
    setStatus("generate", "Open Exam AI from TAW before generating a paper.", "warn");
    return;
  }

  const count = parseInt($("question-count").value, 10) || 10;
  const seedInput = $("seed-input").value.trim();
  const seed = seedInput !== "" ? parseInt(seedInput, 10) : null;
  const mode = document.querySelector('input[name="mode"]:checked')?.value || "mixed";

  let selectedTopics = null;
  if (mode === "selected") {
    selectedTopics = [
      ...document.querySelectorAll(".topic-cb:checked"),
    ].map((cb) => cb.value);
    if (selectedTopics.length === 0) {
      setStatus("generate", "Please select at least one topic.", "warn");
      return;
    }
  }

  const generateFn = state.paperType === "mcq" ? generateMcqPaper : generatePaper;
  const paper = generateFn(state.questionIndex, {
    topics: selectedTopics,
    count,
    seed,
  });

  if (paper.length === 0) {
    setStatus("generate", "No questions matched the selected filters.", "warn");
    return;
  }

  setLoading("generate-btn", true);
  setStatus("generate", "Checking credits...");

  try {
    const latestCredit = await refreshCurrentMonthCredit(state.examContext);
    updateCreditPanel(latestCredit);

    if (latestCredit.remaining <= 0) {
      setStatus(
        "generate",
        `No Exam AI credits left for ${latestCredit.monthKey}. Credits renew next month.`,
        "warn"
      );
      return;
    }

    const updatedCredit = await consumeExamAiCredit(state.examContext);
    updateCreditPanel(updatedCredit);
    setStatus(
      "generate",
      `Generated ${paper.length} question(s). ${updatedCredit.remaining}/${updatedCredit.limit} credits left.`,
      "success"
    );
    clearGeneratedPaper();
    state.generatedPaper = {
      questions: paper,
      seed,
      generatedAt: new Date(),
      fileName: defaultGeneratedPaperFileName(),
    };
    renderPaper(paper, seed);
    showSection("paper-section");
  } catch (err) {
    console.error(err);
    setStatus("generate", err.message || "Could not spend Exam AI credit.", "error");
    return;
  } finally {
    setLoading("generate-btn", false);
    updateCreditPanel(state.examContext.credit);
  }

}

// ─── Step 7: Render paper ─────────────────────────────────────────────────────

function renderPdfWhenVisible(container, render) {
  container.innerHTML = '<span class="page-loading">Page preview loads when it comes into view.</span>';

  if (!("IntersectionObserver" in window)) {
    render();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return;
      }
      observer.disconnect();
      render();
    },
    { rootMargin: "900px 0px" }
  );
  observer.observe(container);
}

function syncAiAnalysisPanels() {
  state.renderedQuestionContexts.forEach((context) => {
    const existingPanel = context.card.querySelector(".ai-debug-details");
    if (!state.debugMode) {
      existingPanel?.remove();
      return;
    }

    if (!existingPanel) {
      addLazyAiAnalysisPanel(context);
    }
  });
}

function addLazyAiAnalysisPanel(context) {
  const details = document.createElement("details");
  details.className = "ai-debug-details";

  const summary = document.createElement("summary");
  summary.className = "ai-debug-summary";
  summary.textContent = "AI analysis";
  details.appendChild(summary);

  details.addEventListener("toggle", () => {
    if (!details.open || details.dataset.loaded) {
      return;
    }

    details.dataset.loaded = "true";
    details.appendChild(buildAiAnalysisBody(context));
  });

  const pagesSection = context.card.querySelector(".question-pages-section");
  context.card.insertBefore(details, pagesSection);
}

function buildAiAnalysisBody({ question: q, pageLabel, startPage: sp, endPage: ep }) {
  const debug = q.debugInfo || {};
  const matchedLine = debug.matchedLine ?? "";
  const topicScores = debug.topicScores ?? [];
  const subParts = debug.subParts ?? [];
  const extractionMode = debug.extractionMode ?? "bold";
  const candidateHeadersFound = debug.candidateHeadersFound ?? 0;
  const lowTextCoverage = debug.lowTextCoverage ?? false;
  const avgCharsPerPage = debug.avgCharsPerPage ?? 0;
  const cropInfo = q.crop || null;
  const canRenderCrop = Boolean(cropInfo?.cropped && sp === ep);
  const outputModeLabel = canRenderCrop
    ? "Cropped question"
    : cropInfo?.cropped
      ? "Full source page (multi-page)"
      : "Full source page";
  const outputModeClass = canRenderCrop ? "ai-debug-crop-tag--cropped" : "ai-debug-crop-tag--full";

  const assignedTopicId = q.topics[0] ?? "unclassified";
  const assignedTopicScore = topicScores.find((ts) => ts.id === assignedTopicId);
  const assignedLabel = assignedTopicScore?.label ?? assignedTopicId;
  const assignedKeywords = assignedTopicScore?.matchedKeywords ?? [];

  const topicScoreRows = topicScores
    .filter((ts) => ts.score > 0 || (ts.hybridScore ?? 0) > 0)
    .map((ts) => {
      const hybrid = ts.hybridScore != null ? ts.hybridScore.toFixed(3) : "—";
      const relatedness = ts.relatedness ?? "";
      const relColour = relatedness === "related"
        ? "var(--color-success)"
        : relatedness === "borderline"
          ? "var(--color-warn)"
          : "var(--color-error)";
      const relBadge = relatedness
        ? `<span style="color:${relColour};font-weight:600">${escapeHtml(relatedness)}</span>`
        : "";
      return `<tr${ts.id === assignedTopicId ? ' class="ai-debug-assigned-row"' : ""}>
        <td class="ai-debug-topic">${escapeHtml(ts.label)}</td>
        <td class="ai-debug-score">${ts.score}</td>
        <td class="ai-debug-score">${hybrid} ${relBadge}</td>
        <td class="ai-debug-kw">${ts.matchedKeywords.map(renderKeywordBadge).join(" ")}</td>
      </tr>`;
    })
    .join("");

  const subPartsHtml = subParts.length > 0
    ? subParts.map((part) => `<code class="ai-debug-subpart">(${escapeHtml(part)})</code>`).join(" ")
    : `<span class="ai-debug-muted">none detected</span>`;

  const modeColour = extractionMode === "bold"
    ? "var(--color-success)"
    : extractionMode === "geometric"
      ? "var(--color-warn)"
      : "var(--color-error)";
  const modeBadge = `<span style="font-weight:600;color:${modeColour}">${escapeHtml(extractionMode)}</span>`;
  const coverageBadge = lowTextCoverage
    ? `<span style="color:var(--color-warn)">Low (${avgCharsPerPage} chars/page avg)</span>`
    : `<span style="color:var(--color-success)">OK (${avgCharsPerPage} chars/page avg)</span>`;

  const body = document.createElement("div");
  body.className = "ai-debug-body";
  body.innerHTML = `
    <div class="ai-debug-row">
      <span class="ai-debug-label">Source PDF</span>
      <span class="ai-debug-value">${escapeHtml(q.pdfUrl.split("/").pop())}</span>
    </div>
    <div class="ai-debug-row">
      <span class="ai-debug-label">Original question #</span>
      <span class="ai-debug-value">${q.number}</span>
    </div>
    <div class="ai-debug-row">
      <span class="ai-debug-label">Page range</span>
      <span class="ai-debug-value">${pageLabel}</span>
    </div>
    <div class="ai-debug-row">
      <span class="ai-debug-label">Detected start line</span>
      <span class="ai-debug-value">
        <code class="ai-debug-code">${escapeHtml(matchedLine)}</code>
        <span class="ai-debug-muted"> (p. ${sp})</span>
      </span>
    </div>
    <div class="ai-debug-row">
      <span class="ai-debug-label">Extraction mode</span>
      <span class="ai-debug-value">${modeBadge}
        <span class="ai-debug-muted"> &mdash; ${candidateHeadersFound} candidate header(s) considered</span>
      </span>
    </div>
    <div class="ai-debug-row">
      <span class="ai-debug-label">Text coverage</span>
      <span class="ai-debug-value">${coverageBadge}</span>
    </div>
    <div class="ai-debug-row">
      <span class="ai-debug-label">Page output</span>
      <span class="ai-debug-value">
        <span class="ai-debug-crop-tag ${outputModeClass}">${outputModeLabel}</span>
        ${
          canRenderCrop
            ? `<button type="button" class="btn-link source-preview-btn">View original page</button>`
            : ""
        }
      </span>
    </div>
    <div class="source-preview-container" hidden></div>
    <div class="ai-debug-row">
      <span class="ai-debug-label">Sub-parts found</span>
      <span class="ai-debug-value">${subPartsHtml}</span>
    </div>
    <div class="ai-debug-row ai-debug-row--assigned">
      <span class="ai-debug-label">Assigned topic</span>
      <span class="ai-debug-value">
        <strong>${escapeHtml(assignedLabel)}</strong>
        ${assignedKeywords.length > 0
          ? `&mdash; triggered by: <span class="ai-debug-kw-inline">${assignedKeywords.map(renderKeywordBadge).join(" ")}</span>`
          : `<span class="ai-debug-muted">(no keyword match &mdash; unclassified)</span>`}
      </span>
    </div>
    ${
      topicScoreRows
        ? `<div class="ai-debug-row ai-debug-row--table">
            <span class="ai-debug-label">All topic scores</span>
            <table class="ai-debug-table">
              <thead><tr><th>Topic</th><th>Kw score</th><th>Hybrid score</th><th>Matched keywords</th></tr></thead>
              <tbody>${topicScoreRows}</tbody>
            </table>
          </div>`
        : `<div class="ai-debug-row">
            <span class="ai-debug-label">All topic scores</span>
            <span class="ai-debug-value ai-debug-muted">No keywords matched &mdash; tagged as unclassified</span>
          </div>`
    }
  `;

  const previewButton = body.querySelector(".source-preview-btn");
  const previewContainer = body.querySelector(".source-preview-container");
  previewButton?.addEventListener("click", () => {
    const isHidden = previewContainer.hidden;
    previewContainer.hidden = !isHidden;
    previewButton.textContent = isHidden ? "Hide original page" : "View original page";
    if (isHidden && !previewContainer.dataset.loaded) {
      previewContainer.dataset.loaded = "true";
      renderPdfPages(previewContainer, q.pdfUrl, sp, sp, []);
    }
  });

  return body;
}

function renderPaper(paper, seed) {
  if (state.paperType === "mcq") {
    renderMcqPaper(paper, seed);
    return;
  }

  const container = $("paper-container");
  container.innerHTML = "";
  state.renderedQuestionContexts = [];

  const header = document.createElement("div");
  header.className = "paper-header";
  header.innerHTML = `
    <h2>Generated Exam Paper</h2>
    <p class="paper-meta">
      ${state.level?.replace("-", " ").toUpperCase()} &mdash;
      ${formatSubjectLabel(state.subject)}
      ${state.paperNumber !== null ? ` &mdash; Paper ${state.paperNumber}` : ""} &mdash;
      ${paper.length} Questions
      ${seed !== null ? `&mdash; Seed: <code>${seed}</code>` : ""}
    </p>
  `;
  container.appendChild(header);

  paper.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "question-card";

    const topicBadges = q.topics
      .map((t) => `<span class="topic-badge">${t}</span>`)
      .join(" ");

    // Page-range label shown in the question header source info
    const sp = q.startPage ?? 1;
    const ep = q.endPage   ?? sp;
    const pageLabel = ep > sp ? `pp. ${sp}–${ep}` : `p. ${sp}`;

    const cropInfo = q.crop || null;
    const canRenderCrop = Boolean(cropInfo?.cropped && sp === ep);

    div.innerHTML = `
      <div class="question-header">
        <span class="question-number">Question ${i + 1}</span>
        <span class="question-topics">${topicBadges}</span>
        <span class="question-source" title="${q.pdfUrl}">${q.pdfUrl.split("/").pop()} — ${pageLabel}</span>
      </div>
      <div class="question-pages-section">
        <div class="question-pages-container"></div>
      </div>
    `;

    const pagesContainer = div.querySelector(".question-pages-container");
    container.appendChild(div);

    const context = {
      card: div,
      question: q,
      pageLabel,
      startPage: sp,
      endPage: ep,
    };
    state.renderedQuestionContexts.push(context);
    if (state.debugMode) {
      addLazyAiAnalysisPanel(context);
    }

    renderPdfWhenVisible(pagesContainer, () => {
      if (canRenderCrop) {
        renderPdfCrop(pagesContainer, q.pdfUrl, cropInfo);
      } else {
        renderPdfPages(pagesContainer, q.pdfUrl, sp, ep, q.blankPages ?? []);
      }
    });
  });
}

function renderMcqPaper(paper, seed) {
  const container = $("paper-container");
  container.innerHTML = "";
  state.renderedQuestionContexts = [];

  const header = document.createElement("div");
  header.className = "paper-header";
  header.innerHTML = `
    <h2>Generated Multiple Choice Paper</h2>
    <p class="paper-meta">
      ${state.level?.replace("-", " ").toUpperCase()} &mdash;
      ${formatSubjectLabel(state.subject)}
      ${state.paperNumber !== null ? ` &mdash; Paper ${state.paperNumber}` : ""} &mdash;
      ${paper.length} Questions
      ${seed !== null ? `&mdash; Seed: <code>${seed}</code>` : ""}
    </p>
  `;
  container.appendChild(header);

  const tableWrap = document.createElement("div");
  tableWrap.className = "mcq-table-wrap";

  const table = document.createElement("table");
  table.className = "mcq-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Question</th>
        <th>Answers</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");

  paper.forEach((q, i) => {
    const topicBadges = q.topics
      .map((t) => `<span class="topic-badge">${escapeHtml(t)}</span>`)
      .join(" ");
    const sourceName = q.pdfUrl.split("/").pop();
    const pageLabel = `p. ${q.page ?? q.startPage ?? 1}`;
    const options = q.options || {};

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="mcq-question-cell">
        <p class="mcq-question-title">Question ${i + 1}</p>
        <p class="mcq-stem">${escapeHtml(q.stem || "")}</p>
        <div class="mcq-meta">
          ${topicBadges}
          <span title="${escapeHtml(q.pdfUrl)}">${escapeHtml(sourceName)} &mdash; ${pageLabel}</span>
          <span>Original #${q.number}</span>
        </div>
      </td>
      <td>
        <ul class="mcq-answer-list">
          <li><strong>A.</strong> ${escapeHtml(options.A || "")}</li>
          <li><strong>B.</strong> ${escapeHtml(options.B || "")}</li>
          <li><strong>C.</strong> ${escapeHtml(options.C || "")}</li>
          <li><strong>D.</strong> ${escapeHtml(options.D || "")}</li>
        </ul>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tableWrap.appendChild(table);
  container.appendChild(tableWrap);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Render a single matched-keyword entry as an HTML badge showing the keyword,
 * its location (main body or sub-part), and a tooltip with the context line.
 *
 * @param {{ kw: string, location: 'main'|'sub', context: string }} mk
 * @returns {string} HTML string
 */
function renderKeywordBadge(mk) {
  const locClass = mk.location === "main" ? "ai-debug-loc--main" : "ai-debug-loc--sub";
  const locLabel = mk.location === "main" ? "main" : "sub";
  const ctxAttr  = mk.context ? ` title="${escapeHtml(mk.context)}"` : "";
  return `<span class="ai-debug-kw-item"><span class="ai-debug-loc ${locClass}"${ctxAttr}>${locLabel}</span> ${escapeHtml(mk.kw)}</span>`;
}

// ─── PDF page rendering (for images & tables) ─────────────────────────────────

/**
 * Cache of already-loaded PDF documents keyed by URL.
 * Avoids re-fetching the same file when the user toggles page views.
 * @type {Map<string, Promise<PDFDocumentProxy>>}
 */
const pdfDocCache = new Map();

/**
 * Return a (possibly cached) PDF document promise.
 * @param {string} url
 * @returns {Promise<PDFDocumentProxy>}
 */
function getCachedPdfDoc(url) {
  if (!pdfDocCache.has(url)) {
    pdfDocCache.set(url, loadPdf(url));
  }
  return pdfDocCache.get(url);
}

/**
 * Pixels to mask at the top of each rendered page (covers paper codes,
 * subject name, and session info in the Cambridge exam paper header).
 *
 * At the default render scale of 1.5, 1 PDF point ≈ 1.5 canvas pixels.
 * Cambridge headers typically span ~40 PDF points, so 60 px is sufficient
 * to hide the header while keeping question numbers and question text visible.
 */
const PDF_HEADER_MASK_PX = 60;

/**
 * Pixels to mask at the bottom of each rendered page (covers page numbers,
 * "Turn over" arrows, and © UCLES copyright notices in the footer).
 *
 * Reduced from 140 to 80 px to avoid cutting off question content that
 * appears near the bottom of a page.
 */
const PDF_FOOTER_MASK_PX = 80;

/**
 * Fill colour used for the header/footer mask rectangles.
 * Should match the page background so masked areas are invisible.
 */
const PDF_MASK_COLOR = "#ffffff";

/**
 * Render one or more PDF pages as <canvas> elements inside `container`.
 * Replaces any existing content with a loading indicator while working.
 * Pages listed in `blankPages` are silently skipped (not rendered).
 *
 * @param {HTMLElement} container
 * @param {string} pdfUrl
 * @param {number} startPage — 1-based
 * @param {number} endPage   — 1-based, inclusive
 * @param {number[]} [blankPages] — 1-based page numbers to skip (blank pages)
 */
async function renderPdfPages(container, pdfUrl, startPage, endPage, blankPages = []) {
  container.innerHTML =
    `<span class="page-loading">Loading ${startPage === endPage ? "page" : "pages"}…</span>`;
  try {
    const pdfDoc = await getCachedPdfDoc(pdfUrl);
    container.innerHTML = "";
    const skipSet = new Set(blankPages);
    for (let p = startPage; p <= endPage; p++) {
      if (skipSet.has(p)) continue; // skip blank pages
      const page     = await pdfDoc.getPage(p);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas   = document.createElement("canvas");
      canvas.width   = viewport.width;
      canvas.height  = viewport.height;
      canvas.className = "pdf-page-canvas";
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Mask the top and bottom margins to remove page headers (paper codes,
      // session info) and footers (page numbers, "Turn over", © UCLES notices).
      ctx.fillStyle = PDF_MASK_COLOR;
      ctx.fillRect(0, 0, canvas.width, PDF_HEADER_MASK_PX);
      ctx.fillRect(0, canvas.height - PDF_FOOTER_MASK_PX, canvas.width, PDF_FOOTER_MASK_PX);

      container.appendChild(canvas);
    }
  } catch (err) {
    container.innerHTML =
      `<span class="page-error">Could not render page: ${escapeHtml(err.message)}</span>`;
  }
}

async function renderPdfCrop(container, pdfUrl, crop) {
  const pageNumber = crop.page ?? 1;
  container.innerHTML = `<span class="page-loading">Loading cropped question…</span>`;
  try {
    const pdfDoc = await getCachedPdfDoc(pdfUrl);
    const page = await pdfDoc.getPage(pageNumber);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = viewport.width;
    sourceCanvas.height = viewport.height;
    const sourceCtx = sourceCanvas.getContext("2d");
    await page.render({ canvasContext: sourceCtx, viewport }).promise;

    const topPdfY = Math.min(viewport.height / scale, (crop.startY ?? 0) + 28);
    const bottomPdfY = crop.nextStartY != null
      ? Math.max(0, crop.nextStartY + 10)
      : PDF_FOOTER_MASK_PX / scale;
    const cropTop = Math.max(0, Math.floor(viewport.height - topPdfY * scale));
    const cropBottom = Math.min(
      viewport.height,
      Math.max(cropTop + 80, Math.ceil(viewport.height - bottomPdfY * scale))
    );
    const cropHeight = cropBottom - cropTop;

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = cropHeight;
    canvas.className = "pdf-page-canvas pdf-page-canvas--cropped";
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = PDF_MASK_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      sourceCanvas,
      0,
      cropTop,
      viewport.width,
      cropHeight,
      0,
      0,
      viewport.width,
      cropHeight
    );

    container.innerHTML = "";
    container.appendChild(canvas);
  } catch (err) {
    container.innerHTML =
      `<span class="page-error">Could not render cropped question: ${escapeHtml(err.message)}</span>`;
  }
}

// ─── Step 8: Download JSON ────────────────────────────────────────────────────

// Preview, download, and classroom upload all reuse the same generated PDF.
function defaultGeneratedPaperFileName() {
  const subject = formatSubjectLabel(state.subject || "Subject").replace(/[\\/:*?"<>|]+/g, "-");
  return `${subject} Generated Paper ${new Date().toISOString().slice(0, 10)}.pdf`;
}

async function ensureGeneratedPdf() {
  if (state.generatedPdf) return state.generatedPdf;
  if (!state.generatedPaper) {
    throw new Error("Generate a paper before using PDF actions.");
  }
  if (!window.jspdf?.jsPDF) {
    throw new Error("The PDF creator could not be loaded. Check the internet connection and retry.");
  }

  state.generatedPdf = {
    blob: await buildGeneratedPaperPdf(state.generatedPaper),
    fileName: state.generatedPaper.fileName,
  };
  return state.generatedPdf;
}

async function buildGeneratedPaperPdf(generatedPaper) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 16, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Generated Exam Paper", margin, 92);
  doc.setFontSize(15);
  doc.text(formatSubjectLabel(state.subject), margin, 126);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(11);
  doc.text([
    state.level?.replace("-", " ").toUpperCase(),
    state.paperNumber !== null ? `Paper ${state.paperNumber}` : null,
    `${generatedPaper.questions.length} questions`,
    `Prepared ${generatedPaper.generatedAt.toLocaleString()}`,
  ].filter(Boolean), margin, 158);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, 228, pageWidth - margin, 228);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Instructions", margin, 262);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(doc.splitTextToSize(
    "Answer all questions. Generated question numbers define the order of this paper; original past-paper numbering may remain visible inside each extract.",
    pageWidth - margin * 2
  ), margin, 284);
  addPdfFooter(doc, pageWidth, pageHeight);

  if (state.paperType === "mcq") {
    addMcqQuestionsToPdf(doc, generatedPaper.questions, pageWidth, pageHeight, margin);
  } else {
    for (let index = 0; index < generatedPaper.questions.length; index += 1) {
      const canvases = await renderQuestionToCanvases(generatedPaper.questions[index]);
      if (canvases.length === 0) {
        throw new Error(`Question ${index + 1} could not be rendered into the PDF.`);
      }
      canvases.forEach((canvas, pageIndex) => {
        doc.addPage();
        addQuestionHeading(doc, index + 1, pageIndex > 0, pageWidth);
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - 120;
        const scale = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
        const width = canvas.width * scale;
        const height = canvas.height * scale;
        doc.addImage(
          canvas.toDataURL("image/jpeg", 0.9),
          "JPEG",
          (pageWidth - width) / 2,
          76,
          width,
          height,
          undefined,
          "FAST"
        );
        addPdfFooter(doc, pageWidth, pageHeight);
      });
    }
  }
  return doc.output("blob");
}

function addQuestionHeading(doc, questionNumber, continued, pageWidth) {
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Question ${questionNumber}${continued ? " (continued)" : ""}`, 42, 44);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1.2);
  doc.line(42, 55, pageWidth - 42, 55);
}

function addPdfFooter(doc, pageWidth, pageHeight) {
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Generated with TutorsAtWork Exam AI", 42, pageHeight - 22);
  doc.text(String(doc.getNumberOfPages()), pageWidth - 42, pageHeight - 22, { align: "right" });
}

function addMcqQuestionsToPdf(doc, questions, pageWidth, pageHeight, margin) {
  let y = pageHeight;
  questions.forEach((question, index) => {
    const options = question.options || {};
    const wrapped = [
      question.stem || "",
      `A. ${options.A || ""}`,
      `B. ${options.B || ""}`,
      `C. ${options.C || ""}`,
      `D. ${options.D || ""}`,
    ].map((line) => doc.splitTextToSize(line, pageWidth - margin * 2));
    const requiredHeight = 46 + wrapped.reduce((total, lines) => total + lines.length * 13 + 5, 0);
    if (y + requiredHeight > pageHeight - 46) {
      doc.addPage();
      y = 44;
    }
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Question ${index + 1}`, margin, y);
    y += 22;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    wrapped.forEach((lines) => {
      doc.text(lines, margin, y);
      y += lines.length * 13 + 5;
    });
    doc.setDrawColor(219, 227, 239);
    doc.line(margin, y, pageWidth - margin, y);
    y += 24;
    addPdfFooter(doc, pageWidth, pageHeight);
  });
}

async function renderQuestionToCanvases(question) {
  const startPage = question.startPage ?? question.page ?? 1;
  const endPage = question.endPage ?? startPage;
  if (question.crop?.cropped && startPage === endPage) {
    return [await renderCropCanvas(question.pdfUrl, question.crop)];
  }

  const canvases = [];
  const blankPages = new Set(question.blankPages ?? []);
  for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
    if (!blankPages.has(pageNumber)) {
      canvases.push(await renderMaskedPageCanvas(question.pdfUrl, pageNumber));
    }
  }
  return canvases;
}

async function renderMaskedPageCanvas(pdfUrl, pageNumber) {
  const pdfDoc = await getCachedPdfDoc(pdfUrl);
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  ctx.fillStyle = PDF_MASK_COLOR;
  ctx.fillRect(0, 0, canvas.width, PDF_HEADER_MASK_PX);
  ctx.fillRect(0, canvas.height - PDF_FOOTER_MASK_PX, canvas.width, PDF_FOOTER_MASK_PX);
  return canvas;
}

async function renderCropCanvas(pdfUrl, crop) {
  const pdfDoc = await getCachedPdfDoc(pdfUrl);
  const page = await pdfDoc.getPage(crop.page ?? 1);
  const scale = 1.5;
  const viewport = page.getViewport({ scale });
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = viewport.width;
  sourceCanvas.height = viewport.height;
  const sourceCtx = sourceCanvas.getContext("2d");
  await page.render({ canvasContext: sourceCtx, viewport }).promise;
  const topPdfY = Math.min(viewport.height / scale, (crop.startY ?? 0) + 28);
  const bottomPdfY = crop.nextStartY != null
    ? Math.max(0, crop.nextStartY + 10)
    : PDF_FOOTER_MASK_PX / scale;
  const cropTop = Math.max(0, Math.floor(viewport.height - topPdfY * scale));
  const cropBottom = Math.min(
    viewport.height,
    Math.max(cropTop + 80, Math.ceil(viewport.height - bottomPdfY * scale))
  );
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = cropBottom - cropTop;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = PDF_MASK_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(sourceCanvas, 0, cropTop, viewport.width, canvas.height, 0, 0, viewport.width, canvas.height);
  return canvas;
}

async function onPreviewClick() {
  setLoading("preview-btn", true);
  setPaperActionStatus("Preparing PDF preview...");
  try {
    const pdf = await ensureGeneratedPdf();
    await renderGeneratedPdfPreview(pdf.blob);
    $("paper-preview-dialog").showModal();
    setPaperActionStatus("");
  } catch (error) {
    setPaperActionStatus(error.message || "Could not prepare PDF preview.", "error");
  } finally {
    setLoading("preview-btn", false);
  }
}

async function renderGeneratedPdfPreview(blob) {
  const container = $("paper-preview-pages");
  container.innerHTML = '<span class="page-loading">Rendering PDF preview...</span>';
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const pdfDoc = await window.pdfjsLib.getDocument({ data: bytes, verbosity: 0 }).promise;
  container.replaceChildren();
  for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber += 1) {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.35 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    container.appendChild(canvas);
  }
}

async function onDownloadClick() {
  setLoading("download-btn", true);
  setPaperActionStatus("Preparing PDF download...");
  try {
    const pdf = await ensureGeneratedPdf();
    if (hasTawNativeBridge()) {
      const result = await sendPdfToTaw("downloadPdf", pdf);
      setPaperActionStatus(result.message || "PDF saved.", "success");
      return;
    }

    const file = new File([pdf.blob], pdf.fileName, { type: "application/pdf" });
    if (/Android/i.test(navigator.userAgent) && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: pdf.fileName,
      });
      setPaperActionStatus("PDF opened in the device save/share menu.", "success");
      return;
    }

    const url = URL.createObjectURL(pdf.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdf.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setPaperActionStatus("PDF downloaded.", "success");
  } catch (error) {
    setPaperActionStatus(error.message || "Could not download the PDF.", "error");
  } finally {
    setLoading("download-btn", false);
  }
}

async function onUploadClassroomClick() {
  setLoading("upload-classroom-btn", true);
  setPaperActionStatus("Loading your classrooms...");
  try {
    const [pdf, classrooms] = await Promise.all([
      ensureGeneratedPdf(),
      loadTutorClassrooms(state.examContext),
    ]);
    if (classrooms.length === 0) {
      throw new Error("No classrooms created by this tutor were found.");
    }
    renderClassroomPicker(classrooms);
    $("classroom-upload-name").value = pdf.fileName;
    setClassroomUploadStatus("");
    $("classroom-upload-dialog").showModal();
    setPaperActionStatus("");
  } catch (error) {
    setPaperActionStatus(error.message || "Could not load classrooms.", "error");
  } finally {
    setLoading("upload-classroom-btn", false);
  }
}

function renderClassroomPicker(classrooms) {
  const list = $("classroom-upload-list");
  list.replaceChildren();
  classrooms.forEach((classroom, index) => {
    const label = document.createElement("label");
    label.className = "classroom-option";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "upload-classroom";
    radio.value = String(classroom.id);
    radio.checked = index === 0;
    const text = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = classroom.title;
    const detail = document.createElement("small");
    detail.textContent = `Classroom ${classroom.id}`;
    text.append(title, detail);
    label.append(radio, text);
    list.appendChild(label);
  });
}

function setClassroomUploadStatus(message, type = "info") {
  const status = $("classroom-upload-status");
  status.textContent = message;
  status.className = `status status--${type}`;
  status.hidden = !message;
}

async function onClassroomUploadSubmit(event) {
  event.preventDefault();
  if (event.submitter?.value === "cancel") {
    $("classroom-upload-dialog").close();
    return;
  }
  const classroomId = document.querySelector('input[name="upload-classroom"]:checked')?.value;
  const fileName = $("classroom-upload-name").value.trim();
  if (!classroomId || !fileName) {
    setClassroomUploadStatus("Choose a classroom and enter a PDF name.", "warn");
    return;
  }

  const confirm = $("classroom-upload-confirm");
  confirm.disabled = true;
  setClassroomUploadStatus("Uploading PDF to classroom notes...");
  try {
    const pdf = await ensureGeneratedPdf();
    const result = hasTawNativeBridge()
      ? await sendPdfToTaw("uploadPdf", { ...pdf, fileName }, {
          classroomId: Number(classroomId),
        })
      : await uploadGeneratedPaperToClassroom(state.examContext, {
          classroomId: Number(classroomId),
          fileName,
          pdfBlob: pdf.blob,
        });
    state.generatedPaper.fileName = result.fileName;
    state.generatedPdf.fileName = result.fileName;
    $("classroom-upload-dialog").close();
    setPaperActionStatus(
      result.message || `Uploaded to ${result.classroom.title} notes.`,
      "success"
    );
  } catch (error) {
    setClassroomUploadStatus(error.message || "Could not upload the PDF.", "error");
  } finally {
    confirm.disabled = false;
  }
}

function closePaperPreview() {
  $("paper-preview-dialog").close();
  $("paper-preview-pages").replaceChildren();
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  setWorkflowEnabled(false);

  $("exam-ai-title").addEventListener("click", onDebugTriggerClick);
  $("level-select-trigger").addEventListener("click", () => {
    const isOpen = $("level-select-trigger").getAttribute("aria-expanded") === "true";
    setSubjectDropdownOpen(false);
    setLevelDropdownOpen(!isOpen);
  });
  $("subject-select-trigger").addEventListener("click", () => {
    const isOpen = $("subject-select-trigger").getAttribute("aria-expanded") === "true";
    setLevelDropdownOpen(false);
    setSubjectDropdownOpen(!isOpen);
  });
  document.addEventListener("click", (event) => {
    if (!$("level-select-control").contains(event.target)) {
      setLevelDropdownOpen(false);
    }
    if (!$("subject-select-control").contains(event.target)) {
      setSubjectDropdownOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setLevelDropdownOpen(false);
      setSubjectDropdownOpen(false);
    }
  });
  const pdfReportMediaQuery = window.matchMedia("(max-width: 640px)");
  if (typeof pdfReportMediaQuery.addEventListener === "function") {
    pdfReportMediaQuery.addEventListener("change", onPdfReportLayoutChange);
  } else {
    pdfReportMediaQuery.addListener(onPdfReportLayoutChange);
  }

  // Wire up level + subject
  $("level-select").addEventListener("change", (event) => {
    renderLevelDropdown();
    onLevelChange(event);
  });
  $("subject-select").addEventListener("change", (event) => {
    renderSubjectDropdown();
    onSubjectChange(event);
  });

  // Scan
  $("scan-btn").addEventListener("click", onLoadFilesClick);

  document.querySelectorAll('input[name="paper-type"]').forEach((radio) => {
    radio.addEventListener("change", onPaperTypeChange);
  });

  // PDF selector — Select all / Deselect all
  $("pdf-select-all").addEventListener("click", () => {
    document.querySelectorAll(".pdf-cb").forEach((cb) => { cb.checked = true; });
  });
  $("pdf-deselect-all").addEventListener("click", () => {
    document.querySelectorAll(".pdf-cb").forEach((cb) => { cb.checked = false; });
  });

  // Build index
  $("build-index-btn").addEventListener("click", onBuildIndexClick);

  // Mode toggle
  document.querySelectorAll('input[name="mode"]').forEach((radio) => {
    radio.addEventListener("change", onModeChange);
  });

  // Generate
  $("generate-btn").addEventListener("click", onGenerateClick);

  // Download
  $("preview-btn").addEventListener("click", onPreviewClick);
  $("download-btn").addEventListener("click", onDownloadClick);
  $("upload-classroom-btn").addEventListener("click", onUploadClassroomClick);
  $("paper-preview-close").addEventListener("click", closePaperPreview);
  $("paper-preview-dialog").addEventListener("cancel", (event) => {
    event.preventDefault();
    closePaperPreview();
  });
  $("classroom-upload-form").addEventListener("submit", onClassroomUploadSubmit);

  // Hide all downstream sections at start
  [
    "subject-section",
    "paper-type-section",
    "paper-select-section",
    "scan-section",
    "index-section",
    "generate-section",
    "paper-section",
  ].forEach(hideSection);

  bootstrapExamAiSession();
}

document.addEventListener("DOMContentLoaded", init);

/**
 * app.js — UI state machine, event handlers, orchestration.
 *
 * Imports core.js and subjects/* for all processing logic.
 * PDF.js is expected on window.pdfjsLib (loaded via CDN in index.html).
 */

import {
  filterPdfsBySubjectLevel,
  buildIndex,
  generatePaper,
} from "./core.js";
import { TOPICS_O } from "./subjects/topics-o.js";
import { TOPICS_A } from "./subjects/topics-a.js";

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  level: null,          // 'o-level' | 'a-level'
  subject: null,        // 'maths' | 'physics' | 'computer-science'
  allUrls: [],          // all URLs from manifest for chosen level
  matchedUrls: [],      // filtered URLs after scanning
  questionIndex: [],    // built index
  manifest: null,       // loaded manifest.json
  topics: [],           // current topic list
};

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const $ = (id) => document.getElementById(id);

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

function setLoading(buttonId, loading) {
  const btn = $(buttonId);
  if (!btn) return;
  btn.disabled = loading;
  btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
  btn.textContent = loading ? btn.dataset.loadingText || "Working…" : btn.dataset.originalText;
}

function getTopics() {
  if (!state.level || !state.subject) return [];
  const map = state.level === "o-level" ? TOPICS_O : TOPICS_A;
  return map[state.subject] || [];
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

function onLevelChange(e) {
  state.level = e.target.value || null;
  state.subject = null;
  state.matchedUrls = [];
  state.questionIndex = [];

  // Reset subject selector
  const subjectSelect = $("subject-select");
  subjectSelect.value = "";

  // Hide downstream sections
  hideSection("scan-section");
  hideSection("index-section");
  hideSection("generate-section");
  hideSection("paper-section");

  if (state.level) {
    showSection("subject-section");
  } else {
    hideSection("subject-section");
  }
}

function onSubjectChange(e) {
  state.subject = e.target.value || null;
  state.matchedUrls = [];
  state.questionIndex = [];

  hideSection("index-section");
  hideSection("generate-section");
  hideSection("paper-section");

  if (state.subject && state.level) {
    showSection("scan-section");
    setStatus("scan", "");
  } else {
    hideSection("scan-section");
  }
}

// ─── Step 3: Scan PDFs ────────────────────────────────────────────────────────

async function onScanClick() {
  setLoading("scan-btn", true);
  setStatus("scan", "Loading manifest…");
  hideSection("index-section");
  hideSection("generate-section");
  hideSection("paper-section");

  try {
    const manifest = await loadManifest();
    const levelKey = state.level;    // 'o-level' or 'a-level'
    const subjectKey = state.subject; // 'maths' | 'physics' | 'computer-science'

    // Get all URLs listed in manifest for this level (all subjects combined)
    const levelData = manifest[levelKey] || {};
    const allLevelUrls = Object.values(levelData).flat();

    if (allLevelUrls.length === 0) {
      setStatus("scan", "No PDFs found in manifest for this level. Add PDFs and update manifest.json.", "warn");
      setLoading("scan-btn", false);
      return;
    }

    state.allUrls = allLevelUrls;
    setStatus("scan", `Scanning ${allLevelUrls.length} PDF(s)…`);

    state.matchedUrls = await filterPdfsBySubjectLevel(
      allLevelUrls,
      subjectKey,
      levelKey,
      (done, total) => {
        setStatus("scan", `Scanning… ${done}/${total}`);
      }
    );

    if (state.matchedUrls.length === 0) {
      setStatus(
        "scan",
        `No PDFs matched ${subjectKey} / ${levelKey}. Check your manifest and PDF filenames.`,
        "warn"
      );
    } else {
      setStatus(
        "scan",
        `✓ Matched ${state.matchedUrls.length} PDF(s) for ${subjectKey} (${levelKey}).`,
        "success"
      );
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
  setLoading("build-index-btn", true);
  setStatus("index", "Building question index…");
  hideSection("generate-section");
  hideSection("paper-section");

  state.topics = getTopics();
  state.questionIndex = [];

  try {
    state.questionIndex = await buildIndex(
      state.matchedUrls,
      state.topics,
      (done, total, url) => {
        const name = url ? url.split("/").pop() : "";
        setStatus("index", `Indexing… ${done}/${total}${name ? ` — ${name}` : ""}`);
      }
    );

    if (state.questionIndex.length === 0) {
      setStatus("index", "No questions found. PDFs may not be text-based or question format differs.", "warn");
    } else {
      setStatus(
        "index",
        `✓ Indexed ${state.questionIndex.length} question(s) from ${state.matchedUrls.length} PDF(s).`,
        "success"
      );
      buildTopicCheckboxes();
      showSection("generate-section");
    }
  } catch (err) {
    setStatus("index", `Error: ${err.message}`, "error");
    console.error(err);
  }
  setLoading("build-index-btn", false);
}

// ─── Topic checkboxes ─────────────────────────────────────────────────────────

function buildTopicCheckboxes() {
  const container = $("topic-checkboxes");
  container.innerHTML = "";
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

function onGenerateClick() {
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

  const paper = generatePaper(state.questionIndex, {
    topics: selectedTopics,
    count,
    seed,
  });

  if (paper.length === 0) {
    setStatus("generate", "No questions matched the selected filters.", "warn");
    return;
  }

  setStatus("generate", `✓ Generated ${paper.length} question(s).`, "success");
  renderPaper(paper, seed);
  showSection("paper-section");

  // Store for download
  $("download-btn").dataset.paper = JSON.stringify(
    {
      meta: {
        level: state.level,
        subject: state.subject,
        count: paper.length,
        seed: seed,
        generatedAt: new Date().toISOString(),
      },
      questions: paper.map((q, i) => ({
        index: i + 1,
        sourcePdf: q.pdfUrl,
        originalNumber: q.number,
        topics: q.topics,
        text: q.text,
      })),
    },
    null,
    2
  );
}

// ─── Step 7: Render paper ─────────────────────────────────────────────────────

function renderPaper(paper, seed) {
  const container = $("paper-container");
  container.innerHTML = "";

  const header = document.createElement("div");
  header.className = "paper-header";
  header.innerHTML = `
    <h2>Generated Exam Paper</h2>
    <p class="paper-meta">
      ${state.level?.replace("-", " ").toUpperCase()} &mdash;
      ${state.subject?.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())} &mdash;
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

    div.innerHTML = `
      <div class="question-header">
        <span class="question-number">Q${i + 1}</span>
        <span class="question-topics">${topicBadges}</span>
        <span class="question-source" title="${q.pdfUrl}">${q.pdfUrl.split("/").pop()}</span>
      </div>
      <pre class="question-text">${escapeHtml(q.text)}</pre>
    `;
    container.appendChild(div);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Step 8: Download JSON ────────────────────────────────────────────────────

function onDownloadClick() {
  const btn = $("download-btn");
  const data = btn.dataset.paper;
  if (!data) return;

  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `generated-paper-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  // Wire up level + subject
  $("level-select").addEventListener("change", onLevelChange);
  $("subject-select").addEventListener("change", onSubjectChange);

  // Scan
  $("scan-btn").addEventListener("click", onScanClick);

  // Build index
  $("build-index-btn").addEventListener("click", onBuildIndexClick);

  // Mode toggle
  document.querySelectorAll('input[name="mode"]').forEach((radio) => {
    radio.addEventListener("change", onModeChange);
  });

  // Generate
  $("generate-btn").addEventListener("click", onGenerateClick);

  // Download
  $("download-btn").addEventListener("click", onDownloadClick);

  // Hide all downstream sections at start
  [
    "subject-section",
    "scan-section",
    "index-section",
    "generate-section",
    "paper-section",
  ].forEach(hideSection);
}

document.addEventListener("DOMContentLoaded", init);

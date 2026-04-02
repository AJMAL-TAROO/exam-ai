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
  loadPdf,
} from "./core.js";
import { TOPICS_O } from "./subjects/topics-o.js";
import { TOPICS_A } from "./subjects/topics-a.js";

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  level: null,          // 'o-level' | 'a-level'
  subject: null,        // 'maths' | 'physics' | 'computer-science'
  allUrls: [],          // all URLs from manifest for chosen level
  matchedUrls: [],      // filtered URLs after scanning
  selectedPdfUrls: [],  // user-selected subset of matchedUrls for indexing
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
  state.selectedPdfUrls = [];
  state.questionIndex = [];

  // Reset subject selector
  const subjectSelect = $("subject-select");
  subjectSelect.value = "";

  // Hide downstream sections
  hideSection("scan-section");
  hideSection("index-section");
  hideSection("generate-section");
  hideSection("paper-section");

  // Clear PDF selector + report
  resetPdfSelectorAndReport();

  if (state.level) {
    showSection("subject-section");
  } else {
    hideSection("subject-section");
  }
}

function onSubjectChange(e) {
  state.subject = e.target.value || null;
  state.matchedUrls = [];
  state.selectedPdfUrls = [];
  state.questionIndex = [];

  hideSection("index-section");
  hideSection("generate-section");
  hideSection("paper-section");

  // Clear PDF selector + report
  resetPdfSelectorAndReport();

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

  // Clear any previous PDF selector and report
  resetPdfSelectorAndReport();

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
  // If the selector was not rendered (no matched PDFs yet), fall back to all matched URLs.
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

  // Clear previous report
  const reportEl = $("pdf-report");
  reportEl.innerHTML = "";
  reportEl.hidden = true;

  state.topics = getTopics();
  state.questionIndex = [];

  try {
    state.questionIndex = await buildIndex(
      state.selectedPdfUrls,
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
        `✓ Indexed ${state.questionIndex.length} question(s) from ${state.selectedPdfUrls.length} PDF(s).`,
        "success"
      );
      buildTopicCheckboxes();
      renderPdfReport();
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
  const reportEl = $("pdf-report");
  if (selectorEl) selectorEl.hidden = true;
  if (listEl) listEl.innerHTML = "";
  if (reportEl) { reportEl.innerHTML = ""; reportEl.hidden = true; }
  state.selectedPdfUrls = [];
}

/**
 * Build the PDF checkbox list inside #pdf-selector from state.matchedUrls.
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
 * → topic table for each selected PDF.
 */
function renderPdfReport() {
  const reportEl = $("pdf-report");
  reportEl.innerHTML = "";

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
      const table = document.createElement("table");
      table.className = "pdf-topic-table";

      table.innerHTML = `
        <thead>
          <tr>
            <th>#</th>
            <th>Question preview</th>
            <th>Assigned topic</th>
            <th>Pages</th>
          </tr>
        </thead>
      `;

      const tbody = document.createElement("tbody");
      questions.forEach((q, idx) => {
        const assignedId = (q.topics && q.topics[0]) || "unclassified";
        const assignedLabel = topicLabelMap.get(assignedId) || assignedId;

        const preview = (q.text || "").replace(/\s+/g, " ").trim().slice(0, 120);
        const previewText = preview.length < (q.text || "").trim().length
          ? preview + "…"
          : preview;

        const sp = q.startPage ?? "";
        const ep = q.endPage ?? sp;
        const pageRange = sp
          ? (ep && ep !== sp ? `${sp}–${ep}` : `${sp}`)
          : "—";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>${escapeHtml(previewText)}</td>
          <td><span class="topic-badge">${escapeHtml(assignedLabel)}</span></td>
          <td style="white-space:nowrap">${escapeHtml(pageRange)}</td>
        `;
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      entry.appendChild(table);
    }

    reportEl.appendChild(entry);
  });

  reportEl.hidden = false;
}

// ─── Topic checkboxes ─────────────────────────────────────────────────────────

function buildTopicCheckboxes() {
  const container = $("topic-checkboxes");
  container.innerHTML = "";

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
        pageRange: { startPage: q.startPage ?? 1, endPage: q.endPage ?? q.startPage ?? 1 },
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

    // Page-range label shown in the question header source info
    const sp = q.startPage ?? 1;
    const ep = q.endPage   ?? sp;
    const pageLabel = ep > sp ? `pp. ${sp}–${ep}` : `p. ${sp}`;

    // Build AI debug rows for topic scores
    const debug = q.debugInfo || {};
    const matchedLine  = debug.matchedLine  ?? "";
    const topicScores  = debug.topicScores  ?? [];
    const subParts     = debug.subParts     ?? [];
    const extractionMode        = debug.extractionMode        ?? "bold";
    const candidateHeadersFound = debug.candidateHeadersFound ?? 0;
    const lowTextCoverage       = debug.lowTextCoverage       ?? false;
    const avgCharsPerPage       = debug.avgCharsPerPage       ?? 0;

    // The single assigned topic for this question
    const assignedTopicId = q.topics[0] ?? "unclassified";
    const assignedTopicScore = topicScores.find((ts) => ts.id === assignedTopicId);
    const assignedLabel = assignedTopicScore?.label ?? assignedTopicId;
    const assignedKeywords = assignedTopicScore?.matchedKeywords ?? [];

    const topicScoreRows = topicScores
      .filter((ts) => ts.score > 0 || (ts.hybridScore ?? 0) > 0)
      .map(
        (ts) => {
          const hybrid = ts.hybridScore != null
            ? ts.hybridScore.toFixed(3)
            : "—";
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
        }
      )
      .join("");

    const subPartsHtml = subParts.length > 0
      ? subParts.map((p) => `<code class="ai-debug-subpart">(${escapeHtml(p)})</code>`).join(" ")
      : `<span class="ai-debug-muted">none detected</span>`;

    // Render extraction-mode badge with colour coding.
    const modeColour = extractionMode === "bold"
      ? "var(--color-success)"
      : extractionMode === "geometric"
        ? "var(--color-warn)"
        : "var(--color-error)";
    const modeBadge = `<span style="font-weight:600;color:${modeColour}">${escapeHtml(extractionMode)}</span>`;

    const coverageBadge = lowTextCoverage
      ? `<span style="color:var(--color-warn)">⚠ low (${avgCharsPerPage} chars/page avg)</span>`
      : `<span style="color:var(--color-success)">✓ ok (${avgCharsPerPage} chars/page avg)</span>`;

    div.innerHTML = `
      <div class="question-header">
        <span class="question-number">Q${i + 1}</span>
        <span class="question-topics">${topicBadges}</span>
        <span class="question-source" title="${q.pdfUrl}">${q.pdfUrl.split("/").pop()} — ${pageLabel}</span>
      </div>
      <details class="ai-debug-details">
        <summary class="ai-debug-summary">🤖 AI analysis</summary>
        <div class="ai-debug-body">
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
            <span class="ai-debug-label">Sub-parts found</span>
            <span class="ai-debug-value">${subPartsHtml}</span>
          </div>
          <div class="ai-debug-row ai-debug-row--assigned">
            <span class="ai-debug-label">Assigned topic</span>
            <span class="ai-debug-value">
              <strong>${escapeHtml(assignedLabel)}</strong>
              ${assignedKeywords.length > 0
                ? `&mdash; triggered by: <span class="ai-debug-kw-inline">${assignedKeywords.map(renderKeywordBadge).join(" ")}</span>`
                : `<span class="ai-debug-muted">(no keyword match — unclassified)</span>`}
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
                  <span class="ai-debug-value ai-debug-muted">No keywords matched — tagged as unclassified</span>
                </div>`
          }
        </div>
      </details>
      <div class="question-pages-section">
        <div class="question-pages-container"></div>
      </div>
    `;

    // Render pages immediately — no toggle needed; canvas is the primary view.
    const pagesContainer = div.querySelector(".question-pages-container");
    renderPdfPages(pagesContainer, q.pdfUrl, sp, ep, q.blankPages ?? []);

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

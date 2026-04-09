# Exam AI — Randomized Past-Paper Generator

A fully **client-side** (no backend, no API keys, no file uploads) static website
that generates randomized exam papers from bundled Cambridge-style past-paper PDFs
stored in this repository.

---

## Live Demo

Deploy to GitHub Pages (see [Deployment](#deployment)) and open `index.html` in
any modern browser.

---

## Features

- **Level selector** — O Level (IGCSE) or A Level (AS & A Level)
- **Subject selector** — Mathematics, Physics, or Computer Science
- **Paper selector** — for A-Level Computer Science, choose Paper 1, 2, 3, or 4
- **PDF scanning** — reads the first page of each bundled PDF and identifies
  matching papers using keyword detection (no syllabus codes required)
- **Question indexing** — extracts main questions (Q1 / Question 1 style) from
  text-based PDFs via PDF.js
- **Topic tagging** — automatically tags each question with syllabus topics using
  keyword scoring
- **Paper generation** — randomized selection of N questions, optionally filtered
  by topic and reproducible via seed
- **Download** — export the generated paper as `generated-paper.json`

---

## Repository Structure

```
exam-ai/
├── index.html              # Single-page UI
├── app.js                  # UI state machine & event handlers
├── core.js                 # PDF processing, question splitting, topic tagging, shuffle
├── topicScorer.js          # Hybrid TF-IDF + keyword topic scorer
├── pathUtils.js            # Asset path builder (buildPaperPath)
├── package.json            # npm test script (no runtime dependencies)
├── subjects/
│   ├── subject-detect.js   # Keyword-based subject/level detection
│   ├── topics-o.js         # O Level topic lists (Maths, Physics, CS)
│   └── topics-a.js         # A Level topic lists (Maths, Physics, CS)
├── tests/
│   ├── topicScorer.test.js # Unit tests for the hybrid scorer
│   └── paperPath.test.js   # Unit tests for buildPaperPath and manifest lookup
└── assets/
    └── manifest.json       # Lists all bundled PDF URLs per level, subject & paper
```

---

## Adding PDFs

1. **Place PDFs** in the `assets/` directory, organised by level, subject, and
   (for A-Level Computer Science) paper number:

   ```
   assets/
   ├── o-level/
   │   ├── maths/              ← O Level Maths papers here
   │   ├── physics/
   │   └── computer-science/
   └── a-level/
       ├── maths/              ← A Level Maths papers here
       ├── physics/
       └── computer-science/
           ├── question-papers/
           │   ├── paper-1/    ← A Level CS Paper 1 question papers here
           │   ├── paper-2/    ← A Level CS Paper 2 question papers here
           │   ├── paper-3/    ← A Level CS Paper 3 question papers here
           │   └── paper-4/    ← A Level CS Paper 4 question papers here
           └── marking-scheme/ ← A Level CS mark schemes (future use)
   ```

   > **Note:** Only text-based (not scanned/image) PDFs are supported.
   > Cambridge past papers are typically text-based.

   > **Path helper:** `pathUtils.js` exports `buildPaperPath(level, subject, resource, paperNumber)`
   > which constructs the canonical directory path, e.g.
   > `buildPaperPath("a-level", "computer-science", "question-papers", 1)`
   > → `"assets/a-level/computer-science/question-papers/paper-1"`.

2. **Update `assets/manifest.json`** to list every PDF URL.  
   The browser cannot enumerate directory contents, so every file must be
   listed explicitly.

   For **O Level / A Level Maths / Physics** the value is a flat array:

   ```json
   {
     "o-level": {
       "maths":            ["assets/o-level/maths/math_2023_p1.pdf"],
       "physics":          ["assets/o-level/physics/phys_2023_p1.pdf"],
       "computer-science": []
     },
     "a-level": {
       "maths":  [],
       "physics": []
     }
   }
   ```

   For **A-Level Computer Science** the value is an object keyed by paper:

   ```json
   {
     "a-level": {
       "computer-science": {
         "paper-1": [
           "assets/a-level/computer-science/question-papers/paper-1/9618_w23_qp_11.pdf"
         ],
         "paper-2": [],
         "paper-3": [],
         "paper-4": []
       }
     }
   }
   ```

   Paths are relative to the repository root (i.e., relative to `index.html`).

3. **Commit & push** — no build step required.

---

## How It Works

### PDF text extraction
PDF.js (loaded via CDN ESM) renders each page's text items. Items are clustered
into lines using a **tolerance-based y-coordinate grouping** (items within 4 PDF
units of each other are placed on the same line) rather than a simple integer
round, which reduces fragmentation caused by subscripts, superscripts, and
multi-font rows. Items within each line are sorted left→right.

Each extracted line may be prefixed with one or more marker characters that
carry additional signals to the question-detection logic:

| Marker | Meaning |
|--------|---------|
| `\x01` | First item is **bold** (from font metadata) |
| `\x02` | Line has a **large vertical gap** above it (≥ 1.8× median line spacing) |
| `\x03` | First item starts at the **left margin** (x < 120 PDF units) |

These markers are stripped before any text is displayed or exported.

### Header / footer cleaning
Common Cambridge boilerplate is stripped before question splitting:
`Turn over`, `© UCLES`, paper codes, blank page notices, standalone page
numbers, etc.

### Question splitting — three-tier detection
Question headers are detected using a three-tier fallback strategy so that
papers with non-standard font metadata still produce correct results:

1. **Bold mode** *(primary)*: requires the bold marker (`\x01`).  Most
   Cambridge papers render question numbers in bold, making this the most
   precise signal.
2. **Geometric mode** *(fallback)*: requires at least one geometric marker
   — large vertical gap (`\x02`) or left-margin position (`\x03`).  Used
   when bold font metadata is absent (e.g. non-standard or embedded fonts)
   but layout geometry is reliable.
3. **Pattern-only mode** *(last resort)*: all markers optional; matches any
   line that looks like a question header by text pattern alone.

In all modes the regex matches forms like:

```
Q1   Q 1   Question 1   1   (followed by text, not a sub-part)
```

Question numbers must be **monotonically increasing** (1, 2, 3 …).  A gap of
up to 2 is allowed, so if a single question header is missed the remaining
questions (e.g. Q4 after Q2) are still extracted rather than being discarded.

False-positive guards (mark allocations, units, dotted fill-ins, continuation
notices) and the minimum-body-length filter remain active in all modes.

### Low-text-coverage detection
Each indexed PDF is assessed for text coverage.  If the average extractable
character count falls below 200 characters/page the PDF is flagged as
**low-coverage** (likely image-heavy or scanned).  This flag is surfaced in
the per-question AI debug panel together with the average characters/page so
you can quickly identify papers that need attention.

### Extraction mode reporting
The AI debug panel (expandable under each question) now shows:
- **Extraction mode** — which tier (bold / geometric / pattern-only) was used
- **Candidate headers found** — how many lines were considered before filtering
- **Text coverage** — whether the source PDF had adequate extractable text

### Topic tagging
Each question is scored against all topics in the syllabus using a **hybrid
scorer** (`topicScorer.js`) that combines two signals:

1. **Keyword score** — keywords found in the question body are weighted by
   specificity (multi-word phrases score higher than single words) and position
   (main question body scores higher than sub-parts).  The raw score is
   normalised relative to the highest-scoring topic in the batch so that the
   best keyword match always contributes a normalised 1.0.
2. **TF-IDF cosine similarity** — the question text is compared to each
   topic's keyword list treated as a reference document using smooth TF-IDF
   vectors.  Terms shared by both documents are down-weighted (IDF), so
   subject-specific vocabulary carries more signal than common words.

The two signals are combined into a single hybrid score:

```
hybridScore = 0.6 × tfidfSimilarity + 0.4 × normalizedKeywordScore
```

Topics are ranked by hybrid score.  The highest-ranking topic whose score
meets the minimum threshold is assigned; questions that score below the
threshold are tagged `unclassified`.

The hybrid approach improves on keyword-only matching by:
- **Better disambiguation** — when multiple topics have keyword matches,
  TF-IDF vocabulary overlap breaks ties more accurately.
- **Reduced false positives** — a single incidental keyword match in
  an unrelated question produces a low hybrid score and can fall below
  the threshold.
- **Improved recall** — questions sharing topical vocabulary but lacking
  exact keyword matches still receive a non-zero TF-IDF component.

#### Tuning thresholds

`topicScorer.js` exports two configurable objects:

```js
// Minimum hybrid scores for each relatedness band
export const THRESHOLDS = {
  related:    0.15,  // raise for higher precision
  borderline: 0.05,  // lower for higher recall
};

// Mixture weights (must sum to 1.0)
export const WEIGHTS = {
  tfidf:   0.6,
  keyword: 0.4,
};
```

Increase `THRESHOLDS.related` to reduce false positives at the cost of more
`unclassified` questions.  Decrease `THRESHOLDS.borderline` to allow more
marginal matches through.  Adjust `WEIGHTS` to shift the balance between
semantic similarity and exact keyword matching.

The AI debug panel (expandable under each question) shows the raw keyword
score, the hybrid score, and the relatedness category (`related`,
`borderline`, or `not_related`) for every topic that scored above zero, so
you can see exactly why each question was assigned its topic.

### Seeded shuffle
The Mulberry32 algorithm provides a fast, deterministic PRNG. Providing the same
seed always produces the same paper from the same index.

---

## Testing

The project ships with a self-contained test suite that runs under Node.js (≥ 18)
with no additional dependencies:

```bash
npm test
# or run individual suites:
node tests/topicScorer.test.js
node tests/paperPath.test.js
```

The suite covers tokenisation, TF-IDF similarity, categorisation thresholds,
hybrid scoring, paraphrase-like detection, false-positive reduction, paper path
generation for each paper number (1–4), invalid-input rejection, and
manifest paper-URL lookup logic.

---

## Deployment

### GitHub Pages

1. Go to **Settings → Pages** in your repository.
2. Set **Source** to `Deploy from a branch` → branch `main` (or your default
   branch), folder `/ (root)`.
3. Click **Save**. GitHub Pages will serve `index.html` at
   `https://<your-org>.github.io/<repo-name>/`.

No build step is required — everything is plain HTML, CSS, and ES modules.

### Local development

Because ES modules require a proper HTTP origin (not `file://`), use any
static file server:

```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code
# Use the "Live Server" extension
```

Then open `http://localhost:8080` in your browser.

---

## Browser Support

Any modern browser supporting ES modules and the Fetch API:
Chrome 61+, Firefox 60+, Safari 11+, Edge 79+.

---

## Limitations

- **Scanned/image PDFs** will produce few or no questions because PDF.js can
  only extract text that is embedded in the PDF as actual text objects.  The
  app detects this situation and reports it as "low text coverage" in the debug
  panel, but it cannot recover question text from rendered images without an
  OCR engine (not included — keeping the app fully client-side and
  dependency-free).
- Question extraction relies on Cambridge-style numbering (`Q1`, `Question 1`,
  or a standalone `1` at the left margin in bold or with a large gap above).
  Papers with non-standard formats may not parse correctly.
- Geometric signals (left-margin position and vertical gap) are heuristics
  tuned for Cambridge A4 papers.  Papers with unusual layouts may require
  threshold adjustments in `core.js` (`LEFT_MARGIN_MAX_X`, `LARGE_GAP_MULTIPLIER`).
- The CDN for PDF.js requires an internet connection. For fully offline use,
  download the PDF.js dist files and update the `<script>` src in `index.html`.
- PDF files served from a different origin must allow CORS. Hosting PDFs in the
  same GitHub Pages repository avoids this issue entirely.

---

## License

MIT — see repository root for details.

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
├── subjects/
│   ├── subject-detect.js   # Keyword-based subject/level detection
│   ├── topics-o.js         # O Level topic lists (Maths, Physics, CS)
│   └── topics-a.js         # A Level topic lists (Maths, Physics, CS)
└── assets/
    └── manifest.json       # Lists all bundled PDF URLs per level & subject
```

---

## Adding PDFs

1. **Place PDFs** in the `assets/` directory, organised by level and subject:

   ```
   assets/
   ├── o-level/
   │   ├── maths/          ← O Level Maths papers here
   │   ├── physics/
   │   └── computer-science/
   └── a-level/
       ├── maths/          ← A Level Maths papers here
       ├── physics/
       └── computer-science/
   ```

   > **Note:** Only text-based (not scanned/image) PDFs are supported.
   > Cambridge past papers are typically text-based.

2. **Update `assets/manifest.json`** to list every PDF URL.  
   The browser cannot enumerate directory contents, so every file must be
   listed explicitly.

   ```json
   {
     "o-level": {
       "maths":            ["assets/o-level/maths/math_2023_p1.pdf"],
       "physics":          ["assets/o-level/physics/phys_2023_p1.pdf"],
       "computer-science": []
     },
     "a-level": {
       "maths":            [],
       "physics":          [],
       "computer-science": []
     }
   }
   ```

   Paths are relative to the repository root (i.e., relative to `index.html`).

3. **Commit & push** — no build step required.

---

## How It Works

### PDF text extraction
PDF.js (loaded via CDN ESM) renders each page's text items. Items are grouped
by their `y`-coordinate and sorted left→right within each row to reconstruct
natural reading order.

### Header / footer cleaning
Common Cambridge boilerplate is stripped before question splitting:
`Turn over`, `© UCLES`, paper codes, blank page notices, standalone page
numbers, etc.

### Question splitting
A regex matches main question starts of the form:

```
Q1   Q 1   Question 1   1   (followed by text, not a sub-part)
```

Question numbers must be monotonically increasing (1, 2, 3 …) to prevent
false positives from figures or sub-parts.

### Topic tagging
Each question is scored against a keyword list for every topic in the syllabus.
Topics whose score is ≥ 50 % of the best-scoring topic are assigned to the
question. Unmatched questions receive the tag `unclassified`.

### Seeded shuffle
The Mulberry32 algorithm provides a fast, deterministic PRNG. Providing the same
seed always produces the same paper from the same index.

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

- Only **text-based** PDFs are supported. Scanned image PDFs will produce no
  questions.
- Question extraction relies on Cambridge-style numbering (`Q1`, `Question 1`).
  Papers with non-standard formats may not parse correctly.
- The CDN for PDF.js requires an internet connection. For fully offline use,
  download the PDF.js dist files and update the `<script>` src in `index.html`.
- PDF files served from a different origin must allow CORS. Hosting PDFs in the
  same GitHub Pages repository avoids this issue entirely.

---

## License

MIT — see repository root for details.

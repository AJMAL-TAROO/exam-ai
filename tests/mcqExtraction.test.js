/**
 * tests/mcqExtraction.test.js
 *
 * Unit tests for section-aware written extraction and MCQ item parsing.
 */

import assert from "node:assert/strict";
import {
  generateMcqPaper,
  generatePaper,
  getMcqQuestionPages,
  getWrittenQuestionPages,
  isPeriodicTableReferencePage,
  isLikelyMcqInstructionBlock,
  mapQuestionToPhysicalPages,
  splitIntoMcqQuestions,
  splitIntoQuestions,
  trimTrailingPeriodicTablePages,
} from "../core.js";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log("\nMCQ extraction and section handling");

test("written extraction uses Section B and excludes Section A", () => {
  const pages = [
    [
      "SECTION A",
      "\x031 Which one is a vector quantity?",
      "A mass",
      "B time",
      "C velocity",
      "D temperature",
    ].join("\n"),
    [
      "SECTION B",
      "\x011 Define acceleration.",
      "Acceleration is the rate of change of velocity.",
      "Give the SI unit of acceleration.",
      "\x012 State Newton's second law.",
      "Force is equal to mass multiplied by acceleration.",
      "Use the law to calculate force.",
    ].join("\n"),
  ];

  const writtenPages = getWrittenQuestionPages(pages);
  assert.equal(writtenPages.length, 1);
  assert.ok(!writtenPages.join("\n").includes("Which one is a vector quantity"));

  const questions = splitIntoQuestions(writtenPages);
  assert.equal(questions.length, 2);
  assert.ok(questions[0].text.includes("Define acceleration"));
});

test("NCE written extraction drops first page before question splitting", () => {
  const pages = [
    [
      "NATIONAL CERTIFICATE OF EDUCATION",
      "READ THESE INSTRUCTIONS FIRST",
      "1. Write your index number in the space provided above.",
    ].join("\n"),
    [
      "\x031 Solve 2x + 5 = 13.",
      "Show your working.",
    ].join("\n"),
  ];

  const writtenPages = getWrittenQuestionPages(pages, { dropFirstPage: true });
  assert.equal(writtenPages.length, 2);
  assert.equal(writtenPages[0], "");
  assert.ok(writtenPages[1].includes("Solve 2x"));

  const questions = splitIntoQuestions(writtenPages);
  assert.equal(questions.length, 1);
  assert.equal(questions[0].startPage, 2);
  assert.ok(!questions[0].text.includes("Write your index number"));
});

test("NCE question-based extraction starts at flexible Question 2 markers", () => {
  const markerForms = [
    "Question 2",
    "Question 2.",
    "Question 2 (9 marks)",
    "Qu 2",
    "Qu 2.",
    "Qu. 2 (10 Marks)",
    "Q2",
    "Q 2 (8 marks)",
  ];

  for (const marker of markerForms) {
    const pages = [
      "NATIONAL CERTIFICATE OF EDUCATION",
      [
        "SECTION A",
        "\x034 Which one of the following represents an oxygen molecule?",
        "A H H",
        "B Cl Cl",
        "C F F",
        "D O O",
      ].join("\n"),
      [
        `\x01${marker} Define an acid.`,
        "Give one example.",
      ].join("\n"),
    ];

    const writtenPages = getWrittenQuestionPages(pages, {
      dropFirstPage: true,
      startAtQuestion2OrSectionB: true,
    });
    const text = writtenPages.join("\n");

    assert.ok(text.includes("Define an acid"), marker);
    assert.ok(!text.includes("oxygen molecule"), marker);
  }
});

test("NCE question-based extraction can start at numeric Question 2 after Section A", () => {
  const pages = [
    "NATIONAL CERTIFICATE OF EDUCATION",
    [
      "SECTION A",
      "\x034 Which one of the following represents an oxygen molecule?",
      "A H H",
      "B Cl Cl",
      "C F F",
      "D O O",
    ].join("\n"),
    [
      "\x012. Define an acid.",
      "Give one example.",
    ].join("\n"),
  ];

  const writtenPages = getWrittenQuestionPages(pages, {
    dropFirstPage: true,
    startAtQuestion2OrSectionB: true,
  });
  const questions = splitIntoQuestions(writtenPages, null, {
    allowedFirstQuestionNumbers: [1, 2],
  });

  assert.ok(writtenPages.join("\n").includes("Define an acid"));
  assert.ok(!writtenPages.join("\n").includes("oxygen molecule"));
  assert.equal(questions.length, 1);
  assert.equal(questions[0].number, 2);
});

test("NCE question-based extraction detects Question 2 split across nearby lines", () => {
  const pages = [
    "NATIONAL CERTIFICATE OF EDUCATION",
    [
      "SECTION A",
      "\x034 Which one of the following represents an oxygen molecule?",
      "A H H",
      "B Cl Cl",
      "C F F",
      "D O O",
    ].join("\n"),
    [
      "\x01Question",
      "2 (9 marks)",
      "(a) Match the symbol of each element to its correct name.",
    ].join("\n"),
  ];

  const writtenPages = getWrittenQuestionPages(pages, {
    dropFirstPage: true,
    startAtQuestion2OrSectionB: true,
  });
  const text = writtenPages.join("\n");

  assert.ok(text.includes("2 (9 marks)"));
  assert.ok(text.includes("Match the symbol"));
  assert.ok(!text.includes("oxygen molecule"));
});

test("physical page mapping restores PDF page numbers after virtual NCE drop", () => {
  const question = {
    number: 2,
    text: "Question 2",
    startPage: 1,
    endPage: 2,
    blankPages: [2],
    crop: {
      cropped: true,
      page: 1,
      startY: 720,
      nextStartY: null,
    },
  };

  const mapped = mapQuestionToPhysicalPages(question, 5);

  assert.equal(mapped.startPage, 6);
  assert.equal(mapped.endPage, 7);
  assert.deepEqual(mapped.blankPages, [7]);
  assert.equal(mapped.crop.page, 6);
});

test("question splitting records crop metadata between questions on the same page", () => {
  const pages = [
    [
      "\x031 Work out:",
      "451 + 236",
      "Answer:",
      "[1]",
      "\x032 Evaluate:",
      "7 / 9 - 5 / 9",
      "Answer:",
      "[1]",
      "\x033 Simplify (a^4)^5",
      "Answer:",
      "[1]",
      "\x034 Calculate 2.3 x 3",
      "Answer:",
      "[1]",
    ].join("\n"),
  ];
  const layouts = [[
    { y: 720 },
    { y: 690 },
    { y: 660 },
    { y: 640 },
    { y: 610 },
    { y: 580 },
    { y: 550 },
    { y: 530 },
    { y: 500 },
    { y: 470 },
    { y: 450 },
    { y: 420 },
    { y: 390 },
    { y: 370 },
  ]];

  const questions = splitIntoQuestions(pages, null, {
    pageLineLayouts: layouts,
    includeCropMeta: true,
  });

  assert.equal(questions.length, 4);
  assert.equal(questions[2].number, 3);
  assert.equal(questions[2].crop.cropped, true);
  assert.equal(questions[2].crop.page, 1);
  assert.equal(questions[2].crop.startY, 500);
  assert.equal(questions[2].crop.nextStartY, 420);
});

test("non-NCE written questions can also carry crop metadata", () => {
  const pages = [
    [
      "\x011 Define acceleration.",
      "Give the SI unit.",
      "[2]",
      "\x012 State Newton's second law.",
      "Use F = ma.",
      "[2]",
    ].join("\n"),
  ];
  const layouts = [[
    { y: 720 },
    { y: 690 },
    { y: 660 },
    { y: 600 },
    { y: 570 },
    { y: 540 },
  ]];

  const questions = splitIntoQuestions(pages, null, {
    pageLineLayouts: layouts,
    includeCropMeta: true,
  });

  assert.equal(questions.length, 2);
  assert.equal(questions[0].crop.cropped, true);
  assert.equal(questions[0].crop.page, 1);
  assert.equal(questions[0].crop.startY, 720);
  assert.equal(questions[0].crop.nextStartY, 600);
});

test("periodic table reference detection requires periodic table and elements", () => {
  assert.equal(
    isPeriodicTableReferencePage("THE PERIODIC TABLE OF ELEMENTS\nGroup I II III"),
    true
  );
  assert.equal(
    isPeriodicTableReferencePage("Periodic Table - selected chemical elements"),
    true
  );
  assert.equal(
    isPeriodicTableReferencePage("Complete the table of elements shown below."),
    false
  );
  assert.equal(
    isPeriodicTableReferencePage("Use the periodic table to answer the question."),
    false
  );
});

test("trailing periodic table trim drops the reference page and later pages", () => {
  const pages = [
    "\x011 Define ionic bonding.\nAnswer:",
    "\x012 Explain electrolysis.\nAnswer:",
    "The Periodic Table of Elements",
    "Extra blank/reference page",
  ];
  const layouts = [
    [{ y: 720 }],
    [{ y: 720 }],
    [{ y: 720 }],
    [{ y: 720 }],
  ];
  const result = trimTrailingPeriodicTablePages(pages, layouts);

  assert.equal(result.trimmed, true);
  assert.equal(result.trimmedFromPage, 3);
  assert.equal(result.texts.length, 2);
  assert.equal(result.layouts.length, 2);
  assert.ok(result.texts[0].includes("Define ionic bonding"));
  assert.ok(result.texts[1].includes("Explain electrolysis"));
});

test("written generation rejects whole MCQ instruction blocks", () => {
  const text = [
    "11. Circle the correct answer. Each item carries 1 mark.",
    "(a) 1.2 x 4 =",
    "A 0.46",
    "B 0.48",
    "C 4.6",
    "D 4.8",
    "(b) How many sides does a pentagon have?",
    "A 5",
    "B 6",
    "C 7",
    "D 8",
  ].join("\n");

  assert.equal(isLikelyMcqInstructionBlock(text), true);
});

test("written generation keeps normal geometry questions about circles", () => {
  const text = [
    "11. A circle has radius 7 cm.",
    "(a) Find the circumference of the circle.",
    "(b) Find the area of the circle.",
  ].join("\n");

  assert.equal(isLikelyMcqInstructionBlock(text), false);
});

test("mcq extraction uses Section A and excludes Section B", () => {
  const pages = [
    [
      "SECTION A",
      "\x031 Which one is a vector quantity?",
      "A mass",
      "B time",
      "C velocity",
      "D temperature",
    ].join("\n"),
    [
      "SECTION B",
      "\x011 Define acceleration.",
      "Acceleration is the rate of change of velocity.",
      "Give the SI unit of acceleration.",
    ].join("\n"),
  ];

  const mcqPages = getMcqQuestionPages(pages);
  const text = mcqPages.join("\n");
  assert.ok(text.includes("Which one is a vector quantity"));
  assert.ok(!text.includes("Define acceleration"));
});

test("extracts numbered MCQs with A-D options on separate lines", () => {
  const items = splitIntoMcqQuestions([
    [
      "\x031 Which device is used to input text?",
      "A monitor",
      "B keyboard",
      "C speaker",
      "D printer",
      "\x032 Which storage is volatile?",
      "A ROM",
      "B hard disk",
      "C RAM",
      "D optical disc",
    ].join("\n"),
  ]);

  assert.equal(items.length, 2);
  assert.equal(items[0].number, 1);
  assert.equal(items[0].page, 1);
  assert.equal(items[0].stem, "Which device is used to input text?");
  assert.equal(items[0].options.B, "keyboard");
  assert.equal(items[1].options.C, "RAM");
});

test("NCE MCQs start at subpart labels and ignore Section A instructions", () => {
  const items = splitIntoMcqQuestions([
    [
      "SECTION A",
      "Question 1 (15 marks)",
      "Circle the correct answer.  Each item carries one mark.",
      "(a) Which of the following is an input device?",
      "A Projector",
      "B Monitor",
      "C Mouse",
      "D Speaker",
    ].join("\n"),
  ], null, { mode: "nce-section-a" });

  assert.equal(items.length, 1);
  assert.equal(items[0].stem, "Which of the following is an input device?");
  assert.ok(!items[0].stem.includes("15 marks"));
  assert.ok(!items[0].stem.includes("Circle the correct answer"));
  assert.ok(!items[0].stem.includes("(a)"));
});

test("NCE MCQ extraction splits Section A by (a), (b), (c) labels", () => {
  const items = splitIntoMcqQuestions([
    [
      "SECTION A",
      "Question 1 (15 marks)",
      "(a) Which device is used to input text?",
      "A monitor",
      "B keyboard",
      "C speaker",
      "D printer",
      "(b) Which storage is volatile?",
      "A ROM",
      "B hard disk",
      "C RAM",
      "D optical disc",
    ].join("\n"),
  ], null, { mode: "nce-section-a" });

  assert.equal(items.length, 2);
  assert.equal(items[0].number, 1);
  assert.equal(items[0].label, "a");
  assert.equal(items[0].stem, "Which device is used to input text?");
  assert.equal(items[1].label, "b");
  assert.equal(items[1].stem, "Which storage is volatile?");
  assert.equal(items[1].options.C, "RAM");
});

test("NCE Section A stops before Question 2 when Section B is absent", () => {
  const pages = [
    [
      "SECTION A",
      "(a) Which device is used to input text?",
      "A monitor",
      "B keyboard",
      "C speaker",
      "D printer",
    ].join("\n"),
    [
      "Question 2",
      "Answer all questions in this section.",
      "Define the term input device.",
    ].join("\n"),
  ];

  const mcqPages = getMcqQuestionPages(pages);
  const text = mcqPages.join("\n");
  assert.ok(text.includes("Which device is used to input text"));
  assert.ok(!text.includes("Define the term input device"));
  assert.equal(mcqPages.length, 1);
});

test("NCE final MCQ option stops before page footer and Question 2 text", () => {
  const items = splitIntoMcqQuestions([
    [
      "SECTION A",
      "(o) The physical arrangement of a network is called a network ________________.",
      "A interface",
      "B drive",
      "C topology",
      "D security",
      "5",
      "Please turn over this page",
      "Marks",
      "Question 2 (10 Marks)",
      "Fill in the blanks with the correct word from the list given below.",
      "report podcasting troubleshooting hardware ownership HTML",
    ].join("\n"),
  ], null, { mode: "nce-section-a" });

  assert.equal(items.length, 1);
  assert.equal(items[0].options.D, "security");
  assert.ok(!items[0].options.D.includes("Please turn over"));
  assert.ok(!items[0].options.D.includes("Question 2"));
});

test("extracts options when A-D appear on shared PDF lines", () => {
  const items = splitIntoMcqQuestions([
    [
      "\x031 Which gas is needed for combustion?",
      "A oxygen  B nitrogen",
      "C argon  D carbon dioxide",
    ].join("\n"),
  ]);

  assert.equal(items.length, 1);
  assert.equal(items[0].options.A, "oxygen");
  assert.equal(items[0].options.D, "carbon dioxide");
});

test("rejects incomplete MCQs with fewer than four options", () => {
  const items = splitIntoMcqQuestions([
    [
      "\x031 Which gas is needed for combustion?",
      "A oxygen",
      "B nitrogen",
      "C argon",
    ].join("\n"),
  ]);

  assert.equal(items.length, 0);
});

test("MCQ generation filters by topic and remains seed reproducible", () => {
  const index = [
    { pdfUrl: "a.pdf", number: 1, stem: "S1", options: { A: "a", B: "b", C: "c", D: "d" }, topics: ["motion"] },
    { pdfUrl: "a.pdf", number: 2, stem: "S2", options: { A: "a", B: "b", C: "c", D: "d" }, topics: ["energy"] },
    { pdfUrl: "b.pdf", number: 1, text: "Written", topics: ["motion"] },
  ];

  const first = generateMcqPaper(index, { topics: ["motion"], count: 2, seed: 7 });
  const second = generateMcqPaper(index, { topics: ["motion"], count: 2, seed: 7 });

  assert.equal(first.length, 1);
  assert.equal(first[0].stem, "S1");
  assert.deepEqual(first.map((q) => q.number), second.map((q) => q.number));
});

test("mixed written generation excludes unclassified questions", () => {
  const index = [
    { pdfUrl: "a.pdf", number: 1, text: "Classified", topics: ["motion"] },
    { pdfUrl: "a.pdf", number: 2, text: "Unclassified", topics: ["unclassified"] },
  ];

  const paper = generatePaper(index, { topics: null, count: 10, seed: 3 });

  assert.equal(paper.length, 1);
  assert.equal(paper[0].number, 1);
});

test("mixed MCQ generation excludes unclassified questions", () => {
  const index = [
    { pdfUrl: "a.pdf", number: 1, stem: "S1", options: { A: "a", B: "b", C: "c", D: "d" }, topics: ["motion"] },
    { pdfUrl: "a.pdf", number: 2, stem: "S2", options: { A: "a", B: "b", C: "c", D: "d" }, topics: ["unclassified"] },
  ];

  const paper = generateMcqPaper(index, { topics: null, count: 10, seed: 3 });

  assert.equal(paper.length, 1);
  assert.equal(paper[0].number, 1);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);

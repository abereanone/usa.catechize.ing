import { promises as fs } from "node:fs";
import path from "node:path";

import {
  QUESTION_CONTENT_DIR,
  ROOT_DIR,
  serializeQuestionFrontmatter,
} from "./lib/questions-core.mjs";

const SOURCE_FILE = path.join(ROOT_DIR, "scripts", "patriots_catechism_extracted.txt");
const AUTHOR_ID = "jdhall";

const RANGE_CATEGORIES = [
  { start: 1, end: 15, category: "foundations" },
  { start: 16, end: 38, category: "revolution" },
  { start: 39, end: 88, category: "legislature" },
  { start: 89, end: 179, category: "powers" },
  { start: 180, end: 228, category: "executive" },
  { start: 229, end: 272, category: "judiciary" },
  { start: 273, end: 342, category: "rights" },
];

async function main() {
  const raw = await fs.readFile(SOURCE_FILE, "utf8");
  const entries = parseEntries(raw);

  if (entries.length !== 342) {
    throw new Error(`Expected 342 questions but parsed ${entries.length}.`);
  }

  await removeExistingQuestionFiles();

  for (const entry of entries) {
    const slug = `pc-${entry.id}`;
    const frontmatter = serializeQuestionFrontmatter({
      id: entry.id,
      title: entry.question,
      slug,
      categories: [getRangeCategory(entry.id)],
      authorId: AUTHOR_ID,
    });
    const body = normalizeWhitespace(entry.answer);
    const document = `${frontmatter}\n\n${body}\n`;
    await fs.writeFile(path.join(QUESTION_CONTENT_DIR, `${slug}.md`), document, "utf8");
  }

  console.log(`Imported ${entries.length} Patriot's Catechism questions.`);
}

function parseEntries(raw) {
  const lines = raw.split(/\r?\n/u);
  const entries = [];
  let started = false;
  let pendingNumber = null;
  let current = null;
  let inAnswer = false;

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine);
    if (!line || line.startsWith("===== PAGE ")) {
      continue;
    }

    if (!started) {
      if (/^1[.,]?$/u.test(line)) {
        started = true;
        pendingNumber = 1;
      }
      continue;
    }

    if (line === "PASTOR JD HALL") {
      break;
    }

    const numberedLine = line.match(/^(\d+)[.,]?$/u);
    if (numberedLine) {
      pendingNumber = Number(numberedLine[1]);
      continue;
    }

    if (line.startsWith("Q.")) {
      if (current) {
        entries.push(finalizeEntry(current, entries.length + 1));
      }

      current = {
        printedNumber: pendingNumber,
        questionLines: [line.slice(2).trim()],
        answerLines: [],
      };
      pendingNumber = null;
      inAnswer = false;
      continue;
    }

    if (!current) {
      continue;
    }

    if (!inAnswer) {
      if (line.startsWith("A.")) {
        current.answerLines.push(line.slice(2).trim());
        inAnswer = true;
      } else {
        current.questionLines.push(line);
      }
      continue;
    }

    if (line.startsWith("A.")) {
      current.answerLines.push(line.slice(2).trim());
    } else {
      current.answerLines.push(line);
    }
  }

  if (current) {
    entries.push(finalizeEntry(current, entries.length + 1));
  }

  return entries;
}

function finalizeEntry(entry, sequenceId) {
  return {
    id: sequenceId,
    printedNumber: entry.printedNumber,
    question: normalizeWhitespace(entry.questionLines.join(" ")),
    answer: normalizeWhitespace(entry.answerLines.join(" ")),
  };
}

function getRangeCategory(id) {
  const match = RANGE_CATEGORIES.find((range) => id >= range.start && id <= range.end);
  if (!match) {
    throw new Error(`No range category configured for question ${id}.`);
  }
  return match.category;
}

async function removeExistingQuestionFiles() {
  const files = await fs.readdir(QUESTION_CONTENT_DIR);

  for (const fileName of files) {
    if (!fileName.endsWith(".md")) {
      continue;
    }

    await fs.unlink(path.join(QUESTION_CONTENT_DIR, fileName));
  }
}

function normalizeLine(value) {
  return normalizeWhitespace(
    String(value)
      .replace(/\u00a0/gu, " ")
      .replace(/[“”]/gu, '"')
      .replace(/[‘’]/gu, "'")
      .replace(/[–—]/gu, "-")
      .replace(/…/gu, "...")
  );
}

function normalizeWhitespace(value) {
  return String(value)
    .replace(/\s+/gu, " ")
    .trim();
}

await main();

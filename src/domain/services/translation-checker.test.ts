import { describe, expect, test } from "bun:test";
import {
  checkLines,
  checkSectionLines,
  checkSectionOrder,
  checkSectionTitleMatch,
  extractHeadings,
} from "./translation-checker.js";

describe("checkLines", () => {
  test("returns error with correct difference calculation", () => {
    const result = checkLines(10, 8, "README.ja.md");
    expect(result).toEqual({
      file: "README.ja.md",
      type: "line-count",
      counts: {
        expected: 10,
        actual: 8,
      },
    });
  });
});

describe("checkSectionOrder", () => {
  test("detects section count mismatch", () => {
    const sourceHeadings = [
      { level: 1, text: "Title", line: 1 },
      { level: 2, text: "Section", line: 3 },
    ];
    const targetHeadings = [{ level: 1, text: "Title", line: 1 }];
    const result = checkSectionOrder(
      sourceHeadings,
      targetHeadings,
      "README.ja.md",
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe("section-count");
  });

  test("detects level mismatch", () => {
    const sourceHeadings = [
      { level: 1, text: "Title", line: 1 },
      { level: 2, text: "Section", line: 3 },
    ];
    const targetHeadings = [
      { level: 1, text: "タイトル", line: 1 },
      { level: 3, text: "セクション", line: 3 },
    ];
    const result = checkSectionOrder(
      sourceHeadings,
      targetHeadings,
      "README.ja.md",
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe("section-structure");
  });
});

describe("checkSectionLines", () => {
  test("detects line position mismatch", () => {
    const sourceHeadings = [
      { level: 1, text: "Title", line: 1 },
      { level: 2, text: "Section", line: 10 },
    ];
    const targetHeadings = [
      { level: 1, text: "タイトル", line: 1 },
      { level: 2, text: "セクション", line: 15 },
    ];
    const result = checkSectionLines(
      sourceHeadings,
      targetHeadings,
      "README.ja.md",
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe("section-position");
    if (result[0]?.type === "section-position") {
      expect(result[0].expected).toBe(10);
      expect(result[0].actual).toBe(15);
    }
  });
});

describe("checkSectionTitleMatch", () => {
  test("detects title mismatch", () => {
    const sourceHeadings = [
      { level: 1, text: "Installation", line: 1 },
      { level: 2, text: "Usage", line: 10 },
    ];
    const targetHeadings = [
      { level: 1, text: "インストール", line: 1 },
      { level: 2, text: "使い方", line: 10 },
    ];
    const result = checkSectionTitleMatch(
      sourceHeadings,
      targetHeadings,
      "README.ja.md",
    );
    expect(result).toHaveLength(2);
    expect(result[0]?.type).toBe("section-title");
  });
});

describe("extractHeadings", () => {
  test("extracts headings from markdown", () => {
    const content = `# Title
Some text
## Section 1
More text
### Subsection
## Section 2`;

    const headings = extractHeadings(content);
    expect(headings).toEqual([
      { level: 1, text: "Title", line: 1 },
      { level: 2, text: "Section 1", line: 3 },
      { level: 3, text: "Subsection", line: 5 },
      { level: 2, text: "Section 2", line: 6 },
    ]);
  });

  test("ignores headings inside code blocks", () => {
    const content = `# Real Heading
\`\`\`
# Code Heading
## Not a heading
\`\`\`
## Real Section`;

    const headings = extractHeadings(content);
    expect(headings).toEqual([
      { level: 1, text: "Real Heading", line: 1 },
      { level: 2, text: "Real Section", line: 6 },
    ]);
  });
});

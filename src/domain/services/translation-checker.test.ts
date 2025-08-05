import { describe, expect, test } from "bun:test";
import {
  checkChanges,
  checkHeadings,
  checkLines,
  extractHeadings,
} from "./translation-checker.js";

describe("checkLines", () => {
  test("returns null when line counts match", () => {
    const result = checkLines(10, 10, "README.ja.md");
    expect(result).toBeNull();
  });

  test("returns error when line counts don't match", () => {
    const result = checkLines(10, 8, "README.ja.md");
    expect(result).toEqual({
      file: "README.ja.md",
      type: "lines-mismatch",
      details: "Line count mismatch: source has 10 lines, target has 8 lines",
    });
  });
});

describe("checkChanges", () => {
  test("returns empty array when all changes are reflected", () => {
    const sourceChanges = [1, 5, 10];
    const targetChanges = [1, 5, 10, 12]; // Target can have additional changes
    const result = checkChanges(sourceChanges, targetChanges, "README.ja.md");
    expect(result).toEqual([]);
  });

  test("returns errors for missing changes", () => {
    const sourceChanges = [1, 5, 10];
    const targetChanges = [1, 10]; // Missing line 5
    const result = checkChanges(sourceChanges, targetChanges, "README.ja.md");
    expect(result).toEqual([
      {
        file: "README.ja.md",
        type: "line-missing",
        line: 5,
        details: "Line 5 was changed in source but not in target",
      },
    ]);
  });

  test("returns multiple errors for multiple missing changes", () => {
    const sourceChanges = [1, 5, 10, 15];
    const targetChanges = [1]; // Missing lines 5, 10, 15
    const result = checkChanges(sourceChanges, targetChanges, "README.ja.md");
    expect(result).toHaveLength(3);
    expect(result[0]?.line).toBe(5);
    expect(result[1]?.line).toBe(10);
    expect(result[2]?.line).toBe(15);
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

  test("handles empty lines", () => {
    const content = `# Title

## Section`;

    const headings = extractHeadings(content);
    expect(headings).toEqual([
      { level: 1, text: "Title", line: 1 },
      { level: 2, text: "Section", line: 3 },
    ]);
  });
});

describe("checkHeadings", () => {
  test("returns empty array when headings match", () => {
    const sourceHeadings = [
      { level: 1, text: "Title", line: 1 },
      { level: 2, text: "Section", line: 3 },
    ];
    const targetHeadings = [
      { level: 1, text: "Title", line: 1 },
      { level: 2, text: "Section", line: 5 }, // Different line number is OK
    ];

    const errors = checkHeadings(
      sourceHeadings,
      targetHeadings,
      "README.ja.md",
    );
    expect(errors).toEqual([]);
  });

  test("returns error when heading count differs", () => {
    const sourceHeadings = [
      { level: 1, text: "Title", line: 1 },
      { level: 2, text: "Section", line: 3 },
    ];
    const targetHeadings = [{ level: 1, text: "Title", line: 1 }];

    const errors = checkHeadings(
      sourceHeadings,
      targetHeadings,
      "README.ja.md",
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]?.type).toBe("headings-mismatch");
    expect(errors[0]?.details).toContain("Heading count mismatch");
  });

  test("returns error when heading text differs", () => {
    const sourceHeadings = [{ level: 1, text: "Title", line: 1 }];
    const targetHeadings = [
      { level: 1, text: "タイトル", line: 1 }, // Japanese translation
    ];

    const errors = checkHeadings(
      sourceHeadings,
      targetHeadings,
      "README.ja.md",
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]?.type).toBe("headings-mismatch");
    expect(errors[0]?.heading).toBe("Title");
  });

  test("returns error when heading level differs", () => {
    const sourceHeadings = [{ level: 2, text: "Section", line: 1 }];
    const targetHeadings = [
      { level: 3, text: "Section", line: 1 }, // Different level
    ];

    const errors = checkHeadings(
      sourceHeadings,
      targetHeadings,
      "README.ja.md",
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]?.details).toContain("level 2");
    expect(errors[0]?.details).toContain("level 3");
  });
});

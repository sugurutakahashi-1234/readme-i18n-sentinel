import { describe, expect, test } from "bun:test";
import {
  checkChanges,
  checkHeadings,
  checkLines,
  extractHeadings,
} from "./translation-checker.js";

describe("checkLines", () => {
  test("returns error with correct difference calculation", () => {
    const result = checkLines(10, 8, "README.ja.md");
    expect(result).toEqual({
      file: "README.ja.md",
      type: "line-count-mismatch",
      counts: {
        expected: 10,
        actual: 8,
      },
    });
  });
});

describe("checkChanges", () => {
  test("detects multiple missing changes correctly", () => {
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
});

describe("checkHeadings", () => {
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
    // Should only have count mismatch error due to early return
    const error = errors[0];
    expect(error?.type).toBe("heading-count-mismatch");
    if (error?.type === "heading-count-mismatch") {
      expect(error.counts.expected).toBe(2);
      expect(error.counts.actual).toBe(1);
    }
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
    expect(errors).toHaveLength(2); // missing-heading + heading-mismatch
    const missingError = errors.find((e) => e.type === "missing-heading");
    expect(missingError).toBeDefined();
    if (missingError?.type === "missing-heading") {
      expect(missingError.heading.text).toBe("Title");
    }
    const mismatchError = errors.find((e) => e.type === "heading-mismatch");
    expect(mismatchError).toBeDefined();
    if (mismatchError?.type === "heading-mismatch") {
      expect(mismatchError.heading.expected.text).toBe("Title");
      expect(mismatchError.heading.actual.text).toBe("タイトル");
    }
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
    expect(errors).toHaveLength(2); // missing-heading + heading-mismatch
    const missingError = errors.find((e) => e.type === "missing-heading");
    expect(missingError).toBeDefined();
    if (missingError?.type === "missing-heading") {
      expect(missingError.heading.text).toBe("Section");
    }
    const mismatchError = errors.find((e) => e.type === "heading-mismatch");
    expect(mismatchError).toBeDefined();
    if (mismatchError?.type === "heading-mismatch") {
      expect(mismatchError.heading.expected.level).toBe(2);
      expect(mismatchError.heading.actual.level).toBe(3);
    }
  });
});

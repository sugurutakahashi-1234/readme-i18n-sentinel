import { describe, expect, test } from "bun:test";
import {
  checkCodeBlockMatch,
  checkLines,
  checkSectionLines,
  checkSectionOrder,
  checkSectionTitleMatch,
  extractCodeBlocks,
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

describe("extractCodeBlocks", () => {
  test("extracts code blocks with correct content", () => {
    const content = `# Title
Some text
\`\`\`bash
npm install
\`\`\`
More text`;
    const headings = extractHeadings(content);
    const blocks = extractCodeBlocks(content, headings);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      content: "```bash\nnpm install\n```",
      line: 3,
      section: "# Title",
    });
  });

  test("extracts multiple code blocks", () => {
    const content = `# Installation
\`\`\`bash
npm install
\`\`\`
## Usage
\`\`\`javascript
console.log("hello");
\`\`\``;
    const headings = extractHeadings(content);
    const blocks = extractCodeBlocks(content, headings);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.content).toBe("```bash\nnpm install\n```");
    expect(blocks[0]?.section).toBe("# Installation");
    expect(blocks[1]?.content).toBe(
      '```javascript\nconsole.log("hello");\n```',
    );
    expect(blocks[1]?.section).toBe("## Usage");
  });

  test("handles empty lines in code blocks", () => {
    const content = `# Title
\`\`\`python
def hello():

    print("world")
\`\`\``;
    const headings = extractHeadings(content);
    const blocks = extractCodeBlocks(content, headings);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.content).toBe(
      '```python\ndef hello():\n\n    print("world")\n```',
    );
  });

  test("detects indented code blocks in lists", () => {
    const content = `# Installation

1. First step
   \`\`\`bash
   npm install
   \`\`\`

2. Second step
   \`\`\`javascript
   console.log("test");
   \`\`\``;

    const headings = extractHeadings(content);
    const blocks = extractCodeBlocks(content, headings);

    // Should detect both indented code blocks
    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.content).toBe("   ```bash\n   npm install\n   ```");
    expect(blocks[0]?.section).toBe("# Installation");
    expect(blocks[1]?.content).toBe(
      '   ```javascript\n   console.log("test");\n   ```',
    );
    expect(blocks[1]?.section).toBe("# Installation");
  });
});

describe("checkCodeBlockMatch", () => {
  test("detects content mismatch", () => {
    const sourceBlocks = [
      {
        content: "```bash\nnpm install\n```",
        line: 3,
        section: "# Installation",
      },
    ];
    const targetBlocks = [
      {
        content: "```bash\nyarn install\n```",
        line: 3,
        section: "# Installation",
      },
    ];
    const errors = checkCodeBlockMatch(
      sourceBlocks,
      targetBlocks,
      "README.ja.md",
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toEqual({
      type: "code-block",
      file: "README.ja.md",
      line: 3,
      expected: "```bash\nnpm install\n```",
      actual: "```bash\nyarn install\n```",
      section: "# Installation",
    });
  });

  test("detects missing code blocks", () => {
    const sourceBlocks = [
      {
        content: "```bash\nnpm install\n```",
        line: 3,
        section: "# Installation",
      },
      { content: "```bash\nnpm test\n```", line: 7, section: "# Testing" },
    ];
    const targetBlocks = [
      {
        content: "```bash\nnpm install\n```",
        line: 3,
        section: "# Installation",
      },
    ];
    const errors = checkCodeBlockMatch(
      sourceBlocks,
      targetBlocks,
      "README.ja.md",
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]?.type).toBe("code-block");
    expect(errors[0]?.expected).toBe("```bash\nnpm test\n```");
    expect(errors[0]?.actual).toBe("");
    expect(errors[0]?.line).toBeUndefined(); // Should not have line for missing blocks
  });

  test("detects extra code blocks", () => {
    const sourceBlocks = [
      {
        content: "```bash\nnpm install\n```",
        line: 3,
        section: "# Installation",
      },
    ];
    const targetBlocks = [
      {
        content: "```bash\nnpm install\n```",
        line: 3,
        section: "# Installation",
      },
      { content: "```bash\nnpm test\n```", line: 7, section: "# Testing" },
    ];
    const errors = checkCodeBlockMatch(
      sourceBlocks,
      targetBlocks,
      "README.ja.md",
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]?.type).toBe("code-block");
    expect(errors[0]?.expected).toBe("");
    expect(errors[0]?.actual).toBe("```bash\nnpm test\n```");
  });

  test("passes when code blocks match exactly", () => {
    const sourceBlocks = [
      {
        content: "```bash\nnpm install\n```",
        line: 3,
        section: "# Installation",
      },
      {
        content: '```js\nconsole.log("test");\n```',
        line: 7,
        section: "# Usage",
      },
    ];
    const targetBlocks = [
      {
        content: "```bash\nnpm install\n```",
        line: 3,
        section: "# Installation",
      },
      {
        content: '```js\nconsole.log("test");\n```',
        line: 7,
        section: "# Usage",
      },
    ];
    const errors = checkCodeBlockMatch(
      sourceBlocks,
      targetBlocks,
      "README.ja.md",
    );
    expect(errors).toHaveLength(0);
  });
});

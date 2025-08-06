import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  detectReadmeFiles,
  shouldUseAutoDetection,
} from "./readme-detector.js";

describe("readme-detector", () => {
  describe("detectReadmeFiles", () => {
    beforeEach(() => {
      mock.restore();
    });

    test("detects source and target files correctly", async () => {
      mock.module("../../infrastructure/adapters/glob.adapter.js", () => ({
        findFilesByPattern: mock(() =>
          Promise.resolve([
            "README.md",
            "README.ja.md",
            "README.zh-CN.md",
            "README.es.md",
          ]),
        ),
      }));

      const result = await detectReadmeFiles();

      expect(result.source).toBe("README.md");
      expect(result.targets).toEqual([
        "README.ja.md",
        "README.zh-CN.md",
        "README.es.md",
      ]);
    });

    test("returns null source when README.md is not found", async () => {
      mock.module("../../infrastructure/adapters/glob.adapter.js", () => ({
        findFilesByPattern: mock(() =>
          Promise.resolve(["README.ja.md", "README.zh-CN.md"]),
        ),
      }));

      const result = await detectReadmeFiles();

      expect(result.source).toBeNull();
      expect(result.targets).toEqual([]);
    });

    test("ignores non-translation README files", async () => {
      mock.module("../../infrastructure/adapters/glob.adapter.js", () => ({
        findFilesByPattern: mock(() =>
          Promise.resolve([
            "README.md",
            "README.ja.md",
            "README-old.md", // Should be ignored
            "README2.md", // Should be ignored
            "README_backup.md", // Should be ignored
          ]),
        ),
      }));

      const result = await detectReadmeFiles();

      expect(result.source).toBe("README.md");
      expect(result.targets).toEqual(["README.ja.md"]);
    });

    test("handles empty directory", async () => {
      mock.module("../../infrastructure/adapters/glob.adapter.js", () => ({
        findFilesByPattern: mock(() => Promise.resolve([])),
      }));

      const result = await detectReadmeFiles();

      expect(result.source).toBeNull();
      expect(result.targets).toEqual([]);
    });

    test("handles directory with only target files", async () => {
      mock.module("../../infrastructure/adapters/glob.adapter.js", () => ({
        findFilesByPattern: mock(() =>
          Promise.resolve(["docs/README.ja.md", "docs/README.zh-CN.md"]),
        ),
      }));

      const result = await detectReadmeFiles();

      expect(result.source).toBeNull();
      expect(result.targets).toEqual([]);
    });
  });

  describe("shouldUseAutoDetection", () => {
    test("returns true when no CLI source", () => {
      expect(shouldUseAutoDetection(false)).toBe(true);
    });

    test("returns false when CLI source is specified", () => {
      expect(shouldUseAutoDetection(true)).toBe(false);
    });
  });
});

/**
 * Configuration helpers for readme-i18n-sentinel
 *
 * This file provides type-safe configuration utilities for TypeScript users.
 */

import type { Config } from "./domain/models/config.js";

// Re-export the type
export type { Config } from "./domain/models/config.js";

/**
 * Helper function to define configuration with type safety
 *
 * @example
 * ```ts
 * // readme-i18n-sentinel.config.ts
 * import { defineConfig } from 'readme-i18n-sentinel/config';
 *
 * export default defineConfig({
 *   source: 'docs/README.md',
 *   target: 'docs/README.*.md',
 *   checks: {
 *     lines: true,
 *     changes: true,
 *     headingsMatchSource: true
 *   },
 *   output: {
 *     json: false
 *   }
 * });
 * ```
 *
 * @param config - The configuration options
 * @returns The same configuration object with type inference
 */
export function defineConfig(config: Config): Config {
  return config;
}

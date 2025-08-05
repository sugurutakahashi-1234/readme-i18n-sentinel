import { cosmiconfig } from "cosmiconfig";
import { TypeScriptLoader } from "cosmiconfig-typescript-loader";
import { getPackageName } from "../../domain/constants/package-info.js";
import { type Config, ConfigSchema } from "../../domain/models/config.js";
import { ConfigValidationError } from "../../domain/models/errors.js";
import { formatZodErrors } from "../../infrastructure/utils/zod-error-formatter.js";

export async function loadConfigUseCase(
  configPath?: string,
): Promise<Config | null> {
  const moduleName = getPackageName();

  // Cosmiconfig searches for configuration in the following places by default:
  // - package.json (under "readme-i18n-sentinel" property)
  // - .readme-i18n-sentinelrc (no extension)
  // - .readme-i18n-sentinelrc.{json,yaml,yml,js,ts,mjs,cjs}
  // - .config/readme-i18n-sentinelrc (no extension)
  // - .config/readme-i18n-sentinelrc.{json,yaml,yml,js,ts,mjs,cjs}
  // - readme-i18n-sentinel.config.{js,ts,mjs,cjs}
  // Note: .config.json and .config.yml/yaml are NOT included by default
  const explorer = cosmiconfig(moduleName, {
    loaders: {
      ".ts": TypeScriptLoader(),
    },
  });

  try {
    // Load configuration
    const result = configPath
      ? await explorer.load(configPath)
      : await explorer.search();

    if (!result || result.isEmpty) {
      return null;
    }

    // Validate configuration
    const parseResult = ConfigSchema.safeParse(result.config);

    if (parseResult.success) {
      return parseResult.data;
    }

    throw new ConfigValidationError(
      `Invalid configuration in ${result.filepath}`,
      formatZodErrors(parseResult.error),
    );
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      throw error;
    }
    throw new Error(
      `Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

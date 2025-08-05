import { cosmiconfig } from "cosmiconfig";
import { TypeScriptLoader } from "cosmiconfig-typescript-loader";
import { getPackageName } from "../../domain/constants/package-info.js";
import { ConfigSchema } from "../../domain/models/config.js";
import { formatZodErrors } from "../../infrastructure/utils/zod-error-formatter.js";

interface ValidationResult {
  success: boolean;
  filepath?: string;
  errors?: Array<{ path: string; message: string }>;
}

export async function validateConfigUseCase(
  configPath?: string,
): Promise<ValidationResult> {
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
      return {
        success: false,
        errors: [{ path: "root", message: "Configuration file not found" }],
      };
    }

    // Validate configuration
    const parseResult = ConfigSchema.safeParse(result.config);

    if (parseResult.success) {
      return {
        success: true,
        filepath: result.filepath,
      };
    }

    return {
      success: false,
      filepath: result.filepath,
      errors: formatZodErrors(parseResult.error),
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          path: "root",
          message: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

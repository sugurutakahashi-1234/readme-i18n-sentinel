# TypeScript Graph

```bash
tsg --tsconfig tsconfig.build.json --LR --md docs/reports/dependencies/deps-graph.md
```

```mermaid
flowchart LR
    subgraph src["src"]
        src/config.ts["config.ts"]
        src/index.ts["index.ts"]
        subgraph src/domain["/domain"]
            subgraph src/domain/models["/models"]
                src/domain/models/config.ts["config.ts"]
                src/domain/models/check//result.ts["check-result.ts"]
                src/domain/models/errors.ts["errors.ts"]
                src/domain/models/cli//options.ts["cli-options.ts"]
            end
            subgraph src/domain/services["/services"]
                src/domain/services/translation//checker.ts["translation-checker.ts"]
                src/domain/services/options//merger.ts["options-merger.ts"]
                src/domain/services/readme//detector.ts["readme-detector.ts"]
            end
            subgraph src/domain/constants["/constants"]
                src/domain/constants/package//info.ts["package-info.ts"]
            end
        end
        subgraph src/infrastructure["/infrastructure"]
            subgraph src/infrastructure/adapters["/adapters"]
                src/infrastructure/adapters/git.adapter.ts["git.adapter.ts"]
                src/infrastructure/adapters/glob.adapter.ts["glob.adapter.ts"]
            end
            subgraph src/infrastructure/services["/services"]
                src/infrastructure/services/normalizer.ts["normalizer.ts"]
                src/infrastructure/services/config//file//generator.ts["config-file-generator.ts"]
                src/infrastructure/services/interactive//prompts.ts["interactive-prompts.ts"]
                src/infrastructure/services/reporter.ts["reporter.ts"]
            end
            subgraph src/infrastructure/utils["/utils"]
                src/infrastructure/utils/zod//error//formatter.ts["zod-error-formatter.ts"]
            end
        end
        subgraph src/application/use//cases["/application/use-cases"]
            src/application/use//cases/check//translations.ts["check-translations.ts"]
            src/application/use//cases/init//config.ts["init-config.ts"]
            src/application/use//cases/load//config.ts["load-config.ts"]
            src/application/use//cases/validate//config.ts["validate-config.ts"]
        end
        subgraph src/presentation["/presentation"]
            src/presentation/cli.ts["cli.ts"]
        end
    end
    subgraph node//modules["node_modules"]
        node//modules/zod/index.d.cts["zod"]
        node//modules/simple//git/dist/typings/index.d.ts["simple-git"]
        node//modules/globby/index.d.ts["globby"]
        node//modules///clack/prompts/dist/index.d.ts["@clack/prompts"]
        node//modules/yaml/dist/index.d.ts["yaml"]
        node//modules/cosmiconfig/dist/index.d.ts["cosmiconfig"]
        node//modules/cosmiconfig//typescript//loader/dist/types/index.d.ts["cosmiconfig-typescript-loader"]
        node//modules/commander/typings/index.d.ts["commander"]
    end
    src/domain/models/config.ts-->node//modules/zod/index.d.cts
    src/config.ts-->src/domain/models/config.ts
    src/domain/services/translation//checker.ts-->src/domain/models/check//result.ts
    src/infrastructure/adapters/git.adapter.ts-->node//modules/simple//git/dist/typings/index.d.ts
    src/infrastructure/adapters/git.adapter.ts-->src/domain/models/errors.ts
    src/infrastructure/adapters/glob.adapter.ts-->node//modules/globby/index.d.ts
    src/application/use//cases/check//translations.ts-->src/domain/models/check//result.ts
    src/application/use//cases/check//translations.ts-->src/domain/models/config.ts
    src/application/use//cases/check//translations.ts-->src/domain/services/translation//checker.ts
    src/application/use//cases/check//translations.ts-->src/infrastructure/adapters/git.adapter.ts
    src/application/use//cases/check//translations.ts-->src/infrastructure/adapters/glob.adapter.ts
    src/application/use//cases/check//translations.ts-->src/infrastructure/services/normalizer.ts
    src/infrastructure/services/config//file//generator.ts-->node//modules///clack/prompts/dist/index.d.ts
    src/infrastructure/services/config//file//generator.ts-->node//modules/yaml/dist/index.d.ts
    src/infrastructure/services/config//file//generator.ts-->src/domain/models/config.ts
    src/infrastructure/services/config//file//generator.ts-->src/domain/models/errors.ts
    src/infrastructure/services/interactive//prompts.ts-->node//modules///clack/prompts/dist/index.d.ts
    src/infrastructure/services/interactive//prompts.ts-->src/domain/models/config.ts
    src/infrastructure/services/interactive//prompts.ts-->src/domain/models/errors.ts
    src/application/use//cases/init//config.ts-->node//modules///clack/prompts/dist/index.d.ts
    src/application/use//cases/init//config.ts-->src/domain/models/config.ts
    src/application/use//cases/init//config.ts-->src/infrastructure/services/config//file//generator.ts
    src/application/use//cases/init//config.ts-->src/infrastructure/services/interactive//prompts.ts
    src/infrastructure/utils/zod//error//formatter.ts-->node//modules/zod/index.d.cts
    src/application/use//cases/load//config.ts-->node//modules/cosmiconfig/dist/index.d.ts
    src/application/use//cases/load//config.ts-->node//modules/cosmiconfig//typescript//loader/dist/types/index.d.ts
    src/application/use//cases/load//config.ts-->src/domain/constants/package//info.ts
    src/application/use//cases/load//config.ts-->src/domain/models/config.ts
    src/application/use//cases/load//config.ts-->src/domain/models/errors.ts
    src/application/use//cases/load//config.ts-->src/infrastructure/utils/zod//error//formatter.ts
    src/application/use//cases/validate//config.ts-->node//modules/cosmiconfig/dist/index.d.ts
    src/application/use//cases/validate//config.ts-->node//modules/cosmiconfig//typescript//loader/dist/types/index.d.ts
    src/application/use//cases/validate//config.ts-->src/domain/constants/package//info.ts
    src/application/use//cases/validate//config.ts-->src/domain/models/config.ts
    src/application/use//cases/validate//config.ts-->src/infrastructure/utils/zod//error//formatter.ts
    src/domain/models/cli//options.ts-->node//modules/zod/index.d.cts
    src/domain/services/options//merger.ts-->src/domain/models/cli//options.ts
    src/domain/services/options//merger.ts-->src/domain/models/config.ts
    src/domain/services/readme//detector.ts-->src/infrastructure/adapters/glob.adapter.ts
    src/infrastructure/services/reporter.ts-->src/domain/models/check//result.ts
    src/presentation/cli.ts-->node//modules/commander/typings/index.d.ts
    src/presentation/cli.ts-->src/application/use//cases/check//translations.ts
    src/presentation/cli.ts-->src/application/use//cases/init//config.ts
    src/presentation/cli.ts-->src/application/use//cases/load//config.ts
    src/presentation/cli.ts-->src/application/use//cases/validate//config.ts
    src/presentation/cli.ts-->src/domain/constants/package//info.ts
    src/presentation/cli.ts-->src/domain/models/cli//options.ts
    src/presentation/cli.ts-->src/domain/models/errors.ts
    src/presentation/cli.ts-->src/domain/services/options//merger.ts
    src/presentation/cli.ts-->src/domain/services/readme//detector.ts
    src/presentation/cli.ts-->src/infrastructure/services/reporter.ts
    src/index.ts-->src/presentation/cli.ts
```


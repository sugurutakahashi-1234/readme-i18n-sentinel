# TypeScript Graph

```bash
tsg --tsconfig tsconfig.build.json --LR --md docs/reports/dependencies/deps-graph.md
```

```mermaid
flowchart LR
    subgraph src["src"]
        src/index.ts["index.ts"]
        subgraph src/domain["/domain"]
            subgraph src/domain/models["/models"]
                src/domain/models/check//result.ts["check-result.ts"]
                src/domain/models/config.ts["config.ts"]
                src/domain/models/heading.ts["heading.ts"]
                src/domain/models/cli//options.ts["cli-options.ts"]
            end
            subgraph src/domain/services["/services"]
                src/domain/services/translation//checker.ts["translation-checker.ts"]
            end
            subgraph src/domain/constants["/constants"]
                src/domain/constants/package//metadata.ts["package-metadata.ts"]
            end
        end
        subgraph src/infrastructure["/infrastructure"]
            subgraph src/infrastructure/services["/services"]
                src/infrastructure/services/content//normalizer.ts["content-normalizer.ts"]
                src/infrastructure/services/file//validator.ts["file-validator.ts"]
                src/infrastructure/services/readme//detector.ts["readme-detector.ts"]
            end
            subgraph src/infrastructure/adapters["/adapters"]
                src/infrastructure/adapters/glob.adapter.ts["glob.adapter.ts"]
            end
        end
        subgraph src/application/use//cases["/application/use-cases"]
            src/application/use//cases/check//translations.ts["check-translations.ts"]
            src/application/use//cases/prepare//check//config.ts["prepare-check-config.ts"]
            src/application/use//cases/print//result.ts["print-result.ts"]
        end
        subgraph src/presentation["/presentation"]
            src/presentation/cli.ts["cli.ts"]
        end
    end
    subgraph node//modules["node_modules"]
        node//modules/zod/index.d.cts["zod"]
        node//modules/globby/index.d.ts["globby"]
        node//modules/commander/typings/index.d.ts["commander"]
    end
    src/domain/models/config.ts-->node//modules/zod/index.d.cts
    src/domain/services/translation//checker.ts-->src/domain/models/check//result.ts
    src/domain/services/translation//checker.ts-->src/domain/models/heading.ts
    src/infrastructure/adapters/glob.adapter.ts-->node//modules/globby/index.d.ts
    src/infrastructure/services/file//validator.ts-->src/domain/models/check//result.ts
    src/infrastructure/services/file//validator.ts-->src/infrastructure/adapters/glob.adapter.ts
    src/application/use//cases/check//translations.ts-->src/domain/models/check//result.ts
    src/application/use//cases/check//translations.ts-->src/domain/models/config.ts
    src/application/use//cases/check//translations.ts-->src/domain/services/translation//checker.ts
    src/application/use//cases/check//translations.ts-->src/infrastructure/services/content//normalizer.ts
    src/application/use//cases/check//translations.ts-->src/infrastructure/services/file//validator.ts
    src/domain/models/cli//options.ts-->node//modules/zod/index.d.cts
    src/infrastructure/services/readme//detector.ts-->src/infrastructure/adapters/glob.adapter.ts
    src/application/use//cases/prepare//check//config.ts-->src/domain/models/cli//options.ts
    src/application/use//cases/prepare//check//config.ts-->src/domain/models/config.ts
    src/application/use//cases/prepare//check//config.ts-->src/infrastructure/services/readme//detector.ts
    src/application/use//cases/print//result.ts-->src/domain/models/check//result.ts
    src/presentation/cli.ts-->node//modules/commander/typings/index.d.ts
    src/presentation/cli.ts-->src/application/use//cases/check//translations.ts
    src/presentation/cli.ts-->src/application/use//cases/prepare//check//config.ts
    src/presentation/cli.ts-->src/application/use//cases/print//result.ts
    src/presentation/cli.ts-->src/domain/constants/package//metadata.ts
    src/index.ts-->src/presentation/cli.ts
```


# TypeScript Graph

```bash
tsg --tsconfig tsconfig.build.json --LR --abstraction src/domain --abstraction src/application --abstraction src/infrastructure --abstraction src/presentation --md docs/reports/dependencies/layers.md
```

```mermaid
flowchart LR
    classDef dir fill:#0000,stroke:#999
    subgraph src["src"]
        src/domain["/domain"]:::dir
        src/infrastructure["/infrastructure"]:::dir
        src/application["/application"]:::dir
        src/presentation["/presentation"]:::dir
        src/index.ts["index.ts"]
    end
    subgraph node//modules["node_modules"]
        node//modules/zod/index.d.cts["zod"]
        node//modules/globby/index.d.ts["globby"]
        node//modules/diff/libcjs/index.d.ts["diff"]
        node//modules/commander/typings/index.d.ts["commander"]
    end
    src/domain-->node//modules/zod/index.d.cts
    src/infrastructure-->node//modules/globby/index.d.ts
    src/infrastructure-->src/domain
    src/application-->src/domain
    src/application-->src/infrastructure
    src/infrastructure-->node//modules/diff/libcjs/index.d.ts
    src/presentation-->node//modules/commander/typings/index.d.ts
    src/presentation-->src/application
    src/presentation-->src/domain
    src/index.ts-->src/presentation
```


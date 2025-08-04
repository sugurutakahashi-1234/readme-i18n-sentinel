# TypeScript Graph

```bash
tsg --tsconfig tsconfig.build.json --LR --abstraction src/domain --abstraction src/application --abstraction src/infrastructure --abstraction src/presentation --md docs/reports/dependencies/layers.md
```

```mermaid
flowchart LR
    classDef dir fill:#0000,stroke:#999
    subgraph src["src"]
        src/domain["/domain"]:::dir
        src/application["/application"]:::dir
        src/infrastructure["/infrastructure"]:::dir
        src/presentation["/presentation"]:::dir
        src/main.ts["main.ts"]
    end
    src/application-->src/domain
    src/infrastructure-->src/domain
    src/presentation-->src/application
    src/main.ts-->src/application
    src/main.ts-->src/domain
    src/main.ts-->src/infrastructure
    src/main.ts-->src/presentation
```


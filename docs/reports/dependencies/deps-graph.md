# TypeScript Graph

```bash
tsg --tsconfig tsconfig.build.json --LR --md docs/reports/dependencies/deps-graph.md
```

```mermaid
flowchart LR
    subgraph src["src"]
        src/main.ts["main.ts"]
        subgraph src/domain["/domain"]
            src/domain/user.ts["user.ts"]
            src/domain/userRepository.ts["userRepository.ts"]
        end
        subgraph src/application["/application"]
            src/application/getUserUseCase.ts["getUserUseCase.ts"]
        end
        subgraph src/infrastructure["/infrastructure"]
            src/infrastructure/inMemoryUserRepository.ts["inMemoryUserRepository.ts"]
        end
        subgraph src/presentation["/presentation"]
            src/presentation/userController.ts["userController.ts"]
        end
    end
    src/domain/userRepository.ts-->src/domain/user.ts
    src/application/getUserUseCase.ts-->src/domain/user.ts
    src/application/getUserUseCase.ts-->src/domain/userRepository.ts
    src/infrastructure/inMemoryUserRepository.ts-->src/domain/user.ts
    src/infrastructure/inMemoryUserRepository.ts-->src/domain/userRepository.ts
    src/presentation/userController.ts-->src/application/getUserUseCase.ts
    src/main.ts-->src/application/getUserUseCase.ts
    src/main.ts-->src/domain/user.ts
    src/main.ts-->src/infrastructure/inMemoryUserRepository.ts
    src/main.ts-->src/presentation/userController.ts
```


import { GetUserUseCase } from "./application/getUserUseCase.js";
import { User } from "./domain/user.js";
import { InMemoryUserRepository } from "./infrastructure/inMemoryUserRepository.js";
import { UserController } from "./presentation/userController.js";

async function main(): Promise<void> {
  const repository = new InMemoryUserRepository();
  const getUserUseCase = new GetUserUseCase(repository);
  const controller = new UserController(getUserUseCase);

  const user = new User("1", "Alice");
  await repository.save(user);

  const result = await controller.getUser("1");
  console.log(result);
}

await main();

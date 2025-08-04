import type { GetUserUseCase } from "../application/getUserUseCase.js";

export class UserController {
  constructor(private readonly getUserUseCase: GetUserUseCase) {}

  async getUser(userId: string): Promise<{ id: string; name: string } | null> {
    const user = await this.getUserUseCase.execute(userId);
    if (!user) {
      return null;
    }
    return {
      id: user.getId(),
      name: user.getName(),
    };
  }
}

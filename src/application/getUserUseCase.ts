import type { User } from "../domain/user.js";
import type { UserRepository } from "../domain/userRepository.js";

export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }
}

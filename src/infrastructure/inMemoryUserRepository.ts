import type { User } from "../domain/user.js";
import type { UserRepository } from "../domain/userRepository.js";

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.getId(), user);
  }
}

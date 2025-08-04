import { describe, expect, it } from "bun:test";
import { User } from "./user.js";

describe("User", () => {
  it("should create a user and get properties", () => {
    const user = new User("123", "John Doe");

    expect(user.getId()).toBe("123");
    expect(user.getName()).toBe("John Doe");
  });
});

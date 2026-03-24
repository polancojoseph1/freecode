import { expect, test, describe } from "bun:test";
import { z } from "zod";
import { fn } from "../src/fn";

describe("fn utility", () => {
  test("successfully validates simple schema", () => {
    const stringSchema = z.string();
    const myFn = fn(stringSchema, (input) => `Hello, ${input}!`);

    expect(myFn("world")).toBe("Hello, world!");
  });

  test("throws validation error for invalid input", () => {
    const numberSchema = z.number();
    const myFn = fn(numberSchema, (input) => input * 2);

    expect(() => myFn("not a number" as any)).toThrow();
  });

  test("force method bypasses validation", () => {
    const numberSchema = z.number();
    const myFn = fn(numberSchema, (input) => input);

    // This would throw with normal invocation, but `force` bypasses `parse`
    expect(myFn.force("string that is not a number" as any)).toBe("string that is not a number" as any);
  });

  test("schema property matches the original schema", () => {
    const stringSchema = z.string();
    const myFn = fn(stringSchema, (input) => input);

    expect(myFn.schema).toBe(stringSchema);
  });

  test("successfully validates complex schema", () => {
    const userSchema = z.object({
      name: z.string(),
      age: z.number().min(18),
    });

    const myFn = fn(userSchema, (user) => `${user.name} is ${user.age} years old`);

    const validUser = { name: "Alice", age: 30 };
    expect(myFn(validUser)).toBe("Alice is 30 years old");

    const invalidUser = { name: "Bob", age: 17 };
    expect(() => myFn(invalidUser)).toThrow();
  });

  test("preserves transformed values from schema", () => {
    const trimmedStringSchema = z.string().trim();
    const myFn = fn(trimmedStringSchema, (input) => `_${input}_`);

    // The spaces should be trimmed by zod before reaching the callback
    expect(myFn("  spaced  ")).toBe("_spaced_");
  });
});

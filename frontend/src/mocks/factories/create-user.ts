import { faker } from "@faker-js/faker";

import type { User } from "@/types";

import { createId } from "../utils/mock-utils";

export type CreateUserInput = {
  id?: string;
  email?: string;
  name?: string;
};

export const createUser = (input: CreateUserInput = {}): User => {
  const now = new Date().toISOString();

  return {
    id: input.id ?? createId("user", 1),
    email: input.email ?? "matias.silva@email.com",
    name: input.name ?? "Matias Silva",
    avatarUrl: faker.image.avatarGitHub(),
    role: "user",
    createdAt: now,
    updatedAt: now,
  };
};

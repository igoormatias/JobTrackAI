export { createProfileRoutes } from "./infrastructure/http/routes/profile.routes.js";
export { CreateProfileUseCase } from "./application/use-cases/create-profile.use-case.js";
export { UpdateProfileUseCase } from "./application/use-cases/update-profile.use-case.js";
export { prismaProfileRepository } from "./infrastructure/repositories/prisma-profile.repository.js";
export type { CreateProfileInput, Profile, UpdateProfileInput } from "./domain/entities/profile.entity.js";

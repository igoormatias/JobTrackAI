import type { ProfileWithUser } from "../../domain/entities/profile.entity.js";

export type ProfileResponseDto = {
  data: ProfileWithUser;
  message?: string;
};

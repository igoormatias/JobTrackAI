import { http, HttpResponse } from "msw";

import { getAuthStore, isAuthenticatedFromRequest } from "@/mocks/fixtures/auth-store";
import type { AccountProfile, ApiResponse, CreateProfilePayload, Profile, UpdateProfilePayload } from "@/types";

import { getFixtureStore } from "../fixtures";
import {
  createUserProfile,
  getUserProfile,
  resetProfileStore,
  syncProfileStoreFromFixture,
  updateUserProfile,
} from "../fixtures/profile-store";

const unauthorized = () => HttpResponse.json({ message: "Unauthorized" }, { status: 401 });

const withUser = (profile: Profile, user: AccountProfile["user"]): AccountProfile => ({
  ...profile,
  user,
});

const getAccountUser = (): AccountProfile["user"] => {
  const authStore = getAuthStore();
  const fixtureUser = getFixtureStore().user;

  return {
    name: authStore.user.name || fixtureUser.name,
    email: authStore.user.email || fixtureUser.email,
    avatarUrl: authStore.user.avatar ?? fixtureUser.avatarUrl,
  };
};

export const profileHandlers = [
  http.get("*/profile", ({ request }) => {
    const cookieHeader = request.headers.get("cookie");
    const authStore = getAuthStore();

    if (!authStore.isAuthenticated && !isAuthenticatedFromRequest(cookieHeader)) {
      return unauthorized();
    }

    const userId = authStore.user.id;
    const userProfile = getUserProfile(userId);

    if (userProfile) {
      return HttpResponse.json<ApiResponse<AccountProfile>>({
        data: withUser(userProfile, getAccountUser()),
      });
    }

    if (authStore.user.onboardingCompleted) {
      const fixtureProfile = getFixtureStore().profile;
      syncProfileStoreFromFixture(fixtureProfile);
      return HttpResponse.json<ApiResponse<AccountProfile>>({
        data: withUser(fixtureProfile, getAccountUser()),
      });
    }

    return HttpResponse.json({ message: "Profile not found" }, { status: 404 });
  }),

  http.post("*/profile", async ({ request }) => {
    const cookieHeader = request.headers.get("cookie");
    const authStore = getAuthStore();

    if (!authStore.isAuthenticated && !isAuthenticatedFromRequest(cookieHeader)) {
      return unauthorized();
    }

    const userId = authStore.user.id;

    if (getUserProfile(userId)) {
      return HttpResponse.json({ message: "Profile already exists" }, { status: 409 });
    }

    const payload = (await request.json()) as CreateProfilePayload;
    const profile = createUserProfile(userId, payload);

    return HttpResponse.json<ApiResponse<AccountProfile>>(
      {
        data: withUser(profile, getAccountUser()),
        message: "Profile created successfully",
      },
      { status: 201 },
    );
  }),

  http.patch("*/profile", async ({ request }) => {
    const cookieHeader = request.headers.get("cookie");
    const authStore = getAuthStore();

    if (!authStore.isAuthenticated && !isAuthenticatedFromRequest(cookieHeader)) {
      return unauthorized();
    }

    const userId = authStore.user.id;
    const payload = (await request.json()) as UpdateProfilePayload;

    let profile = getUserProfile(userId);

    if (!profile) {
      profile = createUserProfile(userId, payload);
    } else {
      const updated = updateUserProfile(userId, payload);
      profile = updated ?? profile;
    }

    return HttpResponse.json<ApiResponse<AccountProfile>>({
      data: withUser(profile, getAccountUser()),
      message: "Profile updated successfully",
    });
  }),
];

export { resetProfileStore };

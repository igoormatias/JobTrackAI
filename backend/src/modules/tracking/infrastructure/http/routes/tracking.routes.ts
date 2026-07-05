import { Router } from "express";

import { requireAuth } from "../../../../../middlewares/auth-middleware.js";
import { eventBus } from "../../../../../shared/events/event-bus.js";
import { trackingAnalysisBackgroundHandler } from "../../../application/handlers/tracking-analysis-background.handler.js";
import { TrackingController } from "../controllers/tracking.controller.js";

let handlersRegistered = false;

const registerTrackingHandlers = (): void => {
  if (handlersRegistered) return;
  trackingAnalysisBackgroundHandler.register(eventBus);
  handlersRegistered = true;
};

export const createTrackingRoutes = (): Router => {
  registerTrackingHandlers();

  const router = Router();
  const controller = new TrackingController();

  router.use(requireAuth);
  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.patch("/:id/stage", controller.moveStage);
  router.patch("/:id/favorite", controller.toggleFavorite);
  router.patch("/:id/priority", controller.changePriority);
  router.patch("/:id/visibility", controller.changeVisibility);
  router.patch("/:id/notes", controller.updateNotes);
  router.patch("/:id/process", controller.updateProcess);
  router.get("/:id/timeline", controller.getTimeline);
  router.patch("/:id/timeline/:eventId", controller.updateTimelineEvent);
  router.get("/:id/interviews", controller.listInterviews);
  router.post("/:id/interviews", controller.createInterview);
  router.patch("/:id/interviews/:interviewId", controller.updateInterview);

  return router;
};

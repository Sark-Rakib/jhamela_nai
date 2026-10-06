import { Router } from "express";

import {
  deleteToolState,
  getToolState,
  getToolStateHistory,
  listToolStates,
  saveToolState,
} from "../controllers/tool-state.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  listToolStatesQuery,
  saveToolStateSchema,
  toolSlugParams,
} from "../validators/tool-state.validator.js";

export const toolStateRouter = Router();

// Every tool-state route needs a signed-in user; guests stay local-only.
toolStateRouter.use(requireAuth);

/** Dashboard feed: the user's most recently touched tools. */
toolStateRouter.get("/states", validate({ query: listToolStatesQuery }), asyncHandler(listToolStates));

toolStateRouter.get(
  "/:slug/state",
  validate({ params: toolSlugParams }),
  asyncHandler(getToolState),
);

toolStateRouter.get(
  "/:slug/state/history",
  validate({ params: toolSlugParams }),
  asyncHandler(getToolStateHistory),
);

toolStateRouter.post(
  "/:slug/state",
  validate({ params: toolSlugParams, body: saveToolStateSchema }),
  asyncHandler(saveToolState),
);

toolStateRouter.delete(
  "/:slug/state",
  validate({ params: toolSlugParams }),
  asyncHandler(deleteToolState),
);
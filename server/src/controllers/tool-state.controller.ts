import type { Request, Response } from "express";

import { HISTORY_LIMIT, ToolState } from "../models/tool-state.model.js";
import { assertStateSize, type SaveToolStateInput } from "../validators/tool-state.validator.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ok } from "../utils/respond.js";

/** Latest saved state for a tool. 404 means "nothing saved yet". */
export const getToolState = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const doc = await ToolState.findOne({ user: req.user!.id, slug }).lean();

  if (!doc) {
    return res.status(404).json({
      success: false,
      code: "NOT_FOUND",
      message: "এই টুলের কোনো সংরক্ষিত তথ্য নেই।",
    });
  }

  return ok(res, {
    slug: doc.slug,
    state: doc.state,
    label: doc.label,
    savedAt: new Date(doc.savedAt).toISOString(),
  });
});

export const saveToolState = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const { state, label } = req.body as SaveToolStateInput;

  try {
    assertStateSize(state);
  } catch (error) {
    throw ApiError.badRequest((error as Error).message);
  }

  const userId = req.user!.id;
  const previous = await ToolState.findOne({ user: userId, slug }).select("state savedAt").lean();
  const savedAt = new Date();

  const doc = await ToolState.findOneAndUpdate(
    { user: userId, slug },
    {
      $set: { state, savedAt, ...(label ? { label } : {}) },
      $setOnInsert: { user: userId, slug },
      // The previous value becomes the newest history snapshot; `-HISTORY_LIMIT`
      // keeps the array from growing without bound.
      ...(previous
        ? {
            $push: {
              history: {
                $each: [{ state: previous.state, savedAt: previous.savedAt }],
                $slice: -HISTORY_LIMIT,
              },
            },
          }
        : {}),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  if (!doc) throw ApiError.unavailable("তথ্য সংরক্ষণ করা যায়নি।");

  return ok(
    res,
    { slug: doc.slug, state: doc.state, savedAt: new Date(doc.savedAt).toISOString() },
    "ক্লাউডে সংরক্ষিত হয়েছে।",
  );
});

export const deleteToolState = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  await ToolState.deleteOne({ user: req.user!.id, slug });
  return ok(res, { slug, deleted: true }, "সংরক্ষিত তথ্য মুছে ফেলা হয়েছে।");
});

/** Dashboard feed: the user's most recently touched tools. */
export const listToolStates = asyncHandler(async (req: Request, res: Response) => {
  const { limit } = req.query as unknown as { limit: number };
  const docs = await ToolState.find({ user: req.user!.id })
    .sort({ savedAt: -1 })
    .limit(limit)
    .select("slug state label savedAt")
    .lean();

  return ok(res, {
    items: docs.map((doc) => ({
      slug: doc.slug,
      state: doc.state,
      label: doc.label ?? "",
      savedAt: new Date(doc.savedAt).toISOString(),
    })),
  });
});

export const getToolStateHistory = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const doc = await ToolState.findOne({ user: req.user!.id, slug }).lean();
  if (!doc) return ok(res, { slug, history: [] });

  return ok(res, {
    slug: doc.slug,
    history: doc.history.slice(0, HISTORY_LIMIT).map((entry) => ({
      state: entry.state,
      savedAt: new Date(entry.savedAt).toISOString(),
    })),
  });
});
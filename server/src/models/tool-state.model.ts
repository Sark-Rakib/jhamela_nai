import { Schema, model, type InferSchemaType } from "mongoose";

/** Snapshot kept for the dashboard "recent changes" timeline. */
const snapshotSchema = new Schema(
  {
    state: { type: Schema.Types.Mixed, required: true },
    savedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const toolStateSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    slug: { type: String, required: true, lowercase: true, trim: true, index: true },
    state: { type: Schema.Types.Mixed, required: true, default: {} },
    /** Free-text label so the dashboard can show a recognisable name. */
    label: { type: String, default: "", maxlength: 120 },
    savedAt: { type: Date, default: Date.now },
    history: { type: [snapshotSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

toolStateSchema.index({ user: 1, slug: 1 }, { unique: true });

/**
 * Only the newest snapshots are worth keeping — states are small JSON blobs.
 * History is maintained by the save controller (document middleware does not
 * run for `findOneAndUpdate`), so keep this constant in sync with that logic.
 */
export const HISTORY_LIMIT = 8;

export type ToolStateAttributes = InferSchemaType<typeof toolStateSchema>;

export const ToolState = model<ToolStateAttributes>("ToolState", toolStateSchema);
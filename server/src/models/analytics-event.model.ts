import { Schema, model, type InferSchemaType } from "mongoose";

/**
 * Lightweight product analytics.
 *
 * Events may arrive anonymously (guest mode) — `user` is therefore optional and
 * `sessionId` carries the anonymous identity.
 */
const analyticsEventSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    sessionId: { type: String, default: "", maxlength: 64, index: true },
    name: { type: String, required: true, trim: true, maxlength: 64 },
    toolSlug: { type: String, default: "", lowercase: true, trim: true, index: true },
    category: { type: String, default: "", lowercase: true, trim: true },
    props: { type: Schema.Types.Mixed, default: {} },
    occurredAt: { type: Date, default: Date.now, index: true },
    userAgent: { type: String, default: "", maxlength: 200 },
  },
  { timestamps: false, versionKey: false },
);

analyticsEventSchema.index({ name: 1, occurredAt: -1 });
analyticsEventSchema.index({ occurredAt: -1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

export type AnalyticsEventAttributes = InferSchemaType<typeof analyticsEventSchema>;

export const AnalyticsEvent = model<AnalyticsEventAttributes>("AnalyticsEvent", analyticsEventSchema);
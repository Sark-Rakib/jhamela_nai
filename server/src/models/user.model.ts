import bcrypt from "bcryptjs";
import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
  type Model,
} from "mongoose";

const SALT_ROUNDS = 12;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "ইমেইল আবশ্যক"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "সঠিক ইমেইল দিন"],
    },
    name: {
      type: String,
      required: [true, "নাম আবশ্যক"],
      trim: true,
      maxlength: 60,
    },
    /** `select: false` keeps the hash out of every query that does not ask for it. */
    passwordHash: { type: String, required: true, select: false },
    phone: {
      type: String,
      default: "",
      trim: true,
      // Bangladeshi mobile numbers only, stored without spaces or dashes.
      match: [/^$|^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)"],
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    plan: { type: String, enum: ["free", "premium"], default: "free" },
    locale: { type: String, enum: ["bn", "en"], default: "bn" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

export type UserAttributes = InferSchemaType<typeof userSchema>;

export interface UserMethods {
  comparePassword(plain: string): Promise<boolean>;
}

export interface UserStatics {
  hashPassword(plain: string): Promise<string>;
}

export type UserDocument = HydratedDocument<UserAttributes, UserMethods>;
export type UserModel = Model<UserAttributes, Record<string, never>, UserMethods> & UserStatics;

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

export const User = model("User", userSchema) as UserModel;
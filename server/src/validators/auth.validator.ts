import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, "ইমেইল দিন")
  .max(160, "ইমেইল অনেক লম্বা")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "সঠিক ইমেইল দিন");

const password = z
  .string()
  .min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের")
  .max(128, "পাসওয়ার্ড অনেক লম্বা")
  .refine((value) => /[a-zA-Z]/.test(value) && /[0-9]/.test(value), {
    message: "পাসওয়ার্ডে অন্তত একটি অক্ষর ও একটি সংখ্যা থাকতে হবে",
  });

export const registerSchema = z.object({
  name: z.string().trim().min(2, "নাম কমপক্ষে ২ অক্ষরের").max(60, "নাম অনেক লম্বা"),
  email,
  password,
  /** Optional Bangladeshi mobile number, normalised to 11 digits (01XXXXXXXXX). */
  phone: z
    .string()
    .trim()
    .transform((value) =>
      // Accept "+88"/"880" prefixes and Bengali digits like the client does.
      value.replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit))).replace(/[^\d]/g, ""),
    )
    .optional()
    .transform((value) => (value ? value.replace(/^88(?=01)/, "") : value))
    .refine((value) => !value || /^01[3-9]\d{8}$/.test(value), "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)"),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "পাসওয়ার্ড দিন"),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "নাম কমপক্ষে ২ অক্ষরের").max(60, "নাম অনেক লম্বা").optional(),
  locale: z.enum(["bn", "en"]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
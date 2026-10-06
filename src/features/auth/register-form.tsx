"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/input";
import { friendlyError } from "@/lib/api";
import { isValidBDBoMobile } from "@/lib/utils";
import { useAuth } from "./auth-provider";

const schema = z
  .object({
    name: z
      .string()
      .min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে")
      .max(60, "নাম বেশি লম্বা হয়েছে"),
    email: z.string().min(1, "ইমেইল দিন").email("সঠিক ইমেইল ঠিকানা দিন"),
    phone: z
      .string()
      .optional()
      .refine((value) => !value || isValidBDBoMobile(value), "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)"),
    password: z
      .string()
      .min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে")
      .regex(/[a-zA-Z]/, "অন্তত একটি ইংরেজি অক্ষর দিন")
      .regex(/\d/, "অন্তত একটি সংখ্যা দিন"),
    confirmPassword: z.string().min(1, "পাসওয়ার্ড আবার লিখুন"),
    terms: z.boolean().refine((value) => value, "শর্তাবলিতে সম্মতি দিন"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "দুটি পাসওয়ার্ড মিলছে না",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser, isOffline } = useAuth();
  const nextPath = searchParams.get("next") || "/dashboard";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const password = useWatch({ control, name: "password" });
  const terms = useWatch({ control, name: "terms" });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        phone: values.phone?.trim() || undefined,
      });
      toast.success("অ্যাকাউন্ট তৈরি হয়েছে! 🎉");
      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      toast.error(friendlyError(error));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field label="আপনার নাম" htmlFor="name" error={errors.name?.message}>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint-foreground"
            aria-hidden
          />
          <Input
            id="name"
            autoComplete="name"
            placeholder="যেমন: রশিদ আলম"
            className="pl-9"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </div>
      </Field>

      <Field label="ইমেইল" htmlFor="email" error={errors.email?.message}>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint-foreground"
            aria-hidden
          />
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="আপনার ইমেইল"
            className="pl-9"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </div>
      </Field>

      <Field
        label="মোবাইল নম্বর"
        htmlFor="phone"
        hint="ঐচ্ছিক — হিসাব ফিরে পেতে সাহায্য করবে"
        error={errors.phone?.message}
      >
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          aria-invalid={Boolean(errors.phone)}
          {...register("phone")}
        />
      </Field>

      <Field
        label="পাসওয়ার্ড"
        htmlFor="password"
        error={errors.password?.message}
        hint="কমপক্ষে ৮ অক্ষর, ইংরেজি অক্ষর ও সংখ্যা"
      >
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint-foreground"
            aria-hidden
          />
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="pl-9"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </div>
        {password ? <PasswordStrength value={password} /> : null}
      </Field>

      <Field label="পাসওয়ার্ড আবার লিখুন" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
      </Field>

      <div className="space-y-1.5">
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground">
          {/* Radix's Checkbox fires onCheckedChange, not onChange, so this field
              is driven through setValue instead of register. */}
          <Checkbox
            id="terms"
            className="mt-0.5"
            checked={terms}
            onCheckedChange={(checked) =>
              setValue("terms", checked === true, { shouldDirty: true, shouldValidate: true })
            }
          />
          <span className="leading-relaxed">
            আমি{" "}
            <Link href="/terms" className="font-medium text-primary hover:underline">
              শর্তাবলি
            </Link>{" "}
            ও{" "}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              প্রাইভেসি পলিসি
            </Link>{" "}
            পড়েছি এবং সম্মত আছি
          </span>
        </label>
        {errors.terms ? (
          <p className="pl-7 text-2xs font-medium text-destructive" role="alert">
            {errors.terms.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" block size="lg" loading={isSubmitting}>
        ফ্রি অ্যাকাউন্ট তৈরি করুন
        <ArrowRight aria-hidden />
      </Button>

      {isOffline ? (
        <p className="rounded-md border border-border bg-surface-muted px-3 py-2 text-2xs leading-relaxed text-muted-foreground">
          ⚠️ API সার্ভার বন্ধ আছে। টুলগুলো লগইন ছাড়াই ব্যবহার করতে পারবেন, অ্যাকাউন্ট তৈরি করতে সার্ভার চালু করুন।
        </p>
      ) : null}

      <p className="pt-1 text-center text-sm text-muted-foreground">
        ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
        <Link
          href={`/login${nextPath !== "/dashboard" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          লগইন করুন
        </Link>
      </p>
    </form>
  );
}

function PasswordStrength({ value }: { value: string }) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  const labels = ["খুব দুর্বল", "দুর্বল", "মোটামুটি", "ভালো", "শক্তিশালী", "খুব শক্তিশালী"];
  const tones = ["bg-destructive", "bg-destructive", "bg-accent-500", "bg-accent-500", "bg-primary", "bg-primary"];

  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex flex-1 gap-1" aria-hidden>
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index < score ? tones[score] : "bg-ink-200 dark:bg-ink-800"
            }`}
          />
        ))}
      </div>
      <span className="text-2xs text-faint-foreground">{labels[score]}</span>
    </div>
  );
}

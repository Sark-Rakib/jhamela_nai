"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { friendlyError } from "@/lib/api";
import { useAuth } from "./auth-provider";

const schema = z.object({
  email: z
    .string()
    .min(1, "ইমেইল দিন")
    .email("সঠিক ইমেইল ঠিকানা দিন"),
  password: z.string().min(1, "পাসওয়ার্ড দিন").min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isOffline } = useAuth();
  const nextPath = searchParams?.get("next") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await login(values);
      toast.success(`স্বাগতম, ${user.name.split(" ")[0]}! 👋`);
      router.replace(user.role === "admin" && nextPath === "/dashboard" ? "/admin" : nextPath);
      router.refresh();
    } catch (error) {
      toast.error(friendlyError(error));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
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

      <Field label="পাসওয়ার্ড" htmlFor="password" error={errors.password?.message}>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint-foreground"
            aria-hidden
          />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="আপনার পাসওয়ার্ড"
            className="pl-9"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </div>
      </Field>

      <Button type="submit" block size="lg" loading={isSubmitting}>
        লগইন করুন
        <ArrowRight aria-hidden />
      </Button>

      {isOffline ? (
        <p className="rounded-md border border-border bg-surface-muted px-3 py-2 text-2xs leading-relaxed text-muted-foreground">
          ⚠️ API সার্ভার বন্ধ আছে। টুলগুলো লগইন ছাড়াই ব্যবহার করা যাবে, তবে লগইন এখন কাজ করবে না।
        </p>
      ) : null}

      <p className="pt-1 text-center text-sm text-muted-foreground">
        অ্যাকাউন্ট নেই?{" "}
        <Link
          href={`/register${nextPath !== "/dashboard" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ফ্রি অ্যাকাউন্ট তৈরি করুন
        </Link>
      </p>
    </form>
  );
}

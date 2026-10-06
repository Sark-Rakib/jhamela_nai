"use client";

/**
 * "Save result" control.
 *
 * Signed in  → syncs the working copy to the account (cross-device).
 * Guest      → explains that the browser already keeps it, and offers a
 *              reminder-free path to a free account instead of blocking.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CloudUpload, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { PdfPageSize } from "@/lib/export";
import { track } from "@/lib/analytics";
import { useAuth } from "@/features/auth/auth-provider";
import { cn } from "@/lib/utils";

export function SaveButton({
  slug,
  state,
  disabled,
  className,
  label = "ফলাফল সংরক্ষণ",
}: {
  slug: string;
  state: unknown;
  disabled?: boolean;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved">("idle");

  async function save() {
    if (!isAuthenticated) {
      toast("এই ব্রাউজারেই ফলাফল সংরক্ষিত আছে", {
        description: "সব ডিভাইসে সিঙ্ক করতে ফ্রি অ্যাকাউন্ট তৈরি করুন।",
        action: {
          label: "অ্যাকাউন্ট",
          onClick: () => router.push(`/register?next=${encodeURIComponent(`/tools/${slug}`)}`),
        },
      });
      return;
    }

    setStatus("saving");
    try {
      await api.post(`/tools/${slug}/state`, { state });
      track("saved_item", { tool: slug });
      setStatus("saved");
      toast.success("ফলাফল সংরক্ষণ হয়েছে — যেকোনো ডিভাইস থেকে দেখতে পাবেন।");
      window.setTimeout(() => setStatus("idle"), 2500);
    } catch {
      toast.error("সংরক্ষণ করা যায়নি। ইন্টারনেট সংযোগ দেখুন।");
      setStatus("idle");
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => void save()}
      disabled={disabled || isLoading || status === "saving"}
      className={cn(className)}
      data-print-hide="true"
    >
      {status === "saving" ? (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          সংরক্ষণ হচ্ছে…
        </>
      ) : status === "saved" ? (
        <>
          <Check aria-hidden />
          সংরক্ষিত
        </>
      ) : (
        <>
          <CloudUpload aria-hidden />
          {isAuthenticated ? label : "সিঙ্ক করুন"}
        </>
      )}
    </Button>
  );
}

export function GuestHint({ slug }: { slug: string }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return null;

  return (
    <p className="text-2xs leading-relaxed text-faint-foreground">
      ফলাফল এই ব্রাউজারে সংরক্ষিত থাকছে। সব ডিভাইসে নিতে{" "}
      <Link href={`/register?next=/tools/${slug}`} className="text-primary hover:underline">
        ফ্রি অ্যাকাউন্ট
      </Link>{" "}
      তৈরি করুন।
    </p>
  );
}

/** Shared PDF download button that rasterises a node. */
export function PdfButton({
  targetId,
  filename,
  title,
  subtitle,
  disabled,
  orientation,
  format,
}: {
  targetId: string;
  filename: string;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
  orientation?: "portrait" | "landscape";
  /** Paper size forwarded to the PDF writer. */
  format?: PdfPageSize;
}) {
  const [busy, setBusy] = React.useState(false);

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || busy}
      data-print-hide="true"
      onClick={async () => {
        const element = document.getElementById(targetId);
        if (!element) return;
        setBusy(true);
        try {
          const { exportElementToPdf } = await import("@/lib/export");
          await exportElementToPdf(element, { filename, title, subtitle, orientation, format });
          track("pdf_downloaded", { tool: filename });
          toast.success("PDF ডাউনলোড হয়েছে।");
        } catch {
          toast.error("PDF বানানো যায়নি। আবার চেষ্টা করুন।");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? <Loader2 className="animate-spin" aria-hidden /> : null}
      PDF
    </Button>
  );
}
import Link from "next/link";

import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";

/**
 * Original brand mark: a "crossed-out hassle" tick inside a rounded tile,
 * with a spark at the top-right signalling "solved instantly".
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[0.625rem] bg-ink-900 text-white dark:bg-white dark:text-ink-950",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="size-6" fill="none">
        <path
          d="M8 17.5l5.2 5.2L24.5 10"
          stroke="currentColor"
          strokeWidth="3.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23 3.4l.95 2.65L26.6 7l-2.65.95L23 10.6l-.95-2.65L19.4 7l2.65-.95L23 3.4z"
          fill="var(--color-brand-400)"
          className="text-brand-400"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
      aria-label={`${SITE.name} — হোমপেজ`}
    >
      <LogoMark className="transition-transform duration-200 group-hover:scale-105" />
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-foreground">
            Jhamela<span className="text-primary"> Nai</span>
          </span>
          <span className="mt-0.5 hidden text-[10px] font-medium tracking-wide text-faint-foreground sm:block">
            ঝামেলা নাই
          </span>
        </span>
      ) : null}
    </Link>
  );
}

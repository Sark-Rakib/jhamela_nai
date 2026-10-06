"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, Search, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo, LogoMark } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CommandSearch } from "@/components/layout/command-search";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/dialog";
import { CATEGORIES } from "@/lib/tools";
import { NAV_LINKS } from "@/lib/site";
import { useAuth } from "@/features/auth/auth-provider";
import { cn, initialsOf } from "@/lib/utils";

const DESKTOP_NAV = [
  { href: "/tools", label: "সব টুল" },
  { href: "/tools/category/money", label: "ক্যাটাগরি", hasMenu: true },
  { href: "/how-it-works", label: "কীভাবে কাজ করে" },
  { href: "/pricing", label: "প্রাইসিং" },
];

export function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close the mobile menu on navigation. Adjusted during render rather than in
  // an effect to avoid a second render pass on every route change.
  const [lastPath, setLastPath] = React.useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  function isActive(href: string) {
    if (href === "/tools") return pathname === "/tools" || pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-ink-950"
      >
        মূল কনটেন্টে যান
      </a>

      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="container-page flex h-header items-center gap-3">
          <Logo />

          <nav aria-label="প্রধান" className="ml-4 hidden items-center gap-0.5 lg:flex">
            {DESKTOP_NAV.map((item) =>
              item.hasMenu ? (
                <CategoryMenu key={item.href} active={isActive("/tools/category")} />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    isActive(item.href)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group hidden h-9 w-56 items-center gap-2 rounded-md border border-border bg-surface-muted px-3 text-left text-sm text-faint-foreground transition-colors hover:border-ink-300 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:flex xl:w-72"
              aria-label="টুল খুঁজুন (Ctrl+K চাপুন)"
            >
              <Search className="size-4 shrink-0" aria-hidden />
              <span className="flex-1 truncate">খুঁজুন…</span>
              <kbd className="rounded border border-border px-1 py-px font-sans text-[10px] font-medium">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-10 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground md:hidden"
              aria-label="টুল খুঁজুন"
            >
              <Search className="size-[18px]" aria-hidden />
            </button>

            <ThemeToggle className="hidden sm:flex" />

            {isAuthenticated && user ? (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">
                    {initialsOf(user.name)}
                  </span>
                  <span className="max-w-24 truncate">{user.name.split(" ")[0]}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void logout()}
                  aria-label="লগআউট"
                >
                  <LogOut aria-hidden />
                </Button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">লগইন</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">ফ্রি অ্যাকাউন্ট</Link>
                </Button>
              </div>
            )}

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="grid size-10 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground lg:hidden"
                  aria-label="মেনু খুলুন"
                >
                  <Menu className="size-[18px]" aria-hidden />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0">
                <SheetTitle className="sr-only">মেনু</SheetTitle>
                <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
                  <Logo />
                  <SheetClose asChild>
                    <button
                      type="button"
                      className="grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-surface-muted"
                      aria-label="মেনু বন্ধ করুন"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </SheetClose>
                </div>

                <nav aria-label="মোবাইল মেনু" className="flex flex-col p-3">
                  {NAV_LINKS.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground transition-colors hover:bg-surface-muted"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}

                  <div className="my-2 h-px bg-border" />

                  <p className="px-3 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-wide text-faint-foreground">
                    ক্যাটাগরি
                  </p>
                  {CATEGORIES.map((category) => (
                    <SheetClose asChild key={category.slug}>
                      <Link
                        href={`/tools/category/${category.slug}`}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground transition-colors hover:bg-surface-muted"
                      >
                        <span aria-hidden>{category.emoji}</span>
                        {category.nameBn}
                      </Link>
                    </SheetClose>
                  ))}

                  <div className="my-2 h-px bg-border" />

                  {isAuthenticated && user ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          href={user.role === "admin" ? "/admin" : "/dashboard"}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-surface-muted"
                        >
                          <LayoutDashboard className="size-4" aria-hidden />
                          ড্যাশবোর্ড
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <button
                          type="button"
                          onClick={() => void logout()}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[15px] font-medium text-foreground hover:bg-surface-muted"
                        >
                          <LogOut className="size-4" aria-hidden />
                          লগআউট
                        </button>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button variant="outline" size="lg" block asChild>
                          <Link href="/login">
                            <User aria-hidden />
                            লগইন করুন
                          </Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button size="lg" block asChild className="mt-2">
                          <Link href="/register">ফ্রি অ্যাকাউন্ট তৈরি করুন</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

function CategoryMenu({ active }: { active: boolean }) {
  return (
    <div className="group relative">
      <Link
        href="/tools/category/money"
        className={cn(
          "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
        aria-haspopup="true"
      >
        ক্যাটাগরি
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
          <path
            d="M2.5 4.5L6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
      <div
        className="invisible absolute left-0 top-full w-[22rem] translate-y-1 rounded-xl border border-border bg-surface p-2 opacity-0 shadow-lg transition-[opacity,transform] duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
        role="menu"
      >
        <div className="grid grid-cols-2 gap-1">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/tools/category/${category.slug}`}
              role="menuitem"
              className="rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-muted"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span aria-hidden>{category.emoji}</span>
                {category.nameBn}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
        <Link
          href="/tools"
          role="menuitem"
          className="mt-1 flex items-center justify-center gap-1 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          সব {CATEGORIES.length}টি ক্যাটাগরি ও সব টুল দেখুন
        </Link>
      </div>
    </div>
  );
}

export { LogoMark };

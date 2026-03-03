import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Mail, Menu, X } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BrandLogo } from "../../components/branding/BrandLogo";
import { useAuthSession } from "../../features/auth/auth-session-context";
import { appNavItems } from "./navItems";

const getPageTitle = (pathname: string) => {
  const activeItem = appNavItems.find((item) => pathname.startsWith(item.path));
  return activeItem ? activeItem.label : "FlowLedger";
};

export const AppShell = () => {
  const { pathname } = useLocation();
  const { user, logoutSession, isLoggingOut } = useAuthSession();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const pageTitle = getPageTitle(pathname);
  const displayName = user?.name?.trim() || "User";
  const displayEmail = user?.email || "No email";
  const initial =
    displayName.charAt(0).toUpperCase() || displayEmail.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current) {
        return;
      }

      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    setIsProfileMenuOpen(false);
    setIsMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (isMobileNavOpen) {
      setIsProfileMenuOpen(false);
    }
  }, [isMobileNavOpen]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileNavOpen(false)}
            className="absolute inset-0 bg-slate-900/30"
          />

          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white">
            <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
              <BrandLogo variant="full" size="sm" />

              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-2 px-3 py-4">
              {appNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    [
                      "rounded-xl px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-primary-100 text-primary-600"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-screen w-full flex-col md:flex-row">
        <aside className="hidden border-b border-slate-200 bg-white md:block md:w-64 md:border-b-0 md:border-r">
          <div className="border-b border-slate-200 px-5 py-4 md:flex md:h-20 md:items-center md:py-0">
            <BrandLogo variant="full" size="sm" />
          </div>
          <nav className="flex gap-2 overflow-x-auto px-3 py-4 md:flex-col md:overflow-visible">
            {appNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-primary-100 text-primary-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 md:h-20 md:px-6 md:py-0">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
              </button>

              <h1 className="truncate text-xl font-semibold text-slate-800">{pageTitle}</h1>
            </div>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((open) => !open)}
                className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 text-sm text-slate-700 transition hover:border-primary-200 hover:bg-primary-50/40"
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary-200 bg-primary-100 text-sm font-semibold text-primary-700">
                  {initial}
                </span>
                <ChevronDown
                  className={[
                    "h-4 w-4 text-slate-500 transition-transform duration-200",
                    isProfileMenuOpen ? "rotate-180" : "",
                  ].join(" ")}
                  aria-hidden="true"
                />
              </button>

              {isProfileMenuOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                  <div className="border-b border-slate-100 bg-gradient-to-r from-primary-50 via-white to-emerald-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Account
                    </p>
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/90 p-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary-200 bg-primary-100 text-base font-semibold text-primary-700">
                        {initial}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">
                          {displayName}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-600">
                          <Mail
                            className="h-3.5 w-3.5 shrink-0 text-slate-500"
                            aria-hidden="true"
                          />
                          {displayEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      void logoutSession();
                    }}
                    disabled={isLoggingOut}
                    className="m-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    {isLoggingOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              ) : null}
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

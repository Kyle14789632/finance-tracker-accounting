import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuthSession } from "../../features/auth/auth-session-context";
import { appNavItems } from "./navItems";

const getPageTitle = (pathname: string) => {
  const activeItem = appNavItems.find((item) => pathname.startsWith(item.path));
  return activeItem ? activeItem.label : "Student Finance Tracker";
};

export const AppShell = () => {
  const { pathname } = useLocation();
  const { user, logoutSession, isLoggingOut } = useAuthSession();
  const pageTitle = getPageTitle(pathname);
  const initial = user?.name?.trim().charAt(0).toUpperCase() || user?.email.charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col md:flex-row">
        <aside className="border-b border-slate-200 bg-white md:w-64 md:border-b-0 md:border-r">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Student Finance</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">Tracker</p>
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
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 md:px-6">
            <h1 className="text-xl font-semibold text-slate-800">{pageTitle}</h1>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Signed in as</p>
                <p className="text-sm font-medium text-slate-700">{user?.name || user?.email || "User"}</p>
              </div>
              <button
                type="button"
                onClick={() => void logoutSession()}
                disabled={isLoggingOut}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  {initial}
                </span>
                <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
              </button>
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

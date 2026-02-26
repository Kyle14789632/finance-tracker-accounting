import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "../layout/AppShell";
import { LoginPage } from "../../features/auth/LoginPage";
import { RegisterPage } from "../../features/auth/RegisterPage";
import { useAuthSession } from "../../features/auth/auth-session-context";
import { AccountsPage } from "../../features/accounts/AccountsPage";
import { CategoriesPage } from "../../features/categories/CategoriesPage";
import { DashboardPage } from "../../features/reports/DashboardPage";
import { StatementsPage } from "../../features/statements/StatementsPage";
import { SettingsPage } from "../../features/settings/SettingsPage";
import { TransactionsPage } from "../../features/transactions/TransactionsPage";

const SessionLoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <section className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center">
      <p className="text-sm font-medium text-slate-700">Loading your session...</p>
      <p className="mt-2 text-xs text-slate-500">Please wait a moment.</p>
    </section>
  </div>
);

const ProtectedRoute = () => {
  const { isSessionLoading, isAuthenticated } = useAuthSession();
  const location = useLocation();

  if (isSessionLoading) {
    return <SessionLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" state={{ from: location }} />;
  }

  return <Outlet />;
};

const PublicOnlyRoute = () => {
  const { isSessionLoading, isAuthenticated } = useAuthSession();

  if (isSessionLoading) {
    return <SessionLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate replace to="/app/dashboard" />;
  }

  return <Outlet />;
};

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate replace to="/app/dashboard" />} />

    <Route element={<PublicOnlyRoute />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>

    <Route path="/dashboard" element={<Navigate replace to="/app/dashboard" />} />
    <Route path="/transactions" element={<Navigate replace to="/app/transactions" />} />
    <Route path="/accounts" element={<Navigate replace to="/app/accounts" />} />
    <Route path="/categories" element={<Navigate replace to="/app/categories" />} />
    <Route path="/statements" element={<Navigate replace to="/app/statements" />} />
    <Route path="/settings" element={<Navigate replace to="/app/settings" />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate replace to="dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="transactions"
          element={<TransactionsPage />}
        />
        <Route
          path="accounts"
          element={<AccountsPage />}
        />
        <Route
          path="categories"
          element={<CategoriesPage />}
        />
        <Route
          path="statements"
          element={<StatementsPage />}
        />
        <Route
          path="settings"
          element={<SettingsPage />}
        />
      </Route>
    </Route>

    <Route path="*" element={<Navigate replace to="/" />} />
  </Routes>
);

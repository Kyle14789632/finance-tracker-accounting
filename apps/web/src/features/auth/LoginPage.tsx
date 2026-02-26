import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { LoginRequest } from "@sft/shared";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { login } from "./api";
import { useAuthSession } from "./auth-session-context";
import { applyServerFormErrors } from "./form-errors";
import { loginRequestSchema } from "./schemas";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setSession } = useAuthSession();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema)
  });

  const loginMutation = useMutation({
    mutationFn: login
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const response = await loginMutation.mutateAsync(values);
      setSession(response.accessToken, response.user);
      navigate("/app/dashboard", { replace: true });
    } catch (error) {
      setFormError(applyServerFormErrors(error, setError));
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Student Finance Tracker</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to continue tracking your finances.</p>

        {formError ? (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("email")}
            />
            {errors.email ? <span className="mt-1 block text-xs text-rose-600">{errors.email.message}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("password")}
            />
            {errors.password ? <span className="mt-1 block text-xs text-rose-600">{errors.password.message}</span> : null}
          </label>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          No account yet?{" "}
          <Link to="/register" className="font-medium text-primary-700 hover:text-primary-800">
            Create one
          </Link>
        </p>
      </section>
    </div>
  );
};

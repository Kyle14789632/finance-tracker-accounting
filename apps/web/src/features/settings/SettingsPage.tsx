import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { getApiErrorMessage } from "../../utils/api-errors";
import { updateMeSettings } from "../auth/api";
import { useAuthSession } from "../auth/auth-session-context";

const nameFormSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").max(100, "Name must be at most 100 characters")
});

type NameFormValues = z.infer<typeof nameFormSchema>;

const SettingsLoadingState = () => (
  <section className="space-y-4">
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-5 w-48 rounded bg-slate-200" />
        <div className="h-4 w-64 rounded bg-slate-100" />
        <div className="mt-2 h-14 rounded-2xl border border-slate-100 bg-slate-50" />
      </div>
    </div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="h-4 w-56 rounded bg-slate-100" />
        <div className="h-10 rounded-xl bg-slate-100" />
      </div>
    </div>
  </section>
);

export const SettingsPage = () => {
  const { accessToken, user, isSessionLoading, setCurrentUser } = useAuthSession();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<"toggle" | "name" | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors }
  } = useForm<NameFormValues>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      name: user?.name ?? ""
    }
  });

  useEffect(() => {
    reset({ name: user?.name ?? "" });
  }, [reset, user?.name]);

  const updateToggleMutation = useMutation({
    mutationFn: async (learningModeEnabled: boolean) => {
      return updateMeSettings(accessToken as string, { learningModeEnabled });
    },
    onSuccess: (response) => {
      setCurrentUser(response.user);
      setErrorMessage(null);
      setSaveMessage("Show journal setting saved.");
      setLastAction(null);
    },
    onError: (error) => {
      setSaveMessage(null);
      setErrorMessage(getApiErrorMessage(error, "Could not save settings. Please try again."));
    }
  });

  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      return updateMeSettings(accessToken as string, { name });
    },
    onSuccess: (response) => {
      setCurrentUser(response.user);
      setErrorMessage(null);
      setSaveMessage("Profile updated.");
      reset({ name: response.user.name ?? "" });
      setLastAction(null);
    },
    onError: (error) => {
      setSaveMessage(null);
      setErrorMessage(getApiErrorMessage(error, "Could not update profile. Please try again."));
    }
  });

  const showJournalEnabled = Boolean(user?.learningModeEnabled);
  const isSavingSettings = updateToggleMutation.isPending || updateNameMutation.isPending;

  const saveStateText = useMemo(() => {
    if (isSavingSettings) {
      return "Saving...";
    }

    if (saveMessage) {
      return saveMessage;
    }

    return "Changes are applied immediately across the app.";
  }, [isSavingSettings, saveMessage]);

  const handleToggle = () => {
    if (!accessToken || !user || updateToggleMutation.isPending) {
      return;
    }

    setSaveMessage(null);
    setErrorMessage(null);
    setLastAction("toggle");
    updateToggleMutation.mutate(!showJournalEnabled);
  };

  const handleNameSubmit = handleSubmit((values) => {
    if (!accessToken || !user || updateNameMutation.isPending) {
      return;
    }

    setSaveMessage(null);
    setErrorMessage(null);
    setLastAction("name");
    updateNameMutation.mutate(values.name);
  });

  const handleRetry = () => {
    if (!accessToken || !user || !lastAction) {
      return;
    }

    if (lastAction === "toggle" && !updateToggleMutation.isPending) {
      updateToggleMutation.mutate(!showJournalEnabled);
      return;
    }

    if (lastAction === "name" && !updateNameMutation.isPending) {
      const parsedName = nameFormSchema.safeParse({ name: getValues("name") });

      if (!parsedName.success) {
        return;
      }

      updateNameMutation.mutate(parsedName.data.name);
    }
  };

  if (isSessionLoading) {
    return <SettingsLoadingState />;
  }

  if (!accessToken || !user) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-900">No settings available</h2>
        <p className="mt-2 text-base text-slate-600">Your profile is not loaded yet.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-primary-600 px-4 py-2.5 text-base font-medium text-white hover:bg-primary-700"
        >
          Reload session
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Show journal</h2>
          <p className="mt-1 text-base text-slate-600">
            Turn this on to reveal journal entries and accounting explanations in Transactions.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-slate-900">
                {showJournalEnabled ? "Journal display is enabled" : "Journal display is disabled"}
              </p>
              <p className="mt-1 text-sm text-slate-600">{saveStateText}</p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={showJournalEnabled}
              aria-label="Toggle show journal"
              disabled={updateToggleMutation.isPending}
              onClick={handleToggle}
              className={`inline-flex h-7 w-12 items-center rounded-full p-1 transition ${
                showJournalEnabled ? "bg-primary-600" : "bg-slate-300"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white transition ${
                  showJournalEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
          <p className="mt-1 text-base text-slate-600">Review your account details and update your display name.</p>
        </div>

        <dl className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">Email</dt>
            <dd className="mt-1 text-base font-medium text-slate-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Currency</dt>
            <dd className="mt-1 text-base font-medium text-slate-900">{user.currency}</dd>
          </div>
        </dl>

        <form className="mt-5 space-y-3" onSubmit={handleNameSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              type="text"
              autoComplete="name"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("name")}
            />
            {errors.name ? <span className="mt-1 block text-xs text-rose-600">{errors.name.message}</span> : null}
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateNameMutation.isPending}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              {updateNameMutation.isPending ? "Saving profile..." : "Save name"}
            </button>
          </div>
        </form>
      </section>

      {errorMessage ? (
        <section className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={handleRetry}
              disabled={isSavingSettings}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Retry
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
};

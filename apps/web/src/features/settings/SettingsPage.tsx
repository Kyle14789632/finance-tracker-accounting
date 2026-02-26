import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { updateMeSettings } from "../auth/api";
import { useAuthSession } from "../auth/auth-session-context";

const SettingsLoadingState = () => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="animate-pulse space-y-3">
      <div className="h-5 w-48 rounded bg-slate-200" />
      <div className="h-4 w-64 rounded bg-slate-100" />
      <div className="mt-2 h-14 rounded-2xl border border-slate-100 bg-slate-50" />
    </div>
  </section>
);

export const SettingsPage = () => {
  const { accessToken, user, isSessionLoading, setCurrentUser } = useAuthSession();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateSettingsMutation = useMutation({
    mutationFn: async (learningModeEnabled: boolean) => {
      return updateMeSettings(accessToken as string, { learningModeEnabled });
    },
    onSuccess: (response) => {
      setCurrentUser(response.user);
      setErrorMessage(null);
      setSaveMessage("Settings saved.");
    },
    onError: (error) => {
      setSaveMessage(null);
      setErrorMessage(getApiErrorMessage(error, "Could not save settings. Please try again."));
    }
  });

  const learningModeEnabled = Boolean(user?.learningModeEnabled);

  const saveStateText = useMemo(() => {
    if (updateSettingsMutation.isPending) {
      return "Saving...";
    }

    if (saveMessage) {
      return saveMessage;
    }

    return "Changes are applied immediately across the app.";
  }, [saveMessage, updateSettingsMutation.isPending]);

  const handleToggle = () => {
    if (!accessToken || !user || updateSettingsMutation.isPending) {
      return;
    }

    setSaveMessage(null);
    setErrorMessage(null);
    updateSettingsMutation.mutate(!learningModeEnabled);
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
          <h2 className="text-xl font-semibold text-slate-900">Learning mode</h2>
          <p className="mt-1 text-base text-slate-600">
            Turn this on to reveal journal entries and accounting explanations in Transactions.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-slate-900">
                {learningModeEnabled ? "Learning mode is enabled" : "Learning mode is disabled"}
              </p>
              <p className="mt-1 text-sm text-slate-600">{saveStateText}</p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={learningModeEnabled}
              aria-label="Toggle learning mode"
              disabled={updateSettingsMutation.isPending}
              onClick={handleToggle}
              className={`inline-flex h-7 w-12 items-center rounded-full p-1 transition ${
                learningModeEnabled ? "bg-primary-600" : "bg-slate-300"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white transition ${
                  learningModeEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <section className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={handleToggle}
              disabled={updateSettingsMutation.isPending}
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

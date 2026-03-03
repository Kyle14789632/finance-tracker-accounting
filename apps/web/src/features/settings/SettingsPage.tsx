import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthSession } from "../auth/auth-session-context";
import { ProfileSettingsCard } from "./components/ProfileSettingsCard";
import { SessionUnavailableCard } from "./components/SessionUnavailableCard";
import { SettingsLoadingState } from "./components/SettingsLoadingState";
import { ShowJournalCard } from "./components/ShowJournalCard";
import { nameFormSchema, type NameFormValues } from "./form";
import { useSettingsMutations } from "./hooks/useSettingsMutations";

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
    formState: { errors },
  } = useForm<NameFormValues>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      name: user?.name ?? "",
    },
  });

  useEffect(() => {
    reset({ name: user?.name ?? "" });
  }, [reset, user?.name]);

  const { updateToggleMutation, updateNameMutation } = useSettingsMutations({
    accessToken,
    setCurrentUser,
    resetNameForm: (name) => {
      reset({ name });
    },
    setSaveMessage,
    setErrorMessage,
    setLastAction,
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
      <SessionUnavailableCard
        onReload={() => {
          window.location.reload();
        }}
      />
    );
  }

  return (
    <>
      <ShowJournalCard
        showJournalEnabled={showJournalEnabled}
        saveStateText={saveStateText}
        isSavingToggle={updateToggleMutation.isPending}
        onToggle={handleToggle}
      />

      <ProfileSettingsCard
        user={user}
        register={register}
        errors={errors}
        isSavingName={updateNameMutation.isPending}
        onSubmit={handleNameSubmit}
      />

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

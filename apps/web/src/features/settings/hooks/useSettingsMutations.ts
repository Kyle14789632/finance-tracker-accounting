import { useMutation } from "@tanstack/react-query";
import type { PublicUser } from "@sft/shared";
import { getApiErrorMessage } from "../../../utils/api-errors";
import { updateMeSettings } from "../../auth/api";

type UseSettingsMutationsParams = {
  accessToken: string | null;
  setCurrentUser: (user: PublicUser) => void;
  resetNameForm: (name: string) => void;
  setSaveMessage: (message: string | null) => void;
  setErrorMessage: (message: string | null) => void;
  setLastAction: (action: "toggle" | "name" | null) => void;
};

export const useSettingsMutations = ({
  accessToken,
  setCurrentUser,
  resetNameForm,
  setSaveMessage,
  setErrorMessage,
  setLastAction,
}: UseSettingsMutationsParams) => {
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
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      return updateMeSettings(accessToken as string, { name });
    },
    onSuccess: (response) => {
      setCurrentUser(response.user);
      setErrorMessage(null);
      setSaveMessage("Profile updated.");
      resetNameForm(response.user.name ?? "");
      setLastAction(null);
    },
    onError: (error) => {
      setSaveMessage(null);
      setErrorMessage(getApiErrorMessage(error, "Could not update profile. Please try again."));
    },
  });

  return {
    updateToggleMutation,
    updateNameMutation,
  };
};

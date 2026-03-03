import type { PublicUser } from "@sft/shared";
import type { BaseSyntheticEvent } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { NameFormValues } from "../form";

type ProfileSettingsCardProps = {
  user: PublicUser;
  register: UseFormRegister<NameFormValues>;
  errors: FieldErrors<NameFormValues>;
  isSavingName: boolean;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
};

export const ProfileSettingsCard = ({
  user,
  register,
  errors,
  isSavingName,
  onSubmit,
}: ProfileSettingsCardProps) => (
  <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
      <p className="mt-1 text-base text-slate-600">
        Review your account details and update your display name.
      </p>
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

    <form className="mt-5 space-y-3" onSubmit={onSubmit}>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Name</span>
        <input
          type="text"
          autoComplete="name"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          {...register("name")}
        />
        {errors.name ? (
          <span className="mt-1 block text-xs text-rose-600">{errors.name.message}</span>
        ) : null}
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSavingName}
          className="mt-2 rounded-xl bg-primary-600 px-4 py-2.5 text-base font-medium text-white transition hover:bg-primary-700"
        >
          {isSavingName ? "Saving profile..." : "Save name"}
        </button>
      </div>
    </form>
  </section>
);

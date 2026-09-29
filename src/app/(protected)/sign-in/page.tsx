"use client";

import { useActionState } from "react";
import { signInWithEmail, type SignInState } from "./actions";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState<SignInState, FormData>(signInWithEmail, {
    error: null,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <form action={formAction} className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-ink/10 bg-paper p-8 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(3,105,161,0.06)]">
        <h1 className="text-xl font-bold text-ink">Sign in</h1>

        {state.error && <p className="rounded bg-cream px-3 py-2 text-sm text-text">{state.error}</p>}

        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded border border-ink/10 px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded border border-ink/10 px-2 py-1"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

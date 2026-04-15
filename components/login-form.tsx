"use client";

import { useFormState } from "react-dom";

import { loginAction } from "@/app/login/actions";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm() {
  const [state, action] = useFormState(loginAction, undefined);

  return (
    <form action={action} className="auth-form stack">
      <div className="field">
        <label htmlFor="password">Shared password</label>
        <input className="input" id="password" name="password" placeholder="Enter the password for this workspace" type="password" />
      </div>
      {state ? <p className="error-text">{state}</p> : null}
      <SubmitButton>Enter workspace</SubmitButton>
    </form>
  );
}

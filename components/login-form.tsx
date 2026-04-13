"use client";

import { useFormState } from "react-dom";

import { loginAction } from "@/app/login/actions";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm() {
  const [state, action] = useFormState(loginAction, undefined);

  return (
    <form action={action} className="auth-form stack">
      <div className="field">
        <label htmlFor="password">共享密碼</label>
        <input className="input" id="password" name="password" placeholder="輸入你設定的進入密碼" type="password" />
      </div>
      {state ? <p className="error-text">{state}</p> : null}
      <SubmitButton>進入行程規劃</SubmitButton>
    </form>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getSetupStatus } from "@/lib/env";
import { hasValidSessionToken } from "@/lib/session";

export default async function LoginPage() {
  const token = cookies().get("travel_planner_session")?.value;
  if (await hasValidSessionToken(token)) {
    redirect("/trips");
  }

  const setupStatus = getSetupStatus();

  return (
    <main className="auth-layout">
      <div className="auth-shell">
        <section className="auth-panel auth-panel--hero">
          <span className="tag">Travel Planner</span>
          <p className="auth-kicker">Private travel workspace</p>
          <h1>Keep every trip organized and open the details you need fast.</h1>
          <div className="auth-highlights">
            <div className="auth-highlight">
              <strong>Trip overview</strong>
              <p>See dates and key details at a glance.</p>
            </div>
            <div className="auth-highlight">
              <strong>Day planning</strong>
              <p>Lay out each day in a clearer way.</p>
            </div>
            <div className="auth-highlight">
              <strong>Travel details</strong>
              <p>Manage flights, stays, and itinerary items in dedicated sections.</p>
            </div>
          </div>
        </section>

        <section className="auth-panel auth-panel--form">
          <div className="stack">
            <span className="tag">Login</span>
            <h2>Open your travel workspace</h2>
            <p className="muted">Enter the shared password to continue.</p>
          </div>

          {!setupStatus.configured ? (
            <div className="notice">
              <strong>Full data is not available right now</strong>
              <p className="muted">The travel workspace is not fully configured yet. Try again later.</p>
            </div>
          ) : (
            <div className="auth-ready">
              <span className="auth-ready__dot" />
              <span>Ready to use</span>
            </div>
          )}

          <LoginForm />
        </section>
      </div>
    </main>
  );
}

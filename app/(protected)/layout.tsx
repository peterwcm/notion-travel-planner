import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { clearSession } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/env";
import { hasValidSessionToken } from "@/lib/session";

async function logoutAction() {
  "use server";

  clearSession();
  redirect("/login");
}

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!(await hasValidSessionToken(token))) {
    redirect("/login");
  }

  return (
    <div className="app-shell">
      <div className="shell-grid">
        <aside className="shell-sidebar">
          <div className="shell-brand">
            <span className="tag">Travel Planner</span>
            <h1>旅程規劃</h1>
            <p>更安靜、更好讀的旅行工作台。</p>
          </div>

          <div className="shell-note">
            <span className="shell-note__label">Sections</span>
            <strong>行程與旅行細節</strong>
            <p>旅程、每日安排、航班、住宿、接送與提醒。</p>
          </div>

          <div className="shell-actions">
            <Link className="ghost-button" href="/trips">
              所有旅程
            </Link>
            <form action={logoutAction}>
              <button className="ghost-button" type="submit">
                登出
              </button>
            </form>
          </div>
        </aside>
        <main className="shell-content">{children}</main>
      </div>
    </div>
  );
}

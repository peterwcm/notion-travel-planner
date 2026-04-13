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
            <h1>旅程規劃筆記</h1>
            <p>
              用更簡潔的方式整理旅程，不讓 Notion 原始資料表直接壓到閱讀體驗。
            </p>
          </div>

          <div className="shell-note">
            <span className="shell-note__label">Sync status</span>
            <strong>Notion 為主資料源</strong>
            <p>所有新增與編輯都直接寫回 Notion，這裡專注在更乾淨的視覺與操作流程。</p>
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

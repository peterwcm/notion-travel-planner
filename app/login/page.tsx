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
          <h1>清楚整理旅程，快速打開需要的細節。</h1>
          <div className="auth-highlights">
            <div className="auth-highlight">
              <strong>旅程總覽</strong>
              <p>日期與重點資訊，一眼掌握。</p>
            </div>
            <div className="auth-highlight">
              <strong>每日行程</strong>
              <p>每天安排更直觀。</p>
            </div>
            <div className="auth-highlight">
              <strong>旅行細節</strong>
              <p>航班、住宿與每日行程分區管理。</p>
            </div>
          </div>
        </section>

        <section className="auth-panel auth-panel--form">
          <div className="stack">
            <span className="tag">登入入口</span>
            <h2>進入你的旅程工作台</h2>
            <p className="muted">輸入共享密碼後即可進入。</p>
          </div>

          {!setupStatus.configured ? (
            <div className="notice">
              <strong>目前無法載入完整資料</strong>
              <p className="muted">旅程工作台尚未完成設定，請稍後再試。</p>
            </div>
          ) : (
            <div className="auth-ready">
              <span className="auth-ready__dot" />
              <span>可以開始使用</span>
            </div>
          )}

          <LoginForm />
        </section>
      </div>
    </main>
  );
}

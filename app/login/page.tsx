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
          <p className="auth-kicker">Simple private workspace</p>
          <h1>用一個安靜、清楚的介面，把旅行安排回到最重要的節奏。</h1>
          <p className="auth-copy">
            建立旅程、拆成每天、補上景點與備註。資料仍在 Notion，
            但閱讀與編排體驗更像一個現代產品，而不是資料表。
          </p>
          <div className="auth-highlights">
            <div className="auth-highlight">
              <strong>旅程總覽</strong>
              <p>快速看到每次出發的狀態、日期與進度。</p>
            </div>
            <div className="auth-highlight">
              <strong>每日行程</strong>
              <p>把交通、住宿、餐廳與提醒放進同一個時間軸。</p>
            </div>
            <div className="auth-highlight">
              <strong>Notion 同步</strong>
              <p>維持你熟悉的資料管理方式，不額外建立第二套後台。</p>
            </div>
          </div>
        </section>

        <section className="auth-panel auth-panel--form">
          <div className="stack">
            <span className="tag">登入入口</span>
            <h2>進入你的旅程工作台</h2>
            <p className="muted">輸入共享密碼後即可進入。這個版本專為單人使用與 Vercel Free 部署設計。</p>
          </div>

          {!setupStatus.configured ? (
            <div className="notice">
              <strong>尚未完成 Notion 設定</strong>
              <p className="muted">
                缺少：{setupStatus.missing.join(", ")}。完成環境變數後即可開始正式使用資料同步。
              </p>
            </div>
          ) : (
            <div className="auth-ready">
              <span className="auth-ready__dot" />
              <span>Notion 連線設定已就緒</span>
            </div>
          )}

          <LoginForm />
        </section>
      </div>
    </main>
  );
}

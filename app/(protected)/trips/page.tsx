import { TripCard } from "@/components/trip-card";
import { SubmitButton } from "@/components/submit-button";
import { createTripAction } from "@/app/(protected)/trips/actions";
import { getNotionStatus, listTrips } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const [trips, setupStatus] = await Promise.all([listTrips(), Promise.resolve(getNotionStatus())]);

  return (
    <div className="page">
      <section className="hero hero--dashboard">
        <div className="hero-copy">
          <span className="tag">旅程總覽</span>
          <p className="hero-kicker">Private travel desk</p>
          <h2>把每次旅行整理成簡單、好讀、真的會反覆打開的行程頁。</h2>
          <p className="muted hero-text">
            從規劃中到旅行中，先看總覽，再打開每個旅程細化到每天與每個行程項目。
          </p>
          <div className="hero-points">
            <span>Notion sync</span>
            <span>Clean overview</span>
            <span>Daily planning</span>
          </div>
        </div>
        <div className="hero-aside">
          <div className="hero-aside__card">
            <span className="hero-aside__label">Trips</span>
            <strong>{trips.length}</strong>
            <p>{setupStatus.configured ? "Notion 連線正常，可直接新增資料" : "資料源尚未完成設定"}</p>
          </div>
        </div>
        <div className="metrics metrics--dashboard">
          <div className="metric">
            <span className="metric__label">規劃中的旅程</span>
            <strong>{trips.filter((trip) => trip.status === "規劃中").length}</strong>
          </div>
          <div className="metric">
            <span className="metric__label">已預訂或旅行中</span>
            <strong>{trips.filter((trip) => trip.status !== "規劃中").length}</strong>
          </div>
          <div className="metric">
            <span className="metric__label">目前資料來源</span>
            <strong>{setupStatus.configured ? "Notion" : "未設定"}</strong>
          </div>
        </div>
      </section>

      {!setupStatus.configured ? (
        <div className="notice">
          <strong>尚未完成 Notion 連線設定</strong>
          <p className="muted">缺少：{setupStatus.missing.join(", ")}。先補上 `.env.local` 再開始新增旅程。</p>
        </div>
      ) : null}

      <section className="panel panel--feature stack">
        <div className="header-actions">
          <div>
            <h3 className="section-title">建立新旅程</h3>
            <p className="muted">先填基本資訊，再進入詳細頁面整理每天的安排與項目。</p>
          </div>
          <span className="panel-chip">Create</span>
        </div>
        <form action={createTripAction} className="stack">
          <div className="forms-grid">
            <div className="field">
              <label htmlFor="title">旅程名稱</label>
              <input className="input" id="title" name="title" placeholder="例如：東京秋季散步之旅" required />
            </div>
            <div className="field">
              <label htmlFor="destination">目的地</label>
              <input className="input" id="destination" name="destination" placeholder="東京、日本" required />
            </div>
            <div className="field">
              <label htmlFor="startDate">開始日期</label>
              <input className="input" id="startDate" name="startDate" type="date" />
            </div>
            <div className="field">
              <label htmlFor="endDate">結束日期</label>
              <input className="input" id="endDate" name="endDate" type="date" />
            </div>
            <div className="field">
              <label htmlFor="status">狀態</label>
              <select className="select" defaultValue="規劃中" id="status" name="status">
                <option value="規劃中">規劃中</option>
                <option value="已預訂">已預訂</option>
                <option value="旅行中">旅行中</option>
                <option value="已完成">已完成</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="cover">封面圖片網址</label>
              <input className="input" id="cover" name="cover" placeholder="https://..." />
            </div>
          </div>
          <div className="field">
            <label htmlFor="notes">旅程備註</label>
            <textarea className="textarea" id="notes" name="notes" placeholder="這次旅行的目標、待確認事項、預訂進度..." />
          </div>
          <SubmitButton>建立旅程</SubmitButton>
        </form>
      </section>

      <section className="section-block">
        <div className="header-actions">
          <div>
            <h3 className="section-title">旅程列表</h3>
            <p className="muted">每張卡片是一個獨立旅程檔案，點入後可編排每日行程。</p>
          </div>
        </div>
        {trips.length > 0 ? (
          <div className="trip-grid">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="empty">目前還沒有任何旅程。建立第一個旅程後，這裡會出現清單卡片。</div>
        )}
      </section>
    </div>
  );
}

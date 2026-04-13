import { TripCard } from "@/components/trip-card";
import { SubmitButton } from "@/components/submit-button";
import { createTripAction } from "@/app/(protected)/trips/actions";
import { getNotionStatus, listTrips } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const setupStatus = getNotionStatus();
  let trips = [] as Awaited<ReturnType<typeof listTrips>>;
  let hasLoadError = false;

  try {
    trips = await listTrips();
  } catch {
    hasLoadError = true;
  }

  const activeTrips = trips.filter((trip) => trip.status !== "已完成").length;

  return (
    <div className="page">
      <section className="hero hero--compact">
        <div className="header-actions">
          <div className="stack compact-headline">
            <span className="tag">旅程</span>
            <h2>你的旅程</h2>
          </div>
          <div className="stats-inline">
            <span>{trips.length} 個旅程</span>
            <span>{activeTrips} 個進行中</span>
          </div>
        </div>
      </section>

      {!setupStatus.configured || hasLoadError ? (
        <div className="notice">
          <strong>目前暫時無法讀取旅程資料</strong>
          <p className="muted">請檢查設定後重新整理頁面。</p>
        </div>
      ) : null}

      <section className="panel panel--feature stack">
        <div className="header-actions">
          <h3 className="section-title">建立新旅程</h3>
          <span className="panel-chip">New</span>
        </div>
        <form action={createTripAction} className="stack">
          <div className="forms-grid">
            <div className="field">
              <label htmlFor="title">旅程名稱</label>
              <input className="input" id="title" name="title" placeholder="東京秋季散步之旅" required />
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
            <label htmlFor="notes">摘要</label>
            <textarea className="textarea textarea--compact" id="notes" name="notes" placeholder="這趟旅程的短摘要" />
          </div>
          <SubmitButton>建立旅程</SubmitButton>
        </form>
      </section>

      <section className="section-block">
        <div className="header-actions">
          <h3 className="section-title">全部旅程</h3>
        </div>
        {trips.length > 0 ? (
          <div className="trip-grid">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="empty">目前還沒有任何旅程。</div>
        )}
      </section>
    </div>
  );
}

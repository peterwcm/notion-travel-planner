import Link from "next/link";
import { notFound } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import {
  createDayAction,
  createItemAction,
  deleteItemAction,
  updateItemAction,
} from "@/app/(protected)/trips/actions";
import { currency, formatDate } from "@/lib/utils";
import { getNotionStatus, getTripDetail, getTripStats } from "@/lib/notion";

export const dynamic = "force-dynamic";

interface TripDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const [detail, setupStatus] = await Promise.all([
    getTripDetail(params.id),
    Promise.resolve(getNotionStatus()),
  ]);

  if (!setupStatus.configured) {
    return (
      <div className="page">
        <div className="notice">
          <strong>尚未完成 Notion 設定</strong>
          <p className="muted">缺少：{setupStatus.missing.join(", ")}。補齊後即可查看旅程詳細內容。</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    notFound();
  }

  const stats = getTripStats(detail);

  return (
    <div className="page">
      <Link className="ghost-button" href="/trips">
        回旅程列表
      </Link>

      <section className="hero summary-hero">
        <div className="stack summary-copy">
          <span className="tag">{detail.trip.status}</span>
          <p className="hero-kicker">Trip overview</p>
          <h2>{detail.trip.title}</h2>
          <p className="muted summary-destination">{detail.trip.destination}</p>
          <div className="hero-grid hero-grid--detail">
            <div className="metric">
              <span className="metric__label">日期</span>
              <strong>
                {formatDate(detail.trip.startDate)} - {formatDate(detail.trip.endDate)}
              </strong>
            </div>
            <div className="metric">
              <span className="metric__label">天數</span>
              <strong>{stats.days}</strong>
            </div>
            <div className="metric">
              <span className="metric__label">預估費用</span>
              <strong>{currency(stats.budget)}</strong>
            </div>
          </div>
          <p className="summary-notes">{detail.trip.notes || "尚未填寫旅程備註。可以在 Notion 或這個介面補充。"} </p>
        </div>

        <div className="summary-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {detail.trip.cover ? <img alt={detail.trip.title} src={detail.trip.cover} /> : null}
          <div className="summary-cover__meta">
            <span>{stats.items} 個行程節點</span>
            <span>{detail.days.length} 天節奏</span>
          </div>
        </div>
      </section>

      <section className="panel panel--feature stack">
        <div className="header-actions">
          <div>
            <h3 className="section-title">新增每日行程</h3>
            <p className="muted">先建立 Day，再把每段移動、用餐、景點或提醒補進去。</p>
          </div>
          <span className="panel-chip">Day Builder</span>
        </div>
        <form action={createDayAction} className="stack">
          <input name="tripId" type="hidden" value={detail.trip.id} />
          <div className="forms-grid">
            <div className="field">
              <label htmlFor="day-title">標題</label>
              <input className="input" defaultValue={`Day ${detail.days.length + 1}`} id="day-title" name="title" required />
            </div>
            <div className="field">
              <label htmlFor="day-date">日期</label>
              <input className="input" id="day-date" name="date" type="date" />
            </div>
            <div className="field">
              <label htmlFor="day-number">天次</label>
              <input className="input" defaultValue={detail.days.length + 1} id="day-number" min={1} name="dayNumber" type="number" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="summary">摘要</label>
            <textarea className="textarea" id="summary" name="summary" placeholder="例如：淺草、上野、晴空塔動線安排" />
          </div>
          <SubmitButton>新增 Day</SubmitButton>
        </form>
      </section>

      <section className="timeline">
        {detail.days.length > 0 ? (
          detail.days.map((day) => (
            <article className="timeline-day" key={day.id}>
              <div className="header-actions">
                <div>
                  <span className="tag">Day {day.dayNumber}</span>
                  <h3 className="section-title">{day.title}</h3>
                  <p className="muted">
                    {formatDate(day.date)} {day.summary ? `・${day.summary}` : ""}
                  </p>
                </div>
                <span className="pill">{day.items.length} 個項目</span>
              </div>

              <div className="day-grid">
                <div className="item-list">
                  {day.items.length > 0 ? (
                    day.items.map((item) => (
                      <div className="item-card" key={item.id}>
                        <div className="item-meta">
                          <div className="stack item-meta__title">
                            <span className="tag">{item.type}</span>
                            <h4>{item.title}</h4>
                          </div>
                          <div className="item-time">
                            {item.startTime || "--"} - {item.endTime || "--"}
                          </div>
                        </div>
                        <div className="row item-info">
                          <span className="muted">{item.location || "未填地點"}</span>
                          <span>{currency(item.cost)}</span>
                        </div>
                        {item.url ? (
                          <a className="muted" href={item.url} rel="noreferrer" target="_blank">
                            {item.url}
                          </a>
                        ) : null}
                        {item.notes ? <p>{item.notes}</p> : null}

                        <details>
                          <summary>編輯項目</summary>
                          <form action={updateItemAction} className="stack">
                            <input name="tripId" type="hidden" value={detail.trip.id} />
                            <input name="itemId" type="hidden" value={item.id} />
                            <input name="dayId" type="hidden" value={day.id} />
                            <div className="forms-grid">
                              <div className="field">
                                <label>名稱</label>
                                <input className="input" defaultValue={item.title} name="title" required />
                              </div>
                              <div className="field">
                                <label>類型</label>
                                <select className="select" defaultValue={item.type} name="type">
                                  <option value="景點">景點</option>
                                  <option value="交通">交通</option>
                                  <option value="住宿">住宿</option>
                                  <option value="餐廳">餐廳</option>
                                  <option value="購物">購物</option>
                                  <option value="提醒">提醒</option>
                                  <option value="其他">其他</option>
                                </select>
                              </div>
                              <div className="field">
                                <label>開始時間</label>
                                <input className="input" defaultValue={item.startTime} name="startTime" placeholder="09:00" />
                              </div>
                              <div className="field">
                                <label>結束時間</label>
                                <input className="input" defaultValue={item.endTime} name="endTime" placeholder="11:00" />
                              </div>
                              <div className="field">
                                <label>地點</label>
                                <input className="input" defaultValue={item.location} name="location" />
                              </div>
                              <div className="field">
                                <label>排序</label>
                                <input className="input" defaultValue={item.order} min={0} name="order" type="number" />
                              </div>
                              <div className="field">
                                <label>費用</label>
                                <input className="input" defaultValue={item.cost ?? ""} min={0} name="cost" type="number" />
                              </div>
                              <div className="field">
                                <label>網址</label>
                                <input className="input" defaultValue={item.url} name="url" />
                              </div>
                            </div>
                            <div className="field">
                              <label>備註</label>
                              <textarea className="textarea" defaultValue={item.notes} name="notes" />
                            </div>
                            <div className="row">
                              <SubmitButton>儲存變更</SubmitButton>
                            </div>
                          </form>

                          <form action={deleteItemAction}>
                            <input name="tripId" type="hidden" value={detail.trip.id} />
                            <input name="itemId" type="hidden" value={item.id} />
                            <button className="ghost-button" type="submit">
                              刪除項目
                            </button>
                          </form>
                        </details>
                      </div>
                    ))
                  ) : (
                    <div className="empty">這一天還沒有安排項目。先從右側表單新增第一筆。</div>
                  )}
                </div>

                <div className="panel panel--side stack">
                  <div>
                    <h4>新增行程項目</h4>
                    <p className="muted">項目會直接寫入 Notion 的 `Items` database，適合旅途中快速補資料。</p>
                  </div>
                  <form action={createItemAction} className="stack">
                    <input name="tripId" type="hidden" value={detail.trip.id} />
                    <input name="dayId" type="hidden" value={day.id} />
                    <div className="forms-grid">
                      <div className="field">
                        <label>名稱</label>
                        <input className="input" name="title" placeholder="例如：淺草寺散步" required />
                      </div>
                      <div className="field">
                        <label>類型</label>
                        <select className="select" defaultValue="景點" name="type">
                          <option value="景點">景點</option>
                          <option value="交通">交通</option>
                          <option value="住宿">住宿</option>
                          <option value="餐廳">餐廳</option>
                          <option value="購物">購物</option>
                          <option value="提醒">提醒</option>
                          <option value="其他">其他</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>開始時間</label>
                        <input className="input" name="startTime" placeholder="09:00" />
                      </div>
                      <div className="field">
                        <label>結束時間</label>
                        <input className="input" name="endTime" placeholder="11:00" />
                      </div>
                      <div className="field">
                        <label>地點</label>
                        <input className="input" name="location" placeholder="台東區淺草二丁目..." />
                      </div>
                      <div className="field">
                        <label>排序</label>
                        <input className="input" defaultValue={day.items.length} min={0} name="order" type="number" />
                      </div>
                      <div className="field">
                        <label>費用</label>
                        <input className="input" min={0} name="cost" placeholder="1200" type="number" />
                      </div>
                      <div className="field">
                        <label>網址</label>
                        <input className="input" name="url" placeholder="https://..." />
                      </div>
                    </div>
                    <div className="field">
                      <label>備註</label>
                      <textarea className="textarea" name="notes" placeholder="票券、交通提醒、預約資訊..." />
                    </div>
                    <SubmitButton>新增項目</SubmitButton>
                  </form>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="empty">尚未建立任何 Day。先用上方表單加入第一天的行程架構。</div>
        )}
      </section>
    </div>
  );
}

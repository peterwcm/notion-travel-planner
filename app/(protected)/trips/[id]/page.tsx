import type { ReactNode } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { BrowserTimeZoneField } from "@/components/browser-time-zone-field";
import { FlightPassengersField } from "@/components/flight-passengers-field";
import { FormDialog } from "@/components/form-dialog";
import { EditIcon, TrashIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import {
  createDayAction,
  createFlightAction,
  createItemAction,
  createPickupAction,
  createReminderAction,
  createStayAction,
  deleteEntityAction,
  deleteItemAction,
  updateFlightAction,
  updateItemAction,
  updatePickupAction,
  updateReminderAction,
  updateStayAction,
  updateTripAction,
} from "@/app/(protected)/trips/actions";
import { getFlightDisplayLabel } from "@/lib/flight-passengers";
import { getNotionStatus, getTripDetail, getTripStats } from "@/lib/notion";
import type { TripDetail, TripFlightPassenger, TripSectionTab } from "@/lib/types";
import { currency, formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const tabs: Array<{ id: TripSectionTab; label: string }> = [
  { id: "overview", label: "總覽" },
  { id: "itinerary", label: "行程" },
  { id: "flights", label: "航班" },
  { id: "stays", label: "住宿" },
  { id: "pickups", label: "接送" },
  { id: "reminders", label: "提醒" },
];

interface TripDetailPageProps {
  params: {
    id: string;
  };
  searchParams?: {
    tab?: string;
  };
}

function getTab(tab?: string): TripSectionTab {
  return tabs.some((item) => item.id === tab) ? (tab as TripSectionTab) : "overview";
}

export default async function TripDetailPage({ params, searchParams }: TripDetailPageProps) {
  const setupStatus = getNotionStatus();
  let detail: TripDetail | null = null;
  let hasLoadError = false;

  try {
    detail = await getTripDetail(params.id);
  } catch {
    hasLoadError = true;
  }

  if (!setupStatus.configured || hasLoadError) {
    return (
      <div className="page">
        <div className="notice">
          <strong>目前暫時無法讀取旅程資料</strong>
          <p className="muted">請檢查設定後重新整理頁面。</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    notFound();
  }

  const activeTab = getTab(searchParams?.tab);
  const stats = getTripStats(detail);

  return (
    <div className="page">
      <Link className="ghost-button" href="/trips">
        回旅程列表
      </Link>

      <section className="hero summary-hero summary-hero--compact">
        <div className="stack summary-copy">
          <div className="header-actions">
            <div className="stack compact-headline">
              <span className="tag">{detail.trip.status}</span>
              <h2>{detail.trip.title}</h2>
              <p className="muted summary-destination">{detail.trip.destination}</p>
            </div>
            <div className="stats-inline">
              <span>{detail.days.length} 天</span>
              <span>{stats.items} 個行程</span>
              <FormDialog
                description="修改旅程名稱、日期、狀態與封面。"
                title="編輯旅程"
                triggerClassName="ghost-button"
                triggerLabel="編輯旅程"
              >
                <form action={updateTripAction} className="stack">
                  <input name="tripId" type="hidden" value={detail.trip.id} />
                  <div className="forms-grid">
                    <div className="field">
                      <label className="field-label field-label--required" htmlFor="trip-title">旅程名稱</label>
                      <input className="input" defaultValue={detail.trip.title} id="trip-title" name="title" required />
                    </div>
                    <div className="field">
                      <label className="field-label field-label--required" htmlFor="trip-destination">目的地</label>
                      <input className="input" defaultValue={detail.trip.destination} id="trip-destination" name="destination" required />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="trip-startDate">開始日期</label>
                      <input className="input" defaultValue={toDateInputValue(detail.trip.startDate)} id="trip-startDate" name="startDate" type="date" />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="trip-endDate">結束日期</label>
                      <input className="input" defaultValue={toDateInputValue(detail.trip.endDate)} id="trip-endDate" name="endDate" type="date" />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="trip-status">狀態</label>
                      <select className="select" defaultValue={detail.trip.status} id="trip-status" name="status">
                        <option value="規劃中">規劃中</option>
                        <option value="已預訂">已預訂</option>
                        <option value="旅行中">旅行中</option>
                        <option value="已完成">已完成</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="trip-cover">封面圖片網址</label>
                      <input className="input" defaultValue={detail.trip.cover} id="trip-cover" name="cover" placeholder="https://..." />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="trip-notes">摘要</label>
                    <textarea className="textarea textarea--compact" defaultValue={detail.trip.notes} id="trip-notes" name="notes" placeholder="這趟旅程的短摘要" />
                  </div>
                  <SubmitButton>儲存旅程</SubmitButton>
                </form>
              </FormDialog>
            </div>
          </div>

          <div className="metrics metrics--summary">
            <div className="metric">
              <span className="metric__label">日期</span>
              <strong>
                {formatDate(detail.trip.startDate)} - {formatDate(detail.trip.endDate)}
              </strong>
            </div>
            <div className="metric">
              <span className="metric__label">細節</span>
              <strong>{stats.flights + stats.stays + stats.pickups + stats.reminders}</strong>
            </div>
            <div className="metric">
              <span className="metric__label">預估費用</span>
              <strong>{currency(stats.budget)}</strong>
            </div>
          </div>

          {detail.trip.notes ? <p className="summary-notes">{detail.trip.notes}</p> : null}
        </div>

        <div className="summary-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {detail.trip.cover ? <img alt={detail.trip.title} src={detail.trip.cover} /> : null}
          <div className="summary-cover__meta">
            <span>{stats.flights} 航班</span>
            <span>{stats.stays} 住宿</span>
          </div>
        </div>
      </section>

      <nav className="tab-nav" aria-label="旅程詳細區塊">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            className={tab.id === activeTab ? "tab-link tab-link--active" : "tab-link"}
            href={`/trips/${detail.trip.id}?tab=${tab.id}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {activeTab === "overview" ? <OverviewTab detail={detail} /> : null}
      {activeTab === "itinerary" ? <ItineraryTab detail={detail} /> : null}
      {activeTab === "flights" ? <FlightsTab detail={detail} /> : null}
      {activeTab === "stays" ? <StaysTab detail={detail} /> : null}
      {activeTab === "pickups" ? <PickupsTab detail={detail} /> : null}
      {activeTab === "reminders" ? <RemindersTab detail={detail} /> : null}
    </div>
  );
}

function OverviewTab({ detail }: { detail: TripDetail }) {
  const stats = getTripStats(detail);

  return (
    <section className="page page--tight">
      <div className="overview-grid">
        <div className="panel stack">
          <div className="header-actions">
            <h3 className="section-title">旅程摘要</h3>
            <span className="panel-chip">Overview</span>
          </div>
          <div className="list-table">
            <div className="list-table__row">
              <span>航班</span>
              <strong>{stats.flights}</strong>
            </div>
            <div className="list-table__row">
              <span>住宿</span>
              <strong>{stats.stays}</strong>
            </div>
            <div className="list-table__row">
              <span>接送</span>
              <strong>{stats.pickups}</strong>
            </div>
            <div className="list-table__row">
              <span>提醒</span>
              <strong>{stats.reminders}</strong>
            </div>
          </div>
        </div>

        <div className="panel stack">
          <div className="header-actions">
            <h3 className="section-title">快速預覽</h3>
          </div>
          <div className="mini-cards">
            <MiniCard title="下一個航班" value={detail.flights[0] ? getFlightDisplayLabel(detail.flights[0]) : "尚未新增"} meta={detail.flights[0] ? formatDateTime(detail.flights[0].departureAt) : undefined} />
            <MiniCard title="下一筆住宿" value={detail.stays[0]?.title || "尚未新增"} meta={detail.stays[0] ? formatDate(detail.stays[0].checkInDate) : undefined} />
            <MiniCard title="下一筆接送" value={detail.pickups[0]?.title || "尚未新增"} meta={detail.pickups[0] ? formatDateTime(detail.pickups[0].pickupAt) : undefined} />
            <MiniCard title="最近提醒" value={detail.reminders[0]?.title || "尚未新增"} meta={detail.reminders[0] ? formatDateTime(detail.reminders[0].remindAt) : undefined} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ItineraryTab({ detail }: { detail: TripDetail }) {
  return (
    <section className="page page--tight">
      <div className="header-actions">
        <h3 className="section-title">每日行程</h3>
        <FormDialog description="新增一個新的 Day 區塊。" title="新增 Day" triggerLabel="新增 Day">
          <form action={createDayAction} className="stack">
            <input name="tripId" type="hidden" value={detail.trip.id} />
            <div className="forms-grid">
              <div className="field">
                <label className="field-label field-label--required" htmlFor="day-title">標題</label>
                <input className="input" defaultValue={`Day ${detail.days.length + 1}`} id="day-title" name="title" required />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="day-date">日期</label>
                <input className="input" id="day-date" name="date" type="date" />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="day-number">天次</label>
                <input className="input" defaultValue={detail.days.length + 1} id="day-number" min={1} name="dayNumber" type="number" />
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="summary">摘要</label>
              <textarea className="textarea textarea--compact" id="summary" name="summary" placeholder="簡短摘要" />
            </div>
            <SubmitButton>新增 Day</SubmitButton>
          </form>
        </FormDialog>
      </div>

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
                <span className="pill">{day.items.length} 項</span>
              </div>

              <div className="day-grid">
                <div className="item-list">
                  {day.items.length > 0 ? (
                    day.items.map((item) => (
                      <div className="item-card detail-card card-with-actions" key={item.id}>
                        <div className="card-corner-actions">
                          <FormDialog
                            description="調整這筆行程項目的內容。"
                            title={`編輯 ${item.title}`}
                            triggerAriaLabel="編輯項目"
                            triggerClassName="icon-button"
                            triggerContent={<EditIcon />}
                            triggerLabel="編輯"
                          >
                            <form action={updateItemAction} className="stack">
                              <input name="tripId" type="hidden" value={detail.trip.id} />
                              <input name="itemId" type="hidden" value={item.id} />
                              <input name="dayId" type="hidden" value={day.id} />
                              <div className="forms-grid">
                                <div className="field">
                                  <label className="field-label field-label--required">名稱</label>
                                  <input className="input" defaultValue={item.title} name="title" required />
                                </div>
                                <div className="field">
                                  <label className="field-label">類型</label>
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
                                  <label className="field-label">開始時間</label>
                                  <input className="input" defaultValue={item.startTime} name="startTime" placeholder="09:00" />
                                </div>
                                <div className="field">
                                  <label className="field-label">結束時間</label>
                                  <input className="input" defaultValue={item.endTime} name="endTime" placeholder="11:00" />
                                </div>
                                <div className="field">
                                  <label className="field-label">地點</label>
                                  <input className="input" defaultValue={item.location} name="location" />
                                </div>
                                <div className="field">
                                  <label className="field-label">排序</label>
                                  <input className="input" defaultValue={item.order} min={0} name="order" type="number" />
                                </div>
                                <div className="field">
                                  <label className="field-label">費用</label>
                                  <input className="input" defaultValue={item.cost ?? ""} min={0} name="cost" type="number" />
                                </div>
                                <div className="field">
                                  <label className="field-label">網址</label>
                                  <input className="input" defaultValue={item.url} name="url" />
                                </div>
                              </div>
                              <div className="field">
                                <label className="field-label">備註</label>
                                <textarea className="textarea textarea--compact" defaultValue={item.notes} name="notes" />
                              </div>
                              <SubmitButton>儲存</SubmitButton>
                            </form>
                          </FormDialog>
                          <DeleteForm icon tripId={detail.trip.id} entityId={item.id} />
                        </div>
                        <div className="item-meta">
                          <div className="stack item-meta__title">
                            <span className="tag">{item.type}</span>
                            <h4>{item.title}</h4>
                          </div>
                          {getItemTimeLabel(item.startTime, item.endTime) ? (
                            <div className="item-time">{getItemTimeLabel(item.startTime, item.endTime)}</div>
                          ) : null}
                        </div>
                        {hasText(item.location) || typeof item.cost === "number" ? (
                          <div className="row item-info">
                            {hasText(item.location) ? <span className="muted">{item.location}</span> : <span />}
                            {typeof item.cost === "number" ? <span>{currency(item.cost)}</span> : null}
                          </div>
                        ) : null}
                        {item.url ? (
                          <a className="muted" href={item.url} rel="noreferrer" target="_blank">
                            {item.url}
                          </a>
                        ) : null}
                        {item.notes ? <p>{item.notes}</p> : null}
                      </div>
                    ))
                  ) : (
                    <div className="empty">這一天還沒有安排項目。</div>
                  )}
                </div>

                <div className="panel panel--side stack">
                  <div className="header-actions">
                    <h4>新增項目</h4>
                    <FormDialog description="加入這一天的新安排。" title={`新增 ${day.title} 項目`} triggerLabel="新增項目">
                      <form action={createItemAction} className="stack">
                        <input name="tripId" type="hidden" value={detail.trip.id} />
                        <input name="dayId" type="hidden" value={day.id} />
                        <div className="forms-grid">
                          <div className="field">
                            <label className="field-label field-label--required">名稱</label>
                            <input className="input" name="title" placeholder="淺草寺散步" required />
                          </div>
                          <div className="field">
                            <label className="field-label">類型</label>
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
                            <label className="field-label">開始時間</label>
                            <input className="input" name="startTime" placeholder="09:00" />
                          </div>
                          <div className="field">
                            <label className="field-label">結束時間</label>
                            <input className="input" name="endTime" placeholder="11:00" />
                          </div>
                          <div className="field">
                            <label className="field-label">地點</label>
                            <input className="input" name="location" placeholder="地點" />
                          </div>
                          <div className="field">
                            <label className="field-label">排序</label>
                            <input className="input" defaultValue={day.items.length} min={0} name="order" type="number" />
                          </div>
                          <div className="field">
                            <label className="field-label">費用</label>
                            <input className="input" min={0} name="cost" placeholder="0" type="number" />
                          </div>
                          <div className="field">
                            <label className="field-label">網址</label>
                            <input className="input" name="url" placeholder="https://..." />
                          </div>
                        </div>
                        <div className="field">
                          <label className="field-label">備註</label>
                          <textarea className="textarea textarea--compact" name="notes" placeholder="補充資訊" />
                        </div>
                        <SubmitButton>新增項目</SubmitButton>
                      </form>
                    </FormDialog>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="empty">尚未建立任何 Day。</div>
        )}
      </section>
    </section>
  );
}

function FlightsTab({ detail }: { detail: TripDetail }) {
  return (
    <section className="section-block">
      <div className="header-actions">
        <h3 className="section-title">航班</h3>
        <FormDialog description="加入去程或回程航班。" title="新增航班" triggerLabel="新增航班">
          <form action={createFlightAction} className="stack">
            <input name="tripId" type="hidden" value={detail.trip.id} />
            <BrowserTimeZoneField />
            <div className="forms-grid">
              <LabeledInput label="航空公司" name="airline" placeholder="EVA Air" required />
              <LabeledInput label="航班號碼" name="flightNumber" placeholder="BR67" required />
              <LabeledInput label="出發機場" name="departureAirport" placeholder="TPE" required />
              <LabeledInput label="抵達機場" name="arrivalAirport" placeholder="NRT" required />
              <LabeledInput label="出發時間" name="departureAt" type="datetime-local" required />
              <LabeledInput label="抵達時間" name="arrivalAt" type="datetime-local" required />
              <LabeledInput label="機型" name="aircraft" placeholder="Boeing 787-10" />
              <LabeledInput label="行李資訊" name="baggageInfo" placeholder="23kg x 2 + 7kg 手提" />
            </div>
            <FlightPassengersField />
            <LabeledTextarea label="備註" name="notes" placeholder="補充資訊" />
            <SubmitButton>新增航班</SubmitButton>
          </form>
        </FormDialog>
      </div>
      <section className="stack">
        {detail.flights.length > 0 ? (
          detail.flights.map((flight) => (
            <div className="detail-card flight-card card-with-actions" key={flight.id}>
              <div className="card-corner-actions">
                <FormDialog
                  description="更新航班時間與資訊。"
                  title={`編輯 ${getFlightDisplayLabel(flight)}`}
                  triggerAriaLabel="編輯航班"
                  triggerClassName="icon-button"
                  triggerContent={<EditIcon />}
                  triggerLabel="編輯"
                >
                  <form action={updateFlightAction} className="stack">
                    <input name="tripId" type="hidden" value={detail.trip.id} />
                    <input name="flightId" type="hidden" value={flight.id} />
                    <BrowserTimeZoneField />
                    <div className="forms-grid">
                      <LabeledInput label="航空公司" name="airline" defaultValue={flight.airline} required />
                      <LabeledInput label="航班號碼" name="flightNumber" defaultValue={flight.flightNumber} required />
                      <LabeledInput label="出發機場" name="departureAirport" defaultValue={flight.departureAirport} required />
                      <LabeledInput label="抵達機場" name="arrivalAirport" defaultValue={flight.arrivalAirport} required />
                      <LabeledInput label="出發時間" name="departureAt" type="datetime-local" defaultValue={toDateTimeInputValue(flight.departureAt)} required />
                      <LabeledInput label="抵達時間" name="arrivalAt" type="datetime-local" defaultValue={toDateTimeInputValue(flight.arrivalAt)} required />
                      <LabeledInput label="機型" name="aircraft" defaultValue={flight.aircraft} />
                      <LabeledInput label="行李資訊" name="baggageInfo" defaultValue={flight.baggageInfo} />
                    </div>
                    <FlightPassengersField defaultValue={flight.passengers} />
                    <LabeledTextarea label="備註" name="notes" defaultValue={flight.notes} />
                    <SubmitButton>儲存</SubmitButton>
                  </form>
                </FormDialog>
                <DeleteForm icon tripId={detail.trip.id} entityId={flight.id} />
              </div>
              <div className="flight-card__top">
                <div className="flight-card__headline">
                  <div>
                    <span className="tag">航班</span>
                    <h4>{getFlightDisplayLabel(flight)}</h4>
                  </div>
                  <span className="pill">{flight.airline}</span>
                </div>

                <div className="flight-card__route">
                  <div className="flight-card__stop">
                    <span className="flight-card__code">{flight.departureAirport}</span>
                    <strong>{formatDateTime(flight.departureAt)}</strong>
                    <span>出發</span>
                  </div>
                  <div className="flight-card__route-line">
                    <span />
                    <small>{flight.flightNumber}</small>
                  </div>
                  <div className="flight-card__stop">
                    <span className="flight-card__code">{flight.arrivalAirport}</span>
                    <strong>{formatDateTime(flight.arrivalAt)}</strong>
                    <span>抵達</span>
                  </div>
                </div>

                <div className="flight-card__facts">
                  {hasText(flight.aircraft) ? (
                    <div className="flight-card__fact">
                      <span>機型</span>
                      <strong>{flight.aircraft}</strong>
                    </div>
                  ) : null}
                  {hasText(flight.baggageInfo) ? (
                    <div className="flight-card__fact">
                      <span>行李資訊</span>
                      <strong>{flight.baggageInfo}</strong>
                    </div>
                  ) : null}
                  <div className="flight-card__fact">
                    <span>乘客數</span>
                    <strong>{flight.passengers.length || 0}</strong>
                  </div>
                </div>
              </div>

              {flight.passengers.length > 0 ? (
                <div className="stack compact-list flight-card__passengers">
                  {flight.passengers.map((passenger, index) => (
                    <div className="flight-passenger-card" key={getPassengerKey(passenger, index)}>
                      <div className="header-actions">
                        <span className="tag">乘客 {index + 1}</span>
                        {hasText(passenger.fullName) ? <strong>{passenger.fullName}</strong> : null}
                      </div>
                      <div className="flight-passenger-card__grid">
                        {hasText(passenger.bookingReference) ? (
                          <div>
                            <span>訂位代號</span>
                            <strong>{passenger.bookingReference}</strong>
                          </div>
                        ) : null}
                        {hasText(passenger.ticketNumber) ? (
                          <div>
                            <span>機票號碼</span>
                            <strong>{passenger.ticketNumber}</strong>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              {flight.notes ? (
                <div className="flight-card__notes">
                  <span>備註</span>
                  <p className="muted">{flight.notes}</p>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="empty">尚未新增航班。</div>
        )}
      </section>
    </section>
  );
}

function StaysTab({ detail }: { detail: TripDetail }) {
  return (
    <section className="section-block">
      <div className="header-actions">
        <h3 className="section-title">住宿</h3>
        <FormDialog description="記錄飯店、民宿或公寓。" title="新增住宿" triggerLabel="新增住宿">
          <form action={createStayAction} className="stack">
            <input name="tripId" type="hidden" value={detail.trip.id} />
            <div className="forms-grid">
              <LabeledInput label="住宿名稱" name="title" placeholder="Shinjuku Granbell" required />
              <LabeledInput label="入住日期" name="checkInDate" type="date" required />
              <LabeledInput label="退房日期" name="checkOutDate" type="date" required />
              <LabeledInput label="入住時間" name="checkInTime" type="time" />
              <LabeledInput label="退房時間" name="checkOutTime" type="time" />
              <LabeledInput label="訂房代碼" name="bookingReference" placeholder="ABCD1234" />
            </div>
            <LabeledTextarea label="地址" name="address" placeholder="地址" />
            <LabeledTextarea label="備註" name="notes" placeholder="補充資訊" />
            <SubmitButton>新增住宿</SubmitButton>
          </form>
        </FormDialog>
      </div>
      <section className="stack">
        {detail.stays.length > 0 ? (
          detail.stays.map((stay) => (
            <div className="detail-card stay-card card-with-actions" key={stay.id}>
              <div className="card-corner-actions">
                <FormDialog
                  description="更新住宿日期與資訊。"
                  title={`編輯 ${stay.title}`}
                  triggerAriaLabel="編輯住宿"
                  triggerClassName="icon-button"
                  triggerContent={<EditIcon />}
                  triggerLabel="編輯"
                >
                  <form action={updateStayAction} className="stack">
                    <input name="tripId" type="hidden" value={detail.trip.id} />
                    <input name="stayId" type="hidden" value={stay.id} />
                    <div className="forms-grid">
                      <LabeledInput label="住宿名稱" name="title" defaultValue={stay.title} required />
                      <LabeledInput label="入住日期" name="checkInDate" type="date" defaultValue={toDateInputValue(stay.checkInDate)} required />
                      <LabeledInput label="退房日期" name="checkOutDate" type="date" defaultValue={toDateInputValue(stay.checkOutDate)} required />
                      <LabeledInput label="入住時間" name="checkInTime" type="time" defaultValue={stay.checkInTime} />
                      <LabeledInput label="退房時間" name="checkOutTime" type="time" defaultValue={stay.checkOutTime} />
                      <LabeledInput label="訂房代碼" name="bookingReference" defaultValue={stay.bookingReference} />
                    </div>
                    <LabeledTextarea label="地址" name="address" defaultValue={stay.address} />
                    <LabeledTextarea label="備註" name="notes" defaultValue={stay.notes} />
                    <SubmitButton>儲存</SubmitButton>
                  </form>
                </FormDialog>
                <DeleteForm icon tripId={detail.trip.id} entityId={stay.id} />
              </div>
              <div className="stay-card__top">
                <div>
                  <span className="tag">住宿</span>
                  <h4>{stay.title}</h4>
                </div>
                <span className="pill">
                  {formatDate(stay.checkInDate)} - {formatDate(stay.checkOutDate)}
                </span>
              </div>

              <div className="stay-card__timeline">
                <div className="stay-card__point">
                  <span>入住</span>
                  <strong>{formatDate(stay.checkInDate)}</strong>
                  {hasText(stay.checkInTime) ? <small>{stay.checkInTime}</small> : null}
                </div>
                <div className="stay-card__line" />
                <div className="stay-card__point">
                  <span>退房</span>
                  <strong>{formatDate(stay.checkOutDate)}</strong>
                  {hasText(stay.checkOutTime) ? <small>{stay.checkOutTime}</small> : null}
                </div>
              </div>

              <div className="stay-card__facts">
                {hasText(stay.bookingReference) ? (
                  <div className="stay-card__fact">
                    <span>訂房代碼</span>
                    <strong>{stay.bookingReference}</strong>
                  </div>
                ) : null}
                {hasText(stay.address) ? (
                  <div className="stay-card__fact stay-card__fact--wide">
                    <span>地址</span>
                    <strong className="stay-card__address">{stay.address}</strong>
                  </div>
                ) : null}
              </div>

              {stay.notes ? (
                <div className="stay-card__notes">
                  <span>備註</span>
                  <p className="muted">{stay.notes}</p>
                </div>
              ) : null}

            </div>
          ))
        ) : (
          <div className="empty">尚未新增住宿。</div>
        )}
      </section>
    </section>
  );
}

function PickupsTab({ detail }: { detail: TripDetail }) {
  return (
    <section className="section-block">
      <div className="header-actions">
        <h3 className="section-title">接送</h3>
        <FormDialog description="加入機場接送或市區移動安排。" title="新增接送" triggerLabel="新增接送">
          <form action={createPickupAction} className="stack">
            <input name="tripId" type="hidden" value={detail.trip.id} />
            <BrowserTimeZoneField />
            <div className="forms-grid">
              <LabeledInput label="標題" name="title" placeholder="機場接送" required />
              <LabeledInput label="接送時間" name="pickupAt" type="datetime-local" />
              <LabeledInput label="服務商" name="provider" placeholder="Uber / KKday" />
              <LabeledInput label="聯絡方式" name="contact" placeholder="電話或備註" />
            </div>
            <LabeledTextarea label="上車地點" name="pickupLocation" placeholder="上車地點" />
            <LabeledTextarea label="下車地點" name="dropoffLocation" placeholder="下車地點" />
            <LabeledTextarea label="備註" name="notes" placeholder="補充資訊" />
            <SubmitButton>新增接送</SubmitButton>
          </form>
        </FormDialog>
      </div>
      <section className="stack">
        {detail.pickups.length > 0 ? (
          detail.pickups.map((pickup) => (
            <StructuredCard
              key={pickup.id}
              title={pickup.title}
              label="接送"
              meta={pickup.pickupAt ? formatDateTime(pickup.pickupAt) : undefined}
              body={getPickupRouteLabel(pickup.pickupLocation, pickup.dropoffLocation)}
              actions={
                <>
                  <FormDialog
                    description="更新接送時間與聯絡資訊。"
                    title={`編輯 ${pickup.title}`}
                    triggerAriaLabel="編輯接送"
                    triggerClassName="icon-button"
                    triggerContent={<EditIcon />}
                    triggerLabel="編輯"
                  >
                    <form action={updatePickupAction} className="stack">
                      <input name="tripId" type="hidden" value={detail.trip.id} />
                      <input name="pickupId" type="hidden" value={pickup.id} />
                      <BrowserTimeZoneField />
                      <div className="forms-grid">
                        <LabeledInput label="標題" name="title" defaultValue={pickup.title} required />
                        <LabeledInput label="接送時間" name="pickupAt" type="datetime-local" defaultValue={toDateTimeInputValue(pickup.pickupAt)} />
                        <LabeledInput label="服務商" name="provider" defaultValue={pickup.provider} />
                        <LabeledInput label="聯絡方式" name="contact" defaultValue={pickup.contact} />
                      </div>
                      <LabeledTextarea label="上車地點" name="pickupLocation" defaultValue={pickup.pickupLocation} />
                      <LabeledTextarea label="下車地點" name="dropoffLocation" defaultValue={pickup.dropoffLocation} />
                      <LabeledTextarea label="備註" name="notes" defaultValue={pickup.notes} />
                      <SubmitButton>儲存</SubmitButton>
                    </form>
                  </FormDialog>
                  <DeleteForm icon tripId={detail.trip.id} entityId={pickup.id} />
                </>
              }
            >
              {hasText(pickup.provider) || hasText(pickup.contact) ? (
                <div className="list-table">
                  {hasText(pickup.provider) ? (
                    <div className="list-table__row">
                      <span>服務商</span>
                      <strong>{pickup.provider}</strong>
                    </div>
                  ) : null}
                  {hasText(pickup.contact) ? (
                    <div className="list-table__row">
                      <span>聯絡方式</span>
                      <strong>{pickup.contact}</strong>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </StructuredCard>
          ))
        ) : (
          <div className="empty">尚未新增接送。</div>
        )}
      </section>
    </section>
  );
}

function RemindersTab({ detail }: { detail: TripDetail }) {
  return (
    <section className="section-block">
      <div className="header-actions">
        <h3 className="section-title">提醒</h3>
        <FormDialog description="放進重要時間點與待辦。" title="新增提醒" triggerLabel="新增提醒">
          <form action={createReminderAction} className="stack">
            <input name="tripId" type="hidden" value={detail.trip.id} />
            <BrowserTimeZoneField />
            <div className="forms-grid">
              <LabeledInput label="標題" name="title" placeholder="提早 3 小時出門" required />
              <LabeledInput label="提醒時間" name="remindAt" type="datetime-local" />
              <LabeledInput label="網址" name="url" placeholder="https://..." />
            </div>
            <LabeledTextarea label="地點" name="location" placeholder="地點" />
            <LabeledTextarea label="備註" name="notes" placeholder="補充資訊" />
            <SubmitButton>新增提醒</SubmitButton>
          </form>
        </FormDialog>
      </div>
      <section className="stack">
        {detail.reminders.length > 0 ? (
          detail.reminders.map((reminder) => (
            <StructuredCard
              key={reminder.id}
              title={reminder.title}
              label="提醒"
              meta={reminder.remindAt ? formatDateTime(reminder.remindAt) : undefined}
              body={hasText(reminder.location) ? reminder.location : undefined}
              actions={
                <>
                  <FormDialog
                    description="更新提醒時間與補充資訊。"
                    title={`編輯 ${reminder.title}`}
                    triggerAriaLabel="編輯提醒"
                    triggerClassName="icon-button"
                    triggerContent={<EditIcon />}
                    triggerLabel="編輯"
                  >
                    <form action={updateReminderAction} className="stack">
                      <input name="tripId" type="hidden" value={detail.trip.id} />
                      <input name="reminderId" type="hidden" value={reminder.id} />
                      <BrowserTimeZoneField />
                      <div className="forms-grid">
                        <LabeledInput label="標題" name="title" defaultValue={reminder.title} required />
                        <LabeledInput label="提醒時間" name="remindAt" type="datetime-local" defaultValue={toDateTimeInputValue(reminder.remindAt)} />
                        <LabeledInput label="網址" name="url" defaultValue={reminder.url} />
                      </div>
                      <LabeledTextarea label="地點" name="location" defaultValue={reminder.location} />
                      <LabeledTextarea label="備註" name="notes" defaultValue={reminder.notes} />
                      <SubmitButton>儲存</SubmitButton>
                    </form>
                  </FormDialog>
                  <DeleteForm icon tripId={detail.trip.id} entityId={reminder.id} />
                </>
              }
            >
              {reminder.url ? (
                <a className="muted" href={reminder.url} rel="noreferrer" target="_blank">
                  {reminder.url}
                </a>
              ) : null}
              {reminder.notes ? <p className="muted">{reminder.notes}</p> : null}
            </StructuredCard>
          ))
        ) : (
          <div className="empty">尚未新增提醒。</div>
        )}
      </section>
    </section>
  );
}

function MiniCard({ title, value, meta }: { title: string; value: string; meta?: string }) {
  return (
    <div className="mini-card">
      <span>{title}</span>
      <strong>{value}</strong>
      {meta ? <p>{meta}</p> : null}
    </div>
  );
}

function StructuredCard({
  label,
  title,
  meta,
  body,
  preserveBodyNewlines,
  actions,
  children,
}: {
  label: string;
  title: string;
  meta?: string;
  body?: string;
  preserveBodyNewlines?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={actions ? "detail-card card-with-actions" : "detail-card"}>
      {actions ? <div className="card-corner-actions">{actions}</div> : null}
      <div className="header-actions">
        <div>
          <span className="tag">{label}</span>
          <h4>{title}</h4>
        </div>
        {meta ? <span className="pill">{meta}</span> : null}
      </div>
      {body ? (
        <p className={preserveBodyNewlines ? "muted detail-card__body detail-card__body--multiline" : "muted detail-card__body"}>{body}</p>
      ) : null}
      {children}
    </div>
  );
}

function DeleteForm({ tripId, entityId, icon }: { tripId: string; entityId: string; icon?: boolean }) {
  return (
    <form action={deleteEntityAction}>
      <input name="tripId" type="hidden" value={tripId} />
      <input name="entityId" type="hidden" value={entityId} />
      <button aria-label="刪除" className={icon ? "icon-button icon-button--danger" : "ghost-button"} type="submit">
        {icon ? <TrashIcon /> : "刪除"}
      </button>
    </form>
  );
}

function LabeledInput({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="field">
      <label className={required ? "field-label field-label--required" : "field-label"}>{label}</label>
      <input className="input" defaultValue={defaultValue} name={name} placeholder={placeholder} required={required} type={type} />
    </div>
  );
}

function LabeledTextarea({
  label,
  name,
  placeholder,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="field">
      <label className={required ? "field-label field-label--required" : "field-label"}>{label}</label>
      <textarea className="textarea textarea--compact" defaultValue={defaultValue} name={name} placeholder={placeholder} required={required} />
    </div>
  );
}

function toDateTimeInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 16);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function getPassengerKey(passenger: TripFlightPassenger, index: number) {
  return `${passenger.fullName}-${passenger.bookingReference}-${passenger.ticketNumber}-${index}`;
}

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function getItemTimeLabel(startTime?: string, endTime?: string) {
  if (hasText(startTime) && hasText(endTime)) {
    return `${startTime} - ${endTime}`;
  }

  if (hasText(startTime)) {
    return startTime;
  }

  if (hasText(endTime)) {
    return endTime;
  }

  return "";
}

function getPickupRouteLabel(pickupLocation?: string, dropoffLocation?: string) {
  if (hasText(pickupLocation) && hasText(dropoffLocation)) {
    return `${pickupLocation} → ${dropoffLocation}`;
  }

  if (hasText(pickupLocation)) {
    return pickupLocation ?? "";
  }

  if (hasText(dropoffLocation)) {
    return dropoffLocation ?? "";
  }

  return "";
}

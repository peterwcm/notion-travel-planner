# Notion Travel Planner

Airbnb 風格的個人旅行規劃 App。介面採繁體中文，使用 `Next.js App Router` 建構，部署目標為 `Vercel Free`，資料層以 `Notion` 為唯一真實來源，並預留 `Figma` 元件同步 scaffold。

## Product Summary

這個專案把 Notion 裡的旅行資料整理成更適合日常規劃與旅途中使用的 UI：

- 用共享密碼保護私人工作台
- 用旅程卡片查看旅行日期與摘要
- 用單一旅程頁編排每天的 Day 與每個行程項目
- 所有新增、編輯、刪除都直接寫回 Notion
- 視覺方向偏簡潔、現代、Airbnb-style

## Core Features

- `/login`
  簡單密碼保護頁面，登入後以 signed cookie 維持 session
- `/trips`
  旅程列表、統計區塊、建立新旅程表單
- `/trips/[id]`
  單一旅程總覽、建立 Day、建立/編輯/刪除行程項目、航班與住宿
- `Notion` integration
  `Trips`、`Days`、`Items`、`Flights`、`Stays` 五個 data sources 作為唯一資料來源
- `Figma` scaffold
  預留 component mapping 與設計同步結構

## Stack

- `Next.js 14`
- `React 18`
- `TypeScript`
- `@notionhq/client`
- `Zod`
- 自訂 CSS 設計系統

## Local Development

1. 安裝依賴

```bash
npm install
```

2. 建立 `.env.local`

```bash
NOTION_TOKEN=
NOTION_TRIPS_DB_ID=
NOTION_DAYS_DB_ID=
NOTION_ITEMS_DB_ID=
NOTION_FLIGHTS_DB_ID=
NOTION_STAYS_DB_ID=
APP_PASSWORD=
SESSION_SECRET=
```

註：雖然變數名稱沿用 `*_DB_ID`，但在目前 `@notionhq/client` 版本下，實際上請填入對應 database 的 `data source ID`。

3. 啟動開發環境

```bash
npm run dev
```

4. 驗證

```bash
npm run lint
npm run build
```

## Required Notion Schema

### Trips

- `名稱` Title
- `目的地` Rich text
- `開始日期` Date
- `結束日期` Date
- `封面` URL
- `備註` Rich text

### Days

- `名稱` Title
- `旅程` Relation -> Trips
- `日期` Date
- `天次` Number
- `摘要` Rich text

### Items

- `名稱` Title
- `Day` Relation -> Days
- `開始時間` Rich text
- `結束時間` Rich text
- `類型` Select: `景點`, `交通`, `住宿`, `餐廳`, `購物`, `其他`
- `地點` Rich text
- `費用` Number
- `網址` URL
- `備註` Rich text
- `排序` Number

### Flights

- `名稱` Title
- `旅程` Relation -> Trips
- `航空公司` Rich text
- `航班號碼` Rich text
- `出發機場` Rich text
- `抵達機場` Rich text
- `出發時間` Date
- `抵達時間` Date
- `機型` Rich text
- `行李資訊` Rich text
- `費用` Number
- `乘客資訊` Rich text
- `備註` Rich text

### Stays

- `名稱` Title
- `旅程` Relation -> Trips
- `入住日期` Date
- `退房日期` Date
- `入住時間` Rich text
- `退房時間` Rich text
- `費用` Number
- `地址` Rich text
- `網址` URL
- `訂房代碼` Rich text
- `備註` Rich text

## Project Structure

```text
app/
  login/                  login page + server action
  (protected)/trips/      trip list and detail pages
components/               shared UI components
lib/                      auth, notion, validators, utilities
figma/                    component mapping scaffold
```

## Deployment Notes

- 將 `.env.local` 中的變數同步到 Vercel Project Settings
- `middleware` 會保護 `/trips` 路由，因此 `APP_PASSWORD` 與 `SESSION_SECRET` 為必填
- 本專案適合部署於 `Vercel Free`

## Roadmap

- 更完整的 Figma component sync
- 更細的旅程篩選與排序
- 預算分析與旅程摘要強化
- 更穩定的 dev-mode 表單流程與 UX polish

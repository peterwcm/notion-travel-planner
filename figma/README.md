# Figma Sync Scaffold

這個資料夾先放第一版的 Figma 同步規則與元件對應，等你提供 Figma file/node 後即可補上 Code Connect mapping。

## 命名規則

- React component 與 Figma component 採相同英文名稱
- 頁面區塊以 `Trip*`、`Day*`、`Item*` 為前綴
- variant 優先使用 `state`、`size`、`intent`

## 第一版應同步的元件

- `ProtectedLoginForm`
- `TripCard`
- `TripCreateForm`
- `DayCreateForm`
- `TripSummaryHero`
- `ItineraryItemCard`
- `ItemCreateForm`

## 下一步

1. 在 Figma 建立對應 component set
2. 補上 `component-map.json` 的 `fileKey` 與 `nodeId`
3. 使用 Figma Code Connect 將元件連回程式碼


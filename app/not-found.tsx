import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="auth-layout">
      <div className="auth-panel">
        <span className="tag">找不到資料</span>
        <h1>這個旅程不存在</h1>
        <p>可能已被刪除，或是你使用了錯誤的旅程網址。</p>
        <Link className="button" href="/trips">
          回旅程列表
        </Link>
      </div>
    </main>
  );
}

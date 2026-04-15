import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="auth-layout">
      <div className="auth-panel">
        <span className="tag">Not found</span>
        <h1>This trip does not exist</h1>
        <p>It may have been deleted, or the trip URL is incorrect.</p>
        <Link className="button" href="/trips">
          Back to trips
        </Link>
      </div>
    </main>
  );
}

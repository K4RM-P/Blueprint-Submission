"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-CA">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#F3EFE8", color: "#17201C", padding: "64px 24px" }}>
        <h1 style={{ fontSize: 32 }}>Something went wrong.</h1>
        <p>Please try again in a moment.</p>
        <button onClick={reset} style={{ marginTop: 16, padding: "12px 20px", borderRadius: 999, border: "1px solid #E4DED4", background: "#FBF9F5" }}>
          Try again
        </button>
      </body>
    </html>
  );
}

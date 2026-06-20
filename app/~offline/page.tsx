export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "var(--page-bg, #f4f7f6)" }}>
      <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20">
        <span className="text-white font-bold text-2xl">A</span>
      </div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">You&apos;re offline</h1>
      <p className="text-sm text-slate-500 max-w-xs">
        Albify needs an internet connection for studio data. Check your connection and try again.
      </p>
    </div>
  );
}

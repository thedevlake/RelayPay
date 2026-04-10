export default function ActiveCall({
  caller,
  isSpeaking,
  isMuted,
  status,
  error,
  onToggleMute,
  onEndCall
}) {
  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-800 bg-[#0b1220] p-8">
      <p className="text-xs font-medium uppercase tracking-wider text-teal-400">Active voice support</p>
      <h1 className="mt-2 text-2xl font-semibold text-white">RelayPay Assistant</h1>
      <p className="mt-2 text-sm text-slate-300">
        {caller.fullName} ({caller.email})
      </p>

      <div className="mt-8 flex items-center gap-5">
        <div className="relative h-20 w-20 rounded-full border border-slate-700 bg-[#050913]">
          <div
            className={`absolute inset-4 rounded-full bg-[#0d9488] transition ${
              isSpeaking ? 'scale-110 opacity-100' : 'scale-90 opacity-60'
            }`}
          />
          <div
            className={`absolute inset-1 rounded-full border border-[#0d9488]/50 ${
              isSpeaking ? 'animate-ping' : ''
            }`}
          />
        </div>

        <div>
          <p className="text-sm text-slate-400">Call status</p>
          <p className="text-lg font-medium text-white">{status || 'Connected'}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onToggleMute}
          className="rounded-xl border border-slate-700 bg-[#050913] px-5 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500"
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button
          type="button"
          onClick={onEndCall}
          className="rounded-xl bg-[#1e3a8a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
        >
          End Call
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
    </section>
  );
}

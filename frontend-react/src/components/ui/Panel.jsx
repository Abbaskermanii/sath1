export default function Panel({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-2xl border border-zinc-800 bg-zinc-900",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

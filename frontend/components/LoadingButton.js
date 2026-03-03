"use client";

export default function LoadingButton({
  loading,
  disabled,
  onClick,
  children,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/90 border-t-transparent" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

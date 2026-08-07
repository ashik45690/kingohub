import { FaSpinner } from "react-icons/fa";

/**
 * Reusable loading primitives for a consistent loading experience.
 * Keeps the existing indigo/gray color theme.
 */

// ── Spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = "md", label, className = "" }) {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeMap[size] || sizeMap.md} border-indigo-600 border-t-transparent rounded-full animate-spin`}
      />
      {label && <p className="text-gray-500 font-medium">{label}</p>}
    </div>
  );
}

// ── Skeleton block ───────────────────────────────────────────────────
export function Skeleton({ className = "" }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} />;
}

// ── Skeleton stat / summary card ─────────────────────────────────────
export function CardSkeleton({ label = true }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {label && <Skeleton className="h-3 w-24 mb-3" />}
      <Skeleton className="h-7 w-14" />
    </div>
  );
}

// ── Skeleton table rows ──────────────────────────────────────────────
export function TableRowsSkeleton({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="hover:bg-gray-50 transition-colors">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-6 py-4 whitespace-nowrap">
              <Skeleton className="h-4 w-24" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── Full page loader (centered spinner + label) ──────────────────────
export function PageLoader({ label = "Loading..." }) {
  return (
    <div className="p-6 flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-gray-500 font-medium mt-4">{label}</p>
      </div>
    </div>
  );
}

// ── Fade-in wrapper for smooth reveal after loading ──────────────────
export function FadeIn({ children, className = "" }) {
  return <div className={`animate-fade-in ${className}`}>{children}</div>;
}

// ── Small inline spinner (for API request buttons, etc.) ─────────────
export function InlineSpinner({ className = "" }) {
  return <FaSpinner className={`animate-spin ${className}`} />;
}

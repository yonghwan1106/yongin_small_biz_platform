interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="ml-5 flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

const SKELETON_HEIGHTS = [65, 85, 55, 75, 90, 70, 80]; // 고정된 높이 값

export function SkeletonChart() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="h-80 flex items-end justify-between gap-2">
        {SKELETON_HEIGHTS.map((height, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonMap() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="h-80 w-full rounded-lg" />
    </div>
  );
}

export function SkeletonReportList() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="divide-y">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonReportContent() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6 pb-4 border-b">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <div className="pt-4">
          <Skeleton className="h-5 w-40 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

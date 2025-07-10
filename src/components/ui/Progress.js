import { cn } from '@/lib/utils';

export function Progress({ value = 0, className, ...props }) {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-in-out"
        style={{
          transform: `translateX(-${100 - normalizedValue}%)`
        }}
      />
    </div>
  );
}

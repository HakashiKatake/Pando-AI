import { cn } from "@/lib/utils"

export function WellnessCards({ className, children, gradientClass, ...props }) {
  return (
    <div
      className={cn(
        "relative rounded-xl p-6 shadow-lg overflow-hidden",
        "transition-all duration-300 ease-in-out",
        gradientClass,
        className,
      )}
      {...props}
    >
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

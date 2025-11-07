import * as React from "react"
import { cn } from "../../lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
        />
      )}
      {!src && children && (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-gray-600">
          {children}
        </div>
      )}
    </div>
  )
)
Avatar.displayName = "Avatar"

export { Avatar }
import * as React from "react"

import { cn } from "@/lib/utils"

interface SimpleSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  children?: React.ReactNode
  id?: string
  "aria-label"?: string
}

const SimpleSelect = React.forwardRef<
  HTMLSelectElement,
  SimpleSelectProps
>(({ className, children, onValueChange, ...props }, ref) => (
  <select
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    onChange={(e) => onValueChange?.(e.target.value)}
    {...props}
  >
    {children}
  </select>
))
SimpleSelect.displayName = "SimpleSelect"

const SimpleSelectTrigger = SimpleSelect
const SimpleSelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => (
  <span ref={ref} className={cn("block truncate", className)} {...props}>
    {props.children || placeholder}
  </span>
))
SimpleSelectValue.displayName = "SimpleSelectValue"

const SimpleSelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("py-1", className)} {...props} />
))
SimpleSelectContent.displayName = "SimpleSelectContent"

const SimpleSelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, ...props }, ref) => (
  <option
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
))
SimpleSelectItem.displayName = "SimpleSelectItem"

export {
  SimpleSelect as Select,
  SimpleSelectTrigger as SelectTrigger,
  SimpleSelectValue as SelectValue,
  SimpleSelectContent as SelectContent,
  SimpleSelectItem as SelectItem,
}